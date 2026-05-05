using CalendarApi.Models;
using CalendarApi.Repositories;

namespace CalendarApi.Services;

/// <summary>
/// Business logic for GroupMeeting operations.
/// Migrated from TypeScript GroupMeetingService.ts
/// </summary>
public class GroupMeetingService
{
    private readonly GroupMeetingRepository _groupMeetingRepo;

    public GroupMeetingService(GroupMeetingRepository groupMeetingRepo)
    {
        _groupMeetingRepo = groupMeetingRepo;
    }

    public List<GroupMeeting> FindSuggestions(int currentUserId, string title, DateTime startTime, DateTime endTime)
    {
        return _groupMeetingRepo.FindAllMatching(currentUserId, title, startTime, endTime);
    }

    public GroupMeeting? GetMeetingDetails(int meetingId)
    {
        return _groupMeetingRepo.GetById(meetingId);
    }

    public void JoinMeeting(int userId, int meetingId)
    {
        _groupMeetingRepo.AddParticipant(userId, meetingId);
    }

    public void RequestJoin(int userId, int meetingId)
    {
        _groupMeetingRepo.AddRequestToJoin(userId, meetingId);
    }

    public void ApproveUser(int ownerId, int meetingId, int userId)
    {
        var meeting = _groupMeetingRepo.GetById(meetingId);
        if (meeting != null && meeting.OwnerId == ownerId)
        {
            _groupMeetingRepo.ApproveParticipant(userId, meetingId);
        }
    }

    public void RejectUser(int ownerId, int meetingId, int userId)
    {
        var meeting = _groupMeetingRepo.GetById(meetingId);
        if (meeting != null && meeting.OwnerId == ownerId)
        {
            _groupMeetingRepo.RejectParticipant(userId, meetingId);
        }
    }
}
