/**
 * NEON//RIG seed data: regions, categories and initial demo parts.
 * Products added in data/catalog.js are loaded separately and merged by app.js.
 */
(() => {
  const regions = [{"id":"hcm","name":"TP. Hồ Chí Minh","tier":1,"stores":[{"id":"tinhocngoisao-online","name":"Tin Học Ngôi Sao (online)","address":"Kiểm tra địa chỉ chi nhánh tại website chính thức","website":"https://tinhocngoisao.com/","source":"https://tinhocngoisao.com/"},{"id":"gearvn-hcm","name":"GEARVN","address":"78–80–82 Hoàng Hoa Thám, phường Bảy Hiền, TP. Hồ Chí Minh","website":"https://gearvn.com/","source":"https://gearvn.com/pages/he-thong-showroom-gearvn"},{"id":"phongvu-hcm","name":"Phong Vũ","address":"264 Nguyễn Thị Minh Khai, TP. Hồ Chí Minh","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"}]},{"id":"hanoi","name":"Hà Nội","tier":1,"stores":[{"id":"hacom-hanoi","name":"HACOM","address":"131 Lê Thanh Nghị, phường Bạch Mai, Hà Nội","website":"https://hacom.vn/","source":"https://hacom.vn/showroom"},{"id":"gearvn-hanoi","name":"GEARVN","address":"30–32 Thái Hà, Hà Nội","website":"https://gearvn.com/","source":"https://gearvn.com/pages/he-thong-showroom-gearvn"},{"id":"phongvu-hanoi","name":"Phong Vũ","address":"31 Xuân Thủy, phường Cầu Giấy, Hà Nội","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"}]},{"id":"cantho","name":"Cần Thơ","tier":1,"stores":[{"id":"phongvu-cantho","name":"Phong Vũ","address":"178 đường 3 Tháng 2, phường Tân An, Cần Thơ","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"},{"id":"namanh-cantho","name":"Nam Anh PC","address":"133 Xô Viết Nghệ Tĩnh, Cần Thơ","website":"https://namanhpc.vn/","source":"https://namanhpc.vn/lienhe"},{"id":"nguyenvu-cantho","name":"Nguyễn Vũ Store","address":"47C đường 3 Tháng 2, Cần Thơ","website":"https://nguyenvu.store/","source":"https://nguyenvu.store/pc/"},{"id":"songphuong-cantho","name":"Song Phương","address":"30/1 Nguyễn Văn Linh, Cần Thơ (xác nhận địa chỉ trước khi đến)","website":"https://songphuong.vn/","source":"https://songphuong.vn/linh-kien-may-tinh/"}]},{"id":"danang","name":"Đà Nẵng","tier":1,"stores":[{"id":"phongvu-danang","name":"Phong Vũ","address":"14–16–18 Nguyễn Văn Linh, phường Hải Châu, Đà Nẵng","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"},{"id":"mega-danang","name":"MEGA Technology","address":"130 Hàm Nghi, Đà Nẵng","website":"https://mega.com.vn/","source":"https://mega.com.vn/linh-kien-may-tinh"}]},{"id":"haiphong","name":"Hải Phòng","tier":1,"stores":[{"id":"hacom-haiphong","name":"HACOM","address":"36 Lê Lợi, phường Gia Viên, Hải Phòng","website":"https://hacom.vn/","source":"https://hacom.vn/showroom"},{"id":"namanh-haiphong","name":"Nam Anh Computer","address":"Hải Phòng (xem địa chỉ chi tiết trên website)","website":"https://namanhcomputer.com.vn/","source":"https://namanhcomputer.com.vn/lien-he"}]},{"id":"bacninh","name":"Bắc Ninh","tier":2,"stores":[{"id":"hacom-bacninh","name":"HACOM","address":"299 Minh Khai, Từ Sơn, Bắc Ninh","website":"https://hacom.vn/","source":"https://hacom.vn/showroom"},{"id":"phongvu-bacninh","name":"Phong Vũ","address":"234 Ngô Gia Tự, phường Kinh Bắc, Bắc Ninh","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"}]},{"id":"thainguyen","name":"Thái Nguyên","tier":2,"stores":[{"id":"hacom-thainguyen","name":"HACOM","address":"118 Lương Ngọc Quyến, Thái Nguyên","website":"https://hacom.vn/","source":"https://hacom.vn/showroom"},{"id":"phongvu-thainguyen","name":"Phong Vũ","address":"40 Lương Ngọc Quyến, Thái Nguyên","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"}]},{"id":"thanhhoa","name":"Thanh Hóa","tier":2,"stores":[{"id":"hacom-thanhhoa","name":"HACOM","address":"164 Lạc Long Quân, phường Hạc Thành, Thanh Hóa","website":"https://hacom.vn/","source":"https://hacom.vn/showroom"},{"id":"phongvu-thanhhoa","name":"Phong Vũ","address":"310–312 Trần Phú, phường Hạc Thành, Thanh Hóa","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"}]},{"id":"nghean","name":"Nghệ An","tier":2,"stores":[{"id":"hacom-nghean","name":"HACOM","address":"99 Lê Lợi, phường Thành Vinh, Nghệ An","website":"https://hacom.vn/","source":"https://hacom.vn/showroom"},{"id":"phongvu-nghean","name":"Phong Vũ","address":"218 Lê Duẩn, phường Trường Vinh, Nghệ An","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"}]},{"id":"khanhhoa","name":"Khánh Hòa","tier":2,"stores":[{"id":"phongvu-khanhhoa","name":"Phong Vũ Nha Trang","address":"40–42 Thái Nguyên, phường Tây Nha Trang, Khánh Hòa","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"}]},{"id":"dongnai","name":"Đồng Nai","tier":2,"stores":[{"id":"phongvu-dongnai","name":"Phong Vũ Biên Hòa","address":"37 Bùi Văn Hòa, phường Long Bình, Đồng Nai","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"}]},{"id":"hue","name":"Huế","tier":2,"stores":[{"id":"phongvu-hue","name":"Phong Vũ Huế","address":"130 Hùng Vương, phường Thuận Hóa, TP. Huế","website":"https://phongvu.vn/","source":"https://phongvu.vn/p/he-thong-showroom-phong-vu"}]}];
  const categories = [
    {id:'cpu',label:'01 / BỘ VI XỬ LÝ — CPU',short:'CPU',hint:'Bắt đầu tại đây · xác định socket'},
    {id:'board',label:'02 / BO MẠCH CHỦ — MAINBOARD',short:'MB',hint:'Chỉ hiển thị main đúng socket CPU'},
    {id:'ram',label:'03 / BỘ NHỚ — RAM',short:'RAM',hint:'DDR4 hoặc DDR5 theo main đã chọn'},
    {id:'gpu',label:'04 / CARD ĐỒ HỌA — GPU',short:'GPU',hint:'Kho GPU chung, không phụ thuộc cửa hàng'},
    {id:'ssd',label:'05 / Ổ CỨNG — SSD',short:'SSD',hint:'Chuẩn kết nối với mainboard'},
    {id:'cooler',label:'06 / TẢN NHIỆT — COOLER',short:'AIO',hint:'Đúng socket và đủ tải CPU'},
    {id:'case',label:'07 / VỎ MÁY — CASE',short:'CASE',hint:'Khớp kích thước main, GPU và radiator'},
    {id:'psu',label:'08 / NGUỒN — PSU',short:'PSU',hint:'Đủ công suất dự phòng cho CPU + GPU'}
  ];
  const parts = {
    cpu:[
      {id:'i5',name:'Intel Core i5-14600K',price:8600000,socket:'LGA1700',watts:181,links:{phongvu:'https://phongvu.vn/cpu-intel-core-i5-14600k--s231101852',gearvn:'https://gearvn.com/products/intel-core-i5-14600k'}},
      {id:'r5',name:'AMD Ryzen 5 7600',price:4700000,socket:'AM5',watts:88},
      {id:'r7',name:'AMD Ryzen 7 7800X3D',price:9400000,socket:'AM5',watts:120,links:{gearvn:'https://gearvn.com/products/amd-ryzen-7-7800x3d'}}
    ],
    board:[
      {id:'b760d4',name:'Gigabyte B760M DS3H DDR4',price:2900000,socket:'LGA1700',ram:'DDR4',form:'mATX',m2:2,links:{phongvu:'https://phongvu.vn/bo-mach-chinh-mainboard-gigabyte-b760m-ds3h-ddr4--s230100294'}},
      {id:'b760d5',name:'Mainboard B760M DDR5 [mẫu demo]',price:3400000,socket:'LGA1700',ram:'DDR5',form:'mATX',m2:2},
      {id:'b650',name:'Gigabyte B650M Gaming X AX DDR5',price:4200000,socket:'AM5',ram:'DDR5',form:'mATX',m2:2,links:{gearvn:'https://gearvn.com/products/gigabyte-b650m-gaming-x-ax-rev-1-x-ddr5'}},
      {id:'b650a',name:'Mainboard B650 ATX DDR5 [mẫu demo]',price:4800000,socket:'AM5',ram:'DDR5',form:'ATX',m2:3}
    ],
    ram:[
      {id:'d4',name:'ADATA XPG DDR4 32GB 3200',price:2200000,ram:'DDR4'},
      {id:'d4b',name:'DDR4 16GB (2×8) 3200 [mẫu demo]',price:1500000,ram:'DDR4'},
      {id:'d5',name:'ADATA XPG DDR5 32GB 5600',price:3400000,ram:'DDR5'},
      {id:'d5b',name:'DDR5 16GB (2×8) 5600 [mẫu demo]',price:2200000,ram:'DDR5'}
    ],
    gpu:[
      {id:'igpu',name:'Dùng đồ họa tích hợp của CPU (không mua GPU rời)',price:0,watts:0,gpuLength:0,integrated:true,vram:0},
      {id:'5070ti',name:'Colorful iGame RTX 5070 Ti 16GB [mẫu tham chiếu]',price:24500000,watts:300,gpuLength:335},
      {id:'5070',name:'GeForce RTX 5070 12GB [mẫu tham chiếu]',price:18400000,watts:250,gpuLength:300},
      {id:'5060ti',name:'GeForce RTX 5060 Ti 16GB [mẫu tham chiếu]',price:12600000,watts:180,gpuLength:260}
    ],
    ssd:[
      {id:'1tb',name:'NVMe SSD M.2 2280 — 1TB [mẫu demo]',price:2000000,slot:'M2'},
      {id:'2tb',name:'NVMe SSD M.2 2280 — 2TB [mẫu demo]',price:3600000,slot:'M2'}
    ],
    cooler:[
      {id:'air',name:'Tản khí tháp đôi [mẫu demo]',price:1100000,sockets:['LGA1700','AM5'],cap:200,rad:0,coolerHeight:160},
      {id:'aio240',name:'AIO 240mm [mẫu demo]',price:1600000,sockets:['LGA1700','AM5'],cap:230,rad:240,coolerHeight:0},
      {id:'aio360',name:'AIO 360mm [mẫu demo]',price:2100000,sockets:['LGA1700','AM5'],cap:300,rad:360,coolerHeight:0}
    ],
    case:[
      {id:'mini',name:'Case mATX Compact [mẫu demo]',price:1400000,forms:['mATX'],maxGpu:300,maxRad:240,maxAir:165},
      {id:'mid',name:'Case ATX Mid Tower [mẫu demo]',price:2400000,forms:['ATX','mATX'],maxGpu:360,maxRad:360,maxAir:170},
      {id:'vision',name:'Case kính ATX Showcase [mẫu demo]',price:3300000,forms:['ATX','mATX'],maxGpu:400,maxRad:360,maxAir:175}
    ],
    psu:[
      {id:'650',name:'Nguồn 650W [mẫu demo]',price:1600000,watts:650},
      {id:'750',name:'Corsair RM750e 750W [mẫu tham chiếu]',price:2500000,watts:750},
      {id:'850',name:'Corsair RM850e ATX 3.1 850W (CP-9020296-NA)',price:3000000,watts:850,links:{gearvn:'https://gearvn.com/products/nguon-may-tinh-corsair-rm850e-atx-3-1-80-plus-gold-full-modular-850w-cp-9020296-na',phongvu:'https://phongvu.vn/nguon-may-tinh-corsair-rm850e-atx-3-1-cybenetics-gold-full-modul-cp-9020296-na--s250309302'}},
      {id:'1000',name:'Nguồn 1000W [mẫu demo]',price:4200000,watts:1000}
    ]
  };

  window.NEON_SEED = {regions, categories, parts};
})();
