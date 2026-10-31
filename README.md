# AZOTA LuzV — Ô sao chép gọn dưới nội dung chuyển khoản

index.html là bản web đầy đủ, đã nhúng CSS, JavaScript, QR và ảnh bìa 3D của 32 môn.

## Tải lên web

Tải ZIP, giải nén và lấy index.html thay file hiện tại trên hosting. Chỉ cần index.html để hiển thị trang và tạo QR.

Người đăng ký chọn môn/gói, nhập tài khoản Azota và bấm Chốt đơn. Nếu chỉ chọn PDF thì không cần tài khoản Azota. QR điền sẵn số tiền và nội dung chuyển khoản. Có thể tải PNG rồi quét từ ảnh trong ứng dụng ngân hàng.

## Ô sao chép đã thu gọn

Ô Môn học đã chọn đặt ngay dưới nội dung chuyển khoản trong khung thông tin ngân hàng. Tên môn và nút Sao chép cùng một hàng. Lời nhắc ngay dưới ô: Sau khi chuyển khoản, sao chép thông tin này rồi gửi kèm ảnh xác nhận qua Zalo cho LuzV.

Nút sao chép lấy đầy đủ danh sách, gói, tài khoản Azota, tổng tiền và mã chuyển khoản, kể cả khi chọn 32 môn. Phần Xem đầy đủ môn học & thông tin thu gọn mặc định. Khi trình duyệt chặn clipboard, phần này tự mở và bôi đen tin nhắn để sao chép thủ công.

Hướng dẫn 3 bước phía trên QR và trong Túi ôn tập vẫn có: Lấy mã QR → Chuyển khoản → Gửi qua Zalo. Sau khi chuyển khoản, người đăng ký dán thông tin đã sao chép và gửi ảnh xác nhận. LuzV kiểm tra rồi cấp quyền hoặc gửi PDF.

## QR và thông tin nhận tiền

- MB Bank, BIN 970422.
- Số tài khoản: 0377300076.
- Chủ tài khoản: TRAN LUONG VINH.
- Zalo: https://zalo.me/0377300076.

QR có viền góc xanh và vệt sáng quét lên xuống, dừng khi đóng popup và giữ khung tĩnh khi bật giảm chuyển động. PNG tải xuống là ảnh QR gốc. Nút Sao chép số tài khoản giữ nguyên số 0 đầu.

Ảnh QR được tạo tại trình duyệt theo chuẩn NAPAS/VietQR; không gọi máy chủ tạo ảnh bên ngoài. QR, ảnh tải và nội dung đăng ký dùng cùng số tiền và mã tham chiếu. Đóng/mở cùng lựa chọn giữ mã; thay lựa chọn sẽ cập nhật mã. Tên Azota và thông tin người đăng ký không nằm trong QR.

## Giá và giao diện

Solo 15.000đ/môn, không tự giảm theo số môn: 5 môn là 75.000đ khi chưa nhập mã. Gói 2 người 25.000đ/môn và gói 5 người 50.000đ/môn cho cả nhóm. Hai gói nhóm giảm 10% cho 3–4 môn, giảm 15% từ 5 môn. Mã hợp lệ tính sau ưu đãi nhóm. PDF 10.000đ không nhận giảm giá hoặc tính vào số môn ưu đãi.

Giữ 32 môn và ảnh bìa theo chủ đề, 4 môn mỗi hàng trên điện thoại, mục lục theo nội dung thực, hướng dẫn, GPA, hỗ trợ, bộ nhớ túi ôn tập và nút Chốt đơn. Giao diện trắng/xanh nhạt/xanh biển, chế độ tối navy, chữ đậm rõ.

## Kiểm tra và giấy phép

Kiểm tra trên Chromium ở 320, 390, 820 và 1360 px: vị trí ô dưới nội dung chuyển khoản, bố cục một hàng, lời nhắc bên dưới, phần chi tiết thu gọn, sao chép đủ 32 môn, clipboard bị chặn, PDF/gói/mã ưu đãi, QR và hai chế độ sáng/tối. Các ảnh copy-preview*.png và mobile-copy-preview*.png minh họa vị trí mới.

Thư viện qrcode-generator 1.4.4 dùng giấy phép MIT, đã kèm trong index.html và LICENSE-qrcode-generator.txt.
