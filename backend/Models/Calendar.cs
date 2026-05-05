namespace CalendarApi.Models;

public class Calendar
{
    public int CalendarId { get; set; }
    public List<Appointment> Appointments { get; set; } = new();

    public Appointment? FindConflictingAppointment(DateTime start, DateTime end)
    {
        return Appointments.FirstOrDefault(a => a.OverlapsWith(start, end));
    }

    public List<GroupMeeting> FindMatchingGroupMeeting(string title, DateTime startTime, DateTime endTime, List<GroupMeeting> allGroupMeetings)
    {
        return allGroupMeetings.Where(m => m.HasSameTitleAndDuration(title, startTime, endTime)).ToList();
    }

    public Appointment CreateAppointment(string title, string location, DateTime start, DateTime end, int ownerId, List<ReminderMethod>? reminderMethods = null)
    {
        var appointment = new Appointment(title.Trim(), location, start, end, ownerId);
        AddReminders(appointment, reminderMethods, start);
        return appointment;
    }

    public GroupMeeting CreateGroupMeeting(string title, string location, DateTime start, DateTime end, int ownerId, User owner, List<ReminderMethod>? reminderMethods = null)
    {
        var meeting = new GroupMeeting(title.Trim(), location, start, end, ownerId);
        AddReminders(meeting, reminderMethods, start);
        meeting.AddParticipant(owner);
        return meeting;
    }

    public void AddAppointment(Appointment appointment)
    {
        Appointments.Add(appointment);
    }

    public void ReplaceAppointment(Appointment oldAppointment, Appointment newAppointment)
    {
        var index = Appointments.FindIndex(a => a.AppointmentId == oldAppointment.AppointmentId);
        if (index >= 0) Appointments[index] = newAppointment;
    }

    public void JoinGroupMeeting(User user, GroupMeeting meeting)
    {
        meeting.AddParticipant(user);
    }

    private static void AddReminders(Appointment appointment, List<ReminderMethod>? methods, DateTime startTime)
    {
        if (methods == null || methods.Count == 0) return;
        foreach (var method in methods)
            appointment.AddReminder(new Reminder(0, startTime.AddMinutes(-15), method));
    }
}
