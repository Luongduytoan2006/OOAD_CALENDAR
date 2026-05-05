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
                    { 1, new DateTime(2026, 5, 6, 10, 30, 0, 0, DateTimeKind.Unspecified), false, "Phòng A1", 1, new DateTime(2026, 5, 6, 9, 0, 0, 0, DateTimeKind.Unspecified), "Họp Sprint Planning" },
                    { 2, new DateTime(2026, 5, 6, 13, 0, 0, 0, DateTimeKind.Unspecified), false, "Nhà hàng Hải Sản", 1, new DateTime(2026, 5, 6, 11, 30, 0, 0, DateTimeKind.Unspecified), "Ăn trưa với khách" },
                    { 3, new DateTime(2026, 5, 7, 15, 0, 0, 0, DateTimeKind.Unspecified), false, "Online", 1, new DateTime(2026, 5, 7, 14, 0, 0, 0, DateTimeKind.Unspecified), "Review code" },
                    { 4, new DateTime(2026, 5, 7, 18, 30, 0, 0, DateTimeKind.Unspecified), false, "Phòng gym tầng 2", 1, new DateTime(2026, 5, 7, 17, 0, 0, 0, DateTimeKind.Unspecified), "Tập gym" },
                    { 5, new DateTime(2026, 5, 8, 9, 30, 0, 0, DateTimeKind.Unspecified), false, "Thư viện", 1, new DateTime(2026, 5, 8, 8, 0, 0, 0, DateTimeKind.Unspecified), "Đọc tài liệu OOAD" },
                    { 6, new DateTime(2026, 5, 6, 20, 30, 0, 0, DateTimeKind.Unspecified), false, "Online", 2, new DateTime(2026, 5, 6, 19, 0, 0, 0, DateTimeKind.Unspecified), "Học tiếng Anh" },
                    { 7, new DateTime(2026, 5, 8, 11, 0, 0, 0, DateTimeKind.Unspecified), false, "Quán cà phê", 2, new DateTime(2026, 5, 8, 10, 0, 0, 0, DateTimeKind.Unspecified), "Gặp mentor" },
                    { 8, new DateTime(2026, 5, 7, 7, 0, 0, 0, DateTimeKind.Unspecified), false, "Công viên", 3, new DateTime(2026, 5, 7, 6, 0, 0, 0, DateTimeKind.Unspecified), "Chạy bộ buổi sáng" },
                    { 9, new DateTime(2026, 5, 9, 18, 30, 0, 0, DateTimeKind.Unspecified), false, "Nhà", 3, new DateTime(2026, 5, 9, 17, 0, 0, 0, DateTimeKind.Unspecified), "Nấu ăn" },
                    { 10, new DateTime(2026, 5, 9, 10, 30, 0, 0, DateTimeKind.Unspecified), true, "Phòng Lab", 1, new DateTime(2026, 5, 9, 9, 0, 0, 0, DateTimeKind.Unspecified), "Họp nhóm đồ án" },
                    { 11, new DateTime(2026, 5, 10, 15, 30, 0, 0, DateTimeKind.Unspecified), true, "Phòng A2", 1, new DateTime(2026, 5, 10, 14, 0, 0, 0, DateTimeKind.Unspecified), "Thảo luận báo cáo" },
                    { 12, new DateTime(2026, 5, 9, 10, 30, 0, 0, DateTimeKind.Unspecified), true, "Phòng Lab", 2, new DateTime(2026, 5, 9, 9, 0, 0, 0, DateTimeKind.Unspecified), "Họp nhóm đồ án" },
                    { 13, new DateTime(2026, 5, 10, 15, 30, 0, 0, DateTimeKind.Unspecified), true, "Online", 3, new DateTime(2026, 5, 10, 14, 0, 0, 0, DateTimeKind.Unspecified), "Thảo luận báo cáo" }
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
                    { 1, 1, "POPUP", new DateTime(2026, 5, 6, 8, 45, 0, 0, DateTimeKind.Unspecified) },
                    { 2, 3, "EMAIL", new DateTime(2026, 5, 7, 13, 45, 0, 0, DateTimeKind.Unspecified) },
                    { 3, 10, "POPUP", new DateTime(2026, 5, 9, 8, 45, 0, 0, DateTimeKind.Unspecified) }
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
