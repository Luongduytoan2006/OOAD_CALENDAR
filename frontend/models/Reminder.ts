/**
 * Reminder entity: represents one notification reminder attached to an appointment.
 */
export class Reminder {
  constructor(
    public reminderId: number,
    public remindAt: Date,
    public method: string,
  ) {}

  getReminderInfo(): string {
    return `${this.method} at ${this.remindAt.toLocaleString()}`;
  }
}
