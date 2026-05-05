using MySqlConnector;
using System;

namespace CalendarApi.Data;

public static class DatabaseInitializer
{
    public static void Initialize(string connectionString)
    {
        var builder = new MySqlConnectionStringBuilder(connectionString);
        var dbName = builder.Database;
        builder.Database = ""; // Xóa tên DB để connect vào server trước

        try
        {
            using (var connection = new MySqlConnection(builder.ConnectionString))
            {
                connection.Open();

                // 1. Tạo database nếu chưa có
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = $"CREATE DATABASE IF NOT EXISTS `{dbName}`;";
                    cmd.ExecuteNonQuery();
                }

                // 2. Trỏ vào database vừa tạo
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = $"USE `{dbName}`;";
                    cmd.ExecuteNonQuery();
                }

                // 3. Tạo các bảng (tables) và dummy data
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = @"
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO users (user_id, full_name) VALUES
(1, 'Toàn'),
(2, 'Sơn'),
(3, 'Dũng');

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  owner_id INT NOT NULL,
  is_group_meeting TINYINT(1) DEFAULT 0,
  FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reminders (
  reminder_id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  reminder_time DATETIME NOT NULL,
  reminder_type VARCHAR(50) NOT NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_meetings (
  appointment_id INT PRIMARY KEY,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS participants (
  appointment_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (appointment_id, user_id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pending_requests (
  appointment_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (appointment_id, user_id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
";
                    cmd.ExecuteNonQuery();
                }
            }
            Console.WriteLine($"✅ Database '{dbName}' initialized and tables verified.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to initialize database: {ex.Message}");
        }
    }
}
