LUZV — BỘ WEBSITE + ĐĂNG NHẬP ADMIN TRÊN VERCEL (KHÔNG CẦN MÁY CHỦ RIÊNG)

Cách sử dụng:
1) Đưa index.html, api/, lib/ và .gitignore cùng cấp vào repository GitHub kết nối Vercel.
2) Mở Vercel > Project > Settings > Environment Variables và tạo:
   - LUZV_ADMIN_USERNAME: tên tài khoản Admin do bạn đã chọn.
   - LUZV_ADMIN_PASSWORD: mật khẩu Admin do bạn đã chọn; nhập trực tiếp tại Vercel.
   - LUZV_SESSION_SECRET: chuỗi ngẫu nhiên >= 32 ký tự (tạo bằng `openssl rand -hex 32`).
   Chọn các môi trường Production (và Preview nếu thực sự cần).
3) Redeploy trên Vercel để áp dụng 3 biến.
4) Truy cập địa chỉ web Vercel (HTTPS), bấm Đăng nhập, nhập thông tin Admin. Nếu đúng, trang tự mở giao diện quản trị.
5) Đăng ký người dùng thường vẫn dùng trình duyệt như trước; truy cập website không cần đăng nhập vẫn hoạt động.

Lưu ý bảo mật:
- KHÔNG đưa mật khẩu thật vào index.html, .env.example, repo GitHub công khai hoặc code JS frontend.
- Không thể sử dụng tính năng Admin bằng cách mở index.html theo giao thức file://.
- Phiên Admin qua cookie HttpOnly, Secure và SameSite=Strict, tự hết hạn sau 8 giờ; đăng xuất sẽ xóa cookie.
- Chưa có rate-limiting chia sẻ giữa các phiên serverless; nếu chạy công khai quy mô lớn, nên bật WAF/rate limits của Vercel.
- Quyền vào giao diện Admin xác thực trên server; nhưng dữ liệu quản trị (giá, voucher, v.v.) trong trang hiện vẫn lưu cục bộ ở trình duyệt, chưa đồng bộ toàn bộ máy.
- Nếu mật khẩu đã gửi trong hội thoại, nên đổi sang mật khẩu mới trước khi đưa website lên Production.
