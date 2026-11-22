# DEXORA — Trang chủ thiết kế lại (v1.4)

Phiên bản website tư vấn PC & Laptop chạy bằng **HTML / CSS / JavaScript thuần**. Giữ lại các chức năng PC Desktop từ NEON//RIG v1.3.0. Chưa cần Node.js, backend hay GitHub để thử giao diện.

## Chạy thử trên VS Code

1. Mở nguyên thư mục `DEXORA_v1.4_Homepage_VSCode` trong VS Code.
2. Click phải vào `index.html` → **Open with Live Server**.
3. Vào trang chủ, thử nút **Tự build PC**, **Nhờ tư vấn**, **Khám phá Laptop**.
4. Nếu trình duyệt đang mở bản cũ, bấm **Ctrl + Shift + R** hoặc mở tab mới từ Live Server.

## Những file mới / thay đổi

- `index.html`: trang chủ DEXORA, logo sidebar và bố cục hai hệ thống.
- `assets/css/dexora-home.css`: CSS trang chủ mới, responsive, không dùng vệt sáng quét lặp.
- `assets/brand/dexora-mark.svg`: biểu tượng chữ D dạng SVG.
- `assets/brand/dexora-devices.svg`: minh họa PC & Laptop bằng vector SVG.
- `assets/js/dexora-preview.js`: tương tác chọn 3 phương án trên trang chủ (chỉ demo diễn giải).
- `assets/js/home.js`: điều hướng DEXORA, giữ trang Laptop thử nghiệm.
- `assets/js/app.js`: cập nhật các nhãn nhận diện thương hiệu trong phần PC.

## Phạm vi và lưu ý

- **Đây là bản làm lại trang chủ**, không phải phiên bản đã mở rộng kho laptop.
- Các tính năng tự build, tư vấn, phân tích, so sánh, chọn cửa hàng trong PC Desktop được giữ nguyên từ bản 1.3.0.
- Các giá trong PC Builder vẫn là giá tham khảo/demo, không có đồng bộ giá trực tiếp.
- Kho linh kiện chưa đầy đủ mọi SKU, bộ lọc màu chưa ẩn tuyệt đối mẫu sai màu, và tư vấn chưa có FPS benchmark thực tế.
- Trang Laptop vẫn ở mức hồ sơ nhu cầu thử nghiệm, chưa có sản phẩm thật.
- Logo SVG được vẽ mới dựa trên ý tưởng DEXORA; chưa phải bản xuất vector chính thức từ artwork logo đã chọn.

## Cấu trúc

```text
index.html
assets/
  brand/
    dexora-mark.svg
    dexora-devices.svg
  css/
    dexora-home.css
    home.css
    layout.css
    ...
  js/
    dexora-preview.js
    home.js
    app.js
    ...
data/
  catalog.js
  catalog.json
  prices.json
```

**Thông tin chính xác về dữ liệu và giới hạn kỹ thuật** xem thêm changelog và ghi chú phiên bản 1.3.0.
