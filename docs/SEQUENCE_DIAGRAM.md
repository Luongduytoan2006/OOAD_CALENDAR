# Diễn giải Sequence Diagram
Dưới đây là diễn giải cách dữ liệu và các hành động chảy trong hệ thống, theo đúng thứ tự thời gian của Sequence Diagram:

## Bước 1: Khởi tạo và Nhập liệu
1. User chọn một mốc thời gian trên lịch. Hệ thống (giao diện AddAppointmentForm) mở đơn đăng ký thông qua hàm `openFor(selectedDateTime)`.
2. User điền các thông tin: tiêu đề, địa điểm, thời gian bắt đầu/kết thúc và các nhắc nhở (reminders).
3. User ấn nút `submit()`.

## Bước 2: Kiểm tra tính hợp lệ (Validation)
1. Hệ thống (tại Form) tự động chạy hàm `validateInput()` để kiểm tra dữ liệu vừa nhập.
2. **Nếu Fail (Invalid input):** Giao diện hiển thị lỗi bằng hàm `showInvalidInputError(message)`. Luồng dừng lại tại đây.
3. **Nếu Pass (Valid input):** Chuyển sang bước xử lý nghiệp vụ với Calendar ở Bước 3.

## Bước 3: Kiểm tra xung đột lịch (Conflict Check)
Giao diện gọi Calendar thực hiện `findConflictingAppointment(start, end)`. Calendar sẽ trả về kết quả xem có lịch bị trùng hay không (`conflictAppt`).

### Trường hợp 3A: Đã có lịch bị trùng (`conflictAppt != null`)
1. Giao diện hiện cảnh báo cho User thông qua `showConflictWarning(conflictAppt)`.
2. User thực hiện lựa chọn `chooseReplace(replace)` (có muốn ghi đè lịch cũ hay không).
   - **Nếu User chọn ghi đè (`replace == true`):**
     + Calendar tạo một đối tượng lịch mới: `createAppointment(...)`.
     + Hệ thống chạy vòng lặp (loop) qua từng reminder mà User đã chọn, gọi `addReminder(reminder)`.
     + Calendar gọi hàm `replaceAppointment(conflictAppt, newAppt)` để thay thế lịch cũ bằng lịch mới.
     + Hiển thị thông báo thành công: `showSuccess("Appointment replaced")`.
   - **Nếu User không chọn ghi đè (`replace == false`):**
     + Hệ thống gọi hàm `promptChooseAvailableTime()` để yêu cầu User chọn một khung giờ khác rảnh rỗi hơn.

### Trường hợp 3B: Không bị trùng lịch (no conflict)
Nếu khung giờ trống, giao diện tiếp tục gọi Calendar để kiểm tra xem có cuộc họp nhóm nào đang trùng tên và thời lượng không: `findMatchingGroupMeeting(title, start, end)`.

- **Nếu TÌM THẤY cuộc họp nhóm trùng khớp (`meeting != null`):**
  1. Giao diện hiển thị hộp thoại hỏi User có muốn tham gia group meeting (list group nếu số lịch nhiều hơn 1) này không: `askJoinGroupMeeting(meeting)`.
  2. User đưa ra quyết định `chooseJoin(join)`.
     - **Nếu User đồng ý tham gia (`join == true`):** Giao diện báo Calendar thực hiện `joinGroupMeeting(user, meeting)`. Sau đó GroupMeeting thêm user vào danh sách qua `addParticipant(user)`. Cuối cùng, hiển thị thông báo `showSuccess("Joined Group Meeting")`.
     - **Nếu User từ chối tham gia (`join == false`):** Hệ thống tiến hành tạo lịch cá nhân bình thường. Calendar gọi `createAppointment(...)`, chạy vòng lặp thêm reminder `addReminder()`, sau đó lưu vào danh sách bằng `addAppointment(newAppt)`. Cuối cùng hiển thị `showSuccess("Appointment Added")`.

- **Nếu KHÔNG TÌM THẤY cuộc họp nhóm nào (`meeting == null`):**
  1. Hệ thống đi thẳng vào luồng tạo lịch mới bình thường.
  2. Calendar gọi `createAppointment(...)` để tạo đối tượng `newAppt`.
  3. Chạy vòng lặp để gán từng reminder vào lịch `addReminder()`.
  4. Lưu lịch vào bộ nhớ bằng hàm `addAppointment(newAppt)`.
  5. Giao diện hiển thị thông báo `showSuccess("Appointment Added")`. Kết thúc luồng thành công.
