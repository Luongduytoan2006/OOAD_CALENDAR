import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { ReminderMethod } from '../models/Reminder';
import { AddAppointmentRequest } from '../models/types';
import { buildDateTime } from '../utils/dateUtils';

interface AddAppointmentFormModalProps {
  defaultDate: Date;
  onClose: () => void;
  onSubmit: (request: AddAppointmentRequest) => Promise<void>;
}

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function AddAppointmentFormModal({
  defaultDate,
  onClose,
  onSubmit,
}: AddAppointmentFormModalProps): React.JSX.Element {
  const defaultEnd = useMemo(() => new Date(defaultDate.getTime() + 60 * 60 * 1000), [defaultDate]);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(toDateValue(defaultDate));
  const [startTime, setStartTime] = useState(toTimeValue(defaultDate));
  const [endTime, setEndTime] = useState(toTimeValue(defaultEnd));
  const [reminders, setReminders] = useState<ReminderMethod[]>([ReminderMethod.Popup]);
  const [submitting, setSubmitting] = useState(false);

  const toggleReminder = (method: ReminderMethod): void => {
    setReminders((current) =>
      current.includes(method) ? current.filter((item) => item !== method) : [...current, method],
    );
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const request: AddAppointmentRequest = {
        title,
        location,
        startTime: buildDateTime(date, startTime),
        endTime: buildDateTime(date, endTime),
        reminderMethods: reminders,
      };

      await onSubmit(request);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
          <h3 className="text-xl font-bold text-gray-800">Add Appointment</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100">
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-8">
          <form id="add-appointment-form" className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Appointment Name</label>
              <input
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Nhập tên cuộc hẹn"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#3525cd] focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="space-y-2">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</label>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="VD: Phòng họp A2"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#3525cd] focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#3525cd] focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="space-y-2">
                <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Start</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#3525cd] focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="space-y-2">
                <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">End</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#3525cd] focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Reminders</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {Object.values(ReminderMethod).map((method) => {
                  const checked = reminders.includes(method);
                  return (
                    <label
                      key={method}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                        checked ? 'border-indigo-200 bg-indigo-50 text-[#3525cd]' : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleReminder(method)}
                        className="accent-[#3525cd]"
                      />
                      {method}
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-4 border-t border-gray-100 bg-gray-50/50 px-8 py-6">
          <button
            onClick={onClose}
            className="rounded-2xl px-8 py-3 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="add-appointment-form"
            disabled={submitting}
            className="rounded-2xl bg-[#3525cd] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#2a1da3] active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Đang xử lý...' : 'Thêm cuộc hẹn'}
          </button>
        </div>
      </div>
    </div>
  );
}
