import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Plus, UserCircle, BellRing } from 'lucide-react';
import { Appointment } from '../models/Appointment';
import { GroupMeeting } from '../models/GroupMeeting';
import { AddAppointmentDecision, AddAppointmentRequest } from '../models/types';
import { buildMonthGrid } from '../utils/appointmentUtils';
import { formatMonthLabel, formatTime, isSameDay } from '../utils/dateUtils';
import { AddAppointmentFormModal } from './AddAppointmentFormModal';
import { PendingRequestsModal } from './PendingRequestsModal';
import { appointmentController } from './container';
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
  
  const [pendingMeeting, setPendingMeeting] = useState<GroupMeeting | null>(null);

  const today = new Date();

  const loadAppointments = async (): Promise<void> => {
    const data = await appointmentController.listAppointments();
    setAppointments(data);
  };

  useEffect(() => {
    void loadAppointments();
  }, [currentUser]);

  const monthGrid = useMemo(() => buildMonthGrid(displayMonth, appointments), [appointments, displayMonth]);

  const handleSwitchUser = (userId: number): void => {
    appointmentController.setCurrentUser(userId);
    setCurrentUser(appointmentController.getCurrentUser());
  };

  const openAddModalAt = (date: Date): void => {
    const slot = new Date(date);
    const now = new Date();
    if (slot.getDate() === now.getDate() && slot.getMonth() === now.getMonth()) {
      slot.setHours(now.getHours() + 1, 0, 0, 0);
    } else {
      slot.setHours(9, 0, 0, 0);
    }
    setSelectedSlot(slot);
    setShowAddModal(true);
  };

  const processAppointmentFlow = async (
    request: AddAppointmentRequest,
    decision: AddAppointmentDecision = {},
  ): Promise<void> => {
    const result = await appointmentController.createAppointment(request, decision);

    if (result.status === 'INVALID') {
      alert(result.message);
      return;
    }

    if (result.status === 'CONFLICT') {
      const replace = window.confirm(
        `${result.message}\n\nBạn có muốn thay thế cuộc hẹn cũ (${result.conflictingAppointment?.title}) không?`,
      );

      if (!replace) return;
      await processAppointmentFlow(request, { ...decision, replaceConflict: true });
      return;
    }

    if (result.status === 'GROUP_MEETING_SUGGESTION') {
      const join = window.confirm(result.message);
      if (join) {
        await processAppointmentFlow(request, { ...decision, joinGroupMeeting: true });
      } else {
        await processAppointmentFlow(request, { ...decision, joinGroupMeeting: false });
      }
      return;
    }

    alert(result.message);
    setShowAddModal(false);
    await loadAppointments();
  };

  const handleApprove = async (userId: number): Promise<void> => {
    if (!pendingMeeting) return;
    const user = pendingMeeting.pendingRequests.find(u => u.userId === userId);
    if (user) {
      await appointmentController.approveRequest(pendingMeeting.appointmentId, user);
      await loadAppointments();
      setPendingMeeting({ ...pendingMeeting } as GroupMeeting); // Refresh local state
    }
  };

  const handleReject = async (userId: number): Promise<void> => {
    if (!pendingMeeting) return;
    const user = pendingMeeting.pendingRequests.find(u => u.userId === userId);
    if (user) {
      await appointmentController.rejectRequest(pendingMeeting.appointmentId, user);
      await loadAppointments();
      setPendingMeeting({ ...pendingMeeting } as GroupMeeting);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-6 p-8 min-h-screen">
      {/* Header & User Switcher */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="bg-green-900 p-3 rounded-2xl text-white shadow-lg">
            <BellRing size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-green-900 uppercase">Calendar</h1>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">{formatMonthLabel(displayMonth)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-gray-100">
            <UserCircle size={20} className="text-green-800" />
            <span className="text-sm font-bold text-gray-700">{currentUser.fullName}</span>
          </div>
          <div className="flex gap-1">
            {allUsers.map(user => (
              <button
                key={user.userId}
                onClick={() => handleSwitchUser(user.userId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentUser.userId === user.userId 
                    ? 'bg-green-900 text-white shadow-md' 
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {user.fullName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))}
            className="p-2 rounded-full border border-gray-100 bg-white text-green-900 hover:bg-green-50 transition-colors shadow-sm"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))}
            className="p-2 rounded-full border border-gray-100 bg-white text-green-900 hover:bg-green-50 transition-colors shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
          <button
            type="button"
            onClick={() => setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-6 py-2 rounded-xl border border-gray-100 bg-white text-sm font-bold text-green-900 hover:bg-green-50 transition-colors shadow-sm"
          >
            Hôm nay
          </button>
        </div>

        <button
          type="button"
          onClick={() => openAddModalAt(new Date())}
          className="flex items-center gap-2 rounded-2xl bg-green-900 px-8 py-3 text-sm font-black text-white shadow-xl shadow-green-100 transition-all hover:bg-green-800 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={18} strokeWidth={3} />
          TẠO LỊCH MỚI
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl">
        <div className="grid grid-cols-7 border-b border-gray-50 bg-green-900/5">
          {['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CN'].map((day) => (
            <div key={day} className="py-4 text-center text-[10px] font-black tracking-widest text-green-900/40">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthGrid.map((cell) => {
            const isToday = isSameDay(cell.date, today);

            return (
              <div
                key={cell.date.toISOString()}
                className={`group relative min-h-[140px] border-b border-r border-gray-50 p-3 transition-colors hover:bg-green-50/20 ${
                  !cell.isCurrentMonth ? 'bg-gray-50/30 opacity-40' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black ${
                      isToday
                        ? 'bg-green-900 text-white shadow-lg shadow-green-200'
                        : cell.isCurrentMonth
                          ? 'text-gray-800'
                          : 'text-gray-300'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  
                  {cell.isCurrentMonth && (
                    <button 
                      onClick={() => openAddModalAt(cell.date)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-green-900 hover:bg-green-100 rounded-lg transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {cell.appointments.map((appointment) => {
                    const isGroup = appointment instanceof GroupMeeting;
                    const isOwner = isGroup && (appointment as GroupMeeting).ownerId === currentUser.userId;
                    const hasPending = isGroup && (appointment as GroupMeeting).pendingRequests.length > 0;

                    return (
                      <div
                        key={appointment.appointmentId}
                        className={`group/item relative flex flex-col gap-1 rounded-xl p-2 text-[10px] font-bold shadow-sm transition-all border ${
                          isGroup 
                            ? 'bg-green-50 border-green-100 text-green-900' 
                            : 'bg-white border-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate">{appointment.title}</span>
                          {isOwner && hasPending && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingMeeting(appointment as GroupMeeting);
                              }}
                              className="bg-orange-500 text-white px-1.5 py-0.5 rounded-md animate-pulse text-[8px]"
                            >
                              DUYỆT
                            </button>
                          )}
                        </div>
                        <span className="text-[9px] opacity-60">{formatTime(appointment.startTime)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <AddAppointmentFormModal
          defaultDate={selectedSlot}
          onClose={() => setShowAddModal(false)}
          onSubmit={processAppointmentFlow}
        />
      )}

      {pendingMeeting && (
        <PendingRequestsModal
          meetingId={pendingMeeting.appointmentId}
          meetingTitle={pendingMeeting.title}
          requests={pendingMeeting.pendingRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setPendingMeeting(null)}
        />
      )}
    </div>
  );
}
