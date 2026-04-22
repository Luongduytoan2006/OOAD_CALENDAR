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
}
