# LuzV — index.html có đăng nhập và quản trị dùng thử

Đây là đúng bản có đăng nhập/quản trị mà người dùng yêu cầu lưu lại thành index.html, sau đó tải lên GitHub. File nhúng đầy đủ CSS, JavaScript và ảnh. Tải ZIP, giải nén và lấy index.html.

## Bốn thay đổi giao diện đã hoàn tất
1. Khối gói/ưu đãi và chọn nhanh được thu gọn; bấm Chọn môn cuộn tới danh sách chính.
2. Điện thoại có Đăng nhập / Trang của tôi / Đăng xuất trong menu ba gạch, dành lại chiều ngang cho tìm kiếm. Máy tính giữ mục tài khoản trên header.
3. Banner điện thoại thấp hơn, chữ phụ lớn hơn, hai nút chính dễ chạm.
4. Thông báo demo nằm trong luồng trang dưới header, không che thanh điều hướng đáy.

Giữ đủ 32 môn, chọn nhiều PDF, gói giá/mã ưu đãi, giỏ, QR, sao chép, hướng dẫn và các tiện ích của file người dùng gửi. Ảnh gốc được giữ nguyên.

## Trạng thái quản trị
Phần tài khoản/quản trị vẫn là bản dùng thử cục bộ trong trình duyệt, như bản gốc. Nhãn demo trong trang được giữ nguyên. File này không bổ sung máy chủ xác thực hay dữ liệu khách hàng thực.

## Mã ưu đãi sau khi tải lại trang
Danh sách mã đã lưu trên trình duyệt được nạp khi mở website, trước khi người dùng mở bảng quản trị. Tạo mã trong Admin rồi tải lại trang vẫn có thể nhập mã để áp dụng, không cần đăng nhập/mở Admin trước.

Giữ nguyên dữ liệu và khóa lưu cũ, giảm phần trăm hoặc số tiền, điều kiện hết hạn/bật/tắt/xóa và cách tính gói/PDF. Giao diện quản trị vẫn chỉ được dựng khi người dùng mở theo luồng có sẵn. Đây vẫn là dữ liệu cục bộ của bản dùng thử.

Kiểm tra hồi quy: node tests/voucher-reload.cjs (cần Playwright và Chromium). Kiểm tra ở 390/1360px gồm tạo mã → tải lại → áp dụng trước khi mở Admin, mã phần trăm/giảm tiền, bật/tắt/xóa, hết hạn, mã gốc, gói nhóm, PDF và tổng QR; có kiểm tra lưu trữ hỏng/bị chặn.

## Kiểm tra
Đã kiểm tra ở 320, 390, 820 và 1360px, sáng/tối: bố cục, danh sách môn, menu/tìm kiếm, đăng nhập demo, quản trị, đăng xuất, hướng dẫn 5 bước, giỏ, nhiều PDF, các ca giá, QR và sao chép. Không tràn ngang, trùng ID hoặc lỗi JavaScript trong các thao tác thử.

SHA256 của index.html: c8518eae50e2ded7f9f44f8dada8e8cc7e96f62964c9f782d3c20590075f561f.

Thư viện qrcode-generator dùng giấy phép MIT, giữ trong HTML và LICENSE-qrcode-generator.txt.
