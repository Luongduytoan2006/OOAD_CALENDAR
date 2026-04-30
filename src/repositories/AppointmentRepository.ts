import { Appointment } from '../models/Appointment';
import { Reminder } from '../models/Reminder';
import { DbConnection } from './DbConnection';

export class AppointmentRepository {
  async getByUserId(userId: number): Promise<Appointment[]> {
    const db = await DbConnection.getConnection();

    const rows = await db.all(
      `
      SELECT a.*, r.reminder_id, r.reminder_time, r.reminder_type
      FROM appointments a
      LEFT JOIN reminders r ON a.appointment_id = r.appointment_id
      WHERE a.owner_id = ?
         OR a.appointment_id IN (
           SELECT appointment_id
           FROM participants
           WHERE user_id = ?
         )
      ORDER BY a.start_time ASC
      `,
      [userId, userId]
    );

    return this.mapRowsToAppointments(rows);
  }

  async getById(appointmentId: number): Promise<Appointment | null> {
    const db = await DbConnection.getConnection();

    const rows = await db.all(
      `
      SELECT a.*, r.reminder_id, r.reminder_time, r.reminder_type
      FROM appointments a
      LEFT JOIN reminders r ON a.appointment_id = r.appointment_id
      WHERE a.appointment_id = ?
      `,
      [appointmentId]
    );

    if (rows.length === 0) return null;

    return this.mapRowsToAppointments(rows)[0];
  }

  async save(appointment: Appointment): Promise<number> {
    const db = await DbConnection.getConnection();

    try {
      await db.run('BEGIN');

      const result = await db.run(
        `
        INSERT INTO appointments (
          title,
          location,
          start_time,
          end_time,
          owner_id,
          is_group_meeting
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          appointment.title,
          appointment.location,
          appointment.startTime.toISOString(),
          appointment.endTime.toISOString(),
          appointment.ownerId,
          appointment.isGroupMeeting ? 1 : 0,
        ]
      );

      const id = result.lastID;

      for (const reminder of appointment.reminders) {
        await db.run(
          `
          INSERT INTO reminders (
            appointment_id,
            reminder_time,
            reminder_type
          )
          VALUES (?, ?, ?)
          `,
          [id, reminder.remindAt.toISOString(), reminder.method]
        );
      }

      await db.run('COMMIT');

      return id;
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }

  async delete(id: number): Promise<void> {
    const db = await DbConnection.getConnection();

    try {
      await db.run('BEGIN');

      await db.run('DELETE FROM reminders WHERE appointment_id = ?', [id]);
      await db.run('DELETE FROM pending_requests WHERE appointment_id = ?', [id]);
      await db.run('DELETE FROM participants WHERE appointment_id = ?', [id]);
      await db.run('DELETE FROM group_meetings WHERE appointment_id = ?', [id]);
      await db.run('DELETE FROM appointments WHERE appointment_id = ?', [id]);

      await db.run('COMMIT');
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }

  async findConflicts(userId: number, start: Date, end: Date): Promise<Appointment | null> {
    const db = await DbConnection.getConnection();

    const rows = await db.all(
      `
      SELECT a.*
      FROM appointments a
      WHERE (
        a.owner_id = ?
        OR a.appointment_id IN (
          SELECT appointment_id
          FROM participants
          WHERE user_id = ?
        )
      )
      AND a.start_time < ?
      AND a.end_time > ?
      ORDER BY a.start_time ASC
      LIMIT 1
      `,
      [userId, userId, end.toISOString(), start.toISOString()]
    );

    if (rows.length === 0) return null;

    return this.mapRowsToAppointments(rows)[0];
  }

  private mapRowsToAppointments(rows: any[]): Appointment[] {
    const map = new Map<number, Appointment>();

    for (const row of rows) {
      if (!map.has(row.appointment_id)) {
        map.set(
          row.appointment_id,
          new Appointment(
            row.appointment_id,
            row.title,
            row.location,
            new Date(row.start_time),
            new Date(row.end_time),
            row.owner_id,
            Boolean(row.is_group_meeting),
            []
          )
        );
      }

      if (row.reminder_id) {
        const app = map.get(row.appointment_id)!;

        app.addReminder(
          new Reminder(
            row.reminder_id,
            new Date(row.reminder_time),
            row.reminder_type
          )
        );
      }
    }

    return Array.from(map.values());
  }
}