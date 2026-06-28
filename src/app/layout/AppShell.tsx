import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useGarage } from '../../context/GarageContext';
import { X, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, currentView, onViewChange }) => {
  const { toasts, removeToast } = useGarage();

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} color="var(--accent-success)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--accent-warning)" />;
      case 'error':
        return <AlertOctagon size={18} color="var(--accent-danger)" />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onViewChange={onViewChange} />

      {/* Main Workspace Frame */}
      <div className="main-content">
        {/* Top Session Banner */}
        <Topbar />

        {/* Dynamic Inner Panel */}
        <main className="workspace">
          {children}
        </main>
      </div>

      {/* Floating Toast Notification Center */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {getToastIcon(t.type)}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AppShell;
