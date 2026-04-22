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
      return { isValid: false, error: 'Tên cuộc hẹn không được để trống.' };
    }

    if (this.inputEndTime.getTime() <= this.inputStartTime.getTime()) {
      return { isValid: false, error: 'Thời lượng cuộc hẹn phải lớn hơn 0.' };
    }

    return { isValid: true };
  }
}
