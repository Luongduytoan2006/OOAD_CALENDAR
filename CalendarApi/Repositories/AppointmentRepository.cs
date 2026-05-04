using CalendarApi.Data;
using CalendarApi.Models;
using Microsoft.Data.Sqlite;

namespace CalendarApi.Repositories;

/// <summary>
/// Handles all database operations for Appointment entities.
/// Migrated from TypeScript AppointmentRepository.ts
/// </summary>
public class AppointmentRepository
{
    private readonly DbConnection _db;

    public AppointmentRepository(DbConnection db)
    {
        _db = db;
    }

    public List<Appointment> GetByUserId(int userId)
    {
        var conn = _db.GetConnection();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT a.*, r.reminder_id, r.reminder_time, r.reminder_type
            FROM appointments a
            LEFT JOIN reminders r ON a.appointment_id = r.appointment_id
            WHERE a.owner_id = $userId
               OR a.appointment_id IN (
                 SELECT appointment_id
                 FROM participants
                 WHERE user_id = $userId2
               )
            ORDER BY a.start_time ASC";

        cmd.Parameters.AddWithValue("$userId", userId);
        cmd.Parameters.AddWithValue("$userId2", userId);

        var rows = ReadRows(cmd);
        return MapRowsToAppointments(rows);
    }

    public Appointment? GetById(int appointmentId)
    {
        var conn = _db.GetConnection();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT a.*, r.reminder_id, r.reminder_time, r.reminder_type
            FROM appointments a
            LEFT JOIN reminders r ON a.appointment_id = r.appointment_id
            WHERE a.appointment_id = $id";

        cmd.Parameters.AddWithValue("$id", appointmentId);

        var rows = ReadRows(cmd);
        if (rows.Count == 0) return null;
        return MapRowsToAppointments(rows)[0];
    }

    public int Save(Appointment appointment)
    {
        var conn = _db.GetConnection();
        using var transaction = conn.BeginTransaction();

        try
        {
            using var cmd = conn.CreateCommand();
            cmd.Transaction = transaction;
            cmd.CommandText = @"
                INSERT INTO appointments (title, location, start_time, end_time, owner_id, is_group_meeting)
                VALUES ($title, $location, $startTime, $endTime, $ownerId, $isGroupMeeting)";

            cmd.Parameters.AddWithValue("$title", appointment.Title);
            cmd.Parameters.AddWithValue("$location", appointment.Location ?? "");
            cmd.Parameters.AddWithValue("$startTime", appointment.StartTime.ToUniversalTime().ToString("o"));
            cmd.Parameters.AddWithValue("$endTime", appointment.EndTime.ToUniversalTime().ToString("o"));
            cmd.Parameters.AddWithValue("$ownerId", appointment.OwnerId);
            cmd.Parameters.AddWithValue("$isGroupMeeting", appointment.IsGroupMeeting ? 1 : 0);
            cmd.ExecuteNonQuery();

            // Get the last inserted ID
            using var idCmd = conn.CreateCommand();
            idCmd.Transaction = transaction;
            idCmd.CommandText = "SELECT last_insert_rowid()";
            var id = Convert.ToInt32(idCmd.ExecuteScalar());

            // Insert reminders
            foreach (var reminder in appointment.Reminders)
            {
                using var reminderCmd = conn.CreateCommand();
                reminderCmd.Transaction = transaction;
                reminderCmd.CommandText = @"
                    INSERT INTO reminders (appointment_id, reminder_time, reminder_type)
                    VALUES ($appointmentId, $reminderTime, $reminderType)";
                reminderCmd.Parameters.AddWithValue("$appointmentId", id);
                reminderCmd.Parameters.AddWithValue("$reminderTime", reminder.RemindAt.ToUniversalTime().ToString("o"));
                reminderCmd.Parameters.AddWithValue("$reminderType", reminder.Method.ToString());
                reminderCmd.ExecuteNonQuery();
            }

            transaction.Commit();
            return id;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public void Delete(int id)
    {
        var conn = _db.GetConnection();
        using var transaction = conn.BeginTransaction();

        try
        {
            var tables = new[] { "reminders", "pending_requests", "participants", "group_meetings", "appointments" };
            var columns = new[] { "appointment_id", "appointment_id", "appointment_id", "appointment_id", "appointment_id" };

            for (int i = 0; i < tables.Length; i++)
            {
                using var cmd = conn.CreateCommand();
                cmd.Transaction = transaction;
                cmd.CommandText = $"DELETE FROM {tables[i]} WHERE {columns[i]} = $id";
                cmd.Parameters.AddWithValue("$id", id);
                cmd.ExecuteNonQuery();
            }

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public Appointment? FindConflicts(int userId, DateTime start, DateTime end)
    {
        var conn = _db.GetConnection();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT a.*
            FROM appointments a
            WHERE (
              a.owner_id = $userId
              OR a.appointment_id IN (
                SELECT appointment_id
                FROM participants
                WHERE user_id = $userId2
              )
            )
            AND a.start_time < $end
            AND a.end_time > $start
            ORDER BY a.start_time ASC
            LIMIT 1";

        cmd.Parameters.AddWithValue("$userId", userId);
        cmd.Parameters.AddWithValue("$userId2", userId);
        cmd.Parameters.AddWithValue("$end", end.ToUniversalTime().ToString("o"));
        cmd.Parameters.AddWithValue("$start", start.ToUniversalTime().ToString("o"));

        var rows = ReadRows(cmd);
        if (rows.Count == 0) return null;
        return MapRowsToAppointments(rows)[0];
    }

    // ----- Helpers -----

    private static List<Dictionary<string, object?>> ReadRows(SqliteCommand cmd)
    {
        var rows = new List<Dictionary<string, object?>>();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var row = new Dictionary<string, object?>();
            for (int i = 0; i < reader.FieldCount; i++)
            {
                row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            }
            rows.Add(row);
        }
        return rows;
    }

    private static List<Appointment> MapRowsToAppointments(List<Dictionary<string, object?>> rows)
    {
        var map = new Dictionary<int, Appointment>();

        foreach (var row in rows)
        {
            var appId = Convert.ToInt32(row["appointment_id"]);

            if (!map.ContainsKey(appId))
            {
                map[appId] = new Appointment(
                    appId,
                    row["title"]?.ToString() ?? "",
                    row["location"]?.ToString() ?? "",
                    ParseDate(row["start_time"]),
                    ParseDate(row["end_time"]),
                    Convert.ToInt32(row["owner_id"]),
                    Convert.ToInt32(row["is_group_meeting"]) == 1
                );
            }

            // Add reminder if present (LEFT JOIN — can be null)
            if (row.ContainsKey("reminder_id") && row["reminder_id"] != null)
            {
                var reminder = new Reminder(
                    Convert.ToInt32(row["reminder_id"]),
                    ParseDate(row["reminder_time"]),
                    ParseReminderMethod(row["reminder_type"]?.ToString())
                );
                map[appId].AddReminder(reminder);
            }
        }

        return map.Values.ToList();
    }

    private static DateTime ParseDate(object? value)
    {
        if (value == null) return DateTime.MinValue;
        return DateTime.Parse(value.ToString()!, null, System.Globalization.DateTimeStyles.RoundtripKind);
    }

    private static ReminderMethod ParseReminderMethod(string? value)
    {
        return value?.ToUpper() switch
        {
            "EMAIL" => ReminderMethod.EMAIL,
            "SMS" => ReminderMethod.SMS,
            _ => ReminderMethod.POPUP
        };
    }
}
