namespace CalendarApi.DTOs;

public class Duration
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}

public class ReminderData
{
    public DateTime RemindAt { get; set; }
    public string Method { get; set; } = "";
}

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
    public List<ReminderData> Reminders { get; set; } = new();
    public bool IsGroupMeeting { get; set; } = false;
}

// POST /api/appointments/replace
public class ReplaceAppointmentRequest
{
    public int UserId { get; set; }
    public List<int> ConflictIds { get; set; } = new();
    public string Title { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<ReminderData> Reminders { get; set; } = new();
    public bool IsGroupMeeting { get; set; } = false;
}

// POST /api/appointments/join
public class JoinMeetingRequest
{
    public int UserId { get; set; }
    public int MeetingId { get; set; }
}
