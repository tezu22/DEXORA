from pathlib import Path
import re
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
h=(R/'index.html').read_text()
h=re.sub(r'<link href="https://fonts.googleapis.com/[^>]+>','',h)
h=re.sub(r'<link rel="preconnect"[^>]+>','',h)
for name in ['layout','comparison','polish','advisor']:
 h=h.replace(f'<link rel="stylesheet" href="./assets/css/{name}.css" />',f'<style>{(R/f"assets/css/{name}.css").read_text()}</style>')
for name in ['data/catalog.js','assets/js/seed-data.js','assets/js/advisor-data.js','assets/js/app.js']:
 h=h.replace(f'<script defer src="./{name}"></script>',f'<script>{(R/name).read_text()}</script>')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 pg=b.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
 pg.set_content(h)
 pg.locator('[data-page="advisor"]').click()
 pg.locator('.advisor-section-head').first.scroll_into_view_if_needed()
 pg.screenshot(path=str(R/'preview_needs.png'))
 pg.locator('[data-advisor-need="gaming-4"]').check()
 pg.locator('[data-advisor-need="gaming-2"]').check()
 pg.locator('[data-advisor-group="engineering"] summary').click()
 pg.locator('[data-advisor-need="engineering-2"]').check()
 pg.locator('[data-advisor-answer="games"]').first.check()
 pg.locator('[data-advisor-answer="games"]').nth(1).check()
 pg.locator('[data-advisor-answer="resolution"]').nth(0).check()
 pg.locator('[data-advisor-answer="resolution"]').nth(1).check()
 pg.locator('.advisor-questions-head').scroll_into_view_if_needed()
 pg.screenshot(path=str(R/'preview_multiple_answers.png'))
 pg.locator('#advisorGenerate').click()
 pg.locator('.advisor-results-section').scroll_into_view_if_needed()
 pg.screenshot(path=str(R/'preview_three_builds.png'))
 b.close()
print('created',*[x.name for x in R.glob('preview_*.png')])
