# AZOTA LuzV — Giao diện ứng dụng xanh theo ảnh tham khảo

index.html là bản đầy đủ, đã nhúng CSS, JavaScript, QR và ảnh bìa 3D của 32 môn. Tải ZIP, giải nén và lấy index.html thay file hiện tại trên hosting.

## Giao diện mới

Header xanh có tìm kiếm, nút xem gói/ưu đãi, túi ôn tập, đổi sáng/tối và menu các mục. Banner nền trắng với logo LuzV, lời giới thiệu và nút Chọn môn ngay. Trang chủ có ba thẻ gợi ý thật: CN XHKH, Khí Cụ Điện và PDF Điện Tử Số, dùng ảnh bìa theo chủ đề đang có. Các thẻ ưu đãi ghi rõ điều kiện gói nhóm.

Trang chủ mở sẵn. Menu có 8 chức năng: 32 Môn Azota, Ngân hàng PDF, Gói & ưu đãi, Túi ôn tập, Tính điểm, Đóng góp đề, Giới thiệu bạn và Hỗ trợ/SOS. Mỗi lần chỉ một mục hiện ra. Thanh đáy điện thoại có Trang chủ, Chọn môn, Túi ôn tập, Tính điểm và SOS LuzV.

Đổi mục giữ nguyên giỏ, gói, PDF, mã, bộ lọc và điểm đã nhập. Đường dẫn tới mục, Back/Forward, bàn phím và hướng dẫn 5 bước mở đúng nội dung. Hướng dẫn tự hiện sau khi vào trang; kết thúc trở lại mục ban đầu.

## Thao tác nhanh dùng chung giỏ

- Chọn/gỡ môn trên thẻ gợi ý đồng bộ với đủ 32 môn, menu, header và thanh đáy.
- quickAddSubject dùng giá gói đang chọn và metadata PDF; gọi lặp lại không thêm trùng.
- filterFeaturedSubjects tìm không phân biệt dấu ở header, mở Chọn môn và lọc đủ 32 môn.
- jumpToSection và setActiveTab mở nội dung thật, đồng bộ trạng thái điều hướng và hỗ trợ các tên mục trong mẫu.
- Bộ đếm lấy từ các mục thực tế trong túi, có cả PDF; không dùng bộ đếm hay mảng giỏ thứ hai.

## Giá và thanh toán

Solo 15.000đ/môn, không tự giảm theo số môn: 5 môn là 75.000đ khi chưa nhập mã. Gói 2 người 25.000đ/môn và gói 5 người 50.000đ/môn cho cả nhóm. Hai gói nhóm giảm 10% cho 3–4 môn, giảm 15% từ 5 môn. Mã hợp lệ tính sau ưu đãi nhóm. PDF 10.000đ không nhận giảm giá hoặc tính vào số môn ưu đãi.

Giữ hướng dẫn 3 bước, QR động có vệt quét, tải PNG, sao chép số tài khoản và ô sao chép đăng ký dưới nội dung chuyển khoản kèm lời nhắc gửi Zalo. MB Bank / 0377300076 / TRAN LUONG VINH. LuzV kiểm tra ảnh xác nhận trước khi cấp quyền hoặc gửi PDF. Ảnh QR được tạo tại trình duyệt.

## Kiểm tra

Đã kiểm tra ở 320, 390, 820 và 1360px, sáng/tối: Trang chủ, ba thẻ thật, thêm/gỡ/chọn trùng, tìm không dấu, giá gói/PDF, badge, các hàm điều hướng, một mục hiển thị, giữ dữ liệu, lịch sử, QR và sao chép. Đã chạy kiểm tra hồi quy giỏ và giá/CRC VietQR. Các ảnh app-preview*.png và mobile-*.png minh họa giao diện mới.

Thư viện qrcode-generator 1.4.4 dùng giấy phép MIT, kèm trong index.html và LICENSE-qrcode-generator.txt.
