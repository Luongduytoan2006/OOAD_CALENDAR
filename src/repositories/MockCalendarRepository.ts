import { Appointment } from '../models/Appointment';
import { Calendar } from '../models/Calendar';
import { GroupMeeting } from '../models/GroupMeeting';
import { Reminder, ReminderMethod } from '../models/Reminder';
import { User } from '../models/User';
import { ICalendarRepository } from './ICalendarRepository';

function createDate(dayOffset: number, hours: number, minutes: number): Date {
  const base = new Date();
  base.setDate(base.getDate() + dayOffset);
  base.setHours(hours, minutes, 0, 0);
  return base;
}

/**
 * In-memory repository with mock data for the assignment.
 */
export class MockCalendarRepository implements ICalendarRepository {
  private appointmentSeed = 200;
  private reminderSeed = 500;

  private readonly calendar: Calendar;

  constructor() {
    const owner = new User(1, 'Duy Toan');

    const personalAppointment = new Appointment(
      101,
      'Code Review cá nhân',
      'Online Meet',
      createDate(1, 9, 0),
      createDate(1, 10, 0),
      [new Reminder(301, createDate(1, 8, 45), ReminderMethod.Popup)],
    );

    const groupMeeting = new GroupMeeting(
      102,
      'Sprint Planning',
      'Phòng họp A2',
      createDate(2, 14, 0),
      createDate(2, 15, 0),
      [owner],
    );

    this.calendar = new Calendar(1, owner, [personalAppointment, groupMeeting]);
  }

  async getCalendar(): Promise<Calendar> {
    return this.calendar;
  }

  async saveCalendar(_calendar: Calendar): Promise<void> {
    // In-memory implementation: data is already updated by reference.
  }

  nextAppointmentId(): number {
    this.appointmentSeed += 1;
    return this.appointmentSeed;
  }

  nextReminderId(): number {
    this.reminderSeed += 1;
    return this.reminderSeed;
  }
}
