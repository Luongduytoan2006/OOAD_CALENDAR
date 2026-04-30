import { GroupMeeting } from '../models/GroupMeeting';
import { GroupMeetingRepository } from '../repositories/GroupMeetingRepository';

export class GroupMeetingService {
  constructor(private groupMeetingRepo: GroupMeetingRepository) {}

  async findSuggestions(
    currentUserId: number,
    title: string,
    startTime: Date,
    endTime: Date,
  ): Promise<GroupMeeting[]> {
    return this.groupMeetingRepo.findAllMatching(
      currentUserId,
      title,
      startTime,
      endTime,
    );
  }

  async getMeetingDetails(meetingId: number): Promise<GroupMeeting | null> {
    return this.groupMeetingRepo.getById(meetingId);
  }

  async joinMeeting(userId: number, meetingId: number): Promise<void> {
    await this.groupMeetingRepo.addParticipant(userId, meetingId);
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