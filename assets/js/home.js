/* DEXORA v1.2 — landing navigation and laptop preview. All desktop logic remains in app.js. */
(() => {
  const showView = view => {
    document.body.dataset.view=view;
    window.scrollTo({top:0,behavior:'instant'});
    if(view==='home')document.title='DEXORA — Chọn PC hoặc Laptop';
    else if(view==='laptop')document.title='DEXORA — Laptop Lab';
    else document.title='DEXORA — Smart PC Builder';
  };
  window.NEON_SHOW_HOME=()=>showView('home');
  document.querySelectorAll('[data-return-home]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();showView('home');}));
  document.getElementById('sidebarHome')?.addEventListener('click',()=>showView('home'));
  document.querySelectorAll('[data-home-open]').forEach(button=>button.addEventListener('click',()=>{
    const target=button.dataset.homeOpen;
    if(target==='laptop'){showView('laptop');return;}
    showView('pc');
    const page=['build','advisor','compare','catalog','stores'].includes(target)?target:'build';
    if(typeof window.NEON_SET_PC_PAGE==='function')window.NEON_SET_PC_PAGE(page);
    else document.querySelector(`#nav [data-page="${page}"]`)?.click();
  }));
  const notes={
    gaming:{title:'Gaming',why:'Ưu tiên GPU, TGP thực tế, khả năng tản nhiệt và tần số quét màn hình. Cùng tên GPU nhưng công suất và hệ thống tản khác nhau có thể cho hiệu năng khác nhau.',checks:['GPU và TGP của đúng mã máy','Nhiệt độ, độ ồn khi tải lâu','Độ phân giải, tần số quét màn hình']},
    design:{title:'Đồ họa / Kỹ thuật',why:'Cần chọn theo phần mềm sử dụng: CPU, dung lượng RAM, VRAM và chất lượng màn hình có mức quan trọng khác nhau với AutoCAD, Revit hoặc dựng phim.',checks:['RAM, khe nâng cấp, VRAM','Độ phủ màu và độ sáng màn','Benchmark trong phần mềm mục tiêu']},
    study:{title:'Học tập / Văn phòng',why:'Ưu tiên trải nghiệm sử dụng lâu dài: thời lượng pin thực tế, bàn phím, trọng lượng và khả năng kết nối; không cần trả thêm tiền cho GPU mạnh nếu ít dùng.',checks:['Thời lượng pin khi làm việc','Bàn phím, cổng kết nối','Bảo hành và trọng lượng']},
    coding:{title:'Lập trình',why:'Phụ thuộc công việc: biên dịch, máy ảo và Docker thường cần RAM/CPU tốt; với AI hoặc game development có thể phải ưu tiên GPU và VRAM.',checks:['Dung lượng RAM khả dụng','CPU duy trì hiệu năng','Khả năng nâng cấp và tản nhiệt']}
  };
  const priorities={pin:'Pin thực tế quan trọng hơn dung lượng Wh đơn thuần.',light:'Kiểm tra cân nặng máy và bộ sạc khi mang theo.',screen:'Xét độ sáng, tấm nền, màu sắc và độ phân giải.',upgrade:'Kiểm tra RAM hàn hay tháo được và số khe SSD.'};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  document.getElementById('laptopQuickForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const budget=Number(form.querySelector('#laptopBudget').value);
    if(!Number.isFinite(budget)||budget<3000000||budget>200000000)return;
    const use=form.querySelector('input[name="laptopUse"]:checked')?.value||'study';
    const chosen=[...form.querySelectorAll('input[name="laptopPriority"]:checked')].map(x=>x.value);
    const note=notes[use];
    const formatted=new Intl.NumberFormat('vi-VN').format(budget)+'đ';
    const result=document.getElementById('laptopProfileResult');
    result.innerHTML=`<div class="result-heading"><span>// DEXORA LAB · PROFILING</span><h3>Ưu tiên ${esc(note.title)} · Ngân sách ~${esc(formatted)}</h3></div><p>${esc(note.why)}</p><div class="result-columns"><div><strong>Cần kiểm tra trên từng laptop</strong><ul>${note.checks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><strong>Ưu tiên bổ sung</strong>${chosen.length?`<ul>${chosen.map(x=>`<li>${esc(priorities[x])}</li>`).join('')}</ul>`:'<p>Chưa chọn ưu tiên bổ sung.</p>'}</div></div><div class="result-note">Bản xem trước chưa có dữ liệu model/giá laptop được xác minh, nên không tạo danh sách máy hay điểm hiệu năng giả.</div>`;
    result.hidden=false;
    result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });
  const hash=location.hash.slice(1).toLowerCase();
  if(hash==='pc'){showView('pc');}
  else if(hash==='laptop'){showView('laptop');}
})();
