using CalendarApi.DTOs;
using CalendarApi.Models;
using CalendarApi.Repositories;

namespace CalendarApi.Services;

/// <summary>
/// Business logic for Appointment operations.
/// Migrated from TypeScript AppointmentService.ts
/// </summary>
public class AppointmentService
{
    private readonly AppointmentRepository _appointmentRepo;
    private readonly GroupMeetingRepository _groupMeetingRepo;

    public AppointmentService(AppointmentRepository appointmentRepo, GroupMeetingRepository groupMeetingRepo)
    {
        _appointmentRepo = appointmentRepo;
        _groupMeetingRepo = groupMeetingRepo;
    }

    public List<Appointment> GetUserAppointments(int userId)
    {
        return _appointmentRepo.GetByUserId(userId);
    }

    public Appointment? GetDetails(int appointmentId)
    {
        return _appointmentRepo.GetById(appointmentId);
    }

    public Appointment? CheckPersonalConflict(int userId, DateTime start, DateTime end)
    {
        return _appointmentRepo.FindConflicts(userId, start, end);
    }

    public int CreatePersonal(int userId, AddAppointmentRequest request)
    {
        var newApp = new Appointment(
            0,
            request.Title.Trim(),
            request.Location,
            request.StartTime,
            request.EndTime,
            userId,
            isGroupMeeting: false
        );

        AddSelectedReminders(newApp, request.ReminderMethods);
        return _appointmentRepo.Save(newApp);
    }

    public int CreateGroup(int userId, AddAppointmentRequest request)
    {
        var newApp = new Appointment(
            0,
            request.Title.Trim(),
            request.Location,
            request.StartTime,
            request.EndTime,
            userId,
            isGroupMeeting: true
        );

        AddSelectedReminders(newApp, request.ReminderMethods);

        var appId = _appointmentRepo.Save(newApp);
        _groupMeetingRepo.SaveGroupMetadata(appId);
        _groupMeetingRepo.AddParticipant(userId, appId);

        return appId;
    }

    public int ReplaceAppointment(int oldId, int userId, AddAppointmentRequest request)
    {
        _appointmentRepo.Delete(oldId);

        if (request.IsGroupMeeting)
            return CreateGroup(userId, request);

        return CreatePersonal(userId, request);
    }

    public void DeleteAppointment(int appointmentId)
    {
        _appointmentRepo.Delete(appointmentId);
    }

    private static void AddSelectedReminders(Appointment appointment, List<ReminderMethod>? methods)
    {
        if (methods == null || methods.Count == 0) return;

        foreach (var method in methods)
        {
            var remindAt = appointment.StartTime.AddMinutes(-15);
            appointment.AddReminder(new Reminder(0, remindAt, method));
        }
    }
}
