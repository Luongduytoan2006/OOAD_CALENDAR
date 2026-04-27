import React from 'react';
import { X, MapPin, Clock, Users, Calendar } from 'lucide-react';
import { Appointment } from '../../src/models/Appointment';
import { GroupMeeting } from '../../src/models/GroupMeeting';
import { formatTime } from '../../src/utils/dateUtils';

interface Props {
  appointment: Appointment;
  onClose: () => void;
}

export function ViewAppointmentDetailsModal({ appointment, onClose }: Props): React.JSX.Element {
  const isGroup = appointment.isGroupMeeting;
  const group = isGroup ? (appointment as any) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className={`h-2 ${isGroup ? 'bg-green-600' : 'bg-[#3525cd]'}`} />
        
        <div className="p-8">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2 text-white ${isGroup ? 'bg-green-900' : 'bg-indigo-900'}`}>
                {isGroup ? <Users size={20} /> : <Calendar size={20} />}
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Chi tiết lịch</h2>
            </div>
            <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tiêu đề</label>
              <p className="text-lg font-bold text-gray-800">{appointment.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Thời gian</label>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Clock size={16} className="text-gray-400" />
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ngày</label>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Calendar size={16} className="text-gray-400" />
                  {appointment.startTime.toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Địa điểm</label>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <MapPin size={16} className="text-gray-400" />
                {appointment.location || 'Chưa xác định'}
              </div>
            </div>

            {isGroup && group && (
              <div className="space-y-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <label className="text-[10px] font-black uppercase tracking-widest text-green-800 flex items-center gap-2">
                  <Users size={12} /> Thành viên tham gia
                </label>
                <div className="flex flex-wrap gap-2">
                  {group.participants?.map((p: any) => (
                    <span key={p.userId} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-green-900 border border-green-100 shadow-sm">
                      {p.fullName}
                    </span>
                  ))}
                  {(!group.participants || group.participants.length === 0) && (
                    <span className="text-[10px] text-gray-400 italic">Chưa có ai tham gia</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className={`mt-8 w-full rounded-2xl py-4 text-sm font-black text-white transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg ${
              isGroup ? 'bg-green-900 shadow-green-100' : 'bg-indigo-900 shadow-indigo-100'
            }`}
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
}
