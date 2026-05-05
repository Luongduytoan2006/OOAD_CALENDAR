using CalendarApi.Models;

namespace CalendarApi.DTOs;

// POST /api/appointments/check-conflict
public class CheckConflictRequest
{
    public int UserId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}

// POST /api/appointments/check-group-meeting
public class CheckGroupMeetingRequest
{
    public int UserId { get; set; }
    public string Title { get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}

// POST /api/appointments/create
public class CreateAppointmentRequest
{
    public int UserId { get; set; }
    public string Title { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<ReminderMethod> ReminderMethods { get; set; } = new();
    public bool IsGroupMeeting { get; set; } = false;
}

// POST /api/appointments/replace
public class ReplaceAppointmentRequest
{
    public int UserId { get; set; }
    public int ConflictId { get; set; }
    public string Title { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<ReminderMethod> ReminderMethods { get; set; } = new();
    public bool IsGroupMeeting { get; set; } = false;
}

// POST /api/appointments/join
public class JoinMeetingRequest
{
    public int UserId { get; set; }
    public int MeetingId { get; set; }
}
