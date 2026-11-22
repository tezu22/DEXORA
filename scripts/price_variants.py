"""Conservative price classification for DEXORA.

Retail estimates must not silently use bundle-only or account-only prices.
Conditional offers are recorded as UNVERIFIED until their eligibility is checked.
"""
from __future__ import annotations
import re
from bs4 import BeautifulSoup

PRICE_FRAGMENT = re.compile(r'(?<!\d)(?:\d{1,3}(?:[.,\s]\d{3}){2,3}|\d{6,9})\s*(?:₫|đ|vnd)?', re.I)
BUNDLE = re.compile(r'(?:giá\s+(?:build|bộ\s*pc)|mua\s+kèm\s+(?:bộ|pc)|build\s+(?:trọn\s+bộ|pc)|combo)', re.I)
VOUCHER = re.compile(r'(?:mã\s+(?:giảm\s+giá|khuyến\s+mãi)|voucher|coupon|đăng\s+nhập|thành\s+viên)', re.I)

def normalize_price(s: str) -> int | None:
    raw = re.sub(r'(?i)(?:₫|đ|vnd)', '', s).strip()
    if re.fullmatch(r'\d{1,3}(?:[.,\s]\d{3}){2,3}', raw):
        n = int(re.sub(r'\D', '', raw))
    elif re.fullmatch(r'\d{6,9}', raw):
        n = int(raw)
    else:
        return None
    return n if 100_000 <= n <= 250_000_000 else None

def classify_conditionals(html: str) -> list[dict]:
    """Record explicit conditional offers; never make them the default retail estimate."""
    soup = BeautifulSoup(html, 'html.parser')
    result = []
    seen = set()
    for el in soup.find_all(['p', 'li', 'span', 'div', 'tr']):
        text = el.get_text(' ', strip=True)
        if not (10 <= len(text) <= 210):
            continue
        kind = 'bundle' if BUNDLE.search(text) else 'voucher' if VOUCHER.search(text) else None
        if not kind:
            continue
        matches = [(normalize_price(m.group()), m.group()) for m in PRICE_FRAGMENT.finditer(text)]
        amounts = [v for v, _ in matches if v]
        if len(amounts) != 1:
            continue
        price = amounts[0]
        key = (kind, price, text.casefold())
        if key in seen:
            continue
        seen.add(key)
        result.append({'kind': kind, 'price': price, 'conditions_text': text[:180], 'eligible': None, 'status': 'requires_manual_verification'})
        if len(result) >= 10:
            break
    return result

def is_conditional_label(tag) -> bool:
    """Exclude clearly labeled bundle prices when extracting standalone retail price."""
    attrs = ' '.join([' '.join(tag.get('class', [])), str(tag.get('id', '')), str(tag.get('data-price-type',''))]).lower()
    return any(x in attrs for x in ('bundle', 'combo', 'build-price', 'price-build', 'voucher', 'member-price'))
