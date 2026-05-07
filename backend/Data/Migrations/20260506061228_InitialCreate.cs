using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CalendarApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    AppointmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    IsGroupMeeting = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.AppointmentId);
                    table.ForeignKey(
                        name: "FK_Appointments_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Participants",
                columns: table => new
                {
                    AppointmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participants", x => new { x.AppointmentId, x.UserId });
                    table.ForeignKey(
                        name: "FK_Participants_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "AppointmentId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Participants_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Reminders",
                columns: table => new
                {
                    ReminderId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RemindAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AppointmentId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reminders", x => x.ReminderId);
                    table.ForeignKey(
                        name: "FK_Reminders_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "AppointmentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "FullName" },
                values: new object[,]
                {
                    { 1, "Toàn" },
                    { 2, "Sơn" },
                    { 3, "Dũng" }
                });

            migrationBuilder.InsertData(
                table: "Appointments",
                columns: new[] { "AppointmentId", "EndTime", "IsGroupMeeting", "Location", "OwnerId", "StartTime", "Title" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 5, 8, 10, 30, 0, 0, DateTimeKind.Unspecified), false, "Phòng A1", 1, new DateTime(2026, 5, 8, 9, 0, 0, 0, DateTimeKind.Unspecified), "Họp Sprint Planning" },
                    { 2, new DateTime(2026, 5, 8, 13, 0, 0, 0, DateTimeKind.Unspecified), false, "Nhà hàng Hải Sản", 1, new DateTime(2026, 5, 8, 11, 30, 0, 0, DateTimeKind.Unspecified), "Ăn trưa với khách" },
                    { 3, new DateTime(2026, 5, 9, 15, 30, 0, 0, DateTimeKind.Unspecified), false, "Online - Google Meet", 1, new DateTime(2026, 5, 9, 14, 0, 0, 0, DateTimeKind.Unspecified), "Review code PBL3" },
                    { 4, new DateTime(2026, 5, 10, 18, 30, 0, 0, DateTimeKind.Unspecified), false, "Phòng gym tầng 2", 1, new DateTime(2026, 5, 10, 17, 0, 0, 0, DateTimeKind.Unspecified), "Tập gym" },
                    { 5, new DateTime(2026, 5, 12, 10, 0, 0, 0, DateTimeKind.Unspecified), false, "Thư viện DUT", 1, new DateTime(2026, 5, 12, 8, 0, 0, 0, DateTimeKind.Unspecified), "Đọc tài liệu OOAD" },
                    { 6, new DateTime(2026, 5, 8, 20, 30, 0, 0, DateTimeKind.Unspecified), false, "Online - Zoom", 2, new DateTime(2026, 5, 8, 19, 0, 0, 0, DateTimeKind.Unspecified), "Học tiếng Anh IELTS" },
                    { 7, new DateTime(2026, 5, 10, 11, 30, 0, 0, DateTimeKind.Unspecified), false, "Quán cà phê Highlands", 2, new DateTime(2026, 5, 10, 10, 0, 0, 0, DateTimeKind.Unspecified), "Gặp mentor hướng dẫn" },
                    { 8, new DateTime(2026, 5, 9, 7, 0, 0, 0, DateTimeKind.Unspecified), false, "Công viên 29/3", 3, new DateTime(2026, 5, 9, 6, 0, 0, 0, DateTimeKind.Unspecified), "Chạy bộ buổi sáng" },
                    { 9, new DateTime(2026, 5, 11, 18, 30, 0, 0, DateTimeKind.Unspecified), false, "Nhà", 3, new DateTime(2026, 5, 11, 17, 0, 0, 0, DateTimeKind.Unspecified), "Nấu ăn cuối tuần" },
                    { 10, new DateTime(2026, 5, 12, 16, 0, 0, 0, DateTimeKind.Unspecified), true, "Phòng Lab C3-201", 1, new DateTime(2026, 5, 12, 14, 0, 0, 0, DateTimeKind.Unspecified), "Họp nhóm đồ án PBL3" },
                    { 11, new DateTime(2026, 5, 14, 10, 30, 0, 0, DateTimeKind.Unspecified), true, "Phòng A2", 1, new DateTime(2026, 5, 14, 9, 0, 0, 0, DateTimeKind.Unspecified), "Thảo luận báo cáo cuối kỳ" },
                    { 12, new DateTime(2026, 5, 12, 16, 0, 0, 0, DateTimeKind.Unspecified), true, "Phòng Lab C3-201", 2, new DateTime(2026, 5, 12, 14, 0, 0, 0, DateTimeKind.Unspecified), "Họp nhóm đồ án PBL3" },
                    { 13, new DateTime(2026, 5, 14, 10, 30, 0, 0, DateTimeKind.Unspecified), true, "Online - Discord", 3, new DateTime(2026, 5, 14, 9, 0, 0, 0, DateTimeKind.Unspecified), "Thảo luận báo cáo cuối kỳ" }
                });

            migrationBuilder.InsertData(
                table: "Participants",
                columns: new[] { "AppointmentId", "UserId" },
                values: new object[,]
                {
                    { 10, 1 },
                    { 11, 1 },
                    { 12, 2 },
                    { 13, 3 }
                });

            migrationBuilder.InsertData(
                table: "Reminders",
                columns: new[] { "ReminderId", "AppointmentId", "Method", "RemindAt" },
                values: new object[,]
                {
                    { 1, 1, "1 giờ trước", new DateTime(2026, 5, 8, 8, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 2, 1, "1 ngày trước", new DateTime(2026, 5, 7, 9, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 3, 3, "30 phút trước", new DateTime(2026, 5, 9, 13, 30, 0, 0, DateTimeKind.Unspecified) },
                    { 4, 3, "2 giờ trước", new DateTime(2026, 5, 9, 12, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 5, 5, "1 giờ trước", new DateTime(2026, 5, 12, 7, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 6, 6, "1 giờ trước", new DateTime(2026, 5, 8, 18, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 7, 7, "1 giờ trước", new DateTime(2026, 5, 10, 9, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 8, 7, "1 ngày trước", new DateTime(2026, 5, 9, 10, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 9, 10, "1 giờ trước", new DateTime(2026, 5, 12, 13, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 10, 10, "1 ngày trước", new DateTime(2026, 5, 11, 14, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 11, 11, "1 giờ trước", new DateTime(2026, 5, 14, 8, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 12, 11, "1 ngày trước", new DateTime(2026, 5, 13, 9, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 13, 11, "30 phút trước", new DateTime(2026, 5, 14, 8, 30, 0, 0, DateTimeKind.Unspecified) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_OwnerId",
                table: "Appointments",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_UserId",
                table: "Participants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_AppointmentId",
                table: "Reminders",
                column: "AppointmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Participants");

            migrationBuilder.DropTable(
                name: "Reminders");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
