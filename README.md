# OOAD Calendar - Add Calendar Appointment

Ứng dụng demo use case **Add Calendar Appointment** theo mô hình **MVC + N-Layers** với TypeScript/React.

## Tính năng chính

- Giao diện lịch tháng lấy cảm hứng từ PBL3.
- Add Appointment qua popup form (`AddAppointmentForm`).
- Validate đầu vào (tên rỗng, thời lượng âm/0).
- Phát hiện trùng lịch và cho phép người dùng **Replace** cuộc hẹn cũ.
- Gợi ý **Join Group Meeting** khi trùng tên + thời lượng với một cuộc họp nhóm có sẵn.
- Mock data in-memory (chưa cần backend/database).

## Cấu trúc thư mục

- `src/controllers`: điều phối request từ UI vào service.
- `src/models`: entities/classes và kiểu dữ liệu use case.
- `src/services`: business logic Add Calendar Appointment.
- `src/repositories`: truy cập dữ liệu (mock repository).
- `src/utils`: tiện ích xử lý ngày giờ và lịch tháng.
- `src/app`: giao diện chính + modal + wiring dependency.

## Chạy dự án

1. Cài dependencies.
2. Chạy dev server.
3. Mở `http://localhost:3636`.

## UML

Xem tại `docs/diagrams.md`.
