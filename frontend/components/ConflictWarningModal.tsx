import React from 'react';
import { AlertTriangle, X, Clock } from 'lucide-react';
import { formatTime } from '../utils/dateUtils';

interface ConflictInfo {
  appointmentId: number;
  title: string;
  startTime: string;
  endTime: string;
}

interface ConflictWarningModalProps {
  conflicts: ConflictInfo[];
  onReplace: () => void;
  onCancel: () => void;
}

export function ConflictWarningModal({ conflicts, onReplace, onCancel }: ConflictWarningModalProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-orange-500 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">Trùng lịch</h3>
          </div>
          <button type="button" onClick={onCancel} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <p className="text-sm text-gray-600">
            Bạn đã có {conflicts.length} lịch hẹn trong khung giờ này:
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {conflicts.map((conflict) => (
              <div key={conflict.appointmentId} className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 space-y-2">
                <span className="font-black text-orange-900">{conflict.title}</span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  {formatTime(new Date(conflict.startTime))} - {formatTime(new Date(conflict.endTime))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            Bạn muốn thay thế {conflicts.length > 1 ? 'các lịch hẹn cũ' : 'lịch hẹn cũ'} hay chọn thời gian khác?
          </p>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-3 px-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-all">
              Chọn giờ khác
            </button>
            <button type="button" onClick={onReplace} className="flex-1 py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black transition-all">
              Thay thế
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
