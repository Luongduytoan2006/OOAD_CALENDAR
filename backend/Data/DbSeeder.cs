using CalendarApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarApi.Data;

public static class DbSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        // Users
        modelBuilder.Entity<User>().HasData(
            new User { UserId = 1, FullName = "Toàn" },
            new User { UserId = 2, FullName = "Sơn" },
            new User { UserId = 3, FullName = "Dũng" }
        );

        // Appointments cá nhân - Toàn (ngày 6/5 có 2 lịch)
        modelBuilder.Entity<Appointment>().HasData(
            new { AppointmentId = 1, Title = "Họp Sprint Planning", Location = "Phòng A1", StartTime = new DateTime(2026, 5, 6, 9, 0, 0), EndTime = new DateTime(2026, 5, 6, 10, 30, 0), OwnerId = 1, IsGroupMeeting = false },
            new { AppointmentId = 2, Title = "Ăn trưa với khách", Location = "Nhà hàng Hải Sản", StartTime = new DateTime(2026, 5, 6, 11, 30, 0), EndTime = new DateTime(2026, 5, 6, 13, 0, 0), OwnerId = 1, IsGroupMeeting = false },
            new { AppointmentId = 3, Title = "Review code", Location = "Online", StartTime = new DateTime(2026, 5, 7, 14, 0, 0), EndTime = new DateTime(2026, 5, 7, 15, 0, 0), OwnerId = 1, IsGroupMeeting = false },
            new { AppointmentId = 4, Title = "Tập gym", Location = "Phòng gym tầng 2", StartTime = new DateTime(2026, 5, 7, 17, 0, 0), EndTime = new DateTime(2026, 5, 7, 18, 30, 0), OwnerId = 1, IsGroupMeeting = false },
            new { AppointmentId = 5, Title = "Đọc tài liệu OOAD", Location = "Thư viện", StartTime = new DateTime(2026, 5, 8, 8, 0, 0), EndTime = new DateTime(2026, 5, 8, 9, 30, 0), OwnerId = 1, IsGroupMeeting = false }
        );

        // Appointments cá nhân - Sơn
        modelBuilder.Entity<Appointment>().HasData(
            new { AppointmentId = 6, Title = "Học tiếng Anh", Location = "Online", StartTime = new DateTime(2026, 5, 6, 19, 0, 0), EndTime = new DateTime(2026, 5, 6, 20, 30, 0), OwnerId = 2, IsGroupMeeting = false },
            new { AppointmentId = 7, Title = "Gặp mentor", Location = "Quán cà phê", StartTime = new DateTime(2026, 5, 8, 10, 0, 0), EndTime = new DateTime(2026, 5, 8, 11, 0, 0), OwnerId = 2, IsGroupMeeting = false }
        );

        // Appointments cá nhân - Dũng
        modelBuilder.Entity<Appointment>().HasData(
            new { AppointmentId = 8, Title = "Chạy bộ buổi sáng", Location = "Công viên", StartTime = new DateTime(2026, 5, 7, 6, 0, 0), EndTime = new DateTime(2026, 5, 7, 7, 0, 0), OwnerId = 3, IsGroupMeeting = false },
            new { AppointmentId = 9, Title = "Nấu ăn", Location = "Nhà", StartTime = new DateTime(2026, 5, 9, 17, 0, 0), EndTime = new DateTime(2026, 5, 9, 18, 30, 0), OwnerId = 3, IsGroupMeeting = false }
        );

        // Group Meetings - Toàn tạo
        modelBuilder.Entity<GroupMeeting>().HasData(
            new { AppointmentId = 10, Title = "Họp nhóm đồ án", Location = "Phòng Lab", StartTime = new DateTime(2026, 5, 9, 9, 0, 0), EndTime = new DateTime(2026, 5, 9, 10, 30, 0), OwnerId = 1, IsGroupMeeting = true },
            new { AppointmentId = 11, Title = "Thảo luận báo cáo", Location = "Phòng A2", StartTime = new DateTime(2026, 5, 10, 14, 0, 0), EndTime = new DateTime(2026, 5, 10, 15, 30, 0), OwnerId = 1, IsGroupMeeting = true }
        );

        // Group Meeting - Sơn tạo (cùng tên + giờ với Toàn -> test đề xuất)
        modelBuilder.Entity<GroupMeeting>().HasData(
            new { AppointmentId = 12, Title = "Họp nhóm đồ án", Location = "Phòng Lab", StartTime = new DateTime(2026, 5, 9, 9, 0, 0), EndTime = new DateTime(2026, 5, 9, 10, 30, 0), OwnerId = 2, IsGroupMeeting = true }
        );

        // Group Meeting - Dũng tạo (cùng tên + giờ với Toàn -> test đề xuất nhiều)
        modelBuilder.Entity<GroupMeeting>().HasData(
            new { AppointmentId = 13, Title = "Thảo luận báo cáo", Location = "Online", StartTime = new DateTime(2026, 5, 10, 14, 0, 0), EndTime = new DateTime(2026, 5, 10, 15, 30, 0), OwnerId = 3, IsGroupMeeting = true }
        );

        // Participants (join table) - mỗi owner tự tham gia meeting của mình
        modelBuilder.Entity("Participant").HasData(
            new { AppointmentId = 10, UserId = 1 },
            new { AppointmentId = 11, UserId = 1 },
            new { AppointmentId = 12, UserId = 2 },
            new { AppointmentId = 13, UserId = 3 }
        );

        // Reminders
        modelBuilder.Entity<Reminder>().HasData(
            new { ReminderId = 1, AppointmentId = 1, RemindAt = new DateTime(2026, 5, 6, 8, 45, 0), Method = ReminderMethod.POPUP },
            new { ReminderId = 2, AppointmentId = 3, RemindAt = new DateTime(2026, 5, 7, 13, 45, 0), Method = ReminderMethod.EMAIL },
            new { ReminderId = 3, AppointmentId = 10, RemindAt = new DateTime(2026, 5, 9, 8, 45, 0), Method = ReminderMethod.POPUP }
        );
    }
}
