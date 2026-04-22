import { Appointment } from './Appointment';
import { User } from './User';

/**
 * GroupMeeting is a specialized appointment with participants and approval logic.
 */
export class GroupMeeting extends Appointment {
  public pendingRequests: User[] = [];

  constructor(
    appointmentId: number,
    title: string,
    location: string,
    startTime: Date,
    endTime: Date,
    public ownerId: number,
    public participants: User[] = [],
  ) {
    super(appointmentId, title, location, startTime, endTime);
  }

  hasSameTitleAndDuration(title: string, durationMs: number, start: Date): boolean {
    return (
      this.title.trim().toLowerCase() === title.trim().toLowerCase() &&
      this.getDuration() === durationMs &&
      this.startTime.getTime() === start.getTime()
    );
  }

  addParticipant(user: User): void {
    const joined = this.participants.some((p) => p.userId === user.userId);
    if (!joined) {
      this.participants.push(user);
    }
  }

  requestToJoin(user: User): void {
    const isParticipant = this.participants.some((p) => p.userId === user.userId);
    const isPending = this.pendingRequests.some((p) => p.userId === user.userId);
    if (!isParticipant && !isPending) {
      this.pendingRequests.push(user);
    }
  }

  approveParticipant(user: User): void {
    const index = this.pendingRequests.findIndex((p) => p.userId === user.userId);
    if (index !== -1) {
      this.pendingRequests.splice(index, 1);
      this.addParticipant(user);
    }
  }

  rejectParticipant(user: User): void {
    const index = this.pendingRequests.findIndex((p) => p.userId === user.userId);
    if (index !== -1) {
      this.pendingRequests.splice(index, 1);
    }
  }
}
