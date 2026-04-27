-- 1. Xóa toàn bộ dữ liệu cũ
DROP TABLE IF EXISTS pending_requests CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS group_meetings CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Tạo bảng (Schema)
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL
);

CREATE TABLE appointments (
  appointment_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  owner_id INTEGER REFERENCES users(user_id),
  is_group_meeting BOOLEAN DEFAULT FALSE
);

CREATE TABLE group_meetings (
  appointment_id INTEGER PRIMARY KEY REFERENCES appointments(appointment_id) ON DELETE CASCADE
);

CREATE TABLE participants (
  appointment_id INTEGER REFERENCES group_meetings(appointment_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id),
  PRIMARY KEY (appointment_id, user_id)
);

CREATE TABLE pending_requests (
  appointment_id INTEGER REFERENCES group_meetings(appointment_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id),
  PRIMARY KEY (appointment_id, user_id)
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
(2, 3), (2, 1), -- Workshop UI: Dũng chủ trì, Toàn tham gia
(4, 1), (4, 2), -- Ăn trưa: Toàn chủ trì, Sơn tham gia
(7, 1), (7, 2), (7, 3), -- Báo cáo OOAD: Cả 3 người cùng tham gia
(10, 1), (10, 3); -- Tổng kết: Toàn chủ trì, Dũng tham gia

-- 7. Reset Sequences
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('appointments_appointment_id_seq', (SELECT MAX(appointment_id) FROM appointments));
