import { Appointment } from '../models/Appointment';

export interface CalendarCellItem {
  date: Date;
  appointments: Appointment[];
  isCurrentMonth: boolean;
}

export function buildMonthGrid(displayMonth: Date, appointments: Appointment[]): CalendarCellItem[] {
  const startOfMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
  const mondayBasedFirstWeekday = (startOfMonth.getDay() + 6) % 7;

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startOfMonth);
    date.setDate(index - mondayBasedFirstWeekday + 1);

    const dayAppointments = appointments.filter(
      (appointment) =>
        appointment.startTime.getDate() === date.getDate() &&
        appointment.startTime.getMonth() === date.getMonth() &&
        appointment.startTime.getFullYear() === date.getFullYear(),
    );

    return {
      date,
      appointments: dayAppointments,
      isCurrentMonth:
        date.getMonth() === displayMonth.getMonth() && date.getFullYear() === displayMonth.getFullYear(),
    };
  });
}
