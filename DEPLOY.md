# LuzV: đăng nhập quản trị trên Vercel, không dùng database

Gói này có API xác thực quản trị thật trên máy chủ, không có database hoặc tài khoản khách hàng. Giá, mã ưu đãi và dữ liệu trong bảng quản trị vẫn lưu **trên thiết bị/trình duyệt đang mở**, không đồng bộ cho khách hàng hay thiết bị khác. Đăng nhập không biến dữ liệu cục bộ thành dữ liệu chung. API không cung cấp xác nhận thanh toán, lưu đơn hàng, tải file hay xử lý góp ý trên máy chủ.

## Cấu hình rồi deploy

1. Đưa `index.html`, `api/router.js`, `scripts/build.js`, `package.json` và `vercel.json` của gói này vào repository. Trong Vercel chọn thư mục chứa các file đó làm **Root Directory**, Framework Preset **Other**, Node.js **22.x**. Không đưa thư mục backend PostgreSQL đã lưu riêng vào gói triển khai này. Build chỉ chép HTML vào `public/index.html`.
2. Vào **Vercel → Project Settings → Environment Variables**, đặt ba giá trị bí mật:

   | Biến | Yêu cầu |
   |---|---|
   | `ADMIN_USERNAME` | Tên đăng nhập riêng, 3–80 ký tự chữ/số/`_`/`.`/`@`/`+`/`-` |
   | `ADMIN_PASSWORD` | Mật khẩu riêng ít nhất 12 ký tự, tối đa 256 byte |
   | `ADMIN_SESSION_SECRET` | Ít nhất 32 byte ngẫu nhiên mật mã, mã hóa thành 64 ký tự hex hoặc base64url chuẩn từ 43 ký tự |

   Có thể tự tạo session secret bằng trình quản lý mật khẩu hoặc chạy trên máy của bạn: `node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"`. Lệnh này in bí mật để bạn nhập trực tiếp vào Vercel; không gửi kết quả trong chat hoặc đưa vào Git.

3. Cấu hình công khai `APP_ORIGIN` mặc định là `https://lvinhh-azt.vercel.app`. Nếu đổi domain hoặc deploy Preview, đặt biến này đúng origin HTTPS của môi trường đó. Bấm **Redeploy** sau khi thêm/sửa biến. Mật khẩu không xuất hiện trong HTML; tài khoản/mật khẩu mẫu không được hỗ trợ. Thiếu hoặc sai cấu hình thì API trả `503 AUTH_NOT_CONFIGURED`, không mở quản trị bằng chế độ dự phòng.

## API

- `GET /api/health` → `{service:"luzv-auth",ready:true}` chỉ khi các biến xác thực đã cấu hình hợp lệ.
- `GET /api/auth/session` → `{authenticated,role,username,phone:null}`. Khách chưa đăng nhập nhận `authenticated:false`.
- `POST /api/auth/session {username,password}` → phiên quản trị nếu thông tin trùng cấu hình bí mật. So sánh mật khẩu dùng scrypt và phép so sánh thời gian cố định.
- `DELETE /api/auth/session {}` → xóa cookie trên trình duyệt đang gọi.
- `GET /api/admin/session` → cùng thông tin phiên, nhưng thiếu phiên hợp lệ sẽ trả `401 AUTH_REQUIRED`.

Mọi POST/DELETE phải có `Origin` đúng `APP_ORIGIN`, `Content-Type: application/json` và body JSON. Không có endpoint đăng ký tài khoản người dùng hoặc API dữ liệu quản trị.

Cookie có `HttpOnly`, `Secure`, `SameSite=Strict`, chữ ký HMAC-SHA256 và thời hạn 8 giờ. Token gắn với tài khoản/mật khẩu hiện tại; đổi mật khẩu hoặc session secret rồi redeploy sẽ làm phiên cũ không hợp lệ. Session secret không được gửi về trình duyệt. Token có giới hạn độ dài, chữ ký được so sánh thời gian cố định.

Không có nơi lưu phiên trên máy chủ: đăng xuất xóa cookie hiện tại, không thu hồi riêng một bản sao token đã bị lấy trước đó. Token như vậy hết hiệu lực khi hết hạn hoặc khi đổi mật khẩu/session secret. Giới hạn đăng nhập trong bộ nhớ chỉ có tác dụng trên **instance Vercel đang còn ấm**, không phải hạn mức bền vững/toàn hệ thống. API không ghi log hoặc lưu IP; chỉ dùng digest tạm thời trong bộ nhớ để giảm thao tác lặp.

Người có quyền điều khiển trình duyệt vẫn có thể sửa HTML/JavaScript/localStorage của chính họ. Quyền máy chủ ở gói này bảo vệ việc xác thực phiên, không bảo vệ hoặc chia sẻ dữ liệu vốn chỉ nằm trong trình duyệt. Giao diện cần ghi rõ “trên thiết bị này” và xóa nội dung bảng quản trị khỏi màn hình khi đăng xuất.

Chỉ kiểm tra cú pháp tĩnh được thực hiện trong workspace. Chưa chạy server, trình duyệt, đăng nhập thử hoặc deploy; không tạo tài khoản/mật khẩu quản trị trực tiếp trong phiên làm việc.
