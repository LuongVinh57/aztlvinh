# AZOTA LuzV — QR quét hai chiều và sao chép số tài khoản

index.html là bản web đầy đủ, đã nhúng CSS, JavaScript, thư viện QR và ảnh bìa 3D của 32 môn.

## Tải lên web

1. Tải ZIP, giải nén và lấy index.html thay file hiện tại trên hosting.
2. Chỉ cần index.html để hiển thị trang và tạo QR. Ảnh QR được tạo ngay trong trình duyệt.
3. Người đăng ký chọn môn/gói, nhập tài khoản Azota và bấm Chốt đơn. Nếu chỉ chọn PDF thì không cần tài khoản Azota.
4. Quét mã hoặc tải PNG rồi chọn quét từ ảnh trong ứng dụng ngân hàng. QR điền sẵn số tiền và nội dung chuyển khoản.
5. Sau khi chuyển khoản, bấm sao chép đăng ký và mở Zalo, dán nội dung rồi gửi kèm ảnh xác nhận. LuzV kiểm tra rồi cấp quyền hoặc gửi PDF.

## Thông tin nhận tiền đã cấu hình

- Ngân hàng: MB Bank (BIN 970422).
- Số tài khoản: 0377300076.
- Chủ tài khoản: TRAN LUONG VINH.
- Zalo: https://zalo.me/0377300076.

QR dùng chuẩn chuyển khoản NAPAS/VietQR, tiền VND, số tiền nguyên và CRC16. Mã tham chiếu bắt đầu bằng LUZV, dùng chung cho ảnh QR, nút tải và nội dung đăng ký sao chép. Đổi lựa chọn sẽ cập nhật QR; đóng rồi mở lại cùng lựa chọn giữ nguyên mã. Tên Azota và thông tin người đăng ký không nằm trong QR. Không gọi dịch vụ tạo ảnh QR bên ngoài.

Nút sao chép nội dung chuyển khoản và nút chỉ sao chép đăng ký đều có cách chọn văn bản thủ công nếu trình duyệt chặn clipboard. Đây là quy trình xác nhận chuyển khoản thủ công qua LuzV.

## Hiệu ứng QR và sao chép số tài khoản

Khung QR có bốn góc xanh và vệt sáng quét từ trên xuống, rồi đi ngược lên liên tục. Hiệu ứng chỉ hiện khi ảnh sẵn sàng, dừng khi đóng hộp thoại, ẩn khi lỗi hoặc túi trống. Khi thiết bị bật giảm chuyển động, khung giữ bốn góc tĩnh. Ảnh PNG tải xuống vẫn là QR gốc.

Nút Sao chép cạnh số tài khoản chép đúng 0377300076, giữ số 0 đầu. Nếu trình duyệt chặn clipboard, một ô số tài khoản xuất hiện và được bôi đen để sao chép thủ công. Số tài khoản và nút tự xếp lại trên điện thoại nhỏ.

## Giá và giao diện

- Solo: 15.000đ/môn, không tự giảm theo số môn; 5 môn là 75.000đ khi chưa nhập mã.
- Gói 2 người: 25.000đ/môn cho cả nhóm. Gói 5 người: 50.000đ/môn cho cả nhóm.
- Hai gói nhóm giảm 10% khi chọn 3–4 môn, giảm 15% từ 5 môn.
- Mã ưu đãi hợp lệ giảm thêm theo gói, tính sau ưu đãi nhóm.
- PDF 10.000đ, không tính vào số môn nhận ưu đãi và không giảm giá.

Giữ bố cục 4 môn mỗi hàng trên điện thoại, mục lục theo nội dung thật, hướng dẫn, GPA, hỗ trợ, bộ nhớ túi ôn tập và ảnh 3D theo chủ đề. Giao diện trắng/xanh nhạt/xanh biển, chế độ tối navy, chữ đậm rõ. Các nhãn dùng cách gọi ôn tập và đăng ký; nút chính là Chốt đơn.

## Kiểm tra

Đã kiểm tra trên Chromium ở 320, 390, 820 và 1360 px, cả sáng/tối: giỏ trống, Solo/gói nhóm/mã ưu đãi/PDF, đồng bộ tổng tiền, mở lại hộp QR, tải PNG, sao chép số tài khoản/nội dung và trường hợp clipboard bị chặn. Đã kiểm tra chuyển động đi xuống rồi quay lên và chế độ giảm chuyển động. Ảnh gốc, ảnh tải xuống và QR hiển thị với vệt quét tại nhiều vị trí được đọc lại bằng ZXing độc lập để đối chiếu ngân hàng, số tài khoản, số tiền, nội dung và CRC. Các ảnh qr-preview*.png và mobile-qr-preview*.png minh họa hộp QR mới.

Thư viện qrcode-generator 1.4.4 dùng giấy phép MIT; toàn bộ thông báo bản quyền và giấy phép nằm trong index.html và LICENSE-qrcode-generator.txt.
