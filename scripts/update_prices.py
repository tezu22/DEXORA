#!/usr/bin/env python3
"""NEON//RIG public product-price updater.

Only reads configured direct product URLs. Extracts a visible/current sale price
or explicit structured offer, never discounts an already-discounted amount again.
Stores successful quotes and produces one estimated VND price per catalog item.
"""
from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from pathlib import Path
from statistics import median
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser
import requests
from bs4 import BeautifulSoup
from price_variants import classify_conditionals, is_conditional_label
from price_api import price_from_api
import os

ROOT = Path(__file__).resolve().parents[1]
SOURCES_PATH = ROOT / "data" / "price_sources.json"
PRICES_PATH = ROOT / "data" / "prices.json"
UA = "DEXORA-PriceMonitor/1.0 (+public-product-prices; github-actions)"
MAX_QUOTE_AGE = timedelta(days=7)
PRICE_MIN, PRICE_MAX = 100_000, 250_000_000
OLD_CUES = ("old", "original", "regular", "compare", "list-price", "price-before", "strike", "was-price", "giagoc", "gia-goc", "giá-gốc", "niemyet", "niêm-yết")
NEW_CUES = ("sale", "special", "discounted", "final", "current", "new-price", "price-now", "price-sale", "giaban", "gia-ban", "giá-bán", "gia-km", "khuyenmai", "khuyen-mai", "pro-price")
PRICE_CUES = ("price", "gia", "giá", "cost")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def parse_vnd(value) -> int | None:
    """Parse Vietnamese/English thousand separators; never mistake -16% for VND."""
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return int(value) if math.isfinite(value) and value >= PRICE_MIN else None
    if not isinstance(value, str):
        return None
    value = value.strip().replace("\u00a0", " ")
    if "%" in value or len(value) > 55:
        return None
    groups = re.findall(r"\d+", value)
    if not groups:
        return None
    # A sequence like 7.490.000 means a single VND value.
    raw = re.sub(r"(?i)(?:vnđ|vnd|đồng|₫|đ)", "", value).strip()
    if re.fullmatch(r"\d{1,3}([.,\s]\d{3}){1,3}", raw):
        number = int(re.sub(r"\D", "", raw))
    elif re.fullmatch(r"\d{6,9}(?:[.,]0{1,2})?", raw):
        number = int(re.split(r"[.,]", raw)[0])
    else:
        return None
    return number if PRICE_MIN <= number <= PRICE_MAX else None


def attr_text(tag) -> str:
    return " ".join([" ".join(tag.get("class", [])), tag.get("id", ""),
                     tag.get("itemprop", ""), tag.get("data-testid", "")]).lower()


def is_old(tag) -> bool:
    if tag.name in ("del", "s", "strike"):
        return True
    s = attr_text(tag)
    return any(c in s for c in OLD_CUES)


def only_current_text(tag) -> str:
    # Do not accidentally parse the crossed-out price nested inside a price box.
    nested = BeautifulSoup(str(tag), "html.parser")
    for child in nested.find_all(True):
        if is_old(child):
            child.decompose()
    return nested.get_text(" ", strip=True)


def parse_single_price(text: str) -> int | None:
    text = re.sub(r"\s+", " ", text).strip()
    return parse_vnd(text)


def structured_offers(soup: BeautifulSoup) -> list[tuple[int, int, str]]:
    found = []

    def visit(obj):
        if isinstance(obj, list):
            for item in obj:
                visit(item)
            return
        if not isinstance(obj, dict):
            return
        types = obj.get("@type", [])
        if isinstance(types, str):
            types = [types]
        if any(t.lower().endswith("product") for t in types):
            offers = obj.get("offers", [])
            for offer in offers if isinstance(offers, list) else [offers]:
                if not isinstance(offer, dict):
                    continue
                ccy = str(offer.get("priceCurrency", "VND")).upper()
                if ccy != "VND":
                    continue
                price = parse_vnd(offer.get("price"))
                if price:
                    found.append((70, price, "jsonld-offer"))
                # AggregateOffer lowPrice is only used as a fallback.
                low = parse_vnd(offer.get("lowPrice"))
                if low and not price:
                    found.append((35, low, "aggregate-low"))
        for key in ("@graph", "mainEntity"):
            if key in obj:
                visit(obj[key])

    for tag in soup.find_all("script", type=re.compile(r"application/ld\+json", re.I)):
        try:
            visit(json.loads(tag.string or tag.get_text()))
        except (ValueError, TypeError):
            pass
    return found


