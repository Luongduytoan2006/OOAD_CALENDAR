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
      return { status: 'INVALID', message: validation.error ?? 'Dữ liệu không hợp lệ.' };
    }

    const durationMs = request.endTime.getTime() - request.startTime.getTime();
    const matchingGroupMeeting = calendar.findMatchingGroupMeeting(
      request.title.trim(),
      durationMs,
      request.startTime,
    );

    // Luồng 2: Xin gia nhập GroupMeeting
    if (matchingGroupMeeting && decision.joinGroupMeeting === undefined) {
      return {
        status: 'GROUP_MEETING_SUGGESTION',
        message: 'Hệ thống tìm thấy một cuộc họp nhóm tương tự. Bạn có muốn xin tham gia không?',
        matchingGroupMeeting,
      };
    }

    if (matchingGroupMeeting && decision.joinGroupMeeting === true) {
      matchingGroupMeeting.requestToJoin(calendar.user);
      await this.repository.saveCalendar(calendar);
      return {
        status: 'JOINED_GROUP_MEETING',
        message: 'Đã gửi yêu cầu tham gia, chờ duyệt.',
        matchingGroupMeeting,
      };
    }

    // Luồng 3: Xử lý trùng lịch
    const appointment = new Appointment(
      this.repository.nextAppointmentId(),
      request.title.trim(),
      request.location.trim(),
      request.startTime,
      request.endTime,
      [],
    );

    const conflict = calendar.findConflictingAppointment(appointment);
    if (conflict && decision.replaceConflict !== true) {
      return {
        status: 'CONFLICT',
        message: 'Bạn đã có cuộc hẹn khác trong khung giờ này.',
        conflictingAppointment: conflict,
      };
    }

    if (conflict && decision.replaceConflict === true) {
      calendar.replaceAppointment(conflict.appointmentId, appointment);
    } else {
      calendar.addAppointment(appointment);
    }

    await this.repository.saveCalendar(calendar);
    return {
      status: decision.replaceConflict ? 'REPLACED' : 'SUCCESS',
      message: decision.replaceConflict ? 'Đã thay thế cuộc hẹn cũ.' : 'Thêm cuộc hẹn thành công.',
      appointment,
    };
  }

  // Luồng 4: Chủ phòng duyệt người tham gia
  async approveRequest(groupMeetingId: number, user: User): Promise<void> {
    const calendar = await this.repository.getCalendar();
    const meeting = calendar.appointments.find(
      (a) => a.appointmentId === groupMeetingId && a instanceof GroupMeeting
    ) as GroupMeeting;

    if (meeting && meeting.ownerId === calendar.user.userId) {
      meeting.approveParticipant(user);
      await this.repository.saveCalendar(calendar);
    }
  }

  async rejectRequest(groupMeetingId: number, user: User): Promise<void> {
    const calendar = await this.repository.getCalendar();
    const meeting = calendar.appointments.find(
      (a) => a.appointmentId === groupMeetingId && a instanceof GroupMeeting
    ) as GroupMeeting;

    if (meeting && meeting.ownerId === calendar.user.userId) {
      meeting.rejectParticipant(user);
      await this.repository.saveCalendar(calendar);
    }
  }

  // Quản lý User
  getCurrentUser(): User {
    return this.repository.getCurrentUser();
  }

  getAllUsers(): User[] {
    return this.repository.getAllUsers();
  }

  setCurrentUser(userId: number): void {
    this.repository.setCurrentUser(userId);
  }
}
