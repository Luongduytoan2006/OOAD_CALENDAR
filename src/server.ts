import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppointmentController } from './controllers/AppointmentController';
import { AppointmentService } from './services/AppointmentService';
import { GroupMeetingService } from './services/GroupMeetingService';
import { UserService } from './services/UserService';
import { AppointmentRepository } from './repositories/AppointmentRepository';
import { GroupMeetingRepository } from './repositories/GroupMeetingRepository';
import { UserRepository } from './repositories/UserRepository';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Repositories
const userRepo = new UserRepository();
const appRepo = new AppointmentRepository();
const gmRepo = new GroupMeetingRepository();

// Services
const userService = new UserService(userRepo);
const appService = new AppointmentService(appRepo, gmRepo);
const gmService = new GroupMeetingService(gmRepo);

// Controller
const controller = new AppointmentController(appService, gmService, userService);

// API Routes
app.get('/api/users', (req, res, next) => controller.listUsers(req, res, next));
app.get('/api/appointments', (req, res, next) => controller.listAppointments(req, res, next));
app.get('/api/appointments/:id', (req, res, next) => controller.getAppointmentDetails(req, res, next));
app.post('/api/appointments', (req, res, next) => controller.createAppointment(req, res, next));
app.post('/api/approve', (req, res, next) => controller.approveJoinRequest(req, res, next));
app.post('/api/reject', (req, res, next) => controller.rejectJoinRequest(req, res, next));

// Error handling
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ status: 'ERROR', message: err.message });
});

const port = process.env.PORT || 3601;
app.listen(port, () => {
  console.log(`🚀 Backend API running at http://localhost:${port}`);
});
