using CalendarApi.Models;

namespace CalendarApi.DTOs;

/// <summary>
/// Request body to create a new appointment (sent from frontend).
/// </summary>
public class AddAppointmentRequest
{
    public string Title { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public List<ReminderMethod> ReminderMethods { get; set; } = new();
    public bool IsGroupMeeting { get; set; } = false;
}

/// <summary>
/// Decision made by the user when there's a conflict or group meeting suggestion.
/// </summary>
public class AddAppointmentDecision
{
    public bool? ReplaceConflict { get; set; }
    public bool? JoinGroupMeeting { get; set; }
    public int? JoinMeetingId { get; set; }
    public bool? CreateAnyway { get; set; }
}

/// <summary>
/// The wrapper body sent from the frontend for creating an appointment.
/// </summary>
public class CreateAppointmentBody
{
    public int UserId { get; set; }
    public AddAppointmentRequest Request { get; set; } = new();
    public AddAppointmentDecision? Decision { get; set; }
}

public enum AddAppointmentStatus
{
    INVALID,
    CONFLICT,
    GROUP_MEETING_SUGGESTION,
    SUCCESS,
    REPLACED,
    JOINED_GROUP_MEETING
}

/// <summary>
/// Response returned to the frontend after an appointment creation attempt.
/// </summary>
public class AddAppointmentResult
{
    public string Status { get; set; } = "";
    public string Message { get; set; } = "";
    public object? Appointment { get; set; }
    public object? ConflictingAppointment { get; set; }
    public object? MatchingGroupMeeting { get; set; }
    public List<object>? MatchingGroupMeetings { get; set; }
}

/// <summary>
/// Request body for approve/reject join requests.
/// </summary>
public class JoinRequestBody
{
    public int OwnerId { get; set; }
    public int MeetingId { get; set; }
    public int UserId { get; set; }
}
