# 📅 OOAD Calendar Appointment System

Chào mừng đến với **OOAD Calendar** - Hệ thống quản lý lịch hẹn thông minh được thiết kế nghiêm ngặt theo các nguyên lý Phân tích và Thiết kế Hướng đối tượng (OOAD) và kiến trúc đa tầng (N-Tier Architecture).

---

## 🌟 Giới thiệu chung

Dự án này là một giải pháp quản lý thời gian đa nền tảng, cho phép người dùng cá nhân tạo và quản lý các lịch hẹn (Appointments) hoặc các cuộc họp nhóm (Group Meetings). Hệ thống nổi bật với khả năng phát hiện xung đột lịch thông minh, gợi ý tham gia nhóm, hệ thống phê duyệt thành viên và cơ chế nhắc nhở tự động.

## 🛠️ Công nghệ sử dụng

Dự án là sự kết hợp hoàn hảo giữa giao diện người dùng hiện đại và hệ thống backend mạnh mẽ:

- **Frontend**: 
  - **React 19** & **TypeScript**: Xây dựng UI linh hoạt và an toàn kiểu dữ liệu.
  - **Vite**: Build tool siêu tốc dành cho Frontend.
  - **TailwindCSS 4**: Hệ thống Utility-first CSS giúp thiết kế giao diện đẹp mắt, Responsive.
  - **Lucide-React**: Bộ icon mã nguồn mở chuyên nghiệp.
- **Backend**:
  - **ASP.NET Core 10 (C#)**: Framework siêu tốc cho Web API.
  - **Kiến trúc N-Tier**: Controller -> Service -> Repository giúp Tách biệt Mối quan tâm (Separation of Concerns).
- **Database**:
  - **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở phổ biến.
  - **MySqlConnector**: Tương tác trực tiếp không thông qua ORM rườm rà, tối đa hóa hiệu suất bằng SQL thô thuần túy và tham số hóa an toàn.

---

## 🏗️ Kiến trúc hệ thống (N-Tier Architecture)

Mã nguồn Backend được phân chia thành 4 lớp (Layers) rõ ràng để dễ dàng mở rộng và bảo trì:

1. **Controllers Layer (`CalendarApi/Controllers/`)**:
   - Nhận các Request HTTP từ Client.
   - Trích xuất tham số, xác thực (Validation) cơ bản.
   - Trả về JSON Response tương ứng.
   - *(Tuyệt đối không chứa logic xử lý nghiệp vụ hay truy vấn database)*.

2. **Services Layer (`CalendarApi/Services/`)**:
   - Trái tim của hệ thống: Chứa **Business Logic**.
   - Kiểm tra trùng lịch (Conflict Checking), đưa ra gợi ý (Suggestions), xử lý logic thay thế (Replace) lịch cũ.
   - Giao tiếp với nhiều Repository cùng lúc.

3. **Repositories Layer (`CalendarApi/Repositories/`)**:
   - Chịu trách nhiệm tương tác trực tiếp với **MySQL Database**.
   - Chứa các câu lệnh SQL (SELECT, INSERT, UPDATE, DELETE).
   - Biến đổi (Mapping) các dòng dữ liệu vô tri (Data Rows) thành các Thực thể C# (Entities).

4. **Models / DTOs Layer (`CalendarApi/Models/`)**:
   - Chứa định nghĩa các Đối tượng Nghiệp vụ (Appointment, GroupMeeting, User, Reminder).
   - Chứa các Đối tượng Truyền tải Dữ liệu (DTOs) dùng để giao tiếp qua API.

---

## 🚀 Hướng dẫn cài đặt và chạy (Quickstart)

Hệ thống đã được thiết kế để tự động hóa tối đa quy trình cài đặt, loại bỏ sự phức tạp cho lập trình viên.

### Bước 1: Yêu cầu môi trường
- Máy tính cần cài đặt **.NET SDK 10.0+**.
- Cài đặt **Node.js** (phiên bản LTS) và **pnpm** (hoặc npm).
- Cài đặt **MySQL Server** và đảm bảo nó đang chạy (qua XAMPP, Docker, hoặc cài đặt trực tiếp).

### Bước 2: Cấu hình Database
Bạn **KHÔNG CẦN** tạo bảng hay tạo database thủ công. Ứng dụng tích hợp sẵn `DatabaseInitializer` sẽ lo việc đó.
1. Mở file cấu hình `CalendarApi/appsettings.json`.
2. Sửa chuỗi kết nối MySQL cho đúng với tài khoản của bạn (User, Password, Port).
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Port=3306;Database=calendar_db;Uid=root;Pwd=123456;"
   }
   ```

### Bước 3: Khởi động Backend
Mở Terminal, di chuyển vào thư mục `CalendarApi`:
```bash
cd CalendarApi
dotnet run
```
*Ghi chú: Lần chạy đầu tiên, Backend sẽ tự động kết nối với MySQL, tạo database `calendar_db`, khởi tạo cấu trúc bảng (Tables) và chèn sẵn 3 người dùng mẫu (Toàn, Sơn, Dũng). API sẽ lắng nghe tại `http://localhost:5000`.*

### Bước 4: Khởi động Frontend
Mở Terminal khác tại thư mục gốc của dự án:
```bash
pnpm install
pnpm dev
```
*Frontend sẽ chạy tại `http://localhost:3600` và được proxy trực tiếp sang Backend.*

---

## 📅 Các tính năng nổi bật & Nghiệp vụ cốt lõi

1. **Khởi tạo Lịch Cá Nhân & Nhóm**:
   - Hỗ trợ tạo lịch riêng rẽ cho cá nhân hoặc tạo phòng họp chung cho nhiều người.
2. **Xử lý xung đột lịch (Conflict Resolution)**:
   - Khi tạo lịch cá nhân bị trùng giờ, hệ thống lập tức phát hiện và thông báo.
   - Người dùng có thể chọn **Bỏ qua (Cancel)** hoặc **Thay thế (Replace)** lịch cũ bằng lịch mới.
3. **Gợi ý thông minh (Smart Suggestions)**:
   - Khi người dùng muốn tạo một cuộc họp nhóm mới, hệ thống sẽ dò tìm xem trong hệ thống đã có cuộc họp nào cùng tên và cùng giờ hay chưa.
   - Nếu có, hệ thống không tạo mới mà gợi ý người dùng **Gia nhập (Join)** vào nhóm có sẵn đó để tránh làm rác database.
4. **Quy trình Phê duyệt (Approval Workflow)**:
   - Người xin gia nhập (Requester) sẽ ở trạng thái `Pending Requests`.
   - Chủ phòng (Owner) của lịch đó sẽ có quyền `Approve` để đẩy họ sang danh sách `Participants`.
5. **Hệ thống Lời nhắc (Background Reminders)**:
   - Backend hỗ trợ lưu trữ giờ nhắc nhở (RemindAt) và phương thức nhắc (POPUP, EMAIL, SMS).
   - Frontend chạy cơ chế Polling (ngầm) định kỳ mỗi 10 giây để dò tìm những lịch sắp đến hạn và bung thông báo Popup.

---

> 🎉 **Tài liệu tham khảo thêm**: Xem tài liệu phân tích chi tiết luồng xử lý (Workflow) tại file `docs/ADD_APPOINTMENT_FLOW.md`.
