# OOAD Calendar Appointment System

Hệ thống quản lý lịch hẹn (Calendar) được thiết kế theo nguyên lý OOAD và kiến trúc N-Tier chuyên nghiệp.

## 🌟 Công nghệ sử dụng
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: ASP.NET Core 10 (C#)
- **Database**: MySQL
- **Package Manager**: pnpm / npm

## 🏗️ Kiến trúc hệ thống (N-Tier Architecture)
Hệ thống được chia làm các tầng rõ rệt để đảm bảo tính dễ bảo trì và mở rộng:
1.  **Controller Layer**: Nhận Request thông qua các Web API Controller và điều phối các Service.
2.  **Service Layer**: Chứa logic nghiệp vụ chính (Phân tách thành `UserService`, `AppointmentService`, `GroupMeetingService`).
3.  **Repository Layer**: Thực hiện các truy vấn SQL trực tiếp vào MySQL database bằng `MySqlConnector`.
4.  **Model/DTO Layer**: Các Class thực thể (Entity) và Data Transfer Objects đại diện cho dữ liệu.

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Yêu cầu hệ thống
- **.NET SDK 10.0+**
- **Node.js** (Phiên bản LTS)
- **MySQL Server** đang chạy ở cổng `3306`
- **pnpm** hoặc **npm**

### 2. Cài đặt Dependencies cho Frontend
Mở terminal tại thư mục gốc của dự án:
```bash
pnpm install
# hoặc
npm install
```

### 3. Cấu hình & Chạy Database (MySQL)
Ứng dụng có cơ chế tự động tạo database (Auto-Initialize). Bạn **không cần** phải chạy file `.sql` thủ công!
- Hãy đảm bảo MySQL Server đang chạy trên máy bạn.
- Mở file `CalendarApi/appsettings.json`.
- Kiểm tra cấu hình `ConnectionStrings` và sửa lại `Uid`, `Pwd`, `Port` cho phù hợp với tài khoản MySQL của bạn:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=calendar_db;Uid=root;Pwd=;"
  }
  ```

### 4. Khởi động Backend (.NET C#)
Mở một terminal mới và chạy:
```bash
cd CalendarApi
dotnet run
```
- Khi chạy lần đầu, Backend sẽ tự động kết nối vào MySQL, tạo database `calendar_db` và khởi tạo sẵn các bảng và dữ liệu mẫu.
- Backend API sẽ chạy tại: `http://localhost:5000`

### 5. Khởi động Frontend (React)
Mở một terminal khác tại thư mục gốc và chạy:
```bash
pnpm dev
# hoặc
npm run dev
```
- Frontend sẽ chạy tại: `http://localhost:3600` (Tự động proxy các request `/api` sang backend port 5000).

## 📅 Các tính năng nổi bật
- **Gợi ý tham gia nhóm**: Khi tạo lịch trùng Tên + Thời lượng, hệ thống sẽ gợi ý các nhóm hiện có để người dùng chọn tham gia thay vì tạo mới.
- **Xử lý trùng lịch (Conflict)**: Phát hiện lịch cá nhân bị trùng và cung cấp tùy chọn "Thay thế" (Replace) lịch cũ.
- **Phê duyệt gia nhập**: Chủ phòng (Owner) có quyền duyệt hoặc từ chối các yêu cầu gia nhập cuộc họp nhóm.
- **Lời nhắc (Reminders)**: Tự động chạy ngầm và thông báo Popup khi đến hạn cuộc hẹn.

## 📊 Thông tin mã nguồn
- **Mã nguồn**: Tuân thủ nguyên lý thiết kế hướng đối tượng (OOAD).
- **Backend**: Hiệu năng cao với ASP.NET Core C#.
- **Database**: Tương tác mạnh mẽ qua MySQL với kiến trúc Repository Pattern.
