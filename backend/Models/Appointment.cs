namespace CalendarApi.Models;

public class Appointment
{
    public int AppointmentId { get; set; }
    public string Title { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int OwnerId { get; set; }
    public bool IsGroupMeeting { get; set; }

    // Navigation
    public User Owner { get; set; } = null!;
    public List<Reminder> Reminders { get; set; } = new();

    public Appointment() { }

    public Appointment(string title, string location, DateTime startTime, DateTime endTime, int ownerId, bool isGroupMeeting = false)
    {
        Title = title;
        Location = location;
        StartTime = startTime;
        EndTime = endTime;
        OwnerId = ownerId;
        IsGroupMeeting = isGroupMeeting;
    }

    public TimeSpan GetDuration()
    {
        return EndTime - StartTime;
    }

    public bool OverlapsWith(DateTime otherStart, DateTime otherEnd)
    {
        return StartTime < otherEnd && EndTime > otherStart;
    }

    public void AddReminder(Reminder reminder)
    {
        reminder.AppointmentId = AppointmentId;
        Reminders.Add(reminder);
    }
}
