namespace CalendarApi.Models;

public class Reminder
{
    public int ReminderId { get; set; }
    public DateTime RemindAt { get; set; }
    public string Method { get; set; } = "";

    // FK
    public int AppointmentId { get; set; }

    public Reminder() { }

    public Reminder(int reminderId, DateTime remindAt, string method)
    {
        ReminderId = reminderId;
        RemindAt = remindAt;
        Method = method;
    }

    public string GetReminderInfo()
    {
        return $"{Method} at {RemindAt:g}";
    }
}
