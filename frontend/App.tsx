import React from 'react';
import { CalendarPage } from './pages/CalendarPage';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: string | null}> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) { return { error: error.message }; }
  render() {
    if (this.state.error) return <pre style={{padding: 20, color: 'red'}}>{this.state.error}</pre>;
    return this.props.children;
  }
}

export function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#f7f9fb] text-gray-800">
        <CalendarPage />
      </div>
    </ErrorBoundary>
  );
}
