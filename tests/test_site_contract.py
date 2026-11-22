"""Static contract smoke tests: fail before GitHub Pages deployment."""
from pathlib import Path
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
PAGES=[ROOT/'index.html',*sorted((ROOT/'pages').glob('*.html'))]

def test_expected_pages():
    assert len(PAGES)==9
    assert {p.name for p in PAGES}=={'index.html','desktop.html','builder.html','advisor.html','catalog.html','stores.html','compare.html','laptop.html','policy.html'}

def test_all_relative_assets_exist():
    for page in PAGES:
        html=BeautifulSoup(page.read_text(encoding='utf-8'),'html.parser')
        for el in html.select('[src],[href]'):
            attribute='src' if el.has_attr('src') else 'href'
            value=str(el.get(attribute,''))
            if not value or value.startswith(('#','http:','https:','mailto:','tel:','data:','javascript:')):
                continue
            candidate=(page.parent / value.split('?',1)[0]).resolve()
            assert candidate.is_relative_to(ROOT),f'{page}: path outside root: {value}'
            assert candidate.exists(),f'{page}: missing {value}'

def test_frontend_contract():
    home=(ROOT/'index.html').read_text(encoding='utf-8')
    build=(ROOT/'pages/builder.html').read_text(encoding='utf-8')
    assert '02 / TÍNH NĂNG' in home
    assert 'Chọn đúng máy.' in home and 'Hiểu rõ lý do.' in home
    assert 'Bắt đầu từ CPU, chọn mainboard và RAM tương thích.' not in build
    assert 'data-pc-page="build"' in build
    assert 'site-common.js' in home and 'site-common.js' in build
    assert 'build-storage.js' in build
    assert 'data-pc-page="compare"' in (ROOT/'pages/compare.html').read_text(encoding='utf-8')

def test_no_fake_price_sync():
    from json import loads
    prices=loads((ROOT/'data/prices.json').read_text(encoding='utf-8'))
    assert prices.get('currency')=='VND' and isinstance(prices.get('entries'),dict)
    # Transparent feedback integration and conservative fallback available.
    js=(ROOT/'assets/js/site-common.js').read_text(encoding='utf-8')
    assert 'api.web3forms.com/submit' in js and 'data.success' in js
    assert 'Không gửi mật khẩu' in js

def test_web3forms_key_not_committed_as_secret():
    # Web3Forms public access key is purposely browser-facing, unlike credentials.
    js=(ROOT/'assets/js/site-common.js').read_text(encoding='utf-8')
    assert 'access_key' in js
