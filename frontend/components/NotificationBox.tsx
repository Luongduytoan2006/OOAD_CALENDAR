import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationBoxProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
}

const config = {
  success: { icon: CheckCircle, bg: 'bg-green-900', border: 'border-green-200', text: 'text-green-900', label: 'Thành công' },
  error: { icon: AlertTriangle, bg: 'bg-red-500', border: 'border-red-200', text: 'text-red-700', label: 'Lỗi' },
  info: { icon: Info, bg: 'bg-blue-600', border: 'border-blue-200', text: 'text-blue-700', label: 'Thông báo' },
};

export function NotificationBox({ type, message, onClose }: NotificationBoxProps): React.JSX.Element {
  const { icon: Icon, bg, border, text, label } = config[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-2xl bg-white shadow-2xl border ${border} overflow-hidden animate-in fade-in zoom-in duration-200`}>
        <div className={`${bg} px-6 py-4 flex items-center justify-between text-white`}>
          <div className="flex items-center gap-2">
            <Icon size={20} />
            <span className="font-black text-sm uppercase tracking-wide">{label}</span>
          </div>
          <button type="button" onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <p className={`text-sm font-bold ${text}`}>{message}</p>
          <button type="button" onClick={onClose}
            className={`mt-4 w-full py-2.5 rounded-xl ${bg} text-white font-bold text-sm hover:opacity-90 transition-all`}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
