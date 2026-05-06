using CalendarApi.DTOs;
using CalendarApi.Models;
using CalendarApi.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CalendarApi.Controllers;

[ApiController]
[Route("api")]
public class AppointmentController : ControllerBase
{
    private readonly ICalendarRepository _repository;

    public AppointmentController(ICalendarRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("users")]
    public IActionResult ListUsers()
    {
        return Ok(_repository.GetAllUsers());
    }

    [HttpGet("appointments")]
    public IActionResult ListAppointments([FromQuery] int userId)
    {
        return Ok(_repository.GetUserAppointments(userId));
    }

    [HttpGet("appointments/{id:int}")]
    public IActionResult GetAppointmentDetails(int id)
    {
        var appointment = _repository.GetAppointmentById(id);
        if (appointment == null) return NotFound();
        return Ok(appointment);
    }

    // Calendar.findConflictingAppointment(start, end)
    [HttpPost("appointments/check-conflict")]
    public IActionResult CheckConflict([FromBody] CheckConflictRequest body)
    {
        var calendar = new Calendar { Appointments = _repository.GetUserAppointments(body.UserId) };
        var conflicts = calendar.FindConflictingAppointment(body.StartTime, body.EndTime);

        if (conflicts.Count == 0)
            return Ok(new { hasConflict = false });

        return Ok(new
        {
            hasConflict = true,
            conflicts = conflicts.Select(c => new { c.AppointmentId, c.Title, c.StartTime, c.EndTime, c.IsGroupMeeting, c.OwnerId })
        });
    }

    // Calendar.findMatchingGroupMeeting(title, duration)
    [HttpPost("appointments/check-group-meeting")]
    public IActionResult CheckGroupMeeting([FromBody] CheckGroupMeetingRequest body)
    {
        var otherMeetings = _repository.GetOtherGroupMeetings(body.UserId);
        var calendar = new Calendar { Appointments = otherMeetings.Cast<Appointment>().ToList() };
        var duration = new Duration { StartTime = body.StartTime, EndTime = body.EndTime };
        var matches = calendar.FindMatchingGroupMeeting(body.Title, duration);

        if (matches.Count == 0)
            return Ok(new { hasMatch = false });

        return Ok(new
        {
            hasMatch = true,
            meetings = matches.Select(m => new
            {
                m.AppointmentId, m.Title, m.Location, m.StartTime, m.EndTime, m.OwnerId,
                OwnerName = m.Owner?.FullName ?? "",
                ParticipantCount = m.Participants.Count
            })
        });
    }

    // Calendar.createAppointment() + for-loop addReminder() + addAppointment()
    [HttpPost("appointments/create")]
    public IActionResult CreateAppointment([FromBody] CreateAppointmentRequest body)
    {
        var user = _repository.GetUserById(body.UserId);
        if (user == null) return BadRequest("User not found");

        var calendar = new Calendar();
        Appointment appointment;

        if (body.IsGroupMeeting)
            appointment = calendar.CreateGroupMeeting(body.Title, body.Location, body.StartTime, body.EndTime, body.UserId, user);
        else
            appointment = calendar.CreateAppointment(body.Title, body.Location, body.StartTime, body.EndTime, body.UserId);

        foreach (var r in body.Reminders)
            appointment.AddReminder(new Reminder(0, r.RemindAt, r.Method));

        _repository.AddAppointment(appointment);
        _repository.SaveChanges();
        return Ok(new { success = true, message = "Appointment Added" });
    }

    // Calendar.replaceAppointment()
    [HttpPost("appointments/replace")]
    public IActionResult ReplaceAppointment([FromBody] ReplaceAppointmentRequest body)
    {
        var user = _repository.GetUserById(body.UserId);
        if (user == null) return BadRequest("User not found");

        foreach (var conflictId in body.ConflictIds)
        {
            var existing = _repository.GetAppointmentById(conflictId);
            if (existing == null) continue;

            if (existing.IsGroupMeeting && existing.OwnerId != body.UserId)
                _repository.RemoveParticipant(conflictId, body.UserId);
            else
                _repository.DeleteAppointment(conflictId);
        }

        var calendar = new Calendar();
        Appointment appointment;

        if (body.IsGroupMeeting)
            appointment = calendar.CreateGroupMeeting(body.Title, body.Location, body.StartTime, body.EndTime, body.UserId, user);
        else
            appointment = calendar.CreateAppointment(body.Title, body.Location, body.StartTime, body.EndTime, body.UserId);

        foreach (var r in body.Reminders)
            appointment.AddReminder(new Reminder(0, r.RemindAt, r.Method));

        _repository.AddAppointment(appointment);
        _repository.SaveChanges();
        return Ok(new { success = true, message = "Appointment Replaced" });
    }

    // Calendar.joinGroupMeeting()
    [HttpPost("appointments/join")]
    public IActionResult JoinGroupMeeting([FromBody] JoinMeetingRequest body)
    {
        _repository.AddParticipant(body.MeetingId, body.UserId);
        _repository.SaveChanges();
        return Ok(new { success = true, message = "Joined Group Meeting" });
    }
}
