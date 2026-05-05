namespace CalendarApi.Models;

public enum ReminderMethod
{
    POPUP,
    EMAIL,
    SMS
}

/// <summary>
/// Reminder entity: represents one notification reminder attached to an appointment.
/// </summary>
public class Reminder
{
    public int ReminderId { get; set; }
    public DateTime RemindAt { get; set; }
    public ReminderMethod Method { get; set; }

    public Reminder(int reminderId, DateTime remindAt, ReminderMethod method)
    {
        ReminderId = reminderId;
        RemindAt = remindAt;
        Method = method;
    }

    public string GetReminderInfo()
    {
        return $"{Method} at {RemindAt.ToLocalTime()}";
    }
}
