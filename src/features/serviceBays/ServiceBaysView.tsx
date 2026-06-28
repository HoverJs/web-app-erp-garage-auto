import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { 
  Clock, CheckCircle2, AlertCircle, Activity
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const ServiceBaysView: React.FC = () => {
  const { serviceBays, vehicles, employees, updateServiceBay, addToast } = useGarage();
  const [selectedBranch, setSelectedBranch] = useState<'BR-01' | 'BR-02'>('BR-01');

  // Filter bays by branch
  const activeBays = serviceBays.filter(b => b.branchId === selectedBranch);

  // Calculate Utilization Stats
  const totalBays = activeBays.length;
  const occupiedBays = activeBays.filter(b => b.status !== 'Available').length;
  const utilizationPercentage = totalBays > 0 ? (occupiedBays / totalBays) * 100 : 0;

  // Chart Mock Data for Bay Utilization
  const utilizationChartData = [
    { name: 'Mon', 'Downtown Bay': 60, 'Westside Bay': 40 },
    { name: 'Tue', 'Downtown Bay': 80, 'Westside Bay': 60 },
    { name: 'Wed', 'Downtown Bay': 60, 'Westside Bay': 40 },
    { name: 'Thu', 'Downtown Bay': 80, 'Westside Bay': 80 },
    { name: 'Fri', 'Downtown Bay': 100, 'Westside Bay': 60 },
    { name: 'Sat', 'Downtown Bay': 40, 'Westside Bay': 20 },
    { name: 'Sun', 'Downtown Bay': 20, 'Westside Bay': 20 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'var(--accent-success)';
      case 'Occupied': return '#3b82f6'; // Blue
      case 'Waiting Parts': return 'var(--accent-error)';
      case 'Inspection': return 'var(--accent-warning)';
      case 'Completed': return '#a855f7'; // Purple
      default: return 'var(--text-muted)';
    }
  };

  const handleFreeBay = async (id: number) => {
    await updateServiceBay(id, {
      status: 'Available',
      currentVehicleId: undefined,
      assignedTechId: undefined,
      progress: 0,
      eta: undefined
    });
    addToast(`Service Bay ${id} is now available`, 'success');
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Garage Floor Monitor</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Real-time visual diagram of physical service lifts, technician progress trackers, and capacity utilization analytics.
          </p>
        </div>

        {/* Branch Filter dropdown */}
        <select 
          className="input-field" 
          value={selectedBranch} 
          onChange={e => setSelectedBranch(e.target.value as any)}
          style={{ width: '220px' }}
        >
          <option value="BR-01">Branch A (Downtown HQ)</option>
          <option value="BR-02">Branch B (Westside Workshop)</option>
        </select>
      </div>

      {/* KPI Cards & Utilization metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)' }}>
            <Activity size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Active Bay Utilization</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>{utilizationPercentage.toFixed(0)}%</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Available Lifts</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>
              {activeBays.filter(b => b.status === 'Available').length} of {totalBays}
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--accent-error)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Waiting Parts / Hold</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>
              {activeBays.filter(b => b.status === 'Waiting Parts').length} bays
            </span>
          </div>
        </div>
      </div>

      {/* Visually Rended Floor Lifts Grid */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Workshop Floor Diagram</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {activeBays.map(b => {
          const veh = vehicles.find(v => v.id === b.currentVehicleId);
          const tech = employees.find(e => e.id === b.assignedTechId);
          const statusColor = getStatusColor(b.status);

          return (
            <div key={b.id} className="card hover-glow" style={{ padding: '20px', borderLeft: `5px solid ${statusColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Bay {String(b.id).padStart(2, '0')}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.name}</span>
                </div>
                <span style={{
                  background: `${statusColor}15`,
                  color: statusColor,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: `1px solid ${statusColor}30`
                }}>
                  {b.status}
                </span>
              </div>

              {b.status !== 'Available' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {veh ? `${veh.brand} ${veh.model}` : 'Unknown Vehicle'}
                      </span>
                    </div>
                    {veh && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Plate:</span>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{veh.licensePlate}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Technician:</span>
                      <span style={{ fontWeight: 600 }}>{tech?.name || 'Unassigned'}</span>
                    </div>
                    {b.eta && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />ETA:</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{b.eta}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {b.progress !== undefined && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                        <span>Job Progress</span>
                        <span>{b.progress}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--subcard-bg-strong)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${b.progress}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleFreeBay(b.id)}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '6px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--danger-soft-bg)',
                      color: 'var(--accent-error)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    Release Bay
                  </button>
                </div>
              ) : (
                <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Ready to load vehicle lift
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Utilization Charts */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Capacity Utilization Analytics (Weekly)</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={utilizationChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" tickFormatter={tick => `${tick}%`} />
              <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--border-color)' }} labelStyle={{ color: 'var(--chart-tooltip-label)' }} />
              <Legend />
              <Bar dataKey="Downtown Bay" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Westside Bay" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
export default ServiceBaysView;
