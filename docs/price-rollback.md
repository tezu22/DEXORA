# Khôi phục giá khi bộ cập nhật gặp lỗi

GitHub Actions lưu bản **trước lần cập nhật giá** ở `data/prices.backup.json` khi file giá thay đổi. Đây là một snapshot gần nhất, không phải lịch sử vô hạn; lịch sử Git cũng giữ các phiên bản cũ.

**Trước khi khôi phục:** đối chiếu thời điểm, nguồn và dữ liệu vừa xuất. Không tự áp lại ưu đãi hết hạn hoặc giá chưa xác minh.

1. Mở repository DEXORA bằng VS Code ở nhánh `main`.
2. Sao chép nội dung `data/prices.backup.json` sang `data/prices.json`.
3. Chạy `python -m pytest -q tests/test_update_prices.py tests/test_site_contract.py`.
4. Commit và push: `git add data/prices.json; git commit -m "Restore previous price snapshot"; git push origin main`.
5. Theo dõi Actions/Pages để chắc bản phục hồi được triển khai.

Nếu snapshot đã cũ hoặc cũng không đáng tin, đưa `entries` về `{}` và `generated_at` thành `null`. Trang web sẽ quay lại hiển thị giá demo/chưa có giá, thay vì coi dữ liệu không đáng tin là giá thật.
