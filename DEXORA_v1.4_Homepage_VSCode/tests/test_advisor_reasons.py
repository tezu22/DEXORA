"""Advisor must evaluate recommendations against answers, never the self-built PC."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re

ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
# Inline local assets so Chromium tests run even when localhost HTTP is blocked.
html=re.sub(r'<link href="https://fonts.googleapis.com/[^>]+>','',html)
html=re.sub(r'<link rel="preconnect"[^>]+>','',html)
for match in list(re.finditer(r'<link rel="stylesheet" href="(\./assets/css/[^"]+\.css)(?:\?[^"]+)?"\s*/>',html)):
    tag=match.group(0)
    css=(ROOT/match.group(1)[2:]).read_text(encoding='utf-8')
    html=html.replace(tag,'<style>'+css+'</style>')
for match in list(re.finditer(r'<script defer src="(\./(?:data|assets/js)/[^"]+\.js)(?:\?[^"]+)?"></script>',html)):
    tag=match.group(0)
    js=(ROOT/match.group(1)[2:]).read_text(encoding='utf-8')
    html=html.replace(tag,'<script>'+js+'</script>')

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until="domcontentloaded")
    page.locator('.dx-nav-cta').click()
    assert page.locator('[data-advisor-need]').count()==60
    for sel in ('gaming-4','gaming-2','engineering-2','stream-2'):
        group=sel.split('-')[0]
        section=page.locator(f'[data-advisor-group="{group}"]')
        if not section.evaluate('el=>el.open'):
            section.locator('summary').click()
        page.locator(f'[data-advisor-need="{sel}"]').check()
    # exercise multi-select to ensure advice follows answers rather than static presets
    page.locator('[data-advisor-answer="resolution"]').nth(1).check() # 1440p (2K)
    page.locator('[data-advisor-answer="mods"]').nth(2).check() # 150–300+ mod
    page.locator('[data-advisor-answer="mods"]').nth(3).check() # shader nặng
    page.locator('[data-advisor-answer="engscale"]').nth(2).check() # BIM
    page.locator('[data-advisor-answer="engapps"]').nth(1).check() # Revit
    page.locator('[data-advisor-answer="streamres"]').nth(1).check()
    assert page.locator('[data-advisor-answer="mods"]:checked').count()==2
    page.locator('#advisorGenerate').click()
    count=page.locator('.advisor-result-card').count()
    assert 1<=count<=3, count
    assert page.locator('.advisor-mini-rationale').count()==count
    assert page.locator('.advisor-compare-button').first.inner_text().find('LÝ DO')>=0
    card=page.locator('[data-advisor-option="0"]')
    card.hover()
    page.wait_for_timeout(600)
    panel=page.locator('[data-advisor-compare-panel]')
    assert 'is-open' in panel.get_attribute('class')
    txt=panel.inner_text()
    for expected in ('ĐỐI CHIẾU', 'Lý do chọn linh kiện','Đối chiếu từng nhóm nhu cầu','NGÂN SÁCH CỦA BẠN','Minecraft','Revit','150–300+ mod','1440p (2K)'):
        assert expected.lower() in txt.lower(), (expected,txt[:600])
    for wrong in ('BUILD HIỆN TẠI','BUILD CỦA BẠN','linh kiện thay đổi'):
        assert wrong not in txt,wrong
    panel.screenshot(path=str(ROOT/'preview_need_analysis.png'),animations='disabled')
    # Self Build is still separate; comparison logic there must be preserved.
    page.locator('button[data-page="build"]').click()
    assert page.locator('[data-compare-stage]').count()==1
    page.locator('[data-compare="balance"]').click()
    assert 'is-open' in page.locator('[data-compare-stage]').get_attribute('class')
    assert 'CẤU HÌNH CỦA BẠN' in page.locator('[data-compare-content]').inner_text().upper()
    assert not errors,errors

    # Separate heavy AI case: insufficient VRAM should become an explicit gap.
    second=browser.new_page(viewport={'width':1440,'height':900})
    second_errors=[]
    second.on('pageerror',lambda e:second_errors.append(str(e)))
    second.set_content(html,wait_until="domcontentloaded")
    second.locator('.dx-nav-cta').click()
    second.locator('[data-advisor-group="ai"] summary').click()
    second.locator('[data-advisor-need="ai-1"]').check()
    second.locator('[data-advisor-answer="airuntime"]').first.check()
    second.locator('[data-advisor-answer="aimemory"]').nth(2).check() # 24GB
    second.locator('#advisorGenerate').click()
    assert second.locator('.advisor-result-card').count()>0
    second.locator('[data-advisor-option="0"]').hover()
    text=second.locator('[data-advisor-compare-panel]').inner_text()
    assert '24GB' in text
    assert 'CẦN ĐIỀU CHỈNH' in text
    assert 'BUILD CỦA BẠN' not in text
    assert not second_errors,second_errors

    mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    mobile_errors=[]
    mobile.on('pageerror',lambda e:mobile_errors.append(str(e)))
    mobile.set_content(html,wait_until="domcontentloaded")
    mobile.locator('.dx-nav-cta').click()
    mobile.locator('[data-advisor-need="gaming-4"]').check()
    mobile.locator('[data-advisor-group="engineering"] summary').click()
    mobile.locator('[data-advisor-need="engineering-2"]').check()
    mobile.locator('[data-advisor-answer="mods"]').nth(2).check()
    mobile.locator('#advisorGenerate').click()
    mobile.locator('[data-advisor-option="0"]').click(position={'x':30,'y':30})
    assert mobile.locator('[data-advisor-compare-panel]').get_attribute('aria-hidden')=='false'
    mobile.locator('[data-advisor-compare-panel]').screenshot(path=str(ROOT/'preview_need_analysis_mobile.png'),animations='disabled')
    sizes=mobile.evaluate('''() => ({width:document.body.scrollWidth,window:innerWidth})''')
    assert sizes['width']<=sizes['window']+25,sizes
    assert not mobile_errors,mobile_errors
    browser.close()
print('PASS: advisor uses questionnaire, meaningful advice, unchanged self-build, AI warning, mobile and no JS errors')
