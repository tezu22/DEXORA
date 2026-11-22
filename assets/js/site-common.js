/* Shared nav, footer, beta feedback and accessibility features. */
(()=>{
 const root=window.DEXORA_ROOT||'./';const url=p=>root+p;const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const links=[['Trang chủ','index.html'],['Tự build PC','pages/builder.html'],['Tư vấn cấu hình','pages/advisor.html'],['Kho linh kiện','pages/catalog.html'],['Cửa hàng','pages/stores.html'],['So sánh','pages/compare.html'],['Laptop','pages/laptop.html']];
 document.querySelectorAll('[data-home-open]').forEach(b=>b.addEventListener('click',()=>{const p={build:'pages/builder.html',advisor:'pages/advisor.html',catalog:'pages/catalog.html',stores:'pages/stores.html',compare:'pages/compare.html',laptop:'pages/laptop.html'}[b.dataset.homeOpen]||'pages/builder.html';location.href=url(p)}));
 document.querySelectorAll('[data-return-home]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();location.href=url('index.html')}));
 document.getElementById('sidebarHome')?.addEventListener('click',()=>location.href=url('index.html'));
 // Mobile top-level menu deliberately sits BELOW the existing header and its D badge.
 const header=document.querySelector('.dx-header,.portal-nav,.topbar');
 if(header){const row=document.createElement('div');row.className='dexora-mobile-row';row.innerHTML='<button type="button" id="dexoraMenuOpen" aria-expanded="false" aria-controls="dexoraDrawer"><span aria-hidden="true">☰</span> Menu</button><span class="dexora-mobile-label">ĐIỀU HƯỚNG DEXORA</span>';header.after(row)}
 const backdrop=document.createElement('div');backdrop.className='dexora-menu-backdrop';backdrop.hidden=true;
 const drawer=document.createElement('nav');drawer.id='dexoraDrawer';drawer.className='dexora-mobile-drawer';drawer.setAttribute('aria-label','Menu điều hướng trên điện thoại');drawer.setAttribute('aria-hidden','true');drawer.inert=true;
 drawer.innerHTML=`<div class="drawer-head"><strong>DEXORA / MENU</strong><button type="button" id="dexoraMenuClose" aria-label="Đóng menu">←</button></div>${links.map(([name,path])=>`<a href="${url(path)}" ${location.pathname.endsWith('/'+path)?'aria-current="page"':''}>${esc(name)} <span>↗</span></a>`).join('')}`;
 document.body.append(backdrop,drawer);
 const btn=document.getElementById('dexoraMenuOpen');let previousFocus=null;
 const toggle=open=>{document.body.classList.toggle('dexora-menu-open',open);backdrop.hidden=!open;drawer.inert=!open;drawer.setAttribute('aria-hidden',String(!open));btn?.setAttribute('aria-expanded',String(open));if(open){previousFocus=document.activeElement;drawer.querySelector('a')?.focus()}else previousFocus?.focus()};
 btn?.addEventListener('click',()=>toggle(true));drawer.querySelector('#dexoraMenuClose').addEventListener('click',()=>toggle(false));backdrop.addEventListener('click',()=>toggle(false));document.addEventListener('keydown',e=>{
  if(!document.body.classList.contains('dexora-menu-open'))return;
  if(e.key==='Escape'){e.preventDefault();toggle(false);return}
  if(e.key!=='Tab')return;
  const focusable=[...drawer.querySelectorAll('a,button')].filter(el=>!el.disabled);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 });
 // Menu display label is not used as a link; preserve identity of D logo.
 document.querySelectorAll('.dx-brand,.landing-brand').forEach(el=>{if(el.hasAttribute('data-return-home')){el.removeAttribute('data-return-home');el.removeAttribute('href');el.setAttribute('role','img');el.setAttribute('aria-label','DEXORA')}});
 // Footer and feedback are injected consistently on each static page.
 const footer=document.createElement('footer');footer.className='dexora-global-footer';footer.innerHTML=`<div class="dexora-footer-inner"><div><strong class="dexora-wordmark">DE<span>X</span>ORA</strong><p>Tư vấn PC & Laptop • Giá và kết quả chỉ mang tính tham khảo.</p></div><div><h3>Liên hệ</h3><a href="mailto:anhduy262008@gmail.com">anhduy262008@gmail.com</a><a href="tel:+84947789098">0947789098</a></div><div><h3>Thông tin</h3><a href="${url('pages/policy.html')}">Chính sách & giới hạn</a><button type="button" id="dxFeedbackButton">Góp ý cho DEXORA</button><small>Designed & Developed by <b>TEZU</b></small></div></div><div class="dexora-footer-bottom">© 2026 DEXORA · BETA — Không phải trang bán hàng, không đảm bảo giá hoặc tồn kho.</div>`;
 document.body.append(footer);
 const panel=document.createElement('dialog');panel.className='dexora-feedback';panel.setAttribute('aria-label','Gửi góp ý cho DEXORA');panel.innerHTML=`<form id="dexoraFeedbackForm" method="dialog"><div class="feedback-title"><div><strong>Góp ý cho DEXORA</strong><p>Nhập góp ý hoặc báo lỗi. Không cần đăng nhập.</p></div><button type="button" id="dexoraFeedbackClose" aria-label="Đóng">✕</button></div><label for="feedbackText">Nội dung phản hồi</label><textarea id="feedbackText" name="message" required minlength="10" maxlength="2500" rows="5" placeholder="Mô tả vấn đề hoặc đề xuất của bạn..."></textarea><input type="checkbox" name="botcheck" class="dexora-botcheck" tabindex="-1" autocomplete="off"><p class="feedback-privacy">Nội dung được gửi qua Web3Forms về email của TEZU. Không gửi mật khẩu, dữ liệu cá nhân nhạy cảm hoặc mã truy cập.</p><div class="feedback-actions"><span id="feedbackStatus" aria-live="polite"></span><button type="submit" id="feedbackSend">Gửi góp ý ↗</button></div></form>`;
 document.body.append(panel);document.getElementById('dxFeedbackButton')?.addEventListener('click',()=>panel.showModal());document.getElementById('dexoraFeedbackClose').addEventListener('click',()=>panel.close());
 document.getElementById('dexoraFeedbackForm').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget,button=form.querySelector('#feedbackSend'),stat=form.querySelector('#feedbackStatus');
  if(!form.reportValidity())return;
  const last=Number(sessionStorage.getItem('dexora-feedback-last')||0);if(Date.now()-last<30000){stat.textContent='Vui lòng thử lại sau ít phút.';return}
  button.disabled=true;stat.textContent='Đang gửi...';
  const body=new FormData(form);body.set('access_key','e21256fc-6317-4580-b836-570acd59f90d');body.set('subject','DEXORA — Feedback Beta');body.set('from_name','DEXORA Web Feedback');body.set('page',location.pathname);body.set('site_version','DEXORA beta upgrade');
  try{const resp=await fetch('https://api.web3forms.com/submit',{method:'POST',body,headers:{Accept:'application/json'}});const data=await resp.json();if(!resp.ok||!data.success)throw Error('Không được xác nhận');stat.textContent='Đã gửi phản hồi thành công.';sessionStorage.setItem('dexora-feedback-last',String(Date.now()));form.reset();}
  catch{stat.textContent='Gửi thất bại. Bạn có thể thử lại hoặc liên hệ qua email ở footer.'}finally{button.disabled=false}
 });
 // Home anchor smooth scroll with fixed-header clearance.
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href')?.slice(1),el=id&&document.getElementById(id);if(!el)return;e.preventDefault();el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}));
})();
