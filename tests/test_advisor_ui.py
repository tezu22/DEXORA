"""Browser smoke tests for v1.1 advisor and preserved build features."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link href="https://fonts.googleapis.com/[^>]+>','',html)
html=re.sub(r'<link rel="preconnect"[^>]+>','',html)
for name in ('layout','comparison','polish','advisor','comparison-motion','advisor-reasons','home'):
    css=(ROOT/'assets/css'/f'{name}.css').read_text(encoding='utf-8')
    html=re.sub(r'<link rel="stylesheet" href="\./assets/css/'+name+r'\.css(?:\?[^"]+)?"\s*/>',lambda _: '<style>'+css+'</style>',html)
for src in ('data/catalog.js','assets/js/seed-data.js','assets/js/advisor-data.js','assets/js/advisor-explain.js','assets/js/app.js','assets/js/home.js'):
    html=re.sub(r'<script defer src="\./'+re.escape(src)+r'(?:\?[^"]+)?"></script>',lambda _: '<script>'+(ROOT/src).read_text(encoding='utf-8')+'</script>',html)
with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':970},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  assert page.locator('select[data-part]').count()==8
  assert page.locator('.option').count()==3
  page.locator('.dx-nav-cta').click()
  assert page.locator('[data-advisor-need]').count()==60
  assert page.locator('[data-advisor-answer]').count()==0
  assert page.locator('.advisor-results-section').count()==0
  page.locator('[data-advisor-group="gaming"] summary').click() if not page.locator('[data-advisor-group="gaming"]').evaluate('e=>e.open') else None
  page.locator('[data-advisor-need="gaming-4"]').check()
  page.locator('[data-advisor-need="gaming-2"]').check()
  assert page.locator('[data-advisor-need]:checked').count()==2
  assert page.locator('.advisor-question').count()>=5
  assert page.get_by_text('Minecraft / game modded: dự kiến sử dụng?').count()==1
  page.locator('[data-advisor-answer="games"]').first.check()
  page.locator('[data-advisor-answer="games"]').nth(1).check()
  assert page.locator('[data-advisor-answer="games"]:checked').count()==2
  page.locator('[data-advisor-answer="resolution"]').nth(0).check()
  page.locator('[data-advisor-answer="resolution"]').nth(1).check()
  assert page.locator('[data-advisor-answer="resolution"]:checked').count()==2
  # Cross-category: Revit + CAD; question sets must combine.
  page.locator('[data-advisor-group="engineering"] summary').click()
  page.locator('[data-advisor-need="engineering-2"]').check()
  assert page.get_by_text('Mức độ phức tạp dự án?').count()==1
  page.locator('[data-advisor-answer="engapps"]').first.check()
  page.locator('[data-advisor-answer="engapps"]').nth(1).check()
  assert page.locator('[data-advisor-answer="engapps"]:checked').count()==2
  # No result before submit.
  assert page.locator('.advisor-results-section').count()==0
  page.locator('#advisorGenerate').click()
  assert page.locator('.advisor-results-section').count()==1
  assert page.locator('.advisor-result-card').count()>=1
  assert page.locator('.advisor-result-card').count()<=3
  for price in page.locator('.advisor-result-price').all_text_contents():
    assert '~' in price
  page.screenshot(path=str(ROOT/'preview_advisor_desktop.png'),full_page=True)
  # Conditional Minecraft question disappears when the need is removed.
  page.locator('[data-advisor-need="gaming-4"]').uncheck()
  assert page.get_by_text('Minecraft / game modded: dự kiến sử dụng?').count()==0
  assert page.locator('.advisor-results-section').count()==0
  assert not errors, errors
  mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
  mobile_errors=[]
  mobile.on('pageerror',lambda e:mobile_errors.append(str(e)))
  mobile.set_content(html,wait_until='domcontentloaded')
  mobile.locator('.dx-nav-cta').click()
  mobile.locator('[data-advisor-need="gaming-4"]').check()
  mobile.locator('[data-advisor-need="gaming-2"]').check()
  mobile.locator('[data-advisor-answer="games"]').first.check()
  mobile.locator('[data-advisor-answer="games"]').nth(1).check()
  assert mobile.locator('[data-advisor-answer="games"]:checked').count()==2
  mobile.screenshot(path=str(ROOT/'preview_advisor_mobile.png'),full_page=True)
  # Detect overflow in the advisor content only.
  overflow=mobile.evaluate('''() => {
     const v = document.getElementById('pageView');
     const box=v.getBoundingClientRect();
     return {body:document.body.scrollWidth,viewport:window.innerWidth,pageWidth:box.width};
   }''')
  assert overflow['body']<overflow['viewport']+20, overflow
  assert not mobile_errors,mobile_errors
  browser.close()
print('PASS: multi-needs (60), multi-answers, conditional questions, delayed outputs, mobile, no JS errors')
