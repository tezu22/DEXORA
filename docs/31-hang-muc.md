# DEXORA — Đối chiếu 31 hạng mục

Trạng thái trong tài liệu là **triển khai mã nguồn**, không mặc nhiên khẳng định các chức năng phụ thuộc dịch vụ ngoài đã hoạt động thực tế. `Đã dựng` = có mã nguồn; `Đang kiểm chứng` = cần thử thêm; `Chưa đầy đủ` = vẫn có giới hạn đáng kể.

| # | Hạng mục | Trạng thái | Ghi chú |
|---:|---|---|---|
| 01 | Chữ tiếng Việt không dính | Đã dựng | Điều chỉnh line-height/letter-spacing, cần kiểm tra font trên mọi máy |
| 02 | Bỏ mô tả banner Tự build | Đã dựng | Không còn đoạn mô tả dài |
| 03 | Builder khởi đầu trống | Đã dựng | 8 dropdown trống, 0đ, có nút xóa; session đang dùng có thể giữ nháp |
| 04 | Cảnh báo minh bạch | Đã dựng | Khung nổi bật và thông báo dữ liệu demo |
| 05 | Hamburger mobile bên dưới header | Đã dựng | Giữ badge D, menu trượt trái, đóng bằng mũi tên/Escape |
| 06 | Hiệu ứng cuộn/chuyển trang | Đã dựng | View Transition API và fallback; giảm chuyển động |
| 07 | Đồng bộ chữ DEXORA | Đã dựng | Manrope + Inter, dùng wordmark chung |
| 08 | Desktop cyan, Laptop tím | Đã dựng | CSS/theme + SVG; cần rà soát tương phản vài thành phần |
| 09 | Nền trang chủ Cyan–Purple | Đã dựng | Không thêm màu accent thứ ba vào hai khung |
| 10 | Chọn đúng máy. Hiểu rõ lý do. | Đã dựng | Hero và khu hai hệ thống |
| 11 | Chữ phần giải thích to, dễ đọc | Đã dựng | Why DEXORA + Smart Advisor preview |
| 12 | Tinh gọn menu, cuộn đến section | Đã dựng | Trang chủ / Tính năng / Về DEXORA |
| 13 | Công cụ → Tính năng | Đã dựng | Nhãn 02 |
| 14 | Tách HTML theo trang | Đã dựng | 9 trang HTML, dùng JS/CSS chung |
| 15 | So sánh độc lập | Đã dựng | So sánh bản nháp, cấu hình lưu và ví dụ; chưa có benchmark thực |
| 16 | Ẩn ngân sách khỏi Catalog/Stores | Đã dựng | Logo không làm liên kết thừa |
| 17 | Footer liên hệ TEZU | Đã dựng | Email và điện thoại sẽ hiển thị công khai |
| 18 | Lưu/nhập/xuất/chia sẻ build | Đang kiểm chứng | IndexedDB/JSON/URL; cần thử thêm trên trình duyệt/thiết bị thực |
| 19 | Kiểm tra tương thích nâng cao | Chưa đầy đủ | Có lọc socket/RAM, PSU, cooler, case; thiếu bộ dữ liệu BIOS, revision và kích thước xác minh |
| 20 | Tìm kiếm/bộ lọc nâng cao | Đã dựng | Tìm tên/ID/hãng, lọc màu, khoảng giá, sắp xếp; dữ liệu SKU có thể thiếu |
| 21 | Nguồn, loại giá và thời gian | Đang kiểm chứng | Có schema và nhãn demo; chưa có giá shop được xác minh |
| 22 | Góp ý qua Web3Forms | Đang kiểm chứng | Form gửi API, chưa chạy thử email thực hoặc kiểm tra allowlist domain |
| 23 | Empty/error/loading states | Đã dựng một phần | Các cảnh báo chính có, chưa bao phủ mọi tình huống |
| 24 | Responsive mobile | Đang kiểm chứng | CSS cho menu, builder, bộ lọc, so sánh; cần thử nhiều kích thước thiết bị |
| 25 | Tối ưu hiệu năng | Đã dựng một phần | Tách trang, tests; chưa đo Core Web Vitals thực tế |
| 26 | Giá tự động đa nguồn | Đang kiểm chứng | Python/Actions/JSON, fallback API/structured HTML; chưa có quote xác minh thực; combo chưa tự đủ điều kiện |
| 27 | Phiên bản dữ liệu lưu build | Đã dựng | Schema v2, mở dữ liệu cũ và cảnh báo ID mất khỏi danh mục |
| 28 | Chính sách/giới hạn | Đã dựng bản nháp | pages/policy.html; cần chủ dự án duyệt trước công khai |
| 29 | Sao lưu/rollback giá | Đã dựng | prices.backup.json và hướng dẫn hoàn tác bằng Git |
| 30 | CI tự động kiểm tra | Đã dựng | Workflow unit/static tests, JS check; cần chạy trên Actions thật |
| 31 | SEO và accessibility cơ bản | Đã dựng | Sitemap/robots/canonical/404/keyboard menu; kiểm tra thực tế tiếp |

## Phần không được hiểu nhầm

- **Không tuyên bố 31/31 đã hoạt động đầy đủ.** Các tính năng phụ thuộc dữ liệu thật, cửa hàng và dịch vụ feedback cần thử trên website sau khi triển khai.
- DEXORA vẫn có **dữ liệu demo**. Không được tự gọi giá demo là giá đã kiểm chứng.
- Laptop ở mức **prototype định hướng nhu cầu**; không có catalog máy thực.
- API cửa hàng cần nguồn chính thức/cho phép trước khi dùng. Scraping HTML có thể bị từ chối và phải tôn trọng robots.txt và điều khoản nguồn.
