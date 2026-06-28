import React from 'react';
import { Wrench, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useGarage } from '../../context/GarageContext';

export const DashboardView: React.FC = () => {
  const { employees, workOrders, parts, transactions, vehicles } = useGarage();

  // Compute metrics
  const activeJobs = workOrders.filter(w => w.status !== 'Delivered').length;
  
  const lowStockCount = parts.filter(p => p.stock <= p.minStock).length;
  
  const activeTechs = employees.filter(e => e.position === 'Technician' && e.status === 'Active').length;

  const juneRevenue = transactions
    .filter(t => t.date.startsWith('2026-06') && t.type === 'Revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  // Map active work orders to physical service bays (we simulate 5 bays)
  const bays = [
    { id: 1, name: 'Service Bay 1 (Heavy Lift)' },
    { id: 2, name: 'Service Bay 2 (Alignment)' },
    { id: 3, name: 'Service Bay 3 (Standard)' },
    { id: 4, name: 'Service Bay 4 (Standard)' },
    { id: 5, name: 'Service Bay 5 (Quick Lube)' }
  ];

  // Assign in-progress/pending work orders to bays
  const activeOrders = workOrders.filter(w => w.status !== 'Delivered');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>Garage Operations Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Real-time overview of repair slots, service bay capacity, and operational KPIs.</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0
          }}>
            <Wrench size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Repairs</span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '4px' }}>{activeJobs}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-success)', flexShrink: 0
          }}>
            <CheckCircle size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>June Revenue</span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '4px' }}>${juneRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-warning)', flexShrink: 0
          }}>
            <AlertTriangle size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Low Stock Alerts</span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '4px' }}>{lowStockCount}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-info)', flexShrink: 0
          }}>
            <Calendar size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Technicians</span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '4px' }}>{activeTechs}</h3>
          </div>
        </div>

      </div>

      {/* Service Bays Visualizer Grid */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Live Service Bay Status</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Real-time usage of physical workspace bays.</p>
          </div>
          <span className="badge badge-info">{activeOrders.length} Lifts Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
          {bays.map((bay, idx) => {
            const order = activeOrders[idx];
            const technician = order ? employees.find(e => e.id === order.assignedTechId) : null;
            const veh = order ? vehicles.find(v => v.id === order.vehicleId) : null;

            return (
              <div
                key={bay.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '20px',
                  background: order ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                  borderLeft: order 
                    ? `4px solid var(--accent-primary)` 
                    : '4px solid var(--accent-success)',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {bay.name}
                  </span>
                  {order ? (
                    <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                      {order.status}
                    </span>
                  ) : (
                    <span className="badge badge-success">Empty</span>
                  )}
                </div>

                {order ? (
                  <div>
                    <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {veh ? `${veh.brand} ${veh.model} (${veh.licensePlate})` : 'Unknown Vehicle'}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', height: '36px', overflow: 'hidden' }}>
                      {order.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 600
                      }}>
                        {technician?.name.split(' ').map(n => n[0]).join('') || 'Tech'}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{technician?.name || 'Unassigned'}</p>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Lead Tech</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'var(--text-muted)' }}>
                    <CheckCircle size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <span style={{ fontSize: '12px' }}>Ready for Check-In</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Logs */}
      <div className="glass-card">
        <div className="glass-card-header">
          <h2 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Recent Work Orders</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing all active and pending orders</span>
        </div>
        
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Vehicle &amp; Plate</th>
                <th>Service Details</th>
                <th>Lead Mechanic</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.slice(0, 6).map(order => {
                const technician = employees.find(e => e.id === order.assignedTechId);
                const veh = vehicles.find(v => v.id === order.vehicleId);
                
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>WO{order.id.replace('WO', '')}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{veh ? `${veh.brand} ${veh.model}` : 'Unknown Vehicle'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{veh ? veh.licensePlate : ''}</div>
                    </td>
                    <td style={{ maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {order.description}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 600
                        }}>
                          {technician?.name.split(' ').map(n => n[0]).join('') || 'Tech'}
                        </div>
                        <span>{technician?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DashboardView;
