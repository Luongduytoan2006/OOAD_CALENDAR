using CalendarApi.Data;
using CalendarApi.Models;
using Microsoft.Data.Sqlite;

namespace CalendarApi.Repositories;

/// <summary>
/// Handles all database operations for GroupMeeting entities.
/// Migrated from TypeScript GroupMeetingRepository.ts
/// </summary>
public class GroupMeetingRepository
{
    private readonly DbConnection _db;

    public GroupMeetingRepository(DbConnection db)
    {
        _db = db;
    }

    public List<GroupMeeting> FindAllMatching(int currentUserId, string title, DateTime startTime, DateTime endTime)
    {
        var conn = _db.GetConnection();
        var meetings = new List<GroupMeeting>();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT a.*
            FROM appointments a
            WHERE a.is_group_meeting = 1
              AND LOWER(TRIM(a.title)) = LOWER(TRIM($title))
              AND a.start_time = $startTime
              AND a.end_time = $endTime
              AND a.owner_id <> $currentUserId
              AND a.appointment_id NOT IN (
                SELECT appointment_id
                FROM participants
                WHERE user_id = $currentUserId2
              )
            ORDER BY a.start_time ASC";

        cmd.Parameters.AddWithValue("$title", title);
        cmd.Parameters.AddWithValue("$startTime", startTime.ToUniversalTime().ToString("o"));
        cmd.Parameters.AddWithValue("$endTime", endTime.ToUniversalTime().ToString("o"));
        cmd.Parameters.AddWithValue("$currentUserId", currentUserId);
        cmd.Parameters.AddWithValue("$currentUserId2", currentUserId);

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            meetings.Add(new GroupMeeting(
                reader.GetInt32(reader.GetOrdinal("appointment_id")),
                reader.GetString(reader.GetOrdinal("title")),
                reader.IsDBNull(reader.GetOrdinal("location")) ? "" : reader.GetString(reader.GetOrdinal("location")),
                ParseDate(reader["start_time"]),
                ParseDate(reader["end_time"]),
                reader.GetInt32(reader.GetOrdinal("owner_id"))
            ));
        }

        return meetings;
    }

    public GroupMeeting? GetById(int meetingId)
    {
        var conn = _db.GetConnection();

        // Get the base meeting
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT *
            FROM appointments
            WHERE appointment_id = $meetingId
              AND is_group_meeting = 1";
        cmd.Parameters.AddWithValue("$meetingId", meetingId);

        GroupMeeting? meeting = null;
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            meeting = new GroupMeeting(
                reader.GetInt32(reader.GetOrdinal("appointment_id")),
                reader.GetString(reader.GetOrdinal("title")),
                reader.IsDBNull(reader.GetOrdinal("location")) ? "" : reader.GetString(reader.GetOrdinal("location")),
                ParseDate(reader["start_time"]),
                ParseDate(reader["end_time"]),
                reader.GetInt32(reader.GetOrdinal("owner_id"))
            );
        }

        if (meeting == null) return null;

        // Load participants
        using var participantsCmd = conn.CreateCommand();
        participantsCmd.CommandText = @"
            SELECT u.*
            FROM participants p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.appointment_id = $meetingId";
        participantsCmd.Parameters.AddWithValue("$meetingId", meetingId);

        using var participantsReader = participantsCmd.ExecuteReader();
        while (participantsReader.Read())
        {
            meeting.Participants.Add(new User(
                participantsReader.GetInt32(participantsReader.GetOrdinal("user_id")),
                participantsReader.GetString(participantsReader.GetOrdinal("full_name"))
            ));
        }

        // Load pending requests
        using var pendingCmd = conn.CreateCommand();
        pendingCmd.CommandText = @"
            SELECT u.*
            FROM pending_requests p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.appointment_id = $meetingId";
        pendingCmd.Parameters.AddWithValue("$meetingId", meetingId);

        using var pendingReader = pendingCmd.ExecuteReader();
        while (pendingReader.Read())
        {
            meeting.PendingRequests.Add(new User(
                pendingReader.GetInt32(pendingReader.GetOrdinal("user_id")),
                pendingReader.GetString(pendingReader.GetOrdinal("full_name"))
            ));
        }

        return meeting;
    }

    public void SaveGroupMetadata(int meetingId)
    {
        var conn = _db.GetConnection();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT OR IGNORE INTO group_meetings (appointment_id) VALUES ($meetingId)";
        cmd.Parameters.AddWithValue("$meetingId", meetingId);
        cmd.ExecuteNonQuery();
    }

    public void AddParticipant(int userId, int meetingId)
    {
        var conn = _db.GetConnection();
        Console.WriteLine($"[DB] Adding user {userId} to meeting {meetingId} in participants table");

        using var insertCmd = conn.CreateCommand();
        insertCmd.CommandText = "INSERT OR IGNORE INTO participants (appointment_id, user_id) VALUES ($meetingId, $userId)";
        insertCmd.Parameters.AddWithValue("$meetingId", meetingId);
        insertCmd.Parameters.AddWithValue("$userId", userId);
        insertCmd.ExecuteNonQuery();

        using var deleteCmd = conn.CreateCommand();
        deleteCmd.CommandText = "DELETE FROM pending_requests WHERE appointment_id = $meetingId AND user_id = $userId";
        deleteCmd.Parameters.AddWithValue("$meetingId", meetingId);
        deleteCmd.Parameters.AddWithValue("$userId", userId);
        deleteCmd.ExecuteNonQuery();
    }

    public void AddRequestToJoin(int userId, int meetingId)
    {
        var conn = _db.GetConnection();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "INSERT OR IGNORE INTO pending_requests (appointment_id, user_id) VALUES ($meetingId, $userId)";
        cmd.Parameters.AddWithValue("$meetingId", meetingId);
        cmd.Parameters.AddWithValue("$userId", userId);
        cmd.ExecuteNonQuery();
    }

    public void ApproveParticipant(int userId, int meetingId)
    {
        var conn = _db.GetConnection();
        using var transaction = conn.BeginTransaction();

        try
        {
            using var deleteCmd = conn.CreateCommand();
            deleteCmd.Transaction = transaction;
            deleteCmd.CommandText = "DELETE FROM pending_requests WHERE appointment_id = $meetingId AND user_id = $userId";
            deleteCmd.Parameters.AddWithValue("$meetingId", meetingId);
            deleteCmd.Parameters.AddWithValue("$userId", userId);
            deleteCmd.ExecuteNonQuery();

            using var insertCmd = conn.CreateCommand();
            insertCmd.Transaction = transaction;
            insertCmd.CommandText = "INSERT OR IGNORE INTO participants (appointment_id, user_id) VALUES ($meetingId, $userId)";
            insertCmd.Parameters.AddWithValue("$meetingId", meetingId);
            insertCmd.Parameters.AddWithValue("$userId", userId);
            insertCmd.ExecuteNonQuery();

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public void RejectParticipant(int userId, int meetingId)
    {
        var conn = _db.GetConnection();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "DELETE FROM pending_requests WHERE appointment_id = $meetingId AND user_id = $userId";
        cmd.Parameters.AddWithValue("$meetingId", meetingId);
        cmd.Parameters.AddWithValue("$userId", userId);
        cmd.ExecuteNonQuery();
    }

    private static DateTime ParseDate(object? value)
    {
        if (value == null) return DateTime.MinValue;
        return DateTime.Parse(value.ToString()!, null, System.Globalization.DateTimeStyles.RoundtripKind);
    }
}
