import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  LineChart, 
  Wrench,
  Briefcase,
  Car,
  Clock,
  LayoutGrid,
  GitBranch,
  ClipboardCheck
} from 'lucide-react';
import { useGarage } from '../../context/GarageContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { role } = useGarage();

  // Navigation schema based on Role
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, roles: ['Owner', 'Admin', 'Branch Manager', 'Service Advisor', 'Technician', 'Accountant', 'Inventory Staff'] },
    { id: 'garage', label: 'Garage Operations', icon: Wrench, roles: ['Owner', 'Admin', 'Branch Manager', 'Service Advisor', 'Technician'] },
    { id: 'serviceBays', label: 'Service Bay Monitor', icon: LayoutGrid, roles: ['Owner', 'Admin', 'Branch Manager', 'Service Advisor', 'Technician'] },
    { id: 'vehicles', label: 'Vehicle Registry', icon: Car, roles: ['Owner', 'Admin', 'Branch Manager', 'Service Advisor', 'Technician', 'Accountant', 'Inventory Staff'] },
    { id: 'inspections', label: 'Inspection Worksheets', icon: ClipboardCheck, roles: ['Owner', 'Admin', 'Branch Manager', 'Service Advisor', 'Technician'] },
    { id: 'customers', label: 'Customer CRM', icon: Users, roles: ['Owner', 'Admin', 'Branch Manager', 'Service Advisor', 'Accountant'] },
    { id: 'appointments', label: 'Appointments Board', icon: Calendar, roles: ['Owner', 'Admin', 'Branch Manager', 'Service Advisor', 'Technician'] },
    { id: 'hr', label: 'HR Directory', icon: Briefcase, roles: ['Owner', 'Admin', 'Branch Manager'] },
    { id: 'workforce', label: 'Workforce & Shifts', icon: Clock, roles: ['Owner', 'Admin', 'Branch Manager', 'Technician'] },
    { id: 'finance', label: 'Finance & Payroll', icon: DollarSign, roles: ['Owner', 'Admin', 'Branch Manager', 'Accountant'] },
    { id: 'branches', label: 'Multi-Branch Analytics', icon: GitBranch, roles: ['Owner', 'Admin', 'Branch Manager'] },
    { id: 'analytics', label: 'Smart Insights (CEO)', icon: LineChart, roles: ['Owner', 'Admin', 'Branch Manager'] },
    
    // Preview Modules
    { id: 'inventory', label: 'Inventory Catalog', icon: Package, roles: ['Owner', 'Admin', 'Branch Manager', 'Inventory Staff'], isPreview: true },
    { id: 'suppliers', label: 'Suppliers & Orders', icon: Briefcase, roles: ['Owner', 'Admin', 'Branch Manager', 'Inventory Staff'], isPreview: true }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="sidebar">
      {/* Branding */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-primary)',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <img
            src="/LogoGarage.png"
            alt="Garage logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>AUTO-ERP</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Garage Enterprise</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s',
                outline: 'none',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                paddingLeft: isActive ? '13px' : '16px'
              }}
              className="nav-link-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                <span>{item.label}</span>
              </div>
              {item.isPreview && (
                <span style={{
                  fontSize: '9px',
                  background: 'var(--surface-muted)',
                  color: 'var(--text-muted)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  Preview
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Role indicator */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--sidebar-footer-bg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-success)',
            boxShadow: '0 0 8px var(--accent-success)'
          }} />
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>System Live</p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Local Persistence Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
