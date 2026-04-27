import { GroupMeeting } from '../models/GroupMeeting';
import { User } from '../models/User';
import { DbConnection } from './DbConnection';

export class GroupMeetingRepository {
  async findAllMatching(title: string, durationMs: number): Promise<GroupMeeting[]> {
    const pool = await DbConnection.getConnection();
    const result = await pool.query(`
      SELECT a.*, u.full_name as owner_name
      FROM appointments a
      JOIN users u ON a.owner_id = u.user_id
      WHERE a.is_group_meeting = TRUE 
      AND a.title = $1
    `, [title]);

    const matches = result.rows.filter(row => {
      const duration = new Date(row.end_time).getTime() - new Date(row.start_time).getTime();
      return duration === durationMs;
    });

    return matches.map(row => new GroupMeeting(
      row.appointment_id,
      row.title,
      row.location,
      new Date(row.start_time),
      new Date(row.end_time),
      row.owner_id,
      []
    ));
  }

  async getById(meetingId: number): Promise<GroupMeeting | null> {
    const pool = await DbConnection.getConnection();
    const result = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1 AND is_group_meeting = TRUE', [meetingId]);

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    const meeting = new GroupMeeting(
      row.appointment_id,
      row.title,
      row.location,
      new Date(row.start_time),
      new Date(row.end_time),
      row.owner_id
    );

    // Load participants
    const partResult = await pool.query('SELECT u.* FROM participants p JOIN users u ON p.user_id = u.user_id WHERE p.appointment_id = $1', [meetingId]);
    meeting.participants = partResult.rows.map(r => new User(r.user_id, r.full_name));

    // Load pending requests
    const pendResult = await pool.query('SELECT u.* FROM pending_requests p JOIN users u ON p.user_id = u.user_id WHERE p.appointment_id = $1', [meetingId]);
    meeting.pendingRequests = pendResult.rows.map(r => new User(r.user_id, r.full_name));

    return meeting;
  }

  async saveGroupMetadata(meetingId: number): Promise<void> {
    const pool = await DbConnection.getConnection();
    await pool.query('INSERT INTO group_meetings (appointment_id) VALUES ($1) ON CONFLICT DO NOTHING', [meetingId]);
  }

  async addRequestToJoin(userId: number, meetingId: number): Promise<void> {
    const pool = await DbConnection.getConnection();
    await pool.query('INSERT INTO pending_requests (user_id, appointment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, meetingId]);
  }

  async approveParticipant(userId: number, meetingId: number): Promise<void> {
    const client = await (await DbConnection.getConnection()).connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM pending_requests WHERE user_id = $1 AND appointment_id = $2', [userId, meetingId]);
      await client.query('INSERT INTO participants (user_id, appointment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, meetingId]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async rejectParticipant(userId: number, meetingId: number): Promise<void> {
    const pool = await DbConnection.getConnection();
    await pool.query('DELETE FROM pending_requests WHERE user_id = $1 AND appointment_id = $2', [userId, meetingId]);
  }
}
