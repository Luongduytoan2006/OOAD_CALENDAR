import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Plus, UserCircle, BellRing } from 'lucide-react';
import { Appointment } from '../models/Appointment';
import { AddAppointmentForm } from '../models/AddAppointmentForm';
import { buildMonthGrid } from '../utils/appointmentUtils';
import { formatMonthLabel, formatTime, isSameDay } from '../utils/dateUtils';
import { AddAppointmentFormModal } from '../components/AddAppointmentFormModal';
import { ConflictWarningModal } from '../components/ConflictWarningModal';
import { GroupMeetingSuggestionModal } from '../components/GroupMeetingSuggestionModal';
import { ViewAppointmentDetailsModal } from '../components/ViewAppointmentDetailsModal';
import { NotificationBox, NotificationType } from '../components/NotificationBox';
import { appointmentController } from '../container';
import { User } from '../models/User';

export function CalendarPage(): React.JSX.Element {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(() => appointmentController.getCurrentUser());
  const [allUsers] = useState<User[]>(() => appointmentController.getAllUsers());
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [conflictData, setConflictData] = useState<any[] | null>(null);
  const [suggestionMeetings, setSuggestionMeetings] = useState<any[]>([]);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  // Notification box state
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  const notify = useCallback((type: NotificationType, message: string) => setNotification({ type, message }), []);

  const today = new Date();

  const loadAppointments = async (): Promise<void> => {
    const data = await appointmentController.listAppointments();
    setAppointments(data);
  };

  useEffect(() => { void loadAppointments(); }, [currentUser]);

  const notifiedReminders = useRef<Set<number>>(new Set());
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      appointments.forEach((app) => {
        app.reminders?.forEach((reminder) => {
          if (notifiedReminders.current.has(reminder.reminderId)) return;
          const diffMs = reminder.remindAt.getTime() - now.getTime();
          if (diffMs <= 0 && diffMs > -120000) {
            notify('info', `"${app.title}" sắp diễn ra! (${reminder.method} - ${formatTime(app.startTime)})`);
            notifiedReminders.current.add(reminder.reminderId);
          }
        });
      });
    }, 10000);
    return () => clearInterval(intervalId);
  }, [appointments, notify]);

  const monthGrid = useMemo(() => buildMonthGrid(displayMonth, appointments), [appointments, displayMonth]);

  const handleSwitchUser = (userId: number): void => {
    appointmentController.setCurrentUser(userId);
    setCurrentUser(appointmentController.getCurrentUser());
  };

  const openAddModalAt = (date: Date): void => {
    const slot = new Date(date);
    const now = new Date();
    if (isSameDay(slot, now)) slot.setHours(now.getHours() + 1, 0, 0, 0);
    else slot.setHours(9, 0, 0, 0);
    setSelectedSlot(slot);
    setShowAddModal(true);
  };

  const handleShowDetails = async (app: Appointment): Promise<void> => {
    if (app.isGroupMeeting) {
      const details = await appointmentController.getAppointmentDetails(app.appointmentId);
      setSelectedAppointment({ ...details, startTime: new Date(details.startTime), endTime: new Date(details.endTime) });
      return;
    }
    setSelectedAppointment(app);
  };

  // Convert (days/hours/minutes) → { remindAt, method }
  const buildReminders = (startTime: Date, offsets: { days: number; hours: number; minutes: number }[]): { remindAt: Date; method: string }[] => {
    return offsets.map((r) => {
      const remindAt = new Date(startTime);
      remindAt.setDate(remindAt.getDate() - r.days);
      remindAt.setHours(remindAt.getHours() - r.hours);
      remindAt.setMinutes(remindAt.getMinutes() - r.minutes);
      const parts: string[] = [];
      if (r.days > 0) parts.push(`${r.days} ngày`);
      if (r.hours > 0) parts.push(`${r.hours} giờ`);
      if (r.minutes > 0) parts.push(`${r.minutes} phút`);
      const method = parts.length > 0 ? parts.join(' ') + ' trước' : 'khi bắt đầu';
      return { remindAt, method };
    });
  };

  // Submit create appointment
  const handleFormSubmit = async (title: string, location: string, startTime: Date, endTime: Date, reminderOffsets: { days: number; hours: number; minutes: number }[], isGroupMeeting: boolean): Promise<void> => {
    const form = new AddAppointmentForm(startTime, title, location, startTime, endTime, reminderOffsets);
    const validation = form.validateInput();
    if (!validation.isValid) {
      notify('error', validation.error!);
      return;
    }

    const reminders = buildReminders(startTime, reminderOffsets);
    const formData = { title, location, startTime, endTime, reminders, isGroupMeeting };
    setPendingFormData(formData);

    const conflictResult = await appointmentController.checkConflict(startTime, endTime);
    if (conflictResult.hasConflict) {
      setConflictData(conflictResult.conflicts);
      return;
    }

    const groupResult = await appointmentController.checkGroupMeeting(title, startTime, endTime);
    if (groupResult.hasMatch) {
      setSuggestionMeetings(groupResult.meetings);
      return;
    }

    await appointmentController.createAppointment(title, location, startTime, endTime, reminders, isGroupMeeting);
    notify('success', 'Thêm lịch hẹn thành công!');
    setShowAddModal(false);
    setPendingFormData(null);
    await loadAppointments();
  };

  // Replace appointment
  const handleReplace = async (): Promise<void> => {
    if (!pendingFormData || !conflictData) return;
    const { title, location, startTime, endTime, reminders, isGroupMeeting } = pendingFormData;
    const conflictIds = conflictData.map((c: any) => c.appointmentId);
    await appointmentController.replaceAppointment(conflictIds, title, location, startTime, endTime, reminders, isGroupMeeting);
    notify('success', 'Đã thay thế lịch hẹn cũ!');
    setConflictData(null);
    setShowAddModal(false);
    setPendingFormData(null);
    await loadAppointments();
  };

  // Join group meeting
  const handleJoinMeeting = async (meetingId: number): Promise<void> => {
    await appointmentController.joinGroupMeeting(meetingId);
    notify('success', 'Đã tham gia cuộc họp nhóm!');
    setSuggestionMeetings([]);
    setShowAddModal(false);
    setPendingFormData(null);
    await loadAppointments();
  };

  // Create appointment anyway
  const handleCreateAnyway = async (): Promise<void> => {
    if (!pendingFormData) return;
    const { title, location, startTime, endTime, reminders, isGroupMeeting } = pendingFormData;
    await appointmentController.createAppointment(title, location, startTime, endTime, reminders, isGroupMeeting);
    notify('success', 'Thêm lịch hẹn thành công!');
    setSuggestionMeetings([]);
    setShowAddModal(false);
    setPendingFormData(null);
    await loadAppointments();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-6 p-8 min-h-screen">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="bg-green-900 p-3 rounded-2xl text-white shadow-lg"><BellRing size={28} /></div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-green-900 uppercase">Calendar Appointment</h1>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">{formatMonthLabel(displayMonth)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-gray-100">
            <UserCircle size={20} className="text-green-800" />
            <span className="text-sm font-bold text-gray-700">{currentUser.fullName}</span>
          </div>
          <div className="flex gap-1">
            {allUsers.map((user) => (
              <button key={user.userId} onClick={() => handleSwitchUser(user.userId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${currentUser.userId === user.userId ? 'bg-green-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                {user.fullName}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))} className="p-2 rounded-full border border-gray-100 bg-white text-green-900 hover:bg-green-50 transition-colors shadow-sm">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <button type="button" onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))} className="p-2 rounded-full border border-gray-100 bg-white text-green-900 hover:bg-green-50 transition-colors shadow-sm">
            <ChevronRight size={20} />
          </button>
          <button type="button" onClick={() => setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1))} className="px-6 py-2 rounded-xl border border-gray-100 bg-white text-sm font-bold text-green-900 hover:bg-green-50 transition-colors shadow-sm">
            Hôm nay
          </button>
        </div>
        <button type="button" onClick={() => openAddModalAt(new Date())} className="flex items-center gap-2 rounded-2xl bg-green-900 px-8 py-3 text-sm font-black text-white shadow-xl shadow-green-100 transition-all hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0">
          <Plus size={18} strokeWidth={3} /> Tạo lịch mới
        </button>
      </div>

      <div className="flex-1 overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl">
        <div className="grid grid-cols-7 border-b border-gray-50 bg-green-900/5">
          {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((day) => (
            <div key={day} className="py-4 text-center text-[10px] font-black tracking-widest text-green-900/40">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {monthGrid.map((cell) => {
            const isToday = isSameDay(cell.date, today);
            return (
              <div key={cell.date.toISOString()} className={`group relative min-h-[140px] border-b border-r border-gray-50 p-3 transition-colors hover:bg-green-50/20 ${!cell.isCurrentMonth ? 'bg-gray-50/30 opacity-40' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black ${isToday ? 'bg-green-900 text-white shadow-lg shadow-green-200' : cell.isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}`}>
                    {cell.date.getDate()}
                  </span>
                  {cell.isCurrentMonth && (
                    <button type="button" onClick={() => openAddModalAt(cell.date)} className="opacity-0 group-hover:opacity-100 p-1 text-green-900 hover:bg-green-100 rounded-lg transition-all">
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {cell.appointments.map((appointment) => {
                    const isGroup = appointment.isGroupMeeting;
                    const ownerName = (appointment as any).owner?.fullName;
                    const isOther = isGroup && appointment.ownerId !== currentUser.userId;
                    return (
                      <div key={appointment.appointmentId} onClick={() => handleShowDetails(appointment)}
                        className={`flex flex-col gap-0.5 rounded-xl p-2 text-[10px] font-bold shadow-sm transition-all border cursor-pointer hover:scale-[1.02] active:scale-95 ${isGroup ? 'bg-green-50 border-green-100 text-green-900 hover:bg-green-100' : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-200'}`}>
                        <span className="truncate">{appointment.title}</span>
                        <span className="text-[9px] opacity-60">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                        {isGroup && ownerName && isOther && (
                          <span className="text-[8px] text-green-700 opacity-70">của {ownerName}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && <AddAppointmentFormModal defaultDate={selectedSlot} onClose={() => { setShowAddModal(false); setPendingFormData(null); }} onSubmit={handleFormSubmit} />}
      {conflictData && <ConflictWarningModal conflicts={conflictData} onReplace={handleReplace} onCancel={() => { setConflictData(null); setPendingFormData(null); }} />}
      {suggestionMeetings.length > 0 && <GroupMeetingSuggestionModal meetings={suggestionMeetings} onJoin={handleJoinMeeting} onCreateAnyway={handleCreateAnyway} onClose={() => { setSuggestionMeetings([]); setPendingFormData(null); }} />}
      {selectedAppointment && <ViewAppointmentDetailsModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />}
      {notification && <NotificationBox type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
    </div>
  );
}
