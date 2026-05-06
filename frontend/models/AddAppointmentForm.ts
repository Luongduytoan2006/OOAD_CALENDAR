export interface ReminderInput {
  days: number;
  hours: number;
  minutes: number;
}

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

    // Validate reminder
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
}
