import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { Appointment } from '../models/Appointment';
import { AddAppointmentDecision, AddAppointmentRequest } from '../models/types';
import { buildMonthGrid } from '../utils/appointmentUtils';
import { formatMonthLabel, formatTime, isSameDay } from '../utils/dateUtils';
import { AddAppointmentFormModal } from './AddAppointmentFormModal';
import { appointmentController } from './container';

export function CalendarPage(): React.JSX.Element {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date>(new Date());

  const today = new Date();

  const loadAppointments = async (): Promise<void> => {
    const data = await appointmentController.listAppointments();
    setAppointments(data);
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const monthGrid = useMemo(() => buildMonthGrid(displayMonth, appointments), [appointments, displayMonth]);

  const openAddModalAt = (date: Date): void => {
    const slot = new Date(date);
    slot.setHours(9, 0, 0, 0);
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

      if (!replace) {
        alert('Vui lòng chọn thời gian khác để tránh trùng lịch.');
        return;
      }

      await processAppointmentFlow(request, { ...decision, replaceConflict: true });
      return;
    }

    if (result.status === 'GROUP_MEETING_SUGGESTION') {
      const join = window.confirm(
        `${result.message}\n\nNhóm: ${result.matchingGroupMeeting?.title} tại ${result.matchingGroupMeeting?.location}`,
      );

      await processAppointmentFlow(request, { ...decision, joinGroupMeeting: join });
      return;
    }

    alert(result.message);
    setShowAddModal(false);
    await loadAppointments();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-800">{formatMonthLabel(displayMonth)}</h2>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Giao diện tham chiếu từ PBL3 + nghiệp vụ Add Calendar Appointment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1))}
              className="border-r border-gray-200 p-2.5 text-gray-500 hover:bg-gray-50"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1))}
              className="p-2.5 text-gray-500 hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Hôm nay
          </button>

          <button
            type="button"
            onClick={() => openAddModalAt(new Date())}
            className="flex items-center gap-2 rounded-xl bg-[#3525cd] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#2a1da3]"
          >
            <Plus size={16} />
            Add Appointment
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-50 bg-gray-50/50">
          {['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'].map((day) => (
            <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthGrid.map((cell) => {
            const isToday = isSameDay(cell.date, today);

            return (
              <button
                key={cell.date.toISOString()}
                type="button"
                onClick={() => openAddModalAt(cell.date)}
                className={`group relative min-h-[140px] border-b border-r border-gray-50 p-2 text-left transition-colors hover:bg-gray-50/30 ${
                  !cell.isCurrentMonth ? 'bg-gray-50/20' : ''
                }`}
              >
                <span
                  className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isToday
                      ? 'bg-[#3525cd] text-white shadow-lg shadow-indigo-200'
                      : cell.isCurrentMonth
                        ? 'text-gray-800'
                        : 'text-gray-300'
                  }`}
                >
                  {cell.date.getDate()}
                </span>

                <div className="space-y-1">
                  {cell.appointments.map((appointment) => {
                    const isPast = appointment.endTime.getTime() < today.getTime();
                    return (
                      <div
                        key={appointment.appointmentId}
                        className={`truncate rounded-lg px-2 py-1.5 text-[10px] font-bold text-white shadow-sm ${
                          isPast ? 'bg-green-500' : 'bg-indigo-500'
                        }`}
                      >
                        {appointment.title} ({formatTime(appointment.startTime)})
                      </div>
                    );
                  })}
                </div>
              </button>
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
    </div>
  );
}
