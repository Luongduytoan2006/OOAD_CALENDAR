import { Appointment } from '../models/Appointment';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { GroupMeetingRepository } from '../repositories/GroupMeetingRepository';
import { AddAppointmentRequest } from '../models/types';

export class AppointmentService {
  constructor(
    private appointmentRepo: AppointmentRepository,
    private groupMeetingRepo: GroupMeetingRepository
  ) {}

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return this.appointmentRepo.getByUserId(userId);
  }

  async getDetails(appointmentId: number): Promise<Appointment | null> {
    return this.appointmentRepo.getById(appointmentId);
  }

  async checkPersonalConflict(userId: number, start: Date, end: Date): Promise<Appointment | null> {
    return this.appointmentRepo.findConflicts(userId, start, end);
  }

  async createPersonal(userId: number, request: AddAppointmentRequest): Promise<number> {
    const newApp = new Appointment(
      0,
      request.title,
      request.location,
      request.startTime,
      request.endTime,
      userId,
      false
    );
    return this.appointmentRepo.save(newApp);
  }

  async createGroup(userId: number, request: AddAppointmentRequest): Promise<number> {
    const newApp = new Appointment(
      0,
      request.title,
      request.location,
      request.startTime,
      request.endTime,
      userId,
      true
    );
    const appId = await this.appointmentRepo.save(newApp);
    await this.groupMeetingRepo.saveGroupMetadata(appId);
    return appId;
  }

  async replaceAppointment(oldId: number, userId: number, request: AddAppointmentRequest): Promise<number> {
    await this.appointmentRepo.delete(oldId);
    if (request.isGroupMeeting) {
      return this.createGroup(userId, request);
    } else {
      return this.createPersonal(userId, request);
    }
  }
}
