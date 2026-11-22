# DEXORA

Website tư vấn cấu hình **PC Desktop & Laptop**, chạy bằng HTML/CSS/JavaScript trên GitHub Pages. Đây là phiên bản **Beta** với giao diện Clean Premium hai màu cyan (PC) và tím (Laptop); không phải website bán hàng hay công cụ xác nhận thông số chính hãng.

**Trang dự kiến:** https://tezu22.github.io/DEXORA/  
**Repository:** https://github.com/tezu22/DEXORA

## Chạy tại máy

1. Mở **chính thư mục `DEXORA`** bằng VS Code.
2. Click phải `index.html` → **Open with Live Server**.
3. Kiểm tra các trang: `pages/builder.html`, `pages/advisor.html`, `pages/catalog.html`, `pages/compare.html`, `pages/stores.html`, `pages/laptop.html`.
4. Với dữ liệu giá `fetch`, cần dùng Live Server hoặc HTTP server; mở `file://` không tải giá được.

## Cập nhật repository hiện tại (không tạo repo mới)

Nếu đã clone repo `https://github.com/tezu22/DEXORA.git` bằng VS Code:

1. Giải nén gói ZIP, **mở thư mục `DEXORA` bên trong**.
2. Sao chép **toàn bộ nội dung bên trong** sang thư mục `DEXORA` đã clone. Cho phép ghi đè khi được hỏi, nhưng **đừng xóa thư mục `.git`** của bản đã clone.
3. Với file cũ không còn dùng ở phiên bản mới, có thể xóa sau khi kiểm tra. Nếu đang có thay đổi cục bộ chưa commit thì sao lưu hoặc commit trước khi ghi đè.
4. Kiểm tra bằng Live Server và các lệnh test bên dưới.
5. Terminal tại thư mục đã clone:
   ```bash
   git status
   git add -A
   git commit -m "DEXORA major upgrade"
   git push origin main
   ```
6. Vào **Settings → Pages → Build and deployment → Source: GitHub Actions** để workflow mới phụ trách **cả deploy giao diện và cập nhật giá**. Trước khi bật chế độ này, Pages theo nhánh có thể vẫn hiển thị bản mới sau khi push, nhưng workflow tự động cần cấu hình Pages Source.
7. Vào **Actions → DEXORA | Validate, update prices and deploy** để xem kết quả CI, có thể chạy thủ công qua **Run workflow** sau khi thiết lập xong.

> Nếu GitHub thông báo thay đổi chưa được đồng bộ, dùng `git pull --rebase origin main` và xử lý xung đột trước khi Push; không dùng `git push --force` trên `main`.

## Tính năng đáng chú ý

- Builder bắt đầu trống hoàn toàn; không tự đề xuất linh kiện trong ô chọn. Cảnh báo tương thích dựa trên các thuộc tính có dữ liệu, và ghi rõ giới hạn.
- Advisor dùng 60 nhu cầu, câu hỏi phụ và ba phương án dựa trên câu trả lời; không khẳng định FPS khi chưa có benchmark thực tế.
- Lưu build bằng IndexedDB tại trình duyệt khách, xuất/nhập JSON, chia sẻ link (cấu hình trong URL). Khách không cần tài khoản; xóa dữ liệu website hoặc đổi máy có thể mất bản lưu nếu chưa sao lưu JSON.
- Trang so sánh độc lập giữa bản đang chọn, các bản đã lưu và ví dụ cấu hình.
- Feedback: khung nhập và nút Gửi qua Web3Forms; hiển thị thành công **chỉ khi API xác nhận**. Access Key trong JS là **khóa công khai dành cho biểu mẫu**, không phải API secret; cấu hình **allowed domains/anti-spam** trong bảng điều khiển Web3Forms để hạn chế lạm dụng.
- Phần giá từ GEARVN, Phong Vũ, Tin Học Ngôi Sao được thử nghiệm theo từng nguồn công khai hợp lệ và đúng mã sản phẩm. Các sản phẩm chưa có dữ liệu sẽ vẫn ghi **DEMO** hoặc **chưa có giá**, không suy diễn thành giá thật.

## Giới hạn quan trọng

- **Chưa có báo giá được xác minh trong `data/prices.json` tại thời điểm đóng gói**. Giữ nhãn demo cho đến khi workflow chạy và xác minh thành công từng nguồn; scraper không đảm bảo đọc được tất cả cửa hàng.
- **Không thử gửi email thật** trong môi trường đóng gói; cần tự gửi một phản hồi thử sau khi deploy.
- Kho laptop là **bản xem trước hồ sơ tư vấn**; chưa có danh sách laptop thực tế, pin thực tế hay khả năng xếp hạng theo benchmark.
- Trình đánh giá PSU, socket, kích thước và khả năng tản nhiệt chỉ là kiểm tra sơ bộ. Vẫn phải kiểm tra BIOS, bản revision, lắp đặt và các yêu cầu từ hãng trước khi mua.
- Tính năng giá combo/voucher chỉ **ghi nhận là ưu đãi có điều kiện**, chưa tự tính thành giá bán lẻ mặc định và chưa bảo đảm xác nhận điều kiện mua bộ.
- Những tính năng phụ thuộc nhà bán hoặc bên thứ ba có thể không hoạt động nếu nguồn dữ liệu từ chối truy cập hoặc thay đổi định dạng.

## Cấu trúc mã nguồn

```text
DEXORA/
  index.html                    # Trang chủ
  pages/                       # Desktop, Builder, Advisor, Catalog, Stores, Compare, Laptop, Policy
  assets/css/dexora-upgrade.css # Clean Premium, cyan/purple, mobile
  assets/js/app.js              # Builder, Advisor, catalog, comparison
  assets/js/site-common.js     # Mobile menu, footer, feedback
  assets/js/build-storage.js   # IndexedDB, JSON, URL sharing
  assets/js/laptop.js          # Laptop preview
  data/catalog.js              # Kho linh kiện
  data/prices.json             # Giá đã xác minh hoặc trống
  data/prices.backup.json      # Sao lưu trước cập nhật
  data/price_sources.json      # Các liên kết nguồn giá được phép kiểm tra
  scripts/update_prices.py     # Trích xuất giá có xác minh, không tự đoán
  scripts/price_variants.py    # Ưu đãi có điều kiện
  scripts/price_api.py         # Adapter API chính thức khi shop cung cấp
  .github/workflows/           # Test + cập nhật định kỳ + deploy Pages
  docs/                        # Hướng dẫn/đối chiếu phạm vi
  tests/                       # Kiểm thử giá và hợp đồng trang tĩnh
```

## Chạy test

```bash
python -m pip install -r scripts/requirements-prices.txt
python -m pytest -q tests/test_site_contract.py tests/test_update_prices.py tests/test_price_variants.py
node --check assets/js/app.js
```

Nếu chạy workflow lần đầu: Pages phải được cấu hình bằng **GitHub Actions**; Settings → Actions → General → Workflow permissions cần cho phép `GITHUB_TOKEN` ghi vào nội dung repository nếu muốn tự commit dữ liệu giá. Khi chưa có nguồn giá xác minh, workflow không được phép biến demo thành giá thật.

**Riêng thông tin liên hệ:** Footer chứa email, số điện thoại do chủ dự án cung cấp và tên TEZU; đây là thông tin công khai, có thể bị bộ máy tìm kiếm lập chỉ mục và spam.

Tài liệu kế hoạch và mức độ thực hiện: [`docs/31-hang-muc.md`](docs/31-hang-muc.md). Hướng dẫn hoàn tác giá: [`docs/price-rollback.md`](docs/price-rollback.md).
