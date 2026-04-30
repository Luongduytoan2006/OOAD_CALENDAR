import { GroupMeeting } from '../models/GroupMeeting';
import { User } from '../models/User';
import { DbConnection } from './DbConnection';

export class GroupMeetingRepository {
  async findAllMatching(
    currentUserId: number,
    title: string,
    startTime: Date,
    endTime: Date,
  ): Promise<GroupMeeting[]> {
    const db = await DbConnection.getConnection();

    const rows = await db.all(
      `
      SELECT a.*
      FROM appointments a
      WHERE a.is_group_meeting = 1
        AND LOWER(TRIM(a.title)) = LOWER(TRIM(?))
        AND a.start_time = ?
        AND a.end_time = ?
        AND a.owner_id <> ?
        AND a.appointment_id NOT IN (
          SELECT appointment_id
          FROM participants
          WHERE user_id = ?
        )
      ORDER BY a.start_time ASC
      `,
      [
        title,
        startTime.toISOString(),
        endTime.toISOString(),
        currentUserId,
        currentUserId,
      ],
    );

    return rows.map(
      (row) =>
        new GroupMeeting(
          row.appointment_id,
          row.title,
          row.location,
          new Date(row.start_time),
          new Date(row.end_time),
          row.owner_id,
          [],
        ),
    );
  }

  async getById(meetingId: number): Promise<GroupMeeting | null> {
    const db = await DbConnection.getConnection();

    const row = await db.get(
      `
      SELECT *
      FROM appointments
      WHERE appointment_id = ?
        AND is_group_meeting = 1
      `,
      [meetingId],
    );

    if (!row) return null;

    const meeting = new GroupMeeting(
      row.appointment_id,
      row.title,
      row.location,
      new Date(row.start_time),
      new Date(row.end_time),
      row.owner_id,
      [],
    );

    const participantRows = await db.all(
      `
      SELECT u.*
      FROM participants p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.appointment_id = ?
      `,
      [meetingId],
    );

    meeting.participants = participantRows.map(
      (r) => new User(r.user_id, r.full_name),
    );

    const pendingRows = await db.all(
      `
      SELECT u.*
      FROM pending_requests p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.appointment_id = ?
      `,
      [meetingId],
    );

    meeting.pendingRequests = pendingRows.map(
      (r) => new User(r.user_id, r.full_name),
    );

    return meeting;
  }

  async saveGroupMetadata(meetingId: number): Promise<void> {
    const db = await DbConnection.getConnection();

    await db.run(
      `
      INSERT OR IGNORE INTO group_meetings (appointment_id)
      VALUES (?)
      `,
      [meetingId],
    );
  }

  async addParticipant(userId: number, meetingId: number): Promise<void> {
    const db = await DbConnection.getConnection();

    await db.run(
      `
      INSERT OR IGNORE INTO participants (appointment_id, user_id)
      VALUES (?, ?)
      `,
      [meetingId, userId],
    );

    await db.run(
      `
      DELETE FROM pending_requests
      WHERE appointment_id = ?
        AND user_id = ?
      `,
      [meetingId, userId],
    );
  }

  async addRequestToJoin(userId: number, meetingId: number): Promise<void> {
    const db = await DbConnection.getConnection();

    await db.run(
      `
      INSERT OR IGNORE INTO pending_requests (appointment_id, user_id)
      VALUES (?, ?)
      `,
      [meetingId, userId],
    );
  }

  async approveParticipant(userId: number, meetingId: number): Promise<void> {
    const db = await DbConnection.getConnection();

    try {
      await db.run('BEGIN');

      await db.run(
        `
        DELETE FROM pending_requests
        WHERE appointment_id = ?
          AND user_id = ?
        `,
        [meetingId, userId],
      );

      await db.run(
        `
        INSERT OR IGNORE INTO participants (appointment_id, user_id)
        VALUES (?, ?)
        `,
        [meetingId, userId],
      );

      await db.run('COMMIT');
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }

  async rejectParticipant(userId: number, meetingId: number): Promise<void> {
    const db = await DbConnection.getConnection();

    await db.run(
      `
      DELETE FROM pending_requests
      WHERE appointment_id = ?
        AND user_id = ?
      `,
      [meetingId, userId],
    );
  }
}