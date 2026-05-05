# OOAD Calendar Appointment - Hệ thống Quản lý Lịch biểu Thông minh

Dự án này là một ứng dụng quản lý lịch biểu (Calendar) được xây dựng dựa trên nguyên lý **Phân tích và Thiết kế Hướng đối tượng (OOAD)**. Khác với các kiến trúc truyền thống thường tách rời dữ liệu và logic (Anemic Domain Model), dự án này tập trung vào việc đóng gói (Encapsulation) hành vi nghiệp vụ ngay trong các lớp **Domain Models**.

## 🚀 Tính năng nổi bật

- **Quản lý Lịch cá nhân**: Tạo, xem chi tiết và thay thế các cuộc hẹn (Appointments).
- **Kiểm tra Xung đột (Conflict Detection)**: Tự động phát hiện khi các cuộc hẹn bị trùng lặp thời gian.
- **Đề xuất Họp nhóm (Group Meeting Suggestion)**: Nếu cuộc hẹn mới trùng tên và thời lượng với một cuộc họp nhóm hiện có, hệ thống sẽ đề xuất người dùng tham gia thay vì tạo mới.
- **Tham gia Họp nhóm**: Cho phép nhiều người dùng cùng tham gia vào một cuộc họp nhóm duy nhất.
- **Nhắc nhở (Reminders)**: Hệ thống thông báo tự động (Popup/Email) trước khi cuộc hẹn diễn ra.
- **Chuyển đổi Người dùng**: Mô phỏng tương tác giữa nhiều người dùng khác nhau trên cùng một giao diện.

## 🏗️ Kiến trúc & Thiết kế (OOAD)

Dự án tuân thủ nghiêm ngặt tư duy hướng đối tượng:
- **Rich Domain Model**: Các class trong thư mục `Models` (như `Calendar`, `Appointment`, `GroupMeeting`) chứa cả các thuộc tính dữ liệu và các phương thức xử lý nghiệp vụ (ví dụ: `overlapsWith`, `findConflictingAppointment`).
- **Inheritance (Kế thừa)**: `GroupMeeting` kế thừa từ `Appointment`, mở rộng thêm danh sách người tham gia.
- **Repository Pattern**: Sử dụng `ICalendarRepository` để tách biệt logic truy xuất dữ liệu (Data Access) ra khỏi logic nghiệp vụ.
- **Dependency Injection**: Tận dụng hệ thống DI của ASP.NET Core để quản lý vòng đời của Repository và DbContext.

## 🛠️ Công nghệ sử dụng

### Backend (BE)
- **ASP.NET Core 10**: Framework Web API hiệu suất cao nhất hiện nay.
- **Entity Framework Core 10**: ORM mạnh mẽ để tương tác với Database.
- **SQL Server**: Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, đáng tin cậy.

### Frontend (FE)
- **React 19**: Phiên bản mới nhất với các cải tiến về hiệu suất.
- **TypeScript**: Đảm bảo an toàn kiểu dữ liệu và nâng cao trải nghiệm lập trình.
- **Vite**: Công cụ build siêu tốc cho môi trường phát triển.
- **TailwindCSS 4**: Thiết kế giao diện hiện đại, chuyên nghiệp và responsive.
- **Lucide React**: Bộ icon mã nguồn mở tinh tế.

## 📂 Cấu trúc thư mục

```text
Calendar/
├── backend/            # ASP.NET Core 10 Web API
│   ├── Controllers/    # API Endpoints
│   ├── Data/           # DbContext & Migrations
│   ├── Models/         # Rich Domain Models (Logic nghiệp vụ nằm ở đây)
│   ├── Repositories/   # Data Access Layer
│   └── Program.cs      # Cấu hình hệ thống & Seed data
└── frontend/           # React 19 Frontend
    ├── components/     # UI Components (Modals, Buttons, etc.)
    ├── models/         # Client-side Models
    ├── pages/          # Main Views (Calendar Page)
    └── container.ts    # Kết nối logic Controller phía Client
```

## 🛠️ Hướng dẫn cài đặt

### Yêu cầu hệ thống
- .NET 10 SDK
- Node.js (phiên bản mới nhất) & `pnpm`
- SQL Server (LocalDB hoặc Server thực tế)

### 1. Cấu hình Backend
Di chuyển vào thư mục `backend/`:
```bash
# Cấu hình chuỗi kết nối trong appsettings.json
# "DefaultConnection": "Server=...;Database=OOAD_Calendar;..."

# Cài đặt thư viện
dotnet restore

# Chạy Migration để tạo Database và Seed dữ liệu mẫu
dotnet ef database update

# Khởi động Backend (mặc định port 5000)
dotnet run
```

### 2. Cấu hình Frontend
Di chuyển vào thư mục `frontend/`:
```bash
# Cài đặt dependencies
pnpm install

# Khởi động Frontend (mặc định port 3600)
pnpm dev
```

Truy cập `http://localhost:3600` để bắt đầu trải nghiệm ứng dụng.

---
*Dự án được phát triển với mục tiêu thực hành các nguyên lý thiết kế phần mềm bền vững và chuẩn OOP/OOAD.*
