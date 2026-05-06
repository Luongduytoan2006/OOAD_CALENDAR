using CalendarApi.Models;

namespace CalendarApi.Repositories;

public interface ICalendarRepository
{
    List<User> GetAllUsers();
    User? GetUserById(int userId);
    List<Appointment> GetUserAppointments(int userId);
    Appointment? GetAppointmentById(int appointmentId);
    List<GroupMeeting> GetOtherGroupMeetings(int currentUserId);
    void AddAppointment(Appointment appointment);
    void DeleteAppointment(int appointmentId);
    void AddParticipant(int meetingId, int userId);
    void RemoveParticipant(int meetingId, int userId);
    void SaveChanges();
}
