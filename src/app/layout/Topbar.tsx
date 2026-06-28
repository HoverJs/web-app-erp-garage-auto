import React from 'react';
import { User, Building2, Bell, Moon, Sun } from 'lucide-react';
import { useGarage } from '../../context/GarageContext';
import { useTheme } from '../../context/ThemeContext';
import type { UserRole } from '../../shared/types';

export const Topbar: React.FC = () => {
  const { role, changeRole, insights } = useGarage();
  const { theme, toggleTheme } = useTheme();

  const roles: UserRole[] = [
    'Owner',
    'Admin',
    'Branch Manager',
    'Service Advisor',
    'Technician',
    'Accountant',
    'Inventory Staff'
  ];

  // Map roles to a simulated logged-in employee name for UI realism
  const getSimulatedUser = (currentRole: UserRole) => {
    switch (currentRole) {
      case 'Owner':
        return { name: 'John Doe', title: 'Managing Director / Owner' };
      case 'Admin':
        return { name: 'Alice Smith', title: 'System Administrator' };
      case 'Branch Manager':
        return { name: 'Henry Ford', title: 'Branch Manager (Westside)' };
      case 'Service Advisor':
        return { name: 'Bob Johnson', title: 'Senior Service Advisor' };
      case 'Technician':
        return { name: 'David Miller', title: 'Lead Diagnostic Tech' };
      case 'Accountant':
        return { name: 'Grace Lee', title: 'Chief Financial Accountant' };
      case 'Inventory Staff':
        return { name: 'Frank Wilson', title: 'Inventory Controller' };
      default:
        return { name: 'Guest User', title: 'Guest' };
    }
  };

  const user = getSimulatedUser(role);
  
  // Count critical insights to show notifications count
  const criticalCount = insights.filter(i => i.type === 'critical' || i.type === 'warning').length;

  return (
    <header className="topbar">
      {/* Title / Module Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Building2 size={18} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Downtown Headquarters</span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Role Switcher Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Workspace Role:</span>
          <select
            value={role}
            onChange={(e) => changeRole(e.target.value as UserRole)}
            className="glass-input glass-select"
            style={{
              width: '180px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid var(--accent-primary)',
              background: 'var(--accent-soft)'
            }}
          >
            {roles.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

        {/* Notifications Icon */}
        <button
          type="button"
          className="notification-btn"
          aria-label={`Notifications${criticalCount > 0 ? ` (${criticalCount})` : ''}`}
        >
          <Bell size={18} strokeWidth={2.2} />
          {criticalCount > 0 && (
            <div className="notification-badge">
              {criticalCount}
            </div>
          )}
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

        {/* User Card Emulator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--surface-muted)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <User size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.2' }}>{user.name}</p>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.title}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
export default Topbar;
