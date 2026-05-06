import { apiClient } from '../apiClient';

/**
 * User entity.
 */
export class User {
  constructor(
    public userId: number,
    public fullName: string,
  ) {}

  static getAllUsers(): User[] {
    return [
      new User(1, 'Toàn'),
      new User(2, 'Sơn'),
      new User(3, 'Dũng')
    ];
  }

  async chooseReplace(conflictIds: number[], title: string, location: string, startTime: Date, endTime: Date, reminders: { remindAt: Date; method: string }[], isGroupMeeting: boolean): Promise<any> {
    return apiClient.post('/appointments/replace', {
      userId: this.userId,
      conflictIds,
      title,
      location,
      startTime,
      endTime,
      reminders,
      isGroupMeeting
    });
  }

  async confirmJoinGroupMeeting(meetingId: number): Promise<any> {
    return apiClient.post('/appointments/join', {
      userId: this.userId,
      meetingId
    });
  }
}
