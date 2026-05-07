import { Appointment } from './Appointment';
import { GroupMeeting } from './GroupMeeting';
import { User } from './User';
import { apiClient } from '../apiClient';

/**
 * Calendar aggregate root for appointment operations.
 */
export class Calendar {
  constructor(
    public calendarId: number,
    public user: User,
    public appointments: Appointment[] = [],
  ) {}

  static async loadForUser(user: User): Promise<Calendar> {
    const data = await apiClient.get('/appointments', { userId: user.userId });
    
    const appointments = data.map((app: any) => {
      // Create instances of Appointment or GroupMeeting based on isGroupMeeting
      // For now, to keep it simple and compatible, we return plain objects with casted dates
      // which CalendarPage currently expects
      return {
        ...app,
        startTime: new Date(app.startTime),
        endTime: new Date(app.endTime),
        reminders: app.reminders?.map((r: any) => ({ ...r, remindAt: new Date(r.remindAt) })) ?? []
      } as Appointment;
    });

    return new Calendar(user.userId, user, appointments);
  }

  async checkConflict(startTime: Date, endTime: Date): Promise<any> {
    return apiClient.post('/appointments/check-conflict', { 
      userId: this.user.userId, 
      startTime, 
      endTime 
    });
  }

  async checkGroupMeeting(title: string, startTime: Date, endTime: Date): Promise<any> {
    return apiClient.post('/appointments/check-group-meeting', { 
      userId: this.user.userId, 
      title, 
      startTime, 
      endTime 
    });
  }

  async createAppointment(title: string, location: string, startTime: Date, endTime: Date, reminders: { remindAt: Date; method: string }[], isGroupMeeting: boolean): Promise<any> {
    return apiClient.post('/appointments/create', { 
      userId: this.user.userId, 
      title, 
      location, 
      startTime, 
      endTime, 
      reminders, 
      isGroupMeeting 
    });
  }

  async getAppointmentDetails(appointmentId: number): Promise<any> {
    return apiClient.get(`/appointments/${appointmentId}`);
  }

  // --- Local methods ---
  addAppointment(appointment: Appointment): void {
    this.appointments.push(appointment);
  }

  findConflictingAppointment(candidate: Appointment): Appointment | null {
    return this.appointments.find((appointment) => appointment.overlapsWith(candidate)) ?? null;
  }

  findMatchingGroupMeeting(title: string, startTime: Date, endTime: Date): GroupMeeting | null {
    const meeting = this.appointments.find(
      (appointment) =>
        appointment instanceof GroupMeeting &&
        appointment.hasSameTitleAndDuration(title, startTime, endTime),
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
