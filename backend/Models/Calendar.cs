using CalendarApi.DTOs;

namespace CalendarApi.Models;

public class Calendar
{
    public int CalendarId { get; set; }
    public List<Appointment> Appointments { get; set; } = new();

    public List<Appointment> FindConflictingAppointment(DateTime start, DateTime end)
    {
        return Appointments.Where(a => a.OverlapsWith(start, end)).ToList();
    }

    public List<GroupMeeting> FindMatchingGroupMeeting(string title, Duration duration)
    {
        return Appointments.OfType<GroupMeeting>()
            .Where(m => m.HasSameTitleAndDuration(title, duration))
            .ToList();
    }

    public Appointment CreateAppointment(string title, string location, DateTime start, DateTime end, int ownerId)
    {
        return new Appointment(title.Trim(), location, start, end, ownerId);
    }

    public GroupMeeting CreateGroupMeeting(string title, string location, DateTime start, DateTime end, int ownerId, User owner)
    {
        var meeting = new GroupMeeting(title.Trim(), location, start, end, ownerId);
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
}
