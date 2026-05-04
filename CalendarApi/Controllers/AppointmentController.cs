using CalendarApi.DTOs;
using CalendarApi.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace CalendarApi.Controllers;

/// <summary>
/// Main API controller — equivalent to AppointmentController.ts in TypeScript backend.
/// Exposes the same 6 API endpoints for compatibility with the React frontend.
/// </summary>
[ApiController]
[Route("api")]
public class AppointmentController : ControllerBase
{
    private readonly AppointmentService _appointmentService;
    private readonly GroupMeetingService _groupMeetingService;
    private readonly UserService _userService;

    public AppointmentController(
        AppointmentService appointmentService,
        GroupMeetingService groupMeetingService,
        UserService userService)
    {
        _appointmentService = appointmentService;
        _groupMeetingService = groupMeetingService;
        _userService = userService;
    }

    // GET /api/users
    [HttpGet("users")]
    public IActionResult ListUsers()
    {
        try
        {
            var users = _userService.GetAllUsers();
            return Ok(users);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"SERVER ERROR: {ex}");
            return StatusCode(500, new { status = "ERROR", message = ex.Message });
        }
    }

    // GET /api/appointments?userId=X
    [HttpGet("appointments")]
    public IActionResult ListAppointments([FromQuery] int userId)
    {
        try
        {
            var appointments = _appointmentService.GetUserAppointments(userId);
            return Ok(appointments);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"SERVER ERROR: {ex}");
            return StatusCode(500, new { status = "ERROR", message = ex.Message });
        }
    }

    // GET /api/appointments/{id}
    [HttpGet("appointments/{id:int}")]
    public IActionResult GetAppointmentDetails(int id)
    {
        try
        {
            var details = _appointmentService.GetDetails(id);
            if (details == null) return NotFound("Not found");

            if (details.IsGroupMeeting)
            {
                var groupDetails = _groupMeetingService.GetMeetingDetails(id);
                return Ok(groupDetails ?? (object)details);
            }

            return Ok(details);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"SERVER ERROR: {ex}");
            return StatusCode(500, new { status = "ERROR", message = ex.Message });
        }
    }

    // POST /api/appointments
    [HttpPost("appointments")]
    public IActionResult CreateAppointment([FromBody] CreateAppointmentBody body)
    {
        try
        {
            var userId = body.UserId;
            var request = body.Request;
            var decision = body.Decision;

            // 1. Validation cơ bản (Tên không trống, thời lượng không âm)
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return Ok(new { status = "INVALID", message = "Tên cuộc hẹn không được để trống." });
            }

            if (request.EndTime <= request.StartTime)
            {
                return Ok(new { status = "INVALID", message = "Thời gian kết thúc phải lớn hơn thời gian bắt đầu." });
            }

            var conflict = _appointmentService.CheckPersonalConflict(userId, request.StartTime, request.EndTime);

            // 2. Xử lý các quyết định (Decisions) từ người dùng

            // Trường hợp A: Người dùng quyết định tham gia Group Meeting
            if (decision?.JoinMeetingId != null)
            {
                // Nếu đang có lịch trùng mà người dùng chưa xác nhận thay thế -> Hỏi tiếp
                if (conflict != null && decision.ReplaceConflict != true)
                {
                    return Ok(new
                    {
                        status = "CONFLICT",
                        message = "Bạn đã có appointment trong khung giờ này. Hãy chọn thời gian khác hoặc thay thế appointment cũ.",
                        conflictingAppointment = conflict
                    });
                }

                // Nếu người dùng đồng ý thay thế lịch bị trùng -> Xóa lịch cũ
                if (conflict != null && decision.ReplaceConflict == true)
                {
                    Console.WriteLine($"[API] Deleting conflict (ID: {conflict.AppointmentId}) before joining group.");
                    _appointmentService.DeleteAppointment(conflict.AppointmentId);
                }

                // Tiến hành gia nhập nhóm
                Console.WriteLine($"[API] User {userId} joining meeting {decision.JoinMeetingId.Value}");
                _groupMeetingService.JoinMeeting(userId, decision.JoinMeetingId.Value);

                return Ok(new { status = "SUCCESS", message = "Đã tham gia group meeting thành công." });
            }

            // Trường hợp B: Người dùng không tham gia nhóm, nhưng quyết định ghi đè lịch bị trùng
            if (conflict != null && decision?.ReplaceConflict == true)
            {
                _appointmentService.ReplaceAppointment(conflict.AppointmentId, userId, request);
                return Ok(new { status = "SUCCESS", message = "Appointment cũ đã được thay thế." });
            }

            // 3. Đưa ra các câu hỏi (Prompts) nếu đây là luồng tạo mới từ đầu

            // Hỏi: Có muốn tham gia Group Meeting không?
            if (decision?.CreateAnyway != true)
            {
                var matches = _groupMeetingService.FindSuggestions(userId, request.Title, request.StartTime, request.EndTime);
                if (matches.Count > 0)
                {
                    return Ok(new
                    {
                        status = "GROUP_MEETING_SUGGESTION",
                        message = "Có group meeting cùng tên và cùng thời lượng. Bạn có muốn tham gia group meeting này thay vì tạo appointment riêng không?",
                        matchingGroupMeetings = matches
                    });
                }
            }

            // Hỏi: Bị trùng lịch, có muốn ghi đè không?
            if (conflict != null)
            {
                return Ok(new
                {
                    status = "CONFLICT",
                    message = "Bạn đã có appointment trong khung giờ này. Hãy chọn thời gian khác hoặc thay thế appointment cũ.",
                    conflictingAppointment = conflict
                });
            }

            // 4. Tạo lịch mới hoàn toàn
            if (request.IsGroupMeeting)
                _appointmentService.CreateGroup(userId, request);
            else
                _appointmentService.CreatePersonal(userId, request);

            return Ok(new { status = "SUCCESS", message = "Thêm appointment thành công." });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"SERVER ERROR: {ex}");
            return StatusCode(500, new { status = "ERROR", message = ex.Message });
        }
    }

    // POST /api/approve
    [HttpPost("approve")]
    public IActionResult ApproveJoinRequest([FromBody] JoinRequestBody body)
    {
        try
        {
            _groupMeetingService.ApproveUser(body.OwnerId, body.MeetingId, body.UserId);
            return Ok();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"SERVER ERROR: {ex}");
            return StatusCode(500, new { status = "ERROR", message = ex.Message });
        }
    }

    // POST /api/reject
    [HttpPost("reject")]
    public IActionResult RejectJoinRequest([FromBody] JoinRequestBody body)
    {
        try
        {
            _groupMeetingService.RejectUser(body.OwnerId, body.MeetingId, body.UserId);
            return Ok();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"SERVER ERROR: {ex}");
            return StatusCode(500, new { status = "ERROR", message = ex.Message });
        }
    }
}
