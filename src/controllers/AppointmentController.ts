import { AddAppointmentDecision, AddAppointmentRequest, AddAppointmentResult } from '../models/types';
import { Appointment } from '../models/Appointment';
import { AppointmentService } from '../services/AppointmentService';

/**
 * Controller layer coordinating view requests and application service calls.
 */
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  async listAppointments(): Promise<Appointment[]> {
    return this.appointmentService.getAppointments();
  }

  async createAppointment(
    request: AddAppointmentRequest,
    decision: AddAppointmentDecision = {},
  ): Promise<AddAppointmentResult> {
    return this.appointmentService.addAppointment(request, decision);
  }

  getCurrentUser(): User {
    return this.appointmentService.getCurrentUser();
  }

  getAllUsers(): User[] {
    return this.appointmentService.getAllUsers();
  }

  setCurrentUser(userId: number): void {
    this.appointmentService.setCurrentUser(userId);
  }

  async approveRequest(groupMeetingId: number, user: User): Promise<void> {
    await this.appointmentService.approveRequest(groupMeetingId, user);
  }

  async rejectRequest(groupMeetingId: number, user: User): Promise<void> {
    await this.appointmentService.rejectRequest(groupMeetingId, user);
  }
}
