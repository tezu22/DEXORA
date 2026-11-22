/**
 * NEON//RIG — explainable PC advisor (offline, rule-based, no AI API).
 * The output compares an advisor proposal ONLY to the person's questionnaire,
 * never to the configuration selected on the separate Self Build page.
 * Not a hardware benchmark or promise of actual frame rates.
 */
(() => {
  const GRP = {high:'Cốt lõi',normal:'Bình thường',low:'Phụ'};
  const short = (v,n=90) => String(v||'').length > n ? String(v).slice(0,n-1)+'…' : String(v||'');
  const some = (arr,fragments) => arr.some(s=>fragments.some(f=>s.toLowerCase().includes(f.toLowerCase())));
  const gb = part => {
    if(Number.isFinite(part?.capacity))return part.capacity;
    const matches = String(part?.name||'').match(/(\d+(?:\.\d+)?)\s*(TB|GB)/i);
    if(!matches)return null;
    return Math.round(Number(matches[1])*(matches[2].toUpperCase()==='TB'?1024:1));
  };
  const vramGB = part => Number.isFinite(part?.vram) ? part.vram : (()=>{
    const m = String(part?.name||'').match(/\b(\d{1,2})\s*GB\b/i);
    return m?Number(m[1]):null;
  })();
  const storageGB = part => {
    const c=gb(part);
    return c===null?null:c;
  };
  const formatted = amount => new Intl.NumberFormat('vi-VN').format(Math.round(amount))+'đ';
  const budgetText = (total,budget) => Number.isFinite(total)&&Number.isFinite(budget)
    ? total<=budget?`Còn khoảng ${formatted(budget-total)} trong ngân sách.`:`Vượt ngân sách khoảng ${formatted(total-budget)}.`
    : 'Chưa đủ dữ liệu để đối chiếu ngân sách.';
  const priorityScore = priority => priority==='high'?3:priority==='normal'?2:1;

  function evaluate({groups,needs,answers,priorities,parts,price,budget,tier,signal,colorMode,colorReview}){
    const ram=gb(parts.ram),ssd=storageGB(parts.ssd),vram=vramGB(parts.gpu);
    const active = groups.filter(g=>g.needs.some(n=>needs.has(n.id))).map(group=>{
      const labels=group.needs.filter(n=>needs.has(n.id)).map(n=>n.label);
      const q = group.questions.filter(x=>!x.when?.length||x.when.some(n=>needs.has(n)));
      const answersInGroup = q.flatMap(question=>(Array.isArray(answers[question.id])?answers[question.id]:[]).map(value=>({question:question.title,value})));
      return {id:group.id,title:group.title,labels,answers:answersInGroup,priority:priorities[group.id]||'high',items:answersInGroup.map(v=>v.value)};
    });
    const activeSorted = [...active].sort((a,b)=>priorityScore(b.priority)-priorityScore(a.priority));
    const has=id=>active.some(g=>g.id===id);
    const allAnswers=active.flatMap(g=>g.items);
    const facts=[];
    const groupResults=[];
    const addFact=(heading,body)=>facts.push({heading,body});
    const put=(group,status,note)=>groupResults.push({...group,status,note});
    const heavyRam=signal.minRam>=32;
    const needsHighGame = some(allAnswers,['1440p','2160p','4K','Ray Tracing','Path Tracing','Ultra','shader nặng']);
    const gGame=active.find(g=>g.id==='gaming');
    const gWork=active.find(g=>g.id==='engineering');
    const gStream=active.find(g=>g.id==='stream');
    const gAI=active.find(g=>g.id==='ai');
    const gCreative=active.find(g=>g.id==='creative');
    const gDev=active.find(g=>g.id==='dev');
    const needRamMessage = ram===null?'Chưa xác minh được dung lượng RAM.':ram>=signal.minRam?`${ram}GB RAM đạt ngưỡng ${signal.minRam}GB định hướng từ những câu trả lời.`:`${ram}GB RAM thấp hơn ngưỡng ${signal.minRam}GB định hướng cho nhu cầu đã chọn.`;

    // Explicitly describe what the proposal was optimised for. Price is DEMO.
    if(tier==='value')addFact('Chi phí',`Chọn phương án có giá mẫu thấp nhất trong các tổ hợp qua bộ lọc kỹ thuật sơ bộ. ${budgetText(price,budget)}`);
    else if(tier==='balanced')addFact('Phân bổ ngân sách',`Tìm điểm giữa về giá và điểm ưu tiên CPU/GPU của bộ quy tắc demo. ${budgetText(price,budget)}`);
    else addFact('Ưu tiên cấu hình',`Ưu tiên điểm CPU/GPU theo các nhóm nhu cầu đã đánh dấu trong giới hạn ngân sách. ${budgetText(price,budget)}`);
    if(gGame||gCreative||gAI){
      addFact('Card đồ họa',`${parts.gpu.name}${vram===null?' (chưa xác minh VRAM)':' với '+vram+'GB VRAM'} được đưa vào để phục vụ ${[gGame&&'chơi game',gCreative&&'đồ họa/dựng phim',gAI&&'AI'].filter(Boolean).join(', ')}. FPS, tốc độ render và tốc độ AI vẫn cần số đo thực tế.`);
    }
    if(gWork||gDev||gStream||active.some(g=>g.id==='server')){
      addFact('CPU và đa nhiệm',`Chọn ${parts.cpu.name} cùng nền tảng ${parts.board.socket||parts.cpu.socket||'chưa xác minh'} cho các công việc đã chọn. Điểm CPU trong công cụ hiện là xếp hạng tham khảo, chưa đo tốc độ xử lý.`);
    }
    if(heavyRam||gWork||gCreative||gDev||gAI) addFact('Bộ nhớ',needRamMessage);
    if(ssd!==null && (signal.wantStorage>=2000||active.some(g=>g.id==='server'))) addFact('Lưu trữ',`${parts.ssd.name}: khoảng ${ssd>=1024?(ssd/1024).toFixed(ssd%1024===0?0:1)+'TB':ssd+'GB'}. ${ssd>=signal.wantStorage?'Đạt mức lưu trữ mục tiêu sơ bộ.':'Thấp hơn mục tiêu lưu trữ suy ra từ câu trả lời; có thể cần thêm SSD.'}`);

    for(const group of activeSorted){
      const x=group.items;
      let status='verify',note='Chưa đủ dữ liệu đo kiểm để khẳng định hiệu năng theo tác vụ cụ thể.';
      if(group.id==='gaming'){
        const manyMods=group.labels.some(s=>/modpack/i.test(s))&&some(x,['150–300+ mod','50–150 mod']);
        if(manyMods&&ram!==null&&ram<32){status='warning';note=`Bạn đã chọn Minecraft modded; ${ram}GB RAM có thể hạn chế khi modpack lớn. Nên cân nhắc 32GB và đo thực tế.`;}
        else note=`Bạn chọn ${short(group.labels.join(', '),85)}${x.length?' cùng thiết lập '+short(x.join(', '),90):''}. ${manyMods&&ram>=32?ram+'GB RAM đạt ngưỡng sơ bộ cho modpack. ':''}Cần benchmark theo game, độ phân giải và mức đồ họa${needsHighGame?' (đặc biệt 2K/4K, Ultra/RT)':''}; không thể kết luận FPS chỉ từ tên GPU.`;
      }
      else if(group.id==='stream'){
        note=`Bạn chọn ${short(group.labels.join(', '),100)}. GPU ${short(parts.gpu.name,52)} có mặt trong cấu hình, nhưng phải kiểm tra bộ mã hóa, OBS và hiệu năng khi vừa chạy game vừa phát; chưa có số đo chất lượng livestream.`;
      }
      else if(group.id==='engineering'){
        const heavy=some(x,['BIM / mô hình nhiều liên kết','Đại công trình','mở nhiều phần mềm'])||group.labels.some(s=>/Revit|Lumion|CFD|FEA/.test(s));
        if(heavy&&ram!==null&&ram<32){status='warning';note=`Đã chọn tác vụ kỹ thuật nặng nhưng RAM chỉ ${ram}GB. Nên cân nhắc ít nhất 32GB; vẫn cần đo tốc độ Revit/CAD/render.`;}
        else note=`Các mục ${short(group.labels.join(', '),88)} cần xem xét CPU, RAM, GPU theo tác vụ. ${ram!==null?ram+'GB RAM'+(heavy?' đạt ngưỡng định hướng ban đầu':' có trong cấu hình')+'. ':''}Chưa có dữ liệu dự án BIM, CAD hay render để xác nhận thời gian xử lý.`;
      }
      else if(group.id==='creative'){
        const heavy=some(x,['4K','6K / 8K','Nhiều lớp hiệu ứng / RAW','Lớn / chuyên nghiệp']);
        if(heavy&&ram!==null&&ram<32){status='warning';note=`Bạn chọn dựng nội dung độ phân giải/tác vụ nặng, nhưng RAM mới ${ram}GB. 32GB là mốc cân nhắc ban đầu; chưa đủ dữ liệu xác minh render.`;}
        else note=`Cần đánh giá tốc độ xuất video, độ mượt timeline và plugin theo ${short(x.join(', ')||group.labels.join(', '),105)}. ${vram===null?'VRAM chưa rõ.':'GPU có '+vram+'GB VRAM.'} Chưa có kết quả thử nghiệm tương ứng.`;
      }
      else if(group.id==='dev'){
        const heavy=some(x,['Nhiều dự án','nhiều máy ảo','Docker','WSL','Build / compile'])||group.labels.some(s=>/Docker|máy ảo|dự án lớn/i.test(s));
        if(heavy&&ram!==null&&ram<32){status='warning';note=`Có nhu cầu máy ảo/đa nhiệm phát triển nhưng RAM chỉ ${ram}GB. Nên cân nhắc 32GB hoặc hơn tùy số máy ảo.`;}
        else {status=ram!==null&&ram>=16?'partial':'verify';note=`${ram!==null?ram+'GB RAM có thể dùng làm mức khởi đầu. ':''}Khả năng build dự án, chạy IDE/máy ảo phụ thuộc dự án thực tế; chưa có benchmark.`;}
      }
      else if(group.id==='ai'){
        const requireCuda=x.some(s=>s.includes('CUDA / NVIDIA bắt buộc'));
        const explicit= x.some(s=>s.includes('24GB VRAM'))?24:x.some(s=>s.includes('16GB VRAM'))?16:x.some(s=>s.includes('8–12GB VRAM'))?8:null;
        const nvidia=/RTX|GeForce|NVIDIA/i.test(parts.gpu.name);
        if(requireCuda&&!nvidia){status='warning';note='Bạn yêu cầu CUDA/NVIDIA nhưng GPU trong cấu hình chưa xác minh đáp ứng hệ sinh thái CUDA.';}
        else if(explicit!==null&&vram!==null&&vram<explicit){status='warning';note=`Mục tiêu VRAM bạn chọn là ${explicit}GB trở lên, GPU hiện chỉ có ${vram}GB; cần thay GPU hoặc giảm quy mô mô hình.`;}
        else {status='verify';note=`${vram===null?'Chưa xác minh được VRAM.':`GPU có ${vram}GB VRAM${explicit!==null&&vram>=explicit?' — đạt ngưỡng dung lượng bạn nhập':''}.`} ${requireCuda?'Bạn yêu cầu CUDA; cần kiểm tra driver và phần mềm hỗ trợ. ':''}Chưa có benchmark suy luận/huấn luyện cho mô hình cụ thể.`;}
      }
      else if(group.id==='office'){
        status=ram!==null&&ram>=16?'partial':'verify';
        note=`Với ${short(x.join(', ')||group.labels.join(', '),95)}, ${ram!==null?ram+'GB RAM là một mức khởi đầu về dung lượng':'RAM chưa rõ dung lượng'}. Cần xác minh cổng xuất hình nếu dùng nhiều màn hình; chưa kiểm thử từng ứng dụng.`;
      }
      else if(group.id==='learning'){
        status=ram!==null&&ram>=16?'partial':'verify';note=`${short(group.labels.join(', '),102)}. ${ram!==null?ram+'GB RAM là mốc tham khảo ban đầu. ':''}Phần mềm chuyên ngành và thời gian sử dụng dài cần kiểm tra thêm trước khi mua.`;
      }
      else if(group.id==='server'){
        const storageHeavy=group.labels.some(s=>/NAS|lưu trữ/.test(s));
        if(storageHeavy&&ssd!==null&&ssd<2000){status='warning';note=`Bạn đã chọn NAS/lưu trữ nhưng dung lượng mẫu chỉ khoảng ${ssd}GB. Cần xác định dung lượng, độ bền ổ và phương án sao lưu.`;}
        else note=`Bạn chọn ${short(group.labels.join(', '),100)}. Cần xác minh số người dùng, lưu trữ, mạng, nhiệt độ và độ tin cậy nếu chạy 24/7; chưa có thử nghiệm tải dài hạn.`;
      }
      else if(group.id==='special'){
        const compact = some(x,['ITX / SFF'])||group.labels.some(s=>/ITX|SFF/.test(s));
        if(compact && !/ITX|SFF/i.test(parts.case.name)){status='warning';note=`Bạn ưu tiên ITX/SFF, nhưng case đang chọn (${parts.case.name}) chưa được xác minh thuộc loại này.`;}
        else note=`Bạn yêu cầu ${short(group.labels.join(', '),95)}. Màu và kích thước cần đối chiếu từng SKU; độ ồn/RGB/khả năng nâng cấp chưa có số đo đầy đủ.`;
      }
      put(group,status,note);
    }

    if(colorMode==='white'||colorMode==='black'){
      const mismatches=colorReview?.mismatch?.length||0,unknown=colorReview?.unknown?.length||0;
      const selectedColor = colorMode==='white'?'trắng':'đen';
      if(mismatches)groupResults.push({id:'style-color',title:'Ngoại hình '+selectedColor,labels:['Phối màu '+selectedColor],answers:[],priority:'high',status:'warning',note:`Có ${mismatches} hạng mục khác màu ${selectedColor}. Cần đổi đúng SKU nếu Full ${selectedColor} là bắt buộc.`});
      else if(unknown)groupResults.push({id:'style-color',title:'Ngoại hình '+selectedColor,labels:['Phối màu '+selectedColor],answers:[],priority:'high',status:'verify',note:`Còn ${unknown} hạng mục chưa xác minh màu phiên bản; không thể khẳng định máy Full ${selectedColor}.`});
      else groupResults.push({id:'style-color',title:'Ngoại hình '+selectedColor,labels:['Phối màu '+selectedColor],answers:[],priority:'high',status:'partial',note:`Các linh kiện nhìn thấy được đã khớp màu ${selectedColor} theo thông tin danh mục; vẫn cần đối chiếu SKU thực tế.`});
    }
    const gaps=groupResults.filter(x=>x.status==='warning');
    const uncertainties=groupResults.filter(x=>x.status==='verify');
    const notes=[];
    if(gaps.length)notes.push(`Còn ${gaps.length} nhóm tiêu chí cần chỉnh trước khi chốt mua, đặc biệt: ${gaps.map(x=>x.title).slice(0,2).join(', ')}.`);
    if(uncertainties.length)notes.push(`${uncertainties.length} nhóm chưa có benchmark hoặc dữ liệu xác minh; không nên kết luận hiệu năng chỉ bằng tên linh kiện.`);
    if(!gaps.length&&!uncertainties.length)notes.push('Các tiêu chí định lượng sơ bộ đã qua kiểm tra; vẫn cần kiểm chứng kỹ thuật thực tế trước khi mua.');
    if(Number.isFinite(price)) notes.push(budgetText(price,budget));
    const focus=activeSorted.slice(0,2).map(g=>g.title).join(' và ');
    let recommendation = tier==='value'
      ? `Phù hợp để cân nhắc khi bạn ưu tiên tiết kiệm và chấp nhận đánh đổi một phần dư địa nâng cấp${focus?' cho '+focus:''}.`
      :tier==='balanced'
        ? `Đáng cân nhắc khi bạn cần cân đối ngân sách cho nhiều nhu cầu${focus?' — nhất là '+focus:''}.`
        :`Đáng xem xét nếu bạn sẵn sàng dành nhiều ngân sách hơn cho nhóm linh kiện ưu tiên${focus?' phục vụ '+focus:''}.`;
    if(gaps.length)recommendation=`Chưa nên chốt phương án này trước khi xử lý ${gaps.map(x=>x.title).slice(0,2).join(' và ')}. `+recommendation;
    const signature=activeSorted.slice(0,3).map(g=>g.title).join(' • ')||'Nhu cầu chung';
    return {active,signature,groupResults,facts,notes,recommendation,counts:{warning:gaps.length,verify:uncertainties.length,partial:groupResults.filter(x=>x.status==='partial').length},ram,ssd,vram};
  }
  window.NEON_ADVISOR_EXPLAIN = {evaluate};
})();
