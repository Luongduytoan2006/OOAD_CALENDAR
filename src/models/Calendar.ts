import { Appointment } from './Appointment';
import { GroupMeeting } from './GroupMeeting';
import { User } from './User';

/**
 * Calendar aggregate root for appointment operations.
 */
export class Calendar {
  constructor(
    public calendarId: number,
    public user: User,
    public appointments: Appointment[] = [],
  ) {}

  addAppointment(appointment: Appointment): void {
    this.appointments.push(appointment);
  }

  findConflictingAppointment(candidate: Appointment): Appointment | null {
    return this.appointments.find((appointment) => appointment.overlapsWith(candidate)) ?? null;
  }

  findMatchingGroupMeeting(title: string, durationMs: number, startTime: Date): GroupMeeting | null {
    const meeting = this.appointments.find(
      (appointment) =>
        appointment instanceof GroupMeeting &&
        appointment.hasSameTitleAndDuration(title, durationMs, startTime),
    );
    return (meeting as GroupMeeting | undefined) ?? null;
  }

  replaceAppointment(oldAppointmentId: number, replacement: Appointment): void {
    const index = this.appointments.findIndex((appointment) => appointment.appointmentId === oldAppointmentId);
    if (index >= 0) {
      this.appointments[index] = replacement;
    } else {
      this.addAppointment(replacement);
    }
  }
}
