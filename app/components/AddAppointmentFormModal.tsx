import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, AlignLeft, BellRing } from 'lucide-react';
import { AddAppointmentRequest } from '../../src/models/types';
import { ReminderMethod } from '../../src/models/Reminder';

interface AddAppointmentFormModalProps {
  defaultDate: Date;
  onClose: () => void;
  onSubmit: (request: AddAppointmentRequest) => Promise<void>;
}

export function AddAppointmentFormModal({
  defaultDate,
  onClose,
  onSubmit,
}: AddAppointmentFormModalProps): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [selectedReminders, setSelectedReminders] = useState<ReminderMethod[]>([ReminderMethod.Popup]);
  
  const [startTime, setStartTime] = useState(() => {
    const d = new Date(defaultDate);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  const [endTime, setEndTime] = useState(() => {
    const d = new Date(defaultDate);
    d.setHours(d.getHours() + 1);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  const [date, setDate] = useState(() => {
    const d = new Date(defaultDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const start = new Date(date);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(date);
    end.setHours(endH, endM, 0, 0);

    void onSubmit({
      title,
      location,
      startTime: start,
      endTime: end,
      reminderMethods: selectedReminders,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-green-900 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <CalendarIcon size={24} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Tạo cuộc hẹn mới</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title Input */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Input */}
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

            {/* Location Input */}
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
            {/* Start Time */}
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

            {/* End Time */}
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

          {/* Reminders */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-900/60 font-bold text-[10px] uppercase tracking-widest px-1">
              <BellRing size={14} />
              Nhắc nhở
            </div>
            <div className="flex gap-4">
              {[ReminderMethod.Popup, ReminderMethod.Email].map((method) => (
                <label key={method} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg border-2 border-gray-200 text-green-900 focus:ring-green-900/10 transition-all cursor-pointer"
                    checked={selectedReminders.includes(method)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReminders([...selectedReminders, method]);
                      } else {
                        setSelectedReminders(selectedReminders.filter((m) => m !== method));
                      }
                    }}
                  />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-green-900 transition-colors">
                    {method === ReminderMethod.Popup ? 'Thông báo Popup' : 'Gửi Email'}
                  </span>
                </label>
              ))}
            </div>
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
