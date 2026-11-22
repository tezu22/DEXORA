"""Smoke test for the multi-file VS Code demo.
Run: python tests/test_ui.py
Playwright + Chromium required. Tests inline local assets because this sandbox may block localhost.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT/'index.html').read_text(encoding='utf-8')
html = re.sub(r'<link href="https://fonts.googleapis.com/[^>]+>', '', html)
html = re.sub(r'<link rel="preconnect"[^>]+>', '', html)
for match in list(re.finditer(r'<link rel="stylesheet" href="(\./assets/css/[^"]+\.css)(?:\?[^"]+)?"\s*/>',html)):
    css=(ROOT/match.group(1)[2:]).read_text(encoding='utf-8')
    html=html.replace(match.group(0),'<style>'+css+'</style>')
for match in list(re.finditer(r'<script defer src="(\./(?:data|assets/js)/[^"]+\.js)(?:\?[^"]+)?"></script>',html)):
    js=(ROOT/match.group(1)[2:]).read_text(encoding='utf-8')
    html=html.replace(match.group(0),'<script>'+js+'</script>')

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html)
    page.locator('.dx-hero-actions [data-home-open="build"]').click()
    assert page.locator('select[data-part]').count()==8
    assert page.locator('.option').count()==3
    assert page.locator('[data-color-mode]').count()==4
    page.locator('[data-option="balance"]').hover()
    page.wait_for_timeout(470)
    assert 'is-open' in page.locator('[data-compare-stage]').get_attribute('class')
    effect=page.locator('[data-option="balance"]').evaluate('''el => {
       const s = getComputedStyle(el);
       const m = new DOMMatrix(s.transform);
       return {scaleX:m.a,scaleY:m.d,filter:s.filter,opacity:s.opacity};
    }''')
    assert abs(effect['scaleX']-1)<.001 and abs(effect['scaleY']-1)<.001,effect
    assert effect['filter']=='none',effect
    page.locator('[data-compare="balance"]').click()
    assert page.locator('[data-compare-reveal]').get_attribute('aria-hidden')=='false'
    page.locator('button[data-page="catalog"]').click()
    assert page.locator('.catalog-item').count()==356
    page.locator('button[data-page="build"]').click()
    page.locator('[data-color-mode="white"]').click()
    page.locator('select[data-part="cpu"]').select_option('i5')
    board_names=page.locator('select[data-part="board"] option').all_text_contents()
    assert not any('B650M Gaming X' in n for n in board_names)
    assert not errors,errors
    mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    mobile_errors=[]
    mobile.on('pageerror',lambda e:mobile_errors.append(str(e)))
    mobile.set_content(html)
    mobile.locator('.dx-hero-actions [data-home-open="build"]').click()
    mobile.locator('[data-compare="balance"]').click()
    assert mobile.locator('[data-compare-reveal]').get_attribute('aria-hidden')=='false'
    assert not mobile_errors,mobile_errors
    browser.close()
print('PASS: 356 catalog entries, dependent parts, color mode, crisp hover cards, comparison on desktop/mobile')
