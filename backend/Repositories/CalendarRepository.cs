using CalendarApi.Data;
using CalendarApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarApi.Repositories;

public class CalendarRepository : ICalendarRepository
{
    private readonly AppDbContext _context;

    public CalendarRepository(AppDbContext context)
    {
        _context = context;
    }

    public List<User> GetAllUsers()
    {
        return _context.Users.OrderBy(u => u.UserId).ToList();
    }

    public User? GetUserById(int userId)
    {
        return _context.Users.Find(userId);
    }

    public List<Appointment> GetUserAppointments(int userId)
    {
        // Appointments owned by user
        var owned = _context.Appointments
            .Include(a => a.Reminders)
            .Include(a => a.Owner)
            .Where(a => a.OwnerId == userId)
            .ToList();

        // Group meetings where user is a participant (but not owner)
        var joined = _context.GroupMeetings
            .Include(g => g.Reminders)
            .Include(g => g.Participants)
            .Include(g => g.Owner)
            .Where(g => g.OwnerId != userId && g.Participants.Any(p => p.UserId == userId))
            .ToList<Appointment>();

        return owned.Concat(joined).OrderBy(a => a.StartTime).ToList();
    }

    public Appointment? GetAppointmentById(int appointmentId)
    {
        var groupMeeting = _context.GroupMeetings
            .Include(g => g.Reminders)
            .Include(g => g.Participants)
            .FirstOrDefault(g => g.AppointmentId == appointmentId);

        if (groupMeeting != null) return groupMeeting;

        return _context.Appointments
            .Include(a => a.Reminders)
            .FirstOrDefault(a => a.AppointmentId == appointmentId);
    }

    public List<GroupMeeting> FindMatchingGroupMeetings(int currentUserId, string title, DateTime startTime, DateTime endTime)
    {
        return _context.GroupMeetings
            .Include(g => g.Participants)
            .Include(g => g.Owner)
            .Where(g =>
                g.OwnerId != currentUserId
                && g.Title.Trim().ToLower() == title.Trim().ToLower()
                && g.StartTime == startTime
                && g.EndTime == endTime
                && !g.Participants.Any(p => p.UserId == currentUserId))
            .OrderBy(g => g.StartTime)
            .ToList();
    }

    public void AddAppointment(Appointment appointment)
    {
        _context.Appointments.Add(appointment);
    }

    public void DeleteAppointment(int appointmentId)
    {
        var appointment = _context.Appointments.Find(appointmentId);
        if (appointment != null)
        {
            _context.Appointments.Remove(appointment);
        }
    }

    public void AddParticipant(int meetingId, int userId)
    {
        var meeting = _context.GroupMeetings
            .Include(g => g.Participants)
            .FirstOrDefault(g => g.AppointmentId == meetingId);

        var user = _context.Users.Find(userId);

        if (meeting != null && user != null)
        {
            meeting.AddParticipant(user);
        }
    }

    public void SaveChanges()
    {
        _context.SaveChanges();
    }
}
