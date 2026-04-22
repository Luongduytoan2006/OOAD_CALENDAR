import React from 'react';
import { Calendar } from 'lucide-react';
import { CalendarPage } from './CalendarPage';

export function App(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-gray-800">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
          <div className="rounded-xl bg-[#3525cd] p-2 text-white shadow-lg shadow-indigo-100">
            <Calendar size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">OOAD Calendar Appointment</h1>
            <p className="text-xs text-gray-500">MVC + N-Layers + Mock Data</p>
          </div>
        </div>
      </header>

      <main>
        <CalendarPage />
      </main>
    </div>
  );
}
