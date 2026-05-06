import { apiClient } from './apiClient';

let currentUserId = 1;

export const appointmentController = {
  getCurrentUser: () => ({ userId: currentUserId, fullName: currentUserId === 1 ? 'Toàn' : currentUserId === 2 ? 'Sơn' : 'Dũng' }),
  setCurrentUser: (id: number) => { currentUserId = id; },
  getAllUsers: () => [
    { userId: 1, fullName: 'Toàn' },
    { userId: 2, fullName: 'Sơn' },
    { userId: 3, fullName: 'Dũng' }
  ],

  listAppointments: async () => {
    const data = await apiClient.get('/appointments', { userId: currentUserId });
    return data.map((app: any) => ({
      ...app,
      startTime: new Date(app.startTime),
      endTime: new Date(app.endTime),
      reminders: app.reminders?.map((r: any) => ({ ...r, remindAt: new Date(r.remindAt) })) ?? []
    }));
  },

  getAppointmentDetails: async (id: number) => {
    return apiClient.get(`/appointments/${id}`);
  },

  // Calendar.findConflictingAppointment()
  checkConflict: async (startTime: Date, endTime: Date) => {
    return apiClient.post('/appointments/check-conflict', { userId: currentUserId, startTime, endTime });
  },

  // Calendar.findMatchingGroupMeeting()
  checkGroupMeeting: async (title: string, startTime: Date, endTime: Date) => {
    return apiClient.post('/appointments/check-group-meeting', { userId: currentUserId, title, startTime, endTime });
  },

  // Calendar.createAppointment() + for-loop addReminder() + addAppointment()
  createAppointment: async (title: string, location: string, startTime: Date, endTime: Date, reminders: { remindAt: Date; method: string }[], isGroupMeeting: boolean) => {
    return apiClient.post('/appointments/create', { userId: currentUserId, title, location, startTime, endTime, reminders, isGroupMeeting });
  },

  // Calendar.replaceAppointment()
  replaceAppointment: async (conflictIds: number[], title: string, location: string, startTime: Date, endTime: Date, reminders: { remindAt: Date; method: string }[], isGroupMeeting: boolean) => {
    return apiClient.post('/appointments/replace', { userId: currentUserId, conflictIds, title, location, startTime, endTime, reminders, isGroupMeeting });
  },

  // Calendar.joinGroupMeeting()
  joinGroupMeeting: async (meetingId: number) => {
    return apiClient.post('/appointments/join', { userId: currentUserId, meetingId });
  }
};
