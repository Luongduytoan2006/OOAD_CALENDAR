import { Appointment } from '../models/Appointment';
import { Reminder } from '../models/Reminder';
import { DbConnection } from './DbConnection';

export class AppointmentRepository {
  async getByUserId(userId: number): Promise<Appointment[]> {
    const pool = await DbConnection.getConnection();
    const result = await pool.query(`
      SELECT a.*, r.reminder_id, r.remind_at, r.method 
      FROM appointments a
      LEFT JOIN reminders r ON a.appointment_id = r.appointment_id
      WHERE a.owner_id = $1
    `, [userId]);

    return this.mapRowsToAppointments(result.rows);
  }

  async getById(appointmentId: number): Promise<Appointment | null> {
    const pool = await DbConnection.getConnection();
    const result = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1', [appointmentId]);

    if (result.rows.length === 0) return null;
    return this.mapRowsToAppointments(result.rows)[0];
  }

  async save(appointment: Appointment): Promise<number> {
    const client = await (await DbConnection.getConnection()).connect();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(`
        INSERT INTO appointments (title, location, start_time, end_time, owner_id, is_group_meeting)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING appointment_id
      `, [
        appointment.title,
        appointment.location,
        appointment.startTime,
        appointment.endTime,
        appointment.ownerId,
        appointment.isGroupMeeting
      ]);

      const id = res.rows[0].appointment_id;

      if (appointment.reminders.length > 0) {
        for (const reminder of appointment.reminders) {
          await client.query(
            'INSERT INTO reminders (appointment_id, remind_at, method) VALUES ($1, $2, $3)',
            [id, reminder.remindAt, reminder.method]
          );
        }
      }

      await client.query('COMMIT');
      return id;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<void> {
    const pool = await DbConnection.getConnection();
    await pool.query('DELETE FROM appointments WHERE appointment_id = $1', [id]);
  }

  async findConflicts(userId: number, start: Date, end: Date): Promise<Appointment | null> {
    const pool = await DbConnection.getConnection();
    const result = await pool.query(`
      SELECT * FROM appointments 
      WHERE owner_id = $1 
      AND start_time < $2 AND end_time > $3
      LIMIT 1
    `, [userId, end, start]);

    if (result.rows.length === 0) return null;
    return this.mapRowsToAppointments(result.rows)[0];
  }

  private mapRowsToAppointments(rows: any[]): Appointment[] {
    const map = new Map<number, Appointment>();

    for (const row of rows) {
      if (!map.has(row.appointment_id)) {
        map.set(row.appointment_id, new Appointment(
          row.appointment_id,
          row.title,
          row.location,
          new Date(row.start_time),
          new Date(row.end_time),
          row.owner_id,
          row.is_group_meeting,
          []
        ));
      }

      if (row.reminder_id) {
        const app = map.get(row.appointment_id)!;
        app.addReminder(new Reminder(row.reminder_id, new Date(row.remind_at), row.method));
      }
    }

    return Array.from(map.values());
  }
}