def extract_price(html: str) -> dict | None:
    """Prefer explicit selling price over list price or percentage. No double discount."""
    soup = BeautifulSoup(html, "html.parser")
    candidates: list[tuple[int, int, str]] = structured_offers(soup)
    old_candidates: list[int] = []

    for tag in soup.find_all(["meta", "ins", "del", "s", "strike", "span", "div", "strong", "b", "p"]):
        if is_conditional_label(tag):
            continue
        if tag.name == "meta":
            prop = (tag.get("property", "") + " " + tag.get("itemprop", "") + " " + tag.get("name", "")).lower()
            if any(t in prop for t in ["product:price:amount", "og:price:amount", "price"]):
                p = parse_vnd(tag.get("content", ""))
                if p:
                    candidates.append((85, p, "meta-current"))
            continue
        s = attr_text(tag)
        if is_old(tag):
            p = parse_single_price(tag.get_text(" ", strip=True))
            if p:
                old_candidates.append(p)
            continue
        if not any(k in s for k in PRICE_CUES) and tag.name != "ins":
            continue
        # Ignore broad parent boxes that might contain multiple product prices.
        txt = only_current_text(tag)
        p = parse_single_price(txt)
        if p:
            priority = 100 if tag.name == "ins" or any(x in s for x in NEW_CUES) else 58
            candidates.append((priority, p, "visible-current" if priority >= 100 else "visible-price"))
        for attribute in ("data-price", "data-sale-price", "content"):
            a = parse_vnd(tag.get(attribute))
            if a:
                priority = 105 if "sale" in attribute or any(x in s for x in NEW_CUES) else 65
                candidates.append((priority, a, "attribute-current"))

    if not candidates:
        return None
    # Priority, then appearance order. A visible sale beats stale JSON-LD/list price.
    _, selling_price, source = sorted(candidates, key=lambda t: -t[0])[0]
    original = min((p for p in old_candidates if p > selling_price), default=None)
    return {
        "kind": "sale" if bool(original) else "retail",
        "current_price": selling_price,
        "original_price": original,
        "is_discounted": bool(original),
        "discount_percent": math.floor((original - selling_price) * 100 / original) if original else None,
        "detected_from": source,
    }


def verify_product_title(html: str, required_terms: list[str]) -> bool:
    soup = BeautifulSoup(html, "html.parser")
    title = soup.find("h1")
    meta = soup.find("meta", property="og:title")
    visible = " ".join([title.get_text(" ", strip=True) if title else "", meta.get("content", "") if meta else ""])
    line = re.sub(r"[^a-z0-9]", "", visible.lower())
    if not line:
        return False
    # Distinguish e.g. i5-14600K vs i5-14600KF, not substring matches.
    intel_codes = set(re.findall(r"\bi[3579][\s-]*\d{5}(?:kf|ks|f|k)?\b", visible.lower()))
    intel_codes = {re.sub(r"^(i[3579])[\s-]*", r"\1-", code) for code in intel_codes}
    for term in required_terms:
        token = re.sub(r"\s+", "", term.lower())
        if re.fullmatch(r"i[3579]-\d{5}(?:kf|ks|f|k)?", token):
            if token not in intel_codes:
                return False
        elif re.fullmatch(r"\d{5}(?:kf|ks|f|k)?", token):
            variants = {re.sub(r"^i[3579]-", "", code) for code in intel_codes}
            if token not in variants:
                return False
        elif re.sub(r"[^a-z0-9]", "", token) not in line:
            return False
    return True


def load_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, ValueError):
        return default


def quote_is_fresh(quote, current_dt):
    try:
        dt = datetime.fromisoformat(quote["verified_at"].replace("Z", "+00:00"))
        return timedelta(0) <= current_dt-dt <= MAX_QUOTE_AGE
    except (KeyError, TypeError, ValueError):
        return False


def estimate(quotes) -> int:
    # Rounded once, not an extra discount; median dampens retailer outliers.
    return int(math.floor(median([q["current_price"] for q in quotes]) / 10_000 + .5) * 10_000)


def permitted_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme == "https" and bool(parsed.netloc) and not parsed.username and not parsed.password


def robots_allowed(session: requests.Session, url: str, cache: dict) -> bool:
    parsed = urlparse(url)
    host = f"{parsed.scheme}://{parsed.netloc}"
    if host not in cache:
        try:
            resp = session.get(host + "/robots.txt", timeout=12)
            if resp.status_code == 404:
                cache[host] = None
            elif resp.ok:
                rules = RobotFileParser()
                rules.parse(resp.text.splitlines())
                cache[host] = rules
            else:
                # If access rules cannot be verified, skip conservatively.
                cache[host] = False
        except requests.RequestException:
            cache[host] = False
    policy = cache[host]
    return policy is None or (policy is not False and policy.can_fetch(UA, url))


