import { ReminderMethod } from './Reminder';

/**
 * UI form model for Add Appointment use case.
 */
export class AddAppointmentForm {
  constructor(
    public selectedDateTime: Date,
    public inputTitle: string,
    public inputLocation: string,
    public inputStartTime: Date,
    public inputEndTime: Date,
    public selectedReminders: ReminderMethod[],
  ) {}

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

    return { isValid: true };
  }
}
