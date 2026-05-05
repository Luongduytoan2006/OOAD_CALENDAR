import React from 'react';
import { X, Users, Clock, MapPin } from 'lucide-react';
import { formatTime } from '../utils/dateUtils';

interface GroupMeetingInfo {
  appointmentId: number;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  ownerName: string;
  participantCount: number;
}

interface GroupMeetingSuggestionModalProps {
  meetings: GroupMeetingInfo[];
  onJoin: (meetingId: number) => void;
  onCreateAnyway: () => void;
  onClose: () => void;
}

export function GroupMeetingSuggestionModal({
  meetings,
  onJoin,
  onCreateAnyway,
  onClose,
}: GroupMeetingSuggestionModalProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-green-900 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">
                Group Meeting
              </h3>
              <p className="text-xs text-white/70">
                Có cuộc họp nhóm trùng khớp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Có <span className="font-bold text-green-900">{meetings.length}</span> group meeting cùng tên và thời lượng. Bạn muốn tham gia hay tạo riêng?
          </p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {meetings.map((meeting) => (
              <div
                key={meeting.appointmentId}
                className="rounded-2xl border border-green-100 bg-green-50/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-green-900">{meeting.title}</span>
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-lg">
                    {meeting.participantCount} người
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(new Date(meeting.startTime))} - {formatTime(new Date(meeting.endTime))}
                  </span>
                  {meeting.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {meeting.location}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-400">
                    Tạo bởi: <span className="font-bold text-gray-600">{meeting.ownerName}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onJoin(meeting.appointmentId)}
                    className="px-4 py-2 rounded-xl bg-green-900 text-white text-xs font-black hover:bg-green-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    THAM GIA
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-all"
            >
              Huỷ bỏ
            </button>

            <button
              type="button"
              onClick={onCreateAnyway}
              className="flex-1 py-3 px-4 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all"
            >
              Tạo riêng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
