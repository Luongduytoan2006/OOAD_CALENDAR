import React from 'react';
import { User } from '../../src/models/User';
import { X, Check, UserPlus } from 'lucide-react';

interface PendingRequestsModalProps {
  meetingId: number;
  meetingTitle: string;
  requests: User[];
  onApprove: (userId: number) => void;
  onReject: (userId: number) => void;
  onClose: () => void;
}

export function PendingRequestsModal({
  meetingTitle,
  requests,
  onApprove,
  onReject,
  onClose,
}: PendingRequestsModalProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-green-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <UserPlus size={20} />
            <h3 className="font-bold">Yêu cầu tham gia</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Danh sách người dùng xin tham gia cuộc họp: <span className="font-bold text-gray-800">{meetingTitle}</span>
          </p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {requests.length === 0 ? (
              <p className="text-center py-8 text-gray-400 italic">Không có yêu cầu nào đang chờ.</p>
            ) : (
              requests.map((user) => (
                <div key={user.userId} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <span className="font-semibold text-gray-700">{user.fullName}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprove(user.userId)}
                      className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-lg transition-colors"
                      title="Duyệt"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => onReject(user.userId)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors"
                      title="Từ chối"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
