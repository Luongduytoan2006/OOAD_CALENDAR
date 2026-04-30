import { Appointment } from '../models/Appointment';
import { Reminder, ReminderMethod } from '../models/Reminder';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { GroupMeetingRepository } from '../repositories/GroupMeetingRepository';
import { AddAppointmentRequest } from '../models/types';

export class AppointmentService {
  constructor(
    private appointmentRepo: AppointmentRepository,
    private groupMeetingRepo: GroupMeetingRepository,
  ) {}

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return this.appointmentRepo.getByUserId(userId);
  }

  async getDetails(appointmentId: number): Promise<Appointment | null> {
    return this.appointmentRepo.getById(appointmentId);
  }

  async checkPersonalConflict(
    userId: number,
    start: Date,
    end: Date,
  ): Promise<Appointment | null> {
    return this.appointmentRepo.findConflicts(userId, start, end);
  }

  async createPersonal(userId: number, request: AddAppointmentRequest): Promise<number> {
    const newApp = new Appointment(
      0,
      request.title.trim(),
      request.location,
      request.startTime,
      request.endTime,
      userId,
      false,
    );

    this.addSelectedReminders(newApp, request.reminderMethods);

    return this.appointmentRepo.save(newApp);
  }

  async createGroup(userId: number, request: AddAppointmentRequest): Promise<number> {
    const newApp = new Appointment(
      0,
      request.title.trim(),
      request.location,
      request.startTime,
      request.endTime,
      userId,
      true,
    );

    this.addSelectedReminders(newApp, request.reminderMethods);

    const appId = await this.appointmentRepo.save(newApp);

    await this.groupMeetingRepo.saveGroupMetadata(appId);
    await this.groupMeetingRepo.addParticipant(userId, appId);

    return appId;
  }

  async replaceAppointment(
    oldId: number,
    userId: number,
    request: AddAppointmentRequest,
  ): Promise<number> {
    await this.appointmentRepo.delete(oldId);

    if (request.isGroupMeeting) {
      return this.createGroup(userId, request);
    }

    return this.createPersonal(userId, request);
  }

  private addSelectedReminders(
    appointment: Appointment,
    methods?: ReminderMethod[],
  ): void {
    if (!methods || methods.length === 0) return;

    for (const method of methods) {
      const remindAt = new Date(appointment.startTime);
      remindAt.setMinutes(remindAt.getMinutes() - 15);

      appointment.addReminder(new Reminder(0, remindAt, method));
    }
  }
}