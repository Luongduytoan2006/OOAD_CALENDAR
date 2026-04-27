import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { GroupMeetingService } from '../services/GroupMeetingService';
import { UserService } from '../services/UserService';
import { AddAppointmentDecision } from '../models/types';

export class AppointmentController {
  constructor(
    private appointmentService: AppointmentService,
    private groupMeetingService: GroupMeetingService,
    private userService: UserService
  ) {}

  async listAppointments(req: Request, res: Response, next: any) {
    try {
      const userId = parseInt(req.query.userId as string || '0');
      const appointments = await this.appointmentService.getUserAppointments(userId);
      res.json(appointments);
    } catch (err) { next(err); }
  }

  async getAppointmentDetails(req: Request, res: Response, next: any) {
    try {
      const id = parseInt(req.params.id as string);
      const details = await this.appointmentService.getDetails(id);
      if (!details) return res.status(404).send('Not found');
      res.json(details);
    } catch (err) { next(err); }
  }

  async createAppointment(req: Request, res: Response, next: any) {
    try {
      const { userId, request, decision }: { userId: number, request: any, decision: AddAppointmentDecision } = req.body;
      
      request.startTime = new Date(request.startTime);
      request.endTime = new Date(request.endTime);

      // 1. Validation
      if (!request.title.trim()) {
        return res.json({ status: 'INVALID', message: 'Tiêu đề không được để trống.' });
      }
      if (request.endTime <= request.startTime) {
        return res.json({ status: 'INVALID', message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu.' });
      }

      const durationMs = request.endTime.getTime() - request.startTime.getTime();

      // 2. Logic: Group Meeting Suggestions
      if (!decision?.joinMeetingId && !decision?.createAnyway) {
        const matches = await this.groupMeetingService.findSuggestions(request.title, durationMs);
        if (matches.length > 0) {
          return res.json({
            status: 'GROUP_MEETING_SUGGESTION',
            message: `Tìm thấy ${matches.length} cuộc họp nhóm tương tự. Bạn có muốn tham gia không?`,
            matchingGroupMeetings: matches
          });
        }
      }

      // 3. Logic: Join Group Meeting
      if (decision?.joinMeetingId) {
        await this.groupMeetingService.requestJoin(userId, decision.joinMeetingId);
        return res.json({ status: 'JOINED_GROUP_MEETING', message: 'Đã gửi yêu cầu tham gia.' });
      }

      // 4. Logic: Personal Conflicts
      const conflict = await this.appointmentService.checkPersonalConflict(userId, request.startTime, request.endTime);
      if (conflict && !decision?.replaceConflict) {
        return res.json({
          status: 'CONFLICT',
          message: 'Bạn đã có lịch khác trong khung giờ này.',
          conflictingAppointment: conflict
        });
      }

      // 5. Logic: Finalize Save/Replace
      if (conflict && decision?.replaceConflict) {
        await this.appointmentService.replaceAppointment(conflict.appointmentId, userId, request);
        return res.json({ status: 'REPLACED', message: 'Đã thay thế cuộc hẹn cũ.' });
      } else {
        if (request.isGroupMeeting) {
          await this.appointmentService.createGroup(userId, request);
        } else {
          await this.appointmentService.createPersonal(userId, request);
        }
        return res.json({ status: 'SUCCESS', message: 'Thêm cuộc hẹn thành công.' });
      }
    } catch (err) { next(err); }
  }

  async approveJoinRequest(req: Request, res: Response, next: any) {
    try {
      const { ownerId, meetingId, userId } = req.body;
      await this.groupMeetingService.approveUser(ownerId, meetingId, userId);
      res.sendStatus(200);
    } catch (err) { next(err); }
  }

  async rejectJoinRequest(req: Request, res: Response, next: any) {
    try {
      const { ownerId, meetingId, userId } = req.body;
      await this.groupMeetingService.rejectUser(ownerId, meetingId, userId);
      res.sendStatus(200);
    } catch (err) { next(err); }
  }

  async listUsers(_req: Request, res: Response, next: any) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (err) { next(err); }
  }
}
