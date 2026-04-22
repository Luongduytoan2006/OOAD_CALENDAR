import { Appointment } from './Appointment';
import { User } from './User';

/**
 * GroupMeeting is a specialized appointment with participants.
 */
export class GroupMeeting extends Appointment {
  constructor(
    appointmentId: number,
    title: string,
    location: string,
    startTime: Date,
    endTime: Date,
    public participants: User[] = [],
  ) {
    super(appointmentId, title, location, startTime, endTime);
  }

  hasSameTitleAndDuration(title: string, durationMs: number): boolean {
    return this.title.trim().toLowerCase() === title.trim().toLowerCase() && this.getDuration() === durationMs;
  }

  addParticipant(user: User): void {
    const joined = this.participants.some((p) => p.userId === user.userId);
    if (!joined) {
      this.participants.push(user);
    }
  }
}
