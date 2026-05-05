namespace CalendarApi.Models;

/// <summary>
/// Appointment entity for personal events.
/// </summary>
public class Appointment
{
    public int AppointmentId { get; set; }
    public string Title { get; set; }
    public string Location { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int OwnerId { get; set; }
    public bool IsGroupMeeting { get; set; }
    public List<Reminder> Reminders { get; set; }

    public Appointment(
        int appointmentId,
        string title,
        string location,
        DateTime startTime,
        DateTime endTime,
        int ownerId,
        bool isGroupMeeting = false,
        List<Reminder>? reminders = null)
    {
        AppointmentId = appointmentId;
        Title = title;
        Location = location;
        StartTime = startTime;
        EndTime = endTime;
        OwnerId = ownerId;
        IsGroupMeeting = isGroupMeeting;
        Reminders = reminders ?? new List<Reminder>();
    }

    public TimeSpan GetDuration()
    {
        return EndTime - StartTime;
    }

    public bool OverlapsWith(Appointment other)
    {
        return StartTime < other.EndTime && EndTime > other.StartTime;
    }

    public void AddReminder(Reminder reminder)
    {
        Reminders.Add(reminder);
    }
}
