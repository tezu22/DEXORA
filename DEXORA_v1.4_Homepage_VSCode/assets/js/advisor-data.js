/**
 * NEON//RIG questionnaire schema. Each group allows selecting MULTIPLE needs;
 * each follow-up question also allows selecting MULTIPLE responses.
 * `when` narrows a follow-up to relevant selected needs.
 * No answers are considered hardware benchmarks.
 */
(() => {
  const makeNeeds = (id, labels) => labels.map((label, i) => ({id:`${id}-${i+1}`,label}));
  const question = (id,title,options,when=[]) => ({id,title,options,when});
  const groups = [
    {id:'gaming', icon:'◈', title:'Gaming & Giải trí', hint:'Esports, AAA, mod, giả lập, VR',
      needs:makeNeeds('gaming',['Esports: Valorant / CS2 / Liên Minh','AAA đồ họa nặng','Thế giới mở / MMORPG','Minecraft modpack / shader','Giả lập Android / Free Fire','Game VR / thực tế ảo']),
      questions:[
        question('games','Game bạn chơi thường xuyên?',['Valorant / CS2','Liên Minh / Dota 2','Minecraft','Wuthering Waves / ZZZ / HSR','Cyberpunk / Black Myth','Naraka / Delta Force','Game khác']),
        question('resolution','Độ phân giải màn hình đang hoặc sẽ dùng?',['1080p (FHD)','1440p (2K)','2160p (4K)','Màn hình ultrawide']),
        question('fps','Mức FPS mong muốn (có thể chọn nhiều)?',['60+ FPS','100–144 FPS','165–240 FPS','240+ FPS','Ưu tiên ổn định hơn FPS cao']),
        question('graphics','Mức thiết lập đồ họa?',['Low / Esports','Medium','High','Ultra','Ray Tracing / Path Tracing']),
        question('mods','Minecraft / game modded: dự kiến sử dụng?',['Dưới 50 mod','50–150 mod','150–300+ mod','Shader nặng','Server chung với bạn bè'],['gaming-4']),
        question('emulator','Giả lập: cách sử dụng?',['Một cửa sổ','Hai hoặc nhiều cửa sổ','Chơi và livestream cùng lúc'],['gaming-5'])
      ]},
    {id:'stream',icon:'◉',title:'Livestream & Sáng tạo nội dung',hint:'Phát trực tiếp, ghi hình, video, podcast',
      needs:makeNeeds('stream',['Livestream TikTok / YouTube / Twitch','Vừa chơi game vừa livestream','Ghi màn hình / gameplay','Làm video ngắn hoặc dài','Podcast / thu âm / xử lý âm thanh','Đa camera / capture card']),
      questions:[question('platform','Nền tảng dự kiến sử dụng?',['TikTok Live','YouTube Live','Twitch','Facebook','Nhiều nền tảng cùng lúc']),question('streamres','Chất lượng phát hoặc ghi hình?',['720p 30/60','1080p 30/60','1440p 60','4K','Ghi hình chất lượng cao để biên tập']),question('multitask','Những việc bạn thường chạy đồng thời?',['Game + OBS','Game + trình duyệt nhiều tab','OBS + Discord / chat / nhạc','Edit video khi phát','Nhiều nguồn camera'])]},
    {id:'creative',icon:'✦',title:'Đồ họa & Dựng phim',hint:'2D, 3D, animation, video',
      needs:makeNeeds('creative',['Photoshop / Lightroom','Premiere Pro / DaVinci Resolve','After Effects / Motion Graphics','Illustrator / Thiết kế 2D','Blender / Cinema 4D','Render 3D / animation chuyên sâu']),
      questions:[question('creatorapps','Phần mềm bạn dùng?',['Photoshop','Lightroom','Premiere Pro','DaVinci Resolve','After Effects','Blender','Cinema 4D','Phần mềm khác']),question('videores','Độ phân giải nguồn video?',['Full HD','4K','6K / 8K','Nhiều lớp hiệu ứng / RAW']),question('worklevel','Quy mô dự án thường xuyên?',['Nhỏ / học tập','Vừa / bán chuyên','Lớn / chuyên nghiệp','Render dài hoặc chạy hàng loạt'])]},
    {id:'engineering',icon:'⌂',title:'Kiến trúc & Kỹ thuật',hint:'CAD, BIM, dựng hình, mô phỏng',
      needs:makeNeeds('engineering',['AutoCAD 2D / 3D','Revit / BIM','SketchUp / Enscape','Lumion / Twinmotion','3ds Max / V-Ray / Corona','SolidWorks / Inventor / CFD / FEA']),
      questions:[question('engapps','Phần mềm cần chạy?',['AutoCAD','Revit','SketchUp','Enscape','Lumion','3ds Max','V-Ray / Corona','SolidWorks','CFD / FEA']),question('engscale','Mức độ phức tạp dự án?',['Bài tập nhỏ / bản vẽ 2D','Nhà ở / dự án trung bình','BIM / mô hình nhiều liên kết','Đại công trình / assembly lớn']),question('engtask','Loại tác vụ chính?',['Vẽ / modeling thời gian thực','Render CPU','Render GPU','Mô phỏng / phân tích','Mở nhiều phần mềm đồng thời'])]},
    {id:'dev',icon:'⌘',title:'Lập trình & Phát triển',hint:'Web, mobile, game engine, container',
      needs:makeNeeds('dev',['Lập trình Web / Desktop','Android Studio / Mobile','Unity / Unreal Engine','Docker / Kubernetes','Máy ảo / hệ điều hành ảo','Biên dịch dự án lớn / CI local']),
      questions:[question('devapps','Công cụ bạn hay chạy?',['VS Code / IDE nhẹ','IntelliJ / Android Studio','Visual Studio','Unity','Unreal Engine','Docker','WSL','Máy ảo']),question('devwork','Tải công việc chính?',['Code dự án nhỏ','Nhiều dự án song song','Build / compile thường xuyên','Chạy nhiều máy ảo','Tạo game 3D nặng'])]},
    {id:'ai',icon:'◇',title:'AI & Dữ liệu',hint:'Local AI, tạo ảnh/video, data science',
      needs:makeNeeds('ai',['Chạy LLM cục bộ','Stable Diffusion / AI tạo ảnh','AI tạo video','Machine Learning / Fine-tune','Data Science / Phân tích dữ liệu','AI coding / inference cục bộ']),
      questions:[question('aimodel','Loại bài toán AI?',['Chạy mô hình có sẵn','Tạo ảnh','Tạo video','Fine-tune','Huấn luyện mô hình mới','Dữ liệu lớn']),question('airuntime','Nhu cầu môi trường phần mềm?',['CUDA / NVIDIA bắt buộc','Không cần CUDA','Linux / WSL','Chưa xác định']),question('aimemory','Mục tiêu bộ nhớ GPU (nếu đã biết)?',['8–12GB VRAM','16GB VRAM','24GB VRAM trở lên','Chưa biết'])]},
    {id:'office',icon:'▤',title:'Văn phòng & Kinh doanh',hint:'Office, kế toán, đa nhiệm, họp',
      needs:makeNeeds('office',['Word / Excel / PowerPoint','Họp trực tuyến / học online','Kế toán / ERP / quản lý','Trình duyệt nhiều tab / đa nhiệm','Nhiều màn hình','Chạy máy êm, tiết kiệm điện']),
      questions:[question('officeapps','Mức độ sử dụng hằng ngày?',['Office cơ bản','Excel dữ liệu lớn','Trình duyệt 30+ tab','Nhiều ứng dụng / phần mềm kế toán','Họp video liên tục']),question('screens','Cần hỗ trợ bao nhiêu màn hình?',['1 màn hình','2 màn hình','3 màn hình trở lên','Có màn hình 4K'])]},
    {id:'learning',icon:'◎',title:'Học tập & Nghiên cứu',hint:'Đại học, chuyên ngành, học online',
      needs:makeNeeds('learning',['Học tập phổ thông / đại học','Học lập trình','Học kỹ thuật / xây dựng','Học đồ họa và làm phim','Học AI / nghiên cứu','PC dùng lâu để học nhiều chuyên ngành']),
      questions:[question('learnapps','Nhu cầu học tập dự kiến?',['Soạn thảo / thuyết trình','Phần mềm học lập trình','CAD / 3D','Chỉnh sửa ảnh / video','AI / nghiên cứu','Chơi game ngoài giờ']),question('life','Dự kiến dùng trước khi nâng cấp?',['1–2 năm','3–4 năm','5 năm trở lên','Nâng cấp từng món'])]},
    {id:'server',icon:'▦',title:'Máy chủ & Hệ thống',hint:'NAS, server, hosting, ảo hóa',
      needs:makeNeeds('server',['NAS / lưu trữ tại nhà','Minecraft / game server','Hosting web / service','Home Lab / nhiều VM','Máy trạm Workstation','Máy chạy liên tục 24/7']),
      questions:[question('serverrole','Vai trò máy chủ?',['Lưu trữ dữ liệu / backup','Game server','Hosting ứng dụng / web','Nhiều máy ảo','Workstation kết hợp server']),question('serverusers','Tải sử dụng?',['1–5 người','6–20 người','20+ người','Chưa rõ']),question('uptime','Thời gian hoạt động?',['Chỉ khi cần','Nhiều giờ mỗi ngày','24/7'])]},
    {id:'special',icon:'⚙',title:'Tùy chỉnh & Yêu cầu đặc biệt',hint:'SFF, RGB, êm, tiết kiệm điện',
      needs:makeNeeds('special',['Case nhỏ ITX / SFF','Yên tĩnh / ít ồn','Tiết kiệm điện','RGB / ARGB đồng bộ','Nâng cấp lâu dài','PC đa mục đích / ít bảo trì']),
      questions:[question('formsize','Kích thước case ưu tiên?',['ITX / SFF','mATX nhỏ gọn','ATX Mid Tower','Showcase / kính lớn','Không quan trọng']),question('lighting','Đèn & phong cách?',['Không đèn','ARGB đồng bộ','RGB nhiều hiệu ứng','Ít đèn, tinh tế']),question('upgrade','Khả năng nâng cấp?',['Ưu tiên CPU / nền tảng dài hạn','Ưu tiên nâng GPU','Nâng RAM / SSD','Không có kế hoạch nâng cấp'])]}
  ];
  const totalNeeds = groups.reduce((n,g)=>n+g.needs.length,0);
  window.NEON_ADVISOR_CONFIG = {groups,totalNeeds};
})();
