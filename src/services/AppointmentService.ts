import { AddAppointmentForm } from '../models/AddAppointmentForm';
import { Appointment } from '../models/Appointment';
import { Reminder } from '../models/Reminder';
import {
  AddAppointmentDecision,
  AddAppointmentRequest,
  AddAppointmentResult,
} from '../models/types';
import { ICalendarRepository } from '../repositories/ICalendarRepository';

/**
 * Service layer handling use-case logic of Add Calendar Appointment.
 */
export class AppointmentService {
  constructor(private readonly repository: ICalendarRepository) {}

  async getAppointments(): Promise<Appointment[]> {
    const calendar = await this.repository.getCalendar();
    return [...calendar.appointments].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async addAppointment(
    request: AddAppointmentRequest,
    decision: AddAppointmentDecision = {},
  ): Promise<AddAppointmentResult> {
    const calendar = await this.repository.getCalendar();

    const form = new AddAppointmentForm(
      request.startTime,
      request.title,
      request.location,
      request.startTime,
      request.endTime,
      request.reminderMethods,
    );

    const validation = form.validateInput();
    if (!validation.isValid) {
      return {
        status: 'INVALID',
        message: validation.error ?? 'Dữ liệu không hợp lệ.',
      };
    }

    const appointment = new Appointment(
      this.repository.nextAppointmentId(),
      request.title.trim(),
      request.location.trim(),
      request.startTime,
      request.endTime,
      [],
    );

    request.reminderMethods.forEach((method) => {
      const remindAt = new Date(request.startTime.getTime() - 15 * 60 * 1000);
      appointment.addReminder(new Reminder(this.repository.nextReminderId(), remindAt, method));
    });

    const conflict = calendar.findConflictingAppointment(appointment);
    if (conflict && decision.replaceConflict !== true) {
      return {
        status: 'CONFLICT',
        message: 'Bạn đã có cuộc hẹn khác trong khung giờ này.',
        conflictingAppointment: conflict,
      };
    }

    const matchingGroupMeeting = calendar.findMatchingGroupMeeting(
      appointment.title,
      appointment.getDuration(),
    );

    if (matchingGroupMeeting && decision.joinGroupMeeting === undefined) {
      return {
        status: 'GROUP_MEETING_SUGGESTION',
        message: 'Có cuộc họp nhóm cùng tên và thời lượng. Bạn có muốn tham gia thay vì tạo mới?',
        matchingGroupMeeting,
      };
    }

    if (matchingGroupMeeting && decision.joinGroupMeeting === true) {
      calendar.joinGroupMeeting(matchingGroupMeeting);
      await this.repository.saveCalendar(calendar);
      return {
        status: 'JOINED_GROUP_MEETING',
        message: 'Bạn đã được thêm vào danh sách tham gia họp nhóm.',
        matchingGroupMeeting,
      };
    }

    if (conflict && decision.replaceConflict === true) {
      calendar.replaceAppointment(conflict.appointmentId, appointment);
      await this.repository.saveCalendar(calendar);
      return {
        status: 'REPLACED',
        message: 'Đã thay thế cuộc hẹn cũ bằng cuộc hẹn mới.',
        appointment,
      };
    }

    calendar.addAppointment(appointment);
    await this.repository.saveCalendar(calendar);

    return {
      status: 'SUCCESS',
      message: 'Thêm cuộc hẹn thành công.',
      appointment,
    };
  }
}
