# Hướng dẫn cài đặt và chạy dự án

## Yêu cầu hệ thống

- .NET 10 SDK
- SQL Server (bất kỳ edition: Express, Developer, LocalDB)
- Node.js >= 18
- pnpm

## Cấu trúc thư mục

```
Calendar/
├── backend/       ASP.NET Core Web API (.NET 10 + EF Core + SQL Server)
├── frontend/      React + Vite + TypeScript + TailwindCSS
└── docs/          Tài liệu
```

## 1. Cấu hình Database

Mở file `backend/appsettings.json`, chỉnh connection string cho đúng SQL Server của bạn:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=YOUR_SERVER;Initial Catalog=Calendar;Integrated Security=True;TrustServerCertificate=True;"
  }
}
```

Ví dụ:
- Windows Auth: `Data Source=DESKTOP-ABC;Initial Catalog=Calendar;Integrated Security=True;TrustServerCertificate=True;`
- SQL Auth: `Data Source=localhost;Initial Catalog=Calendar;User Id=sa;Password=123456;TrustServerCertificate=True;`

## 2. Chạy Backend

```bash
cd backend
dotnet restore
dotnet run
```

Khi chạy lần đầu, EF Core sẽ tự động:
1. Tạo database `Calendar` nếu chưa có
2. Chạy migration tạo các bảng + seed dữ liệu mẫu

Seed data nằm trong file `Data/DbSeeder.cs`, được gọi trong `AppDbContext.OnModelCreating()`.
Dữ liệu seed được nhúng vào migration → chạy qua lệnh `dotnet ef database update` là có data.

Backend chạy tại: `http://localhost:5000`

## 3. Chạy Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend chạy tại: `http://localhost:3600`

Vite proxy tự động chuyển `/api/` → `http://localhost:5000` (backend).

## 4. Migration (EF Core)

### Xem danh sách migrations

```bash
cd backend
dotnet ef migrations list
```

### Tạo migration mới (khi thay đổi Models)

```bash
cd backend
dotnet ef migrations add TenMigration --output-dir Data/Migrations
```

### Áp dụng migration vào database

```bash
cd backend
dotnet ef database update
```

### Xóa migration cuối cùng (chưa áp dụng)

```bash
cd backend
dotnet ef migrations remove
```

### Reset database (xóa rồi tạo lại)

```bash
cd backend
dotnet ef database drop --force
dotnet run
```

Khi chạy `dotnet run`, database sẽ tự tạo lại từ đầu và seed dữ liệu mẫu.

## 5. API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/users | Danh sách users |
| GET | /api/appointments?userId=X | Lịch hẹn của user |
| GET | /api/appointments/:id | Chi tiết lịch hẹn |
| POST | /api/appointments/check-conflict | Kiểm tra trùng lịch |
| POST | /api/appointments/check-group-meeting | Tìm group meeting trùng |
| POST | /api/appointments/create | Tạo lịch hẹn mới |
| POST | /api/appointments/replace | Thay thế lịch hẹn bị trùng |
| POST | /api/appointments/join | Tham gia group meeting |

## 6. Tài khoản mẫu

Không cần đăng nhập. Switch user bằng nút trên giao diện:

| UserId | Tên |
|--------|-----|
| 1 | Toàn |
| 2 | Sơn |
| 3 | Dũng |
