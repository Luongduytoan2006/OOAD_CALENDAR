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
    const appointments = await apiClient.get('/appointments', { userId: currentUserId });
    // Chuyển đổi string sang Date object để tránh crash UI
    return appointments.map((app: any) => ({
      ...app,
      startTime: new Date(app.startTime),
      endTime: new Date(app.endTime)
    }));
  },
  getAppointmentDetails: async (id: number) => {
    return apiClient.get(`/appointments/${id}`);
  },
  createAppointment: async (request: any, decision: any) => {
    return apiClient.post('/appointments', { userId: currentUserId, request, decision });
  },
  approveRequest: async (meetingId: number, user: any) => {
    return apiClient.post('/approve', { ownerId: currentUserId, meetingId, userId: user.userId });
  },
  rejectRequest: async (meetingId: number, user: any) => {
    return apiClient.post('/reject', { ownerId: currentUserId, meetingId, userId: user.userId });
  }
};
