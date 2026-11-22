"""Optional official JSON API adapter.

Configured only for APIs that explicitly allow programmatic access; credentials
are read from GitHub Actions secrets/environment, never stored in repository.
"""
from __future__ import annotations
import json
from html import escape

def pick(obj: dict, key: str):
    cur = obj
    for token in key.split('.'):
        if not isinstance(cur, dict) or token not in cur:
            return None
        cur = cur[token]
    return cur

def price_from_api(payload, source, parse_vnd, verify_product_title):
    if isinstance(payload, str):
        payload = json.loads(payload)
    if not isinstance(payload, dict):
        raise ValueError('JSON API phải trả về đối tượng')
    name = pick(payload, source.get('api_title_field','name'))
    if not isinstance(name, str) or not verify_product_title('<h1>'+escape(name)+'</h1>',source.get('required_terms',[])):
        raise ValueError('Không khớp tên model trong API')
    currency = pick(payload, source.get('api_currency_field','currency'))
    if currency and str(currency).upper() != 'VND':
        raise ValueError('Đơn vị tiền tệ không phải VND')
    price = parse_vnd(pick(payload, source.get('api_price_field','price')))
    original = parse_vnd(pick(payload,source.get('api_original_field','original_price')))
    if not price:
        raise ValueError('Giá API không hợp lệ')
    original = original if original and original>price else None
    return {'kind':'sale' if original else 'retail','current_price':price,'original_price':original,'is_discounted':bool(original),'discount_percent':round((original-price)*100/original) if original else None,'detected_from':'official-json-api'}
