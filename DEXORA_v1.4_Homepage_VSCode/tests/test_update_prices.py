"""Offline fixtures test sale/current vs struck original and no double-discount."""
import json
import unittest
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from update_prices import extract_price, parse_vnd, update_sources, verify_product_title


class PriceParsing(unittest.TestCase):
    def test_user_screenshot_style(self):
        html = '''<html><h1>CPU Intel 14600K</h1><div class="product-price">
          <span class="sale-price">7.490.000đ</span>
          <del class="old-price">8.990.000đ</del>
          <span class="percent">-16%</span></div></html>'''
        result = extract_price(html)
        self.assertEqual(result['current_price'], 7_490_000)
        self.assertEqual(result['original_price'], 8_990_000)
        self.assertEqual(result['discount_percent'], 16)
        self.assertEqual(result['detected_from'], 'visible-current')

    def test_nested_old_is_ignored(self):
        html = '<div class="sale-price"><strong>7.490.000đ</strong> <del>8.990.000đ</del></div>'
        self.assertEqual(extract_price(html)['current_price'], 7_490_000)

    def test_structure_offer(self):
        html = '<script type="application/ld+json">'+json.dumps({'@type':'Product','name':'X','offers':{'@type':'Offer','priceCurrency':'VND','price':'7490000'}})+'</script>'
        self.assertEqual(extract_price(html)['current_price'], 7_490_000)

    def test_sale_beats_stale_offer(self):
        html = '''<script type="application/ld+json">{"@type":"Product","offers":{"priceCurrency":"VND","price":"8990000"}}</script>
          <p class="current-price">7.490.000đ</p><del>8.990.000đ</del>'''
        self.assertEqual(extract_price(html)['current_price'], 7_490_000)

    def test_price_parser_does_not_take_percent(self):
        self.assertEqual(parse_vnd('7.490.000đ'), 7_490_000)
        self.assertIsNone(parse_vnd('-16%'))
        self.assertIsNone(extract_price('<s class="old-price">8.990.000đ</s><span>-16%</span>'))

    def test_title_verification(self):
        html = '<h1>Intel Core i5-14600K Chính hãng</h1><p class="current-price">7.490.000đ</p>'
        self.assertTrue(verify_product_title(html,['14600k']))
        self.assertFalse(verify_product_title(html,['7800X3D']))

    def test_end_to_end_with_fixture(self):
        src=[{'product_id':'cpu/i5','store_id':'phongvu','url':'https://phongvu.vn/example','required_terms':['14600k']}]
        html='<h1>Intel Core i5 14600K</h1><span class="sale-price">7.490.000đ</span><s>8.990.000đ</s><span>-16%</span>'
        result,logs=update_sources(src,{'entries':{},'generated_at':None},fetcher=lambda url:html)
        quote=result['entries']['cpu/i5']['quotes'][0]
        self.assertEqual(quote['current_price'],7490000)
        self.assertEqual(result['entries']['cpu/i5']['estimate'],7490000)
        self.assertEqual(quote['discount_percent'],16)
        self.assertIn('OK',logs[0])


if __name__ == '__main__':
    unittest.main()
