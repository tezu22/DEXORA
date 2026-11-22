"""User-facing language and workflow smoke test for NEON//RIG v1.3.0."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link href="https://fonts.googleapis.com/[^>]+>','',html)
html=re.sub(r'<link rel="preconnect"[^>]+>','',html)
for m in list(re.finditer(r'<link rel="stylesheet" href="(\./assets/css/[^"?]+\.css)(?:\?[^"\s]+)?"\s*/>',html)):
  html=html.replace(m.group(0), '<style>'+ (ROOT/m.group(1)[2:]).read_text()+'</style>')
for m in list(re.finditer(r'<script defer src="(\./(?:data|assets/js)/[^"?]+\.js)(?:\?[^"\s]+)?"></script>',html)):
  html=html.replace(m.group(0), '<script>'+(ROOT/m.group(1)[2:]).read_text()+'</script>')
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':900})
  errors=[]
  page.on('pageerror', lambda e: errors.append(str(e)))
  page.set_content(html)
  assert page.get_by_text('Chọn đúng máy.').count()>=1
  page.locator('.dx-hero-actions [data-home-open="build"]').click()
  body=page.locator('body').inner_text()
  assert 'Cấu hình bạn đang chọn' in body
  assert 'NGÂN SÁCH DỰ KIẾN' in body
  assert 'THỬ HIỆU ỨNG' not in body
  assert 'LIVE HOVER ANALYSIS' not in body
  assert 'RULE-BASED DEMO' not in body
  assert 'Cấu hình của m' not in body
  assert 'TỔNG CHI PHÍ ƯỚC TÍNH' in body
  assert '3 PHƯƠNG ÁN THAM KHẢO' in body
  page.locator('[data-option="balance"]').hover()
  page.wait_for_timeout(600)
  assert page.locator('.compare-stage.is-open').count()==1
  assert 'CẤU HÌNH CỦA BẠN' in page.locator('[data-compare-content]').inner_text()
  page.screenshot(path=str(ROOT/'audit_build_desktop.png'),full_page=False,animations='disabled')
  # Clicking budget should not add cyan focus ring (lime focus remains).
  budget=page.locator('[data-budget-input]').first
  budget.click()
  assert budget.evaluate('el => getComputedStyle(el).outlineStyle') == 'none'
  page.locator('button[data-page="compare"]').click()
  assert page.locator('table').count()==1
  assert 'CẤU HÌNH CỦA BẠN' in page.locator('table thead').inner_text()
  page.locator('button[data-page="stores"]').click()
  assert page.locator('.store-card').count()>0
  page.locator('button[data-page="advisor"]').click()
  assert page.locator('.advisor-result-card').count()==0
  page.locator('[data-advisor-need="gaming-4"]').check()
  page.locator('[data-advisor-need="gaming-2"]').check()
  page.locator('#advisorGenerate').click()
  assert page.locator('.advisor-result-card').count()>0
  page.locator('.advisor-result-card').first.hover()
  page.wait_for_timeout(600)
  text=page.locator('[data-advisor-compare-panel]').inner_text()
  assert 'CẤU HÌNH CỦA BẠN' not in text
  assert 'GIẢI THÍCH THEO NHU CẦU' in text
  page.screenshot(path=str(ROOT/'audit_advisor_desktop.png'),full_page=False,animations='disabled')
  page.locator('#sidebarHome').click()
  page.locator('.dx-hero-actions [data-home-open="laptop"]').click()
  body=page.locator('#laptopPortal').inner_text()
  assert 'Bạn có thể thử chọn nhu cầu' in body
  assert 'M có thể' not in body
  assert not errors, errors
  browser.close()
print('PASS: copied UI labels, build vs advisor wording, budget focus, no removed labels, laptop, no JS errors')
