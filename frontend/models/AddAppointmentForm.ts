import { Calendar } from './Calendar';
import { User } from './User';

export interface ReminderInput {
  days: number;
  hours: number;
  minutes: number;
}

export interface AddAppointmentCallbacks {
  showSuccess: (message: string) => void;
  showInvalidInputError: (message: string) => void;
  showConflictWarning: (conflicts: any[]) => void;
  askJoinGroupMeeting: (meetings: any[]) => void;
}

/**
 * UI form model for Add Appointment use case.
 */
export class AddAppointmentForm {
  public isGroupMeeting: boolean = false;

  constructor(
    public selectedDateTime: Date,
    public inputTitle: string,
    public inputLocation: string,
    public inputStartTime: Date,
    public inputEndTime: Date,
    public selectedReminders: ReminderInput[],
  ) { }

  validateInput(): { isValid: boolean; error?: string } {
    if (!this.inputTitle.trim()) {
      return { isValid: false, error: 'Tiêu đề không được để trống.' };
    }

    if (this.inputEndTime <= this.inputStartTime) {
      return { isValid: false, error: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu.' };
    }

    const now = new Date();
    if (this.inputStartTime < now) {
      return { isValid: false, error: 'Thời gian bắt đầu không được trong quá khứ.' };
    }

    for (let i = 0; i < this.selectedReminders.length; i++) {
      const r = this.selectedReminders[i];
      if (r.days === 0 && r.hours === 0 && r.minutes === 0) {
        return { isValid: false, error: `Nhắc nhở #${i + 1}: phải đặt ít nhất 1 giá trị lớn hơn 0.` };
      }
      const remindAt = new Date(this.inputStartTime);
      remindAt.setDate(remindAt.getDate() - r.days);
      remindAt.setHours(remindAt.getHours() - r.hours);
      remindAt.setMinutes(remindAt.getMinutes() - r.minutes);
      if (remindAt < now) {
        return { isValid: false, error: `Nhắc nhở #${i + 1}: thời gian nhắc đã qua (trước ${r.days} ngày ${r.hours} giờ ${r.minutes} phút).` };
      }
    }

    return { isValid: true };
  }

  buildReminders(): { remindAt: Date; method: string }[] {
    return this.selectedReminders.map((r) => {
      const remindAt = new Date(this.inputStartTime);
      remindAt.setDate(remindAt.getDate() - r.days);
      remindAt.setHours(remindAt.getHours() - r.hours);
      remindAt.setMinutes(remindAt.getMinutes() - r.minutes);
      const parts: string[] = [];
      if (r.days > 0) parts.push(`${r.days} ngày`);
      if (r.hours > 0) parts.push(`${r.hours} giờ`);
      if (r.minutes > 0) parts.push(`${r.minutes} phút`);
      const method = parts.length > 0 ? parts.join(' ') + ' trước' : 'khi bắt đầu';
      return { remindAt, method };
    });
  }

  async submit(calendar: Calendar, isGroupMeeting: boolean, callbacks: AddAppointmentCallbacks): Promise<void> {
    this.isGroupMeeting = isGroupMeeting;

    const validation = this.validateInput();
    if (!validation.isValid) {
      callbacks.showInvalidInputError(validation.error!);
      return;
    }

    const conflictResult = await calendar.checkConflict(this.inputStartTime, this.inputEndTime);
    if (conflictResult.hasConflict) {
      callbacks.showConflictWarning(conflictResult.conflicts);
      return;
    }

    const groupResult = await calendar.checkGroupMeeting(this.inputTitle, this.inputStartTime, this.inputEndTime);
    if (groupResult.hasMatch) {
      callbacks.askJoinGroupMeeting(groupResult.meetings);
      return;
    }

    const reminders = this.buildReminders();
    await calendar.createAppointment(this.inputTitle, this.inputLocation, this.inputStartTime, this.inputEndTime, reminders, isGroupMeeting);
    callbacks.showSuccess('Thêm lịch hẹn thành công!');
  }

  async executeReplace(user: User, conflictIds: number[]): Promise<void> {
    const reminders = this.buildReminders();
    await user.chooseReplace(conflictIds, this.inputTitle, this.inputLocation, this.inputStartTime, this.inputEndTime, reminders, this.isGroupMeeting);
  }

  async executeCreateAnyway(calendar: Calendar): Promise<void> {
    const reminders = this.buildReminders();
    await calendar.createAppointment(this.inputTitle, this.inputLocation, this.inputStartTime, this.inputEndTime, reminders, this.isGroupMeeting);
  }
}
