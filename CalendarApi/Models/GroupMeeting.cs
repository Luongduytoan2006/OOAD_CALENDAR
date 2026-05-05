namespace CalendarApi.Models;

/// <summary>
/// GroupMeeting is a specialized appointment with participants and approval logic.
/// </summary>
public class GroupMeeting : Appointment
{
    public List<User> Participants { get; set; }
    public List<User> PendingRequests { get; set; }

    public GroupMeeting(
        int appointmentId,
        string title,
        string location,
        DateTime startTime,
        DateTime endTime,
        int ownerId,
        List<User>? participants = null)
        : base(appointmentId, title, location, startTime, endTime, ownerId, isGroupMeeting: true)
    {
        Participants = participants ?? new List<User>();
        PendingRequests = new List<User>();
    }

    public bool HasSameTitleAndDuration(string title, TimeSpan duration, DateTime start)
    {
        return string.Equals(Title.Trim(), title.Trim(), StringComparison.OrdinalIgnoreCase)
            && GetDuration() == duration
            && StartTime == start;
    }

    public void AddParticipant(User user)
    {
        bool joined = Participants.Any(p => p.UserId == user.UserId);
        if (!joined)
        {
            Participants.Add(user);
        }
    }

    public void RequestToJoin(User user)
    {
        bool isParticipant = Participants.Any(p => p.UserId == user.UserId);
        bool isPending = PendingRequests.Any(p => p.UserId == user.UserId);
        if (!isParticipant && !isPending)
        {
            PendingRequests.Add(user);
        }
    }

    public void ApproveParticipant(User user)
    {
        var index = PendingRequests.FindIndex(p => p.UserId == user.UserId);
        if (index != -1)
        {
            PendingRequests.RemoveAt(index);
            AddParticipant(user);
        }
    }

    public void RejectParticipant(User user)
    {
        var index = PendingRequests.FindIndex(p => p.UserId == user.UserId);
        if (index != -1)
        {
            PendingRequests.RemoveAt(index);
        }
    }
}
