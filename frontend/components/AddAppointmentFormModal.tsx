import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlignLeft,
  BellRing,
  Users,
  Plus,
  Trash2,
} from 'lucide-react';
import { ReminderInput } from '../models/AddAppointmentForm';

interface AddAppointmentFormModalProps {
  defaultDate: Date;
  onClose: () => void;
  onSubmit: (title: string, location: string, startTime: Date, endTime: Date, reminders: ReminderInput[], isGroupMeeting: boolean) => Promise<void>;
}

export function AddAppointmentFormModal({
  defaultDate,
  onClose,
  onSubmit,
}: AddAppointmentFormModalProps): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [isGroupMeeting, setIsGroupMeeting] = useState(false);
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminders, setReminders] = useState<ReminderInput[]>([]);

  const [startTime, setStartTime] = useState(() => {
    const d = new Date(defaultDate);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  });

  const [endTime, setEndTime] = useState(() => {
    const d = new Date(defaultDate);
    d.setHours(d.getHours() + 1);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  });

  const [date, setDate] = useState(() => {
    const d = new Date(defaultDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const addReminder = (): void => {
    setReminders([...reminders, { days: 0, hours: 1, minutes: 0 }]);
  };

  const removeReminder = (index: number): void => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const updateReminder = (index: number, field: keyof ReminderInput, value: number): void => {
    const updated = [...reminders];
    updated[index] = { ...updated[index], [field]: value };
    setReminders(updated);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const start = new Date(date);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(date);
    end.setHours(endH, endM, 0, 0);

    void onSubmit(title, location, start, end, enableReminder ? reminders : [], isGroupMeeting);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-green-900 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <CalendarIcon size={24} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Tạo cuộc hẹn mới
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-900/60 font-bold text-[10px] uppercase tracking-widest px-1">
              <AlignLeft size={14} />
              Tiêu đề cuộc hẹn
            </div>

            <input
              type="text"
              required
              placeholder="Ví dụ: Họp Sprint, Ăn trưa..."
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-green-900/20 focus:bg-white focus:ring-4 focus:ring-green-900/5 transition-all outline-none font-bold text-gray-800 placeholder:text-gray-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer rounded-2xl bg-green-50 border border-green-100 p-4">
            <input
              type="checkbox"
              className="w-5 h-5 rounded-lg border-2 border-green-200 text-green-900 focus:ring-green-900/10"
              checked={isGroupMeeting}
              onChange={(e) => setIsGroupMeeting(e.target.checked)}
            />

            <div className="flex items-center gap-2">
              <Users size={18} className="text-green-900" />
              <span className="text-sm font-black text-green-900">
                Đây là group meeting
              </span>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-900/60 font-bold text-[10px] uppercase tracking-widest px-1">
                <CalendarIcon size={14} />
                Ngày diễn ra
              </div>

              <input
                type="date"
                required
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-green-900/20 focus:bg-white transition-all outline-none font-bold text-gray-800"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-900/60 font-bold text-[10px] uppercase tracking-widest px-1">
                <MapPin size={14} />
                Địa điểm
              </div>

              <input
                type="text"
                placeholder="Phòng họp, Online..."
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-green-900/20 focus:bg-white transition-all outline-none font-bold text-gray-800 placeholder:text-gray-300"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-900/60 font-bold text-[10px] uppercase tracking-widest px-1">
                <Clock size={14} />
                Bắt đầu
              </div>

              <input
                type="time"
                required
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-green-900/20 focus:bg-white transition-all outline-none font-bold text-gray-800"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-900/60 font-bold text-[10px] uppercase tracking-widest px-1">
                <Clock size={14} />
                Kết thúc
              </div>

              <input
                type="time"
                required
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-green-900/20 focus:bg-white transition-all outline-none font-bold text-gray-800"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Reminder section */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer rounded-2xl bg-amber-50 border border-amber-100 p-4">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-lg border-2 border-amber-200 text-amber-600 focus:ring-amber-500/10"
                checked={enableReminder}
                onChange={(e) => {
                  setEnableReminder(e.target.checked);
                  if (!e.target.checked) setReminders([]);
                }}
              />
              <div className="flex items-center gap-2">
                <BellRing size={18} className="text-amber-600" />
                <span className="text-sm font-black text-amber-900">Bật nhắc nhở</span>
              </div>
            </label>

            {enableReminder && (
              <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                {reminders.map((r, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-800 whitespace-nowrap">#{index + 1}</span>

                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="number"
                        min={0}
                        max={364}
                        className="w-16 px-2 py-2 rounded-xl bg-white border border-amber-200 text-center text-sm font-bold text-gray-800 outline-none focus:border-amber-400"
                        value={r.days}
                        onChange={(e) => updateReminder(index, 'days', Math.max(0, Math.min(364, Number(e.target.value) || 0)))}
                      />
                      <span className="text-[10px] font-bold text-amber-700">ngày</span>

                      <input
                        type="number"
                        min={0}
                        max={23}
                        className="w-14 px-2 py-2 rounded-xl bg-white border border-amber-200 text-center text-sm font-bold text-gray-800 outline-none focus:border-amber-400"
                        value={r.hours}
                        onChange={(e) => updateReminder(index, 'hours', Math.max(0, Math.min(23, Number(e.target.value) || 0)))}
                      />
                      <span className="text-[10px] font-bold text-amber-700">giờ</span>

                      <input
                        type="number"
                        min={0}
                        max={59}
                        className="w-14 px-2 py-2 rounded-xl bg-white border border-amber-200 text-center text-sm font-bold text-gray-800 outline-none focus:border-amber-400"
                        value={r.minutes}
                        onChange={(e) => updateReminder(index, 'minutes', Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                      />
                      <span className="text-[10px] font-bold text-amber-700">phút trước</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeReminder(index)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addReminder}
                  className="flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors py-2"
                >
                  <Plus size={14} /> Thêm nhắc nhở
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-all"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="flex-[2] py-4 px-6 rounded-2xl bg-green-900 hover:bg-green-700 text-white font-black shadow-xl shadow-green-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              TẠO LỊCH NGAY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
