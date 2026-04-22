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
 * In-memory repository with mock data for Toàn, Sơn, Dũng, Hoàng.
 */
export class MockCalendarRepository implements ICalendarRepository {
  private appointmentSeed = 200;
  private reminderSeed = 500;

  private calendars: Map<number, Calendar> = new Map();
  private currentUserId: number = 1;

  constructor() {
    const toan = new User(1, 'Toàn');
    const son = new User(2, 'Sơn');
    const dung = new User(3, 'Dũng');
    const hoang = new User(4, 'Hoàng');

    const users = [toan, son, dung, hoang];
    users.forEach((u) => this.calendars.set(u.userId, new Calendar(u.userId, u, [])));

    // 1. Toàn - Họp dự án A (Cá nhân)
    this.calendars.get(1)?.addAppointment(new Appointment(
      101, 'Họp dự án A', 'Phòng họp 1', createDate(0, 9, 0), createDate(0, 10, 30)
    ));

    // 2. Sơn - Sprint Planning (Group Meeting) - Toàn đã tham gia
    const sonSprint = new GroupMeeting(
      102, 'Sprint Planning', 'Phòng họp A2', createDate(1, 14, 0), createDate(1, 15, 0), 2, [son, toan]
    );
    this.calendars.get(2)?.addAppointment(sonSprint);
    this.calendars.get(1)?.addAppointment(sonSprint);

    // 3. Dũng - Code Review (Cá nhân)
    this.calendars.get(3)?.addAppointment(new Appointment(
      103, 'Code Review', 'Phòng họp 3', createDate(0, 11, 0), createDate(0, 12, 0)
    ));

    // 4. Hoàng - Thiết kế UI/UX (Group Meeting) - Sơn xin gia nhập (pending)
    const hoangUI = new GroupMeeting(
      104, 'Thiết kế UI/UX', 'Phòng Zoom', createDate(2, 10, 0), createDate(2, 11, 30), 4, [hoang]
    );
    hoangUI.requestToJoin(son);
    this.calendars.get(4)?.addAppointment(hoangUI);

    // 5. Toàn - Ăn trưa cùng team (Cá nhân)
    this.calendars.get(1)?.addAppointment(new Appointment(
      105, 'Ăn trưa cùng team', 'Nhà hàng Green', createDate(1, 12, 0), createDate(1, 13, 30)
    ));

    // 6. Sơn - Nghiệm thu phần mềm (Group Meeting)
    const sonReview = new GroupMeeting(
      106, 'Nghiệm thu phần mềm', 'Phòng họp 1', createDate(3, 15, 0), createDate(3, 16, 30), 2, [son]
    );
    this.calendars.get(2)?.addAppointment(sonReview);
  }

  async getCalendar(): Promise<Calendar> {
    return this.calendars.get(this.currentUserId)!;
  }

  async saveCalendar(calendar: Calendar): Promise<void> {
    this.calendars.set(calendar.user.userId, calendar);
  }

  setCurrentUser(userId: number): void {
    this.currentUserId = userId;
  }

  getCurrentUser(): User {
    return this.calendars.get(this.currentUserId)!.user;
  }

  getAllUsers(): User[] {
    return Array.from(this.calendars.values()).map((c) => c.user);
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
