# AZOTA LuzV — Chọn nhanh và nhận đề miễn phí

`index.html` là bản web đầy đủ đã nhúng CSS, JavaScript và ảnh bìa 3D. Tải file này để thay bản HTML trên hosting.

## Tải lên web

1. Tải ZIP của nhánh này và giải nén, hoặc mở Raw của `index.html` rồi lưu với tên `index.html`.
2. Tải `index.html` lên hosting. Đặt ảnh QR thật của bạn tên `thanh-toan.jpeg` cùng thư mục. Ảnh QR là file riêng, chưa có trong bản gốc người dùng cung cấp.
3. Khách chọn môn/gói, nhập tài khoản Azota rồi bấm “Chốt đơn”. Đơn chỉ mua PDF không yêu cầu tài khoản Azota.
4. Khách chuyển khoản và gửi nội dung đơn kèm bill qua Zalo/Facebook. LuzV kiểm tra rồi cấp quyền/gửi PDF.

## Giao diện mới

- Khung chọn nhanh 32 môn nằm ngay dưới banner, hiển thị 4 thẻ trọn vẹn mỗi lượt. Giữ nút chuyển theo 4 môn, bắt dính thẻ, kéo chuột, vuốt, thanh tua hai chiều, nghiêng sổ và hiệu ứng thêm môn.
- Nền trắng/xanh ở chế độ sáng, navy ở chế độ tối. Màu bìa theo nhóm môn.
- “Đóng góp đề mới” và “Giới thiệu bạn bè” nằm trong một khung hai cột từ 861 px, xếp dọc ở màn hình nhỏ hơn.
- Ba nhãn điều kiện ngoài thẻ đã bỏ. Cách gửi và điều kiện duyệt nằm trong phần mở rộng. Đề được duyệt có thể đổi một môn ở kỳ này hoặc bảo lưu sang kỳ sau.
- Giới thiệu gồm ba bước ngắn, ô SĐT có nhãn, tạo link bằng nút hoặc Enter. Sửa SĐT sẽ ẩn kết quả cũ; dữ liệu vẫn hoạt động khi localStorage bị chặn.
- Sao chép lời mời không ghi đè URL. Khi trình duyệt từ chối clipboard, ô riêng hiện nội dung để sao chép thủ công.

## Giá và giỏ hàng

- Solo 15.000đ/môn, không tự giảm theo số lượng; 5 môn là 75.000đ.
- Gói 2 người 25.000đ/môn cho cả nhóm; gói 5 người 50.000đ/môn cho cả nhóm.
- Gói nhóm giảm 10% cho 3–4 môn, 15% từ 5 môn. Mã hợp lệ tính sau ưu đãi nhóm.
- PDF 10.000đ/file, không được giảm và không tính vào mốc số môn.
- Thẻ môn, chọn nhanh, giỏ trên điện thoại, tổng tiền và nội dung thanh toán dùng chung dữ liệu.

Đã kiểm tra giao diện và tương tác ở 320, 390, 820, 861 và 1360 px; cả sáng/tối, bộ nhớ bị chặn, clipboard thành công/bị từ chối, sửa SĐT khi đang sao chép, điều hướng theo 4 thẻ, kéo chuột, thanh tua, đồng bộ chọn/bỏ môn, giỏ hàng, QR và hướng dẫn 5 bước.

Các ảnh `carousel-preview*.png`, `free-preview*.png`, `mobile-free-preview.png` minh họa hai phần mới. `preview*.png` minh họa giỏ hàng.


## Mục lục nhanh theo nội dung trong file

Thanh đặt ngay dưới banner, trước khung chọn nhanh. Thanh tự lấy các khối nội dung chính đang có trong trang, gồm:

1. Chọn nhanh môn.
2. Tính điểm cuối kỳ.
3. Chọn gói & môn học.
4. PDF & Chốt đơn.
5. Đóng góp đề.
6. Giới thiệu bạn bè.
7. Liên hệ.

Số thứ tự theo đúng vị trí hiển thị, tự đổi khi bố cục điện thoại chuyển phần tính điểm xuống dưới phần chọn môn. Các phần thực mới có tiêu đề cũng được thêm vào; phần ẩn và hộp thoại không tạo mục lục trùng.

Thanh dùng kiểu nút bo tròn trắng/xanh hoặc navy theo chế độ sáng/tối, dính dưới thanh đầu trang. Trên điện thoại vuốt ngang để xem đủ mục. Link dùng đúng phần đang có và hỗ trợ bàn phím, Back/Forward; tiêu đề không bị các thanh dính che. Cuộn trang chỉ đổi mục được tô sáng, không tự kéo trang lên đầu. Giỏ hàng bên phải và menu Nhảy tới đã tính khoảng trống cho thanh mới.

Đã kiểm tra ở 320, 390, 820 và 1360 px, cả cuộn mượt và chế độ giảm chuyển động; kiểm tra lại giỏ hàng, PDF, Chốt đơn, hướng dẫn 5 bước và menu Nhảy tới. Giá, ảnh bìa 3D, mã ưu đãi và công cụ tính điểm giữ nguyên trong bản đầy đủ này.

Các ảnh toc-preview.png, toc-preview-dark.png và mobile-toc-preview.png chụp riêng thanh mục lục. toc-page-preview.png và mobile-toc-page-preview.png minh họa thanh khi cuộn trên máy tính và điện thoại.
