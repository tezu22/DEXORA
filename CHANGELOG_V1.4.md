# DEXORA v1.4 — Trang chủ mới

## Thay đổi

- Đổi tên hiển thị từ NEON//RIG sang **DEXORA** trên trang chủ, khu PC và màn hình xem trước Laptop.
- Logo DEXORA dạng SVG nét góc cạnh; đổi favicon và ảnh minh họa PC/Laptop, không dùng ảnh tải từ mạng.
- Trang chủ mới: header, giới thiệu, 2 cổng PC/Laptop, 4 công cụ, lý do chọn, bảng xem trước tư vấn tương tác, CTA và footer.
- Hiệu ứng chỉ được kích hoạt khi rê chuột/bấm, không có vệt quét sáng lặp liên tục.
- Giữ và kiểm thử các trang PC hiện có, tương tác chọn nhiều câu hỏi và khả năng điều hướng.
- Trên điện thoại, nội dung chuyển thành một cột và không tràn ngang ở màn 390px.

## Đã kiểm tra

- `python tests/test_ui.py`
- `python tests/test_advisor_ui.py`
- `python tests/test_advisor_reasons.py`
- `python tests/test_copy_audit.py`
- `python tests/test_update_prices.py`
- Kiểm thử trang chủ DEXORA: chuyển ba nút, xem trước lời tư vấn, vào trang Laptop và thao tác trên mobile.

## Giới hạn

- Logo SVG là phiên bản mã nguồn theo concept, không phải sản phẩm in ấn/logo vector chính thức.
- Kho laptop hiện là bản xem trước, giá và benchmark thực tế chưa được tích hợp.
- Hệ thống Build PC giữ nguyên mức độ hoàn thiện/giới hạn dữ liệu từ v1.3.
