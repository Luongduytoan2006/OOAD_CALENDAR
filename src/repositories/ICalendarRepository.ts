import { Calendar } from '../models/Calendar';
import { User } from '../models/User';

export interface ICalendarRepository {
  getCalendar(): Promise<Calendar>;
  saveCalendar(calendar: Calendar): Promise<void>;
  setCurrentUser(userId: number): void;
  getCurrentUser(): User;
  getAllUsers(): User[];
  nextAppointmentId(): number;
  nextReminderId(): number;
}
