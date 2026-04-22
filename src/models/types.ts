import { Appointment } from './Appointment';
import { GroupMeeting } from './GroupMeeting';
import { ReminderMethod } from './Reminder';

export interface AddAppointmentRequest {
  title: string;
  location: string;
  startTime: Date;
  endTime: Date;
  reminderMethods: ReminderMethod[];
}

export interface AddAppointmentDecision {
  replaceConflict?: boolean;
  joinGroupMeeting?: boolean;
}

export type AddAppointmentStatus =
  | 'INVALID'
  | 'CONFLICT'
  | 'GROUP_MEETING_SUGGESTION'
  | 'SUCCESS'
  | 'REPLACED'
  | 'JOINED_GROUP_MEETING';

export interface AddAppointmentResult {
  status: AddAppointmentStatus;
  message: string;
  appointment?: Appointment;
  conflictingAppointment?: Appointment;
  matchingGroupMeeting?: GroupMeeting;
}
