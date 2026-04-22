/**
 * User entity: owner of a calendar and participant of group meetings.
 */
export class User {
  constructor(
    public userId: number,
    public fullName: string,
  ) {}

  chooseReplace(choice: boolean): boolean {
    return choice;
  }

  confirmJoinGroupMeeting(choice: boolean): boolean {
    return choice;
  }
}
