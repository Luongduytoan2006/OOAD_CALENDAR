export enum ReminderMethod {
  Popup = 'POPUP',
  Email = 'EMAIL',
  Sms = 'SMS',
}

/**
 * Reminder entity: represents one notification reminder attached to an appointment.
 */
export class Reminder {
  constructor(
    public reminderId: number,
    public remindAt: Date,
    public method: ReminderMethod,
  ) {}

  getReminderInfo(): string {
    return `${this.method} at ${this.remindAt.toLocaleString()}`;
  }
}
