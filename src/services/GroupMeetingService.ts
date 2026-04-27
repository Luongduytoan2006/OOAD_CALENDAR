import { GroupMeeting } from '../models/GroupMeeting';
import { GroupMeetingRepository } from '../repositories/GroupMeetingRepository';

export class GroupMeetingService {
  constructor(private groupMeetingRepo: GroupMeetingRepository) {}

  async findSuggestions(title: string, durationMs: number): Promise<GroupMeeting[]> {
    return this.groupMeetingRepo.findAllMatching(title, durationMs);
  }

  async getMeetingDetails(meetingId: number): Promise<GroupMeeting | null> {
    return this.groupMeetingRepo.getById(meetingId);
  }

  async requestJoin(userId: number, meetingId: number): Promise<void> {
    await this.groupMeetingRepo.addRequestToJoin(userId, meetingId);
  }

  async approveUser(ownerId: number, meetingId: number, userId: number): Promise<void> {
    const meeting = await this.groupMeetingRepo.getById(meetingId);
    if (meeting && meeting.ownerId === ownerId) {
      await this.groupMeetingRepo.approveParticipant(userId, meetingId);
    }
  }

  async rejectUser(ownerId: number, meetingId: number, userId: number): Promise<void> {
    const meeting = await this.groupMeetingRepo.getById(meetingId);
    if (meeting && meeting.ownerId === ownerId) {
      await this.groupMeetingRepo.rejectParticipant(userId, meetingId);
    }
  }
}
