import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from update_prices import verify_product_title, extract_price
from price_variants import classify_conditionals

def test_variant_difference():
    k='<h1>Intel Core i5-14600K Box</h1>'
    kf='<h1>Intel Core i5-14600KF TRAY</h1>'
    assert verify_product_title(k,['i5-14600k'])
    assert not verify_product_title(kf,['i5-14600k'])
    assert verify_product_title(kf,['i5-14600kf'])
    assert not verify_product_title(k,['i5-14600kf'])

def test_bundle_not_retail():
    html='''<h1>CPU Intel Core i5-14600K</h1><div class="retail-price">8.490.000đ</div><div class="combo-price">Giá build PC 7.190.000đ</div>'''
    retail=extract_price(html)
    assert retail is not None
    assert retail['current_price']==8_490_000
    combos=classify_conditionals(html)
    assert any(x['kind']=='bundle' and x['price']==7_190_000 and x['eligible'] is None for x in combos)

def test_voucher_not_autoapplied():
    html='''<h1>CPU Intel Core i5-14600K</h1><strong class="sale-price">7.490.000đ</strong><p>Voucher 500.000đ</p>'''
    retail=extract_price(html)
    assert retail['current_price']==7_490_000
    assert retail['is_discounted'] is False

def test_official_api_adapter():
    from update_prices import parse_vnd
    from price_api import price_from_api
    result=price_from_api({'name':'Intel Core i5-14600K','currency':'VND','price':7490000,'original_price':8990000},
        {'required_terms':['i5-14600k']},parse_vnd,verify_product_title)
    assert result['current_price']==7490000 and result['kind']=='sale'
