import { Reminder } from './Reminder';

/**
 * Appointment entity for personal events.
 */
export class Appointment {
  constructor(
    public appointmentId: number,
    public title: string,
    public location: string,
    public startTime: Date,
    public endTime: Date,
    public reminders: Reminder[] = [],
  ) {}

  getDuration(): number {
    return this.endTime.getTime() - this.startTime.getTime();
  }

  overlapsWith(other: Appointment): boolean {
    return this.startTime < other.endTime && this.endTime > other.startTime;
  }

  addReminder(reminder: Reminder): void {
    this.reminders.push(reminder);
  }
}