def update_sources(sources: list[dict], prior: dict, fetcher=None) -> tuple[dict, list[str]]:
    current_dt = datetime.now(timezone.utc)
    stamp = current_dt.isoformat(timespec="seconds").replace("+00:00", "Z")
    previous = prior.get("entries", {})
    quotes: dict[str, list[dict]] = {}
    logs: list[str] = []
    # Keep only recent verified quotes from configured URLs.
    active = {(s["product_id"], s["store_id"], s["url"]) for s in sources if s.get("enabled", True)}
    for product_id, data in previous.items():
        for old in data.get("quotes", []):
            key = (product_id, old.get("store_id"), old.get("url"))
            if key in active and quote_is_fresh(old, current_dt):
                quotes.setdefault(product_id, []).append(old)

    session = requests.Session()
    session.headers.update({"User-Agent": UA, "Accept-Language": "vi-VN,vi;q=0.8"})
    robot_cache = {}
    successful = 0
    for src in sources:
        if not src.get("enabled", True):
            continue
        url, product, store = src["url"], src["product_id"], src["store_id"]
        key = f"{product} @ {store}"
        if not permitted_url(url):
            logs.append(f"SKIP {key}: URL không hợp lệ")
            continue
        try:
            if fetcher is None:
                if not robots_allowed(session, url, robot_cache):
                    logs.append(f"SKIP {key}: robots.txt không cho phép/chưa xác minh")
                    continue
                headers={}
                if src.get('source_type')=='official_api_json' and src.get('auth_env'):
                    secret=os.environ.get(src['auth_env'])
                    if not secret:raise ValueError('Thiếu API key được cấp quyền')
                    headers['Authorization']='Bearer '+secret
                res = session.get(url, timeout=18, headers=headers)
                res.raise_for_status()
                if urlparse(res.url).netloc.lower() != urlparse(url).netloc.lower():
                    raise ValueError("Trang chuyển sang domain khác")
                html = res.text
            else:
                html = fetcher(url)
            if src.get('source_type')=='official_api_json':
                found=price_from_api(html,src,parse_vnd,verify_product_title)
                extras=[]
            else:
                if not verify_product_title(html, src["required_terms"]):
                    logs.append(f"SKIP {key}: không xác minh được đúng sản phẩm")
                    continue
                found=extract_price(html)
                extras=classify_conditionals(html)
            if not found:
                logs.append(f"SKIP {key}: không tìm thấy giá bán hiện hành")
                continue
            record = {
                "store_id": store, "url": url, "verified_at": stamp,
                "price_kind": found.get("kind", "retail"),
                "conditional_offers": extras,
                "current_price": found["current_price"],
                "original_price": found["original_price"],
                "discount_percent": found["discount_percent"],
                "detected_from": found["detected_from"],
            }
            others = quotes.setdefault(product, [])
            others[:] = [q for q in others if not (q["store_id"] == store and q["url"] == url)]
            others.append(record)
            successful += 1
            logs.append(f"OK {key}: {record['current_price']:,} VND" + (" (giá khuyến mãi)" if found["is_discounted"] else ""))
        except (requests.RequestException, ValueError) as exc:
            logs.append(f"SKIP {key}: {type(exc).__name__}")

    entries = {}
    for product_id, product_quotes in sorted(quotes.items()):
        if product_quotes:
            entries[product_id] = {
                "estimate": estimate(product_quotes),
                "last_verified": max(q["verified_at"] for q in product_quotes),
                "quotes": sorted(product_quotes, key=lambda q: (q["store_id"],q["url"])),
            }
    result = {"schema_version": 2, "currency": "VND", "generated_at": stamp if successful else prior.get("generated_at"), "entries": entries}
    return result, logs


def main():
    sources = load_json(SOURCES_PATH, [])
    prior = load_json(PRICES_PATH, {"schema_version": 1, "currency": "VND", "generated_at": None, "entries": {}})
    updated, logs = update_sources(sources, prior)
    print("\n".join(logs))
    if updated != prior:
        PRICES_PATH.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Đã lưu {len(updated['entries'])} sản phẩm có báo giá được xác minh gần đây.")
    else:
        print("Chưa có báo giá mới được xác minh; giữ nguyên dữ liệu.")


if __name__ == "__main__":
    main()
