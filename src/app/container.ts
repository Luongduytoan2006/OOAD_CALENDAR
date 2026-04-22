import { AppointmentController } from '../controllers/AppointmentController';
import { MockCalendarRepository } from '../repositories/MockCalendarRepository';
import { AppointmentService } from '../services/AppointmentService';

const repository = new MockCalendarRepository();
const service = new AppointmentService(repository);

export const appointmentController = new AppointmentController(service);
