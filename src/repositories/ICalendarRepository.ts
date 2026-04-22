import { Calendar } from '../models/Calendar';

export interface ICalendarRepository {
  getCalendar(): Promise<Calendar>;
  saveCalendar(calendar: Calendar): Promise<void>;
  nextAppointmentId(): number;
  nextReminderId(): number;
}
