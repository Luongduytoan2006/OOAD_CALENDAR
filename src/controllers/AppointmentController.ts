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
      const userId = parseInt((req.query.userId as string) || '0');
      const appointments = await this.appointmentService.getUserAppointments(userId);
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  }

  async getAppointmentDetails(req: Request, res: Response, next: any) {
    try {
      const id = parseInt(req.params.id as string);
      const details = await this.appointmentService.getDetails(id);

      if (!details) {
        return res.status(404).send('Not found');
      }

      if (details.isGroupMeeting) {
        const groupDetails = await this.groupMeetingService.getMeetingDetails(id);
        return res.json(groupDetails ?? details);
      }

      return res.json(details);
    } catch (err) {
      next(err);
    }
  }

  async createAppointment(req: Request, res: Response, next: any) {
    try {
      const {
        userId,
        request,
        decision,
      }: {
        userId: number;
        request: any;
        decision: AddAppointmentDecision;
      } = req.body;

      request.startTime = new Date(request.startTime);
      request.endTime = new Date(request.endTime);

      if (!request.title || !request.title.trim()) {
        return res.json({
          status: 'INVALID',
          message: 'Tên cuộc hẹn không được để trống.',
        });
      }

      if (request.endTime <= request.startTime) {
        return res.json({
          status: 'INVALID',
          message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu.',
        });
      }

      const durationMs = request.endTime.getTime() - request.startTime.getTime();

      const conflict = await this.appointmentService.checkPersonalConflict(
        userId,
        request.startTime,
        request.endTime,
      );

      if (conflict && !decision?.replaceConflict) {
        return res.json({
          status: 'CONFLICT',
          message:
            'Bạn đã có appointment trong khung giờ này. Hãy chọn thời gian khác hoặc thay thế appointment cũ.',
          conflictingAppointment: conflict,
        });
      }

      if (conflict && decision?.replaceConflict) {
        await this.appointmentService.replaceAppointment(
          conflict.appointmentId,
          userId,
          request,
        );

        return res.json({
          status: 'REPLACED',
          message: 'Appointment cũ đã được thay thế.',
        });
      }

      if (!decision?.joinMeetingId && !decision?.createAnyway) {
        const matches = await this.groupMeetingService.findSuggestions(
        userId,
        request.title,
        request.startTime,
        request.endTime,
      );

        if (matches.length > 0) {
          return res.json({
            status: 'GROUP_MEETING_SUGGESTION',
            message:
              'Có group meeting cùng tên và cùng thời lượng. Bạn có muốn tham gia group meeting này thay vì tạo appointment riêng không?',
            matchingGroupMeetings: matches,
          });
        }
      }

      if (decision?.joinMeetingId) {
        await this.groupMeetingService.joinMeeting(userId, decision.joinMeetingId);

        return res.json({
          status: 'JOINED_GROUP_MEETING',
          message: 'Đã tham gia group meeting.',
        });
      }

      if (request.isGroupMeeting) {
        await this.appointmentService.createGroup(userId, request);
      } else {
        await this.appointmentService.createPersonal(userId, request);
      }

      return res.json({
        status: 'SUCCESS',
        message: 'Thêm appointment thành công.',
      });
    } catch (err) {
      next(err);
    }
  }

  async approveJoinRequest(req: Request, res: Response, next: any) {
    try {
      const { ownerId, meetingId, userId } = req.body;
      await this.groupMeetingService.approveUser(ownerId, meetingId, userId);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }

  async rejectJoinRequest(req: Request, res: Response, next: any) {
    try {
      const { ownerId, meetingId, userId } = req.body;
      await this.groupMeetingService.rejectUser(ownerId, meetingId, userId);
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }

  async listUsers(_req: Request, res: Response, next: any) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
}