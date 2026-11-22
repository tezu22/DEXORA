/**
 * DEXORA Advisor v1.5 — recommendation selection engine (offline prototype).
 * No vendor benchmarks and no claim of FPS prediction. Availability of products
 * with *priced* metadata is deliberately limited and always disclosed.
 * Group priorities and multi-select answers affect CPU, GPU, RAM, SSD targets.
 */
(() => {
  const MAX_CANDIDATES = 60000;
  const norm = s => String(s||'').toLocaleLowerCase('vi-VN');
  const includes = (s,terms) => terms.some(t => norm(s).includes(norm(t)));
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const extractGB = p => {
    if(Number.isFinite(p?.capacity))return p.capacity;
    const m=String(p?.name||'').match(/(\d+(?:[.,]\d+)?)\s*(GB|TB)/i);
    return m?Math.round(Number(m[1].replace(',','.'))*(m[2].toUpperCase()==='TB'?1024:1)):null;
  };
  const ramSize = p => extractGB(p) || 0;
  const storageSize = p => extractGB(p) || 0;
  const vramSize = p => {
    if(p?.integrated)return 0;
    if(Number.isFinite(p?.vram))return p.vram;
    const m=String(p?.name||'').match(/(\d+)\s*GB/i);return m?Number(m[1]):0;
  };
  const cpuStats = p => {
    const name=norm(p.name);
    if(name.includes('7800x3d'))return {game:3.7,work:2.6};
    if(name.includes('14600k'))return {game:3.1,work:3.5};
    if(name.includes('7600'))return {game:2.3,work:2.1};
    // Unranked product: no speculative benchmark rating
    return {game:2.2,work:2.2};
  };
  const gpuRank = p => {
    if(p?.integrated)return 0.45;
    const n=norm(p.name);
    if(n.includes('5070 ti'))return 3.6;
    if(n.includes('5070'))return 2.95;
    if(n.includes('5060 ti'))return 2.2;
    return 2.0; // neutral placeholder for unbenchmarked products
  };
  const cpuHasIntegratedGraphics = cpu => {
    if(cpu?.hasIgpu===true)return true;
    if(cpu?.hasIgpu===false)return false;
    const n=norm(cpu?.name);
    if(n.includes('ryzen 5 7600')||n.includes('7800x3d'))return true;
    if(n.includes('core i5-14600k')&&!/14600kf/.test(n))return true;
    // No assumption about unverified models
    return false;
  };
  const powerNeed=(cpu,gpu)=>Math.ceil(((cpu.watts||100)+(gpu.watts||0)+90)*1.2/50)*50;
  const priced = p => Number.isFinite(p?.price) && (p.price>0 || p.integrated&&p.price===0);

  function deriveProfile({groups,needs,answers,priorities}){
    const selected=groups.map(g=>({id:g.id,needs:g.needs.filter(n=>needs.has(n.id)),
      questions:g.questions.filter(q=>!q.when?.length||q.when.some(n=>needs.has(n))),
      priority:priorities[g.id]||'high'})).filter(g=>g.needs.length);
    const active=selected.map(g=>g.id);
    const weight=g=>({high:1.8,normal:1,low:.42}[selected.find(x=>x.id===g)?.priority]||0);
    const has=id=>selected.some(g=>g.needs.some(n=>n.id===id));
    const av=[];
    for(const g of selected)for(const q of g.questions)for(const x of answers[q.id]||[])av.push(x);
    const hasAnswer=(...terms)=>av.some(x=>includes(x,terms));
    const heavyRes=hasAnswer('1440p','2160p','4K','ultrawide');
    const extremeRes=hasAnswer('2160p (4K)','ray tracing','path tracing','Ultra');
    const cuda=hasAnswer('CUDA / NVIDIA bắt buộc');
    const ramHeavy=has('gaming-4')&&hasAnswer('150–300+ mod','shader nặng') ||
      hasAnswer('nhiều máy ảo','BIM / mô hình nhiều liên kết','Đại công trình','nhiều ứng dụng','6K / 8K','Nhiều lớp hiệu ứng / RAW','Dữ liệu lớn') ||
      has('server-4')||has('dev-5')||has('creative-6');
    const virtualGpuOK= !active.includes('gaming') && !has('stream-2') && !has('stream-3') &&
      !has('creative-5')&&!has('creative-6') && !has('engineering-3')&&!has('engineering-4') &&
      !has('ai-1')&&!has('ai-2')&&!has('ai-3')&&!has('ai-4')&&!has('ai-6')&&
      !has('dev-3');
    let cpuWeight=1,gpuWeight=.15;
    let cpuTarget=1.8,gpuTarget=virtualGpuOK?.45:1.9;
    const notes=[];
    const add=(msg)=>{if(!notes.includes(msg))notes.push(msg)};
    if(weight('office')||weight('learning')){cpuWeight+=.25*(weight('office')+weight('learning'));cpuTarget=Math.max(cpuTarget,1.9);add('Tác vụ nhẹ ưu tiên chi phí và khả năng đáp ứng, không tự động chọn GPU cao cấp.');}
    if(weight('gaming')){
      const w=weight('gaming');gpuWeight+=2*w;cpuWeight+=.8*w;
      cpuTarget=Math.max(cpuTarget,2.2);gpuTarget=Math.max(gpuTarget,hasAnswer('1440p','2K')?2.85:2.15);
      if(has('gaming-2')||has('gaming-6')||extremeRes)gpuTarget=Math.max(gpuTarget,extremeRes?3.55:2.85);
      if(has('gaming-1')&&hasAnswer('165–240 FPS','240+ FPS'))cpuTarget=Math.max(cpuTarget,3.3);
      if(has('gaming-4')){cpuTarget=Math.max(cpuTarget,2.5);add('Minecraft modded cần RAM theo modpack và CPU đủ tốt; FPS shader còn phụ thuộc GPU.');}
      add('Game được ưu tiên theo độ phân giải và thiết lập bạn chọn, chưa thể khẳng định FPS khi thiếu benchmark.');
    }
    if(weight('stream')){
      const w=weight('stream');cpuWeight+=.8*w;gpuWeight+=.65*w;
      cpuTarget=Math.max(cpuTarget,2.45);
      if(has('stream-2'))gpuTarget=Math.max(gpuTarget,2.2);
      add('Livestream cần kiểm tra khả năng mã hóa và tải máy khi chạy đồng thời, không chỉ tên GPU.');
    }
    if(weight('creative')){
      const w=weight('creative');cpuWeight+=.8*w;gpuWeight+=(has('creative-5')||has('creative-6')?1.6:.6)*w;
      cpuTarget=Math.max(cpuTarget,2.5);
      if(has('creative-5')||has('creative-6')||hasAnswer('Render GPU'))gpuTarget=Math.max(gpuTarget,2.85);
      if(hasAnswer('6K / 8K','Lớn / chuyên nghiệp'))cpuTarget=Math.max(cpuTarget,3.1);
      add('Đồ họa và dựng phim cần đánh giá riêng tốc độ xử lý, RAM và VRAM theo phần mềm.');
    }
    if(weight('engineering')){
      const w=weight('engineering');cpuWeight+=1.6*w;gpuWeight+=(has('engineering-4')||has('engineering-5')?1.2:.3)*w;
      cpuTarget=Math.max(cpuTarget,has('engineering-2')||has('engineering-6')?3.05:2.5);
      if(has('engineering-4')||hasAnswer('Render GPU'))gpuTarget=Math.max(gpuTarget,2.85);
      add('CAD/BIM ưu tiên CPU và RAM; Lumion hoặc render GPU cần xét thêm GPU/VRAM.');
    }
    if(weight('dev')){
      cpuWeight+=1.4*weight('dev');cpuTarget=Math.max(cpuTarget,has('dev-5')||has('dev-6')?3.15:2.35);
      if(has('dev-3'))gpuTarget=Math.max(gpuTarget,2.2);
      add('Máy ảo/biên dịch thường cần CPU và RAM trước khi nâng card đồ họa.');
    }
    if(weight('ai')){
      cpuWeight+=.7*weight('ai');gpuWeight+=2.2*weight('ai');cpuTarget=Math.max(cpuTarget,2.3);gpuTarget=Math.max(gpuTarget,2.2);
      add('Nhu cầu AI phải kiểm tra VRAM và nền tảng phần mềm; không nên chọn card chỉ theo giá.');
    }
    if(weight('server')){
      cpuWeight+=1.35*weight('server');cpuTarget=Math.max(cpuTarget,has('server-4')?3:2.3);
      add('Máy chủ cần đánh giá RAM, lưu trữ, tải 24/7 và độ tin cậy riêng.');
    }
    const minRam=ramHeavy||has('gaming-4')&&hasAnswer('50–150 mod')||has('engineering-2')||has('ai-4')?32:16;
    const minStorage=(has('server-1')||hasAnswer('6K / 8K','Ghi hình chất lượng cao để biên tập','Nhiều lớp hiệu ứng / RAW')||has('creative-6'))?2000:1000;
    const minVram=hasAnswer('24GB VRAM trở lên')?24:hasAnswer('16GB VRAM')?16:hasAnswer('8–12GB VRAM')?8:0;
    if(minVram) gpuTarget=Math.max(gpuTarget,minVram>=16?2.2:1.9);
    if(!virtualGpuOK && gpuTarget<1.9)gpuTarget=1.9;
    const level=clamp((gpuTarget+cpuTarget)/2,0,4);
    const signature=active.join('|')+';'+Array.from(needs).sort().join('|')+';'+av.slice().sort().join('|');
    const focus=selected.sort((a,b)=>weight(b.id)-weight(a.id)).slice(0,3).map(x=>x.id);
    const title=focus.map(x=>({gaming:'Gaming',stream:'Livestream',creative:'Đồ họa',engineering:'CAD / BIM',dev:'Lập trình',ai:'AI',office:'Văn phòng',learning:'Học tập',server:'Máy chủ',special:'Tùy chỉnh'})[x]).join(' · ');
    return {cpuWeight,gpuWeight,cpuTarget,gpuTarget,minRam,minStorage,minVram,cuda,virtualGpuOK,
      preferCompact:has('special-1')||hasAnswer('ITX / SFF'),signature,level,notes,title,answers:av};
  }

  function evaluateCandidate(profile,{cpu,board,ram,gpu,ssd,cooler,casePart,psu},price){
    const c=cpuStats(cpu),cs=c.game*(profile.gpuWeight>profile.cpuWeight? .6:.2)+c.work*(profile.gpuWeight>profile.cpuWeight? .4:.8);
    const g=gpuRank(gpu),m=ramSize(ram),s=storageSize(ssd),v=vramSize(gpu);
    let score=100;
    const shortage=(target,actual,power)=>Math.max(0,target-actual)*power;
    score -= shortage(profile.cpuTarget,cs,10+profile.cpuWeight*1.9);
    score -= shortage(profile.gpuTarget,g,10+profile.gpuWeight*2.8);
    score -= shortage(profile.minRam,m,1.65);
    score -= shortage(profile.minStorage,s,.007);
    if(profile.minVram && v<profile.minVram)score-=35+(profile.minVram-v)*3;
    if(profile.cuda&&!/GeForce|RTX|NVIDIA/i.test(gpu.name))score-=60;
    if(profile.preferCompact&&!/ITX|SFF|Compact|Mini/i.test(casePart.name))score-=8;
    if(!profile.virtualGpuOK&&gpu.integrated)score-=75;
    // Additional capacity counts only when user demanded it; no arbitrary overbuying.
    score+=Math.min(2,Math.max(0,cs-profile.cpuTarget))*1.0;
    score+=Math.min(2,Math.max(0,g-profile.gpuTarget))*1.0;
    if(profile.minStorage>=2000&&s>=2000)score+=.5;
    return clamp(score,0,104);
  }

  function generate({parts,budget,groups,needs,answers,priorities,chosenColor,colorPolicy,colorReview}){
    const profile=deriveProfile({groups,needs,answers,priorities});
    const group=id=>(parts[id]||[]).filter(priced);
    const [cpus,boards,rams,gpus,ssds,coolers,cases,psus]=['cpu','board','ram','gpu','ssd','cooler','case','psu'].map(group);
    const maxVRAM=Math.max(0,...gpus.map(vramSize));
    if(profile.minVram>maxVRAM)return {builds:[],profile,message:`Bạn yêu cầu tối thiểu ${profile.minVram}GB VRAM nhưng kho linh kiện có giá tham khảo hiện chỉ tới ${maxVRAM}GB. Chưa thể tạo cấu hình đạt điều kiện này. Cần bổ sung dữ liệu sản phẩm và giá phù hợp.`,total:0};
    const eligibleCPU=cpus.filter(cpu=>!profile.virtualGpuOK || true);
    const eligibleGPU=gpus.filter(gpu=>!gpu.integrated||profile.virtualGpuOK);
    const candidates=[];
    for(const cpu of eligibleCPU){
      for(const board of boards){if(board.socket!==cpu.socket)continue;
        for(const ram of rams){if(ram.ram!==board.ram||ramSize(ram)<profile.minRam)continue;
          for(const gpu of eligibleGPU){
            if(gpu.integrated&&!cpuHasIntegratedGraphics(cpu))continue;
            if(vramSize(gpu)<profile.minVram)continue;
            if(profile.cuda&&!/RTX|GeForce|NVIDIA/i.test(gpu.name))continue;
            for(const ssd of ssds){if(storageSize(ssd)<profile.minStorage)continue;
              for(const cooler of coolers){if(!cooler.sockets?.includes(cpu.socket)||cooler.cap!=null&&cooler.cap<cpu.watts)continue;
                for(const casePart of cases){
                  if(!casePart.forms?.includes(board.form)||casePart.maxGpu!=null&&gpu.gpuLength!=null&&gpu.gpuLength>casePart.maxGpu||casePart.maxRad!=null&&cooler.rad>casePart.maxRad||casePart.maxAir!=null&&cooler.coolerHeight>casePart.maxAir)continue;
                  for(const psu of psus){if(psu.watts<powerNeed(cpu,gpu))continue;
                    const items={cpu:cpu.id,board:board.id,ram:ram.id,gpu:gpu.id,ssd:ssd.id,cooler:cooler.id,case:casePart.id,psu:psu.id};
                    const price=cpu.price+board.price+ram.price+gpu.price+ssd.price+cooler.price+casePart.price+psu.price;
                    if(price>budget)continue;
                    const colors=colorReview(items);
                    if(colorPolicy==='strict'&&chosenColor&&(colors.mismatch.length||colors.unknown.length))continue;
                    const score=evaluateCandidate(profile,{cpu,board,ram,gpu,ssd,cooler,casePart,psu},price) - (chosenColor?(colors.mismatch.length*1.5+colors.unknown.length*.25):0);
                    candidates.push({items,price,quality:score,ramGB:ramSize(ram),storageGB:storageSize(ssd),
                      mismatch:colors.mismatch.length,unknown:colors.unknown.length});
                    if(candidates.length>=MAX_CANDIDATES)break;
                  }
                  if(candidates.length>=MAX_CANDIDATES)break;
                }
                if(candidates.length>=MAX_CANDIDATES)break;
              }
              if(candidates.length>=MAX_CANDIDATES)break;
            }
            if(candidates.length>=MAX_CANDIDATES)break;
          }
          if(candidates.length>=MAX_CANDIDATES)break;
        }
        if(candidates.length>=MAX_CANDIDATES)break;
      }
      if(candidates.length>=MAX_CANDIDATES)break;
    }
    if(!candidates.length){
      const reason=colorPolicy==='strict'&&chosenColor?`Điều kiện màu ${chosenColor==='White'?'trắng':'đen'} bắt buộc có thể khiến kho giá demo không đủ sản phẩm. `:'';
      return {builds:[],profile,message:`${reason}Không tìm được tổ hợp đủ RAM (${profile.minRam}GB), SSD (${profile.minStorage}GB), tương thích cơ bản và trong ngân sách ${new Intl.NumberFormat('vi-VN').format(budget)}đ. Có thể cần tăng ngân sách hoặc bổ sung giá linh kiện.`,total:0};
    }
    const best=Math.max(...candidates.map(x=>x.quality));
    // Economy must still meet a sensible floor: cheapest build alone is not a recommendation.
    const feasible=candidates.filter(x=>x.quality>=Math.max(52,best-22));
    const pool=feasible.length?feasible:candidates;
    pool.sort((a,b)=>a.price-b.price||b.quality-a.quality);
    const distinct=(x,y)=>x && y && Object.keys(x.items).some(k=>x.items[k]!==y.items[k]);
    const value=pool[0];
    // Balanced: reward improvements that are worth their increase in total cost.
    const balanced=[...pool].filter(x=>x.price>=value.price+500000)
      .sort((a,b)=>(b.quality-.28*(b.price-value.price)/1e6)-(a.quality-.28*(a.price-value.price)/1e6)||a.price-b.price)[0];
    // Premium: higher fit score is useful; don't waste budget solely for a pricier part.
    const premium=[...pool].filter(x=>x.price>value.price+800000)
      .sort((a,b)=>(b.quality-.09*(b.price-value.price)/1e6)-(a.quality-.09*(a.price-value.price)/1e6)||a.price-b.price)[0];
    const list=[value];
    // Keep order strictly increasing, never three arbitrary copies of the same build.
    if(balanced&&premium&&distinct(balanced,value)&&distinct(premium,balanced) && balanced.price+500000<premium.price && premium.quality>=balanced.quality-1){list.push(balanced,premium);}
    else{
      const last=premium&&distinct(premium,value)?premium:balanced;
      if(last){
        const middle=[...pool].filter(x=>x.price>value.price+300000&&x.price<last.price-300000&&distinct(x,value)&&distinct(x,last))
          .sort((a,b)=>(b.quality-.21*(b.price-value.price)/1e6)-(a.quality-.21*(a.price-value.price)/1e6)||a.price-b.price)[0];
        if(middle)list.push(middle);
        list.push(last);
      }
    }
    const unique=[];
    for(const x of list.sort((a,b)=>a.price-b.price)){
      if(!unique.some(z=>JSON.stringify(z.items)===JSON.stringify(x.items)) && (!unique.length||x.price>unique.at(-1).price))unique.push(x);
    }
    return {builds:unique,profile,message:'',total:candidates.length};
  }
  window.DEXORA_ADVISOR_ENGINE={deriveProfile,generate,cpuHasIntegratedGraphics,ramSize,storageSize,vramSize};
})();
