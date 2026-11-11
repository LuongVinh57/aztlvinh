# LuzV — 35 môn, Admin Vercel không dùng database

Bổ sung Luật Kinh Doanh, Hóa Học Đại Cương, Năng Lực Số và Ứng Dụng Trí Tuệ Nhân Tạo: tổng cộng 35 môn Azota và 35 PDF. Giữ các môn cũ, giá gói, ảnh, giỏ, QR, mã chuyển khoản sau khi tải lại và thanh điều hướng điện thoại.

Đăng nhập quản trị được xác thực bởi API Vercel với cookie có chữ ký. Đã bỏ mật khẩu/tài khoản mẫu, nút vào thẳng Admin, dữ liệu đơn minh họa và banner dùng thử. Bảng quản trị chỉ mở sau khi kiểm tra phiên máy chủ; đóng hoặc đăng xuất sẽ xóa nội dung quản trị khỏi màn hình.

Không dùng database. Giá, mã ưu đãi, đóng góp, giới thiệu và thống kê trong bảng quản trị vẫn lưu trên thiết bị/trình duyệt đang mở; chưa đồng bộ tới khách hoặc thiết bị khác. Đơn và ảnh chuyển khoản tiếp tục được gửi qua Zalo để LuzV kiểm tra. Không có xác nhận thanh toán hoặc cấp tài liệu tự động.

## Bật trên Vercel

Dùng toàn bộ mã nguồn, không chỉ index.html. Chọn Root Directory là thư mục có package.json, Framework Preset Other; build npm run build, output public, Node.js 22.x (đã khai báo trong vercel.json).

Trong Vercel Project Settings → Environment Variables, đặt riêng:

- ADMIN_USERNAME: tên đăng nhập bạn chọn.
- ADMIN_PASSWORD: mật khẩu riêng, ít nhất 12 ký tự.
- ADMIN_SESSION_SECRET: ít nhất 32 byte ngẫu nhiên, ở dạng 64 ký tự hex hoặc base64url chuẩn.

APP_ORIGIN mặc định là https://lvinhh-azt.vercel.app. Sau khi đặt biến, Redeploy đúng nhánh chứa mã nguồn này: codex/luzv-index-quan-tri. Không gửi giá trị bí mật vào chat, không đưa vào HTML/Git. Thiếu cấu hình thì đăng nhập bị khóa, không chuyển về tài khoản mẫu.

Hướng dẫn và giới hạn chi tiết: DEPLOY.md. API chỉ xác thực quản trị, không lưu dữ liệu website. Có thể xem các môn và dùng luồng QR thủ công khi chưa đăng nhập.

## Xác minh đã thực hiện

Chỉ kiểm tra tĩnh: cú pháp 31 khối JavaScript trong HTML và các file API/build, đối chiếu 35 môn/35 PDF, bảo toàn ảnh và build sao chép đúng HTML. Đã rà tĩnh đường đăng nhập, chữ ký cookie, kiểm tra phiên trước khi mở quản trị, hủy nội dung khi đóng/đăng xuất. Không chạy server, trình duyệt, tài khoản hay giao dịch thử theo yêu cầu của người dùng.

Mã nguồn được đóng gói để triển khai; chưa xác nhận biến bí mật hoặc kích hoạt đăng nhập trực tiếp trên project Vercel của người dùng. Các file trong tests/ là bộ kiểm tra của phiên bản độc lập trước, không phải kiểm tra xác thực Vercel của bản này.

SHA256 index.html: c1faafd4f3535cb950a1aedd80b79e025a5ca2636720bb6a6159390bc59412a2

Thư viện QR giữ giấy phép trong LICENSE-qrcode-generator.txt.
