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

        // === Appointments cá nhân - Toàn ===
        modelBuilder.Entity<Appointment>().HasData(
            new { AppointmentId = 1, Title = "Họp Sprint Planning", Location = "Phòng A1", StartTime = new DateTime(2026, 5, 8, 9, 0, 0), EndTime = new DateTime(2026, 5, 8, 10, 30, 0), OwnerId = 1, IsGroupMeeting = false },
            new { AppointmentId = 2, Title = "Ăn trưa với khách", Location = "Nhà hàng Hải Sản", StartTime = new DateTime(2026, 5, 8, 11, 30, 0), EndTime = new DateTime(2026, 5, 8, 13, 0, 0), OwnerId = 1, IsGroupMeeting = false },
            new { AppointmentId = 3, Title = "Review code PBL3", Location = "Online - Google Meet", StartTime = new DateTime(2026, 5, 9, 14, 0, 0), EndTime = new DateTime(2026, 5, 9, 15, 30, 0), OwnerId = 1, IsGroupMeeting = false },
            new { AppointmentId = 4, Title = "Tập gym", Location = "Phòng gym tầng 2", StartTime = new DateTime(2026, 5, 10, 17, 0, 0), EndTime = new DateTime(2026, 5, 10, 18, 30, 0), OwnerId = 1, IsGroupMeeting = false },
            new { AppointmentId = 5, Title = "Đọc tài liệu OOAD", Location = "Thư viện DUT", StartTime = new DateTime(2026, 5, 12, 8, 0, 0), EndTime = new DateTime(2026, 5, 12, 10, 0, 0), OwnerId = 1, IsGroupMeeting = false }
        );

        // === Appointments cá nhân - Sơn ===
        modelBuilder.Entity<Appointment>().HasData(
            new { AppointmentId = 6, Title = "Học tiếng Anh IELTS", Location = "Online - Zoom", StartTime = new DateTime(2026, 5, 8, 19, 0, 0), EndTime = new DateTime(2026, 5, 8, 20, 30, 0), OwnerId = 2, IsGroupMeeting = false },
            new { AppointmentId = 7, Title = "Gặp mentor hướng dẫn", Location = "Quán cà phê Highlands", StartTime = new DateTime(2026, 5, 10, 10, 0, 0), EndTime = new DateTime(2026, 5, 10, 11, 30, 0), OwnerId = 2, IsGroupMeeting = false }
        );

        // === Appointments cá nhân - Dũng ===
        modelBuilder.Entity<Appointment>().HasData(
            new { AppointmentId = 8, Title = "Chạy bộ buổi sáng", Location = "Công viên 29/3", StartTime = new DateTime(2026, 5, 9, 6, 0, 0), EndTime = new DateTime(2026, 5, 9, 7, 0, 0), OwnerId = 3, IsGroupMeeting = false },
            new { AppointmentId = 9, Title = "Nấu ăn cuối tuần", Location = "Nhà", StartTime = new DateTime(2026, 5, 11, 17, 0, 0), EndTime = new DateTime(2026, 5, 11, 18, 30, 0), OwnerId = 3, IsGroupMeeting = false }
        );

        // === Group Meeting - Toàn tạo ===
        modelBuilder.Entity<GroupMeeting>().HasData(
            new { AppointmentId = 10, Title = "Họp nhóm đồ án PBL3", Location = "Phòng Lab C3-201", StartTime = new DateTime(2026, 5, 12, 14, 0, 0), EndTime = new DateTime(2026, 5, 12, 16, 0, 0), OwnerId = 1, IsGroupMeeting = true },
            new { AppointmentId = 11, Title = "Thảo luận báo cáo cuối kỳ", Location = "Phòng A2", StartTime = new DateTime(2026, 5, 14, 9, 0, 0), EndTime = new DateTime(2026, 5, 14, 10, 30, 0), OwnerId = 1, IsGroupMeeting = true }
        );

        // === Group Meeting - Sơn tạo (cùng tên + giờ -> test đề xuất join) ===
        modelBuilder.Entity<GroupMeeting>().HasData(
            new { AppointmentId = 12, Title = "Họp nhóm đồ án PBL3", Location = "Phòng Lab C3-201", StartTime = new DateTime(2026, 5, 12, 14, 0, 0), EndTime = new DateTime(2026, 5, 12, 16, 0, 0), OwnerId = 2, IsGroupMeeting = true }
        );

        // === Group Meeting - Dũng tạo (cùng tên + giờ -> test đề xuất join) ===
        modelBuilder.Entity<GroupMeeting>().HasData(
            new { AppointmentId = 13, Title = "Thảo luận báo cáo cuối kỳ", Location = "Online - Discord", StartTime = new DateTime(2026, 5, 14, 9, 0, 0), EndTime = new DateTime(2026, 5, 14, 10, 30, 0), OwnerId = 3, IsGroupMeeting = true }
        );

        // === Participants (join table) - owner tự tham gia meeting của mình ===
        modelBuilder.Entity("Participant").HasData(
            new { AppointmentId = 10, UserId = 1 },
            new { AppointmentId = 11, UserId = 1 },
            new { AppointmentId = 12, UserId = 2 },
            new { AppointmentId = 13, UserId = 3 }
        );

        // === Reminders ===

        // Appointment 1: Họp Sprint Planning (8/5 lúc 9:00)
        modelBuilder.Entity<Reminder>().HasData(
            new { ReminderId = 1, AppointmentId = 1, RemindAt = new DateTime(2026, 5, 8, 8, 0, 0), Method = "1 giờ trước" },
            new { ReminderId = 2, AppointmentId = 1, RemindAt = new DateTime(2026, 5, 7, 9, 0, 0), Method = "1 ngày trước" }
        );

        // Appointment 3: Review code PBL3 (9/5 lúc 14:00)
        modelBuilder.Entity<Reminder>().HasData(
            new { ReminderId = 3, AppointmentId = 3, RemindAt = new DateTime(2026, 5, 9, 13, 30, 0), Method = "30 phút trước" },
            new { ReminderId = 4, AppointmentId = 3, RemindAt = new DateTime(2026, 5, 9, 12, 0, 0), Method = "2 giờ trước" }
        );

        // Appointment 5: Đọc tài liệu OOAD (12/5 lúc 8:00)
        modelBuilder.Entity<Reminder>().HasData(
            new { ReminderId = 5, AppointmentId = 5, RemindAt = new DateTime(2026, 5, 12, 7, 0, 0), Method = "1 giờ trước" }
        );

        // Appointment 6: Học tiếng Anh IELTS - Sơn (8/5 lúc 19:00)
        modelBuilder.Entity<Reminder>().HasData(
            new { ReminderId = 6, AppointmentId = 6, RemindAt = new DateTime(2026, 5, 8, 18, 0, 0), Method = "1 giờ trước" }
        );

        // Appointment 7: Gặp mentor - Sơn (10/5 lúc 10:00)
        modelBuilder.Entity<Reminder>().HasData(
            new { ReminderId = 7, AppointmentId = 7, RemindAt = new DateTime(2026, 5, 10, 9, 0, 0), Method = "1 giờ trước" },
            new { ReminderId = 8, AppointmentId = 7, RemindAt = new DateTime(2026, 5, 9, 10, 0, 0), Method = "1 ngày trước" }
        );

        // GroupMeeting 10: Họp nhóm đồ án PBL3 (12/5 lúc 14:00)
        modelBuilder.Entity<Reminder>().HasData(
            new { ReminderId = 9, AppointmentId = 10, RemindAt = new DateTime(2026, 5, 12, 13, 0, 0), Method = "1 giờ trước" },
            new { ReminderId = 10, AppointmentId = 10, RemindAt = new DateTime(2026, 5, 11, 14, 0, 0), Method = "1 ngày trước" }
        );

        // GroupMeeting 11: Thảo luận báo cáo cuối kỳ (14/5 lúc 9:00)
        modelBuilder.Entity<Reminder>().HasData(
            new { ReminderId = 11, AppointmentId = 11, RemindAt = new DateTime(2026, 5, 14, 8, 0, 0), Method = "1 giờ trước" },
            new { ReminderId = 12, AppointmentId = 11, RemindAt = new DateTime(2026, 5, 13, 9, 0, 0), Method = "1 ngày trước" },
            new { ReminderId = 13, AppointmentId = 11, RemindAt = new DateTime(2026, 5, 14, 8, 30, 0), Method = "30 phút trước" }
        );
    }
}
