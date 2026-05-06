using CalendarApi.DTOs;

namespace CalendarApi.Models;

public class GroupMeeting : Appointment
{
    public List<User> Participants { get; set; } = new();

    public GroupMeeting() { }

    public GroupMeeting(string title, string location, DateTime startTime, DateTime endTime, int ownerId)
        : base(title, location, startTime, endTime, ownerId, isGroupMeeting: true)
    {
    }

    public bool HasSameTitleAndDuration(string title, Duration duration)
    {
        return string.Equals(Title.Trim(), title.Trim(), StringComparison.OrdinalIgnoreCase)
            && StartTime == duration.StartTime
            && EndTime == duration.EndTime;
    }

    public void AddParticipant(User user)
    {
        if (!Participants.Any(p => p.UserId == user.UserId))
        {
            Participants.Add(user);
        }
    }
}
