# OOAD Calendar Appointment System

Hệ thống quản lý lịch hẹn (Calendar) được thiết kế theo nguyên lý OOAD và kiến trúc N-Tier chuyên nghiệp.

## 🌟 Công nghệ sử dụng
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 18
- **Package Manager**: pnpm

## 🏗️ Kiến trúc hệ thống (N-Tier Architecture)
Hệ thống được chia làm các tầng rõ rệt để đảm bảo tính dễ bảo trì và mở rộng:
1.  **Controller Layer**: Nhận Request, Validate dữ liệu và điều phối các Service.
2.  **Service Layer**: Chứa logic nghiệp vụ chính (Phân tách thành `UserService`, `AppointmentService`, `GroupMeetingService`).
3.  **Repository Layer**: Thực hiện các truy vấn SQL trực tiếp vào Database.
4.  **Model Layer**: Các Class thực thể (Entity) đại diện cho dữ liệu.

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Cấu hình môi trường
- Tạo file `.env` từ `.env.example`.
- Cập nhật thông tin `DB_PASSWORD` và các thông số kết nối PostgreSQL của bạn.

### 2. Khởi tạo Database (Migration)
Chạy lệnh sau để tự động tạo Database và nạp dữ liệu mẫu (Toàn, Sơn, Dũng):
```bash
npx tsx scripts/migrate.ts
```

### 3. Khởi động ứng dụng
Chạy cả Frontend và Backend đồng thời:
```bash
pnpm dev
```
- Frontend sẽ chạy tại: `http://localhost:3636`
- Backend API sẽ chạy tại: `http://localhost:3636/api` (Dùng chung port thông qua Vite Proxy hoặc port riêng 3637 tùy cấu hình).

### 4. Kiểm tra hệ thống (Testing)
Chạy bộ test tự động bao quát các kịch bản quan trọng (Validation, Group Suggestion, Conflict, Replace):
```bash
npx tsx scripts/test_system.ts
```

## 📅 Các tính năng nổi bật
- **Gợi ý đa nhóm**: Khi tạo lịch trùng Tên + Thời lượng, hệ thống sẽ gợi ý tất cả các nhóm hiện có để người dùng chọn tham gia.
- **Xử lý trùng lịch (Conflict)**: Phát hiện lịch cá nhân bị trùng và cung cấp tùy chọn "Replace" (Ghi đè) lịch cũ.
- **Phê duyệt gia nhập**: Chủ phòng có quyền duyệt hoặc từ chối các yêu cầu gia nhập cuộc họp nhóm.
- **Lời nhắc (Reminders)**: Hỗ trợ nhiều hình thức nhắc nhở (Popup, Email).

## 📊 Báo cáo sơ bộ
- **Tình trạng**: Đã hoàn thiện 100% logic nghiệp vụ.
- **Database**: Đã tối ưu hóa cho PostgreSQL với các ràng buộc (Constraints) và khóa ngoại (Foreign Keys) chặt chẽ.
- **Mã nguồn**: Sạch sẽ, không có code dư thừa, tuân thủ TypeScript Strict Mode.
