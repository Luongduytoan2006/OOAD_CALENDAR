-- 1. Xóa toàn bộ dữ liệu cũ
DROP TABLE IF EXISTS pending_requests;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS group_meetings;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS users;

-- 2. Tạo bảng (Schema)
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name VARCHAR(255) NOT NULL
);

CREATE TABLE appointments (
  appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  owner_id INTEGER REFERENCES users(user_id),
  is_group_meeting BOOLEAN DEFAULT FALSE
);

CREATE TABLE group_meetings (
  appointment_id INTEGER PRIMARY KEY REFERENCES appointments(appointment_id)
);

CREATE TABLE participants (
  appointment_id INTEGER REFERENCES group_meetings(appointment_id),
  user_id INTEGER REFERENCES users(user_id),
  PRIMARY KEY (appointment_id, user_id)
);

CREATE TABLE pending_requests (
  appointment_id INTEGER REFERENCES group_meetings(appointment_id),
  user_id INTEGER REFERENCES users(user_id),
  PRIMARY KEY (appointment_id, user_id)
);

CREATE TABLE reminders (
  reminder_id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER REFERENCES appointments(appointment_id),
  reminder_type VARCHAR(50),
  reminder_time TEXT
);

-- 3. Seed Users
INSERT INTO users (user_id, full_name) VALUES (1, 'Toàn'), (2, 'Sơn'), (3, 'Dũng');

-- 4. Seed Appointments (Rải rác từ 25/04 đến 30/04)
INSERT INTO appointments (appointment_id, title, location, start_time, end_time, owner_id, is_group_meeting) VALUES 
-- Ngày 25/04
(1, 'Lập kế hoạch tuần', 'Phòng họp 1', '2026-04-25T08:00:00Z', '2026-04-25T09:00:00Z', 1, false),
(2, 'Workshop UI/UX', 'Phòng Creative', '2026-04-25T14:00:00Z', '2026-04-25T16:00:00Z', 3, true),

-- Ngày 26/04
(3, 'Review Code Sprint 1', 'Văn phòng', '2026-04-26T10:00:00Z', '2026-04-26T11:30:00Z', 2, false),
(4, 'Ăn trưa cùng team', 'Nhà hàng Sen', '2026-04-26T12:00:00Z', '2026-04-26T13:30:00Z', 1, true),

-- Ngày 27/04
(5, 'Fix bug Database', 'Remote', '2026-04-27T09:00:00Z', '2026-04-27T11:00:00Z', 2, false),
(6, 'Học ngoại ngữ', 'Trung tâm', '2026-04-27T18:00:00Z', '2026-04-27T19:30:00Z', 3, false),

-- Ngày 28/04 (Hôm nay)
(7, 'Báo cáo OOAD', 'Giảng đường A', '2026-04-28T08:30:00Z', '2026-04-28T10:00:00Z', 1, true),
(8, 'Tập Gym', 'Gym Center', '2026-04-28T17:00:00Z', '2026-04-28T18:30:00Z', 2, false),

-- Ngày 29/04
(9, 'Meeting khách hàng', 'Cafe Highland', '2026-04-29T14:00:00Z', '2026-04-29T15:30:00Z', 3, false),
(10, 'Tổng kết dự án', 'Phòng họp lớn', '2026-04-29T16:00:00Z', '2026-04-29T17:30:00Z', 1, true);

-- 5. Seed Group Meetings Metadata
INSERT INTO group_meetings (appointment_id) VALUES (2), (4), (7), (10);

-- 6. Seed Participants (Sự giao thoa)
INSERT INTO participants (appointment_id, user_id) VALUES 
(2, 3), (2, 1),
(4, 1), (4, 2),
(7, 1), (7, 2), (7, 3),
(10, 1), (10, 3);
