import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { 
  Plus, User, Car, LayoutGrid, AlertTriangle, Trash2
} from 'lucide-react';
import type { Appointment } from '../../shared/types';

export const AppointmentsView: React.FC = () => {
  const { 
    appointments, customers, vehicles, employees, 
    createAppointment, updateAppointment, deleteAppointment, addToast 
  } = useGarage();

  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('week');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [assignedTechId, setAssignedTechId] = useState('');
  const [serviceBayId, setServiceBayId] = useState(1);
  const [bookingDate, setBookingDate] = useState('2026-06-28');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

  // Conflict Checking Warning (derived state)
  const getConflictWarning = () => {
    if (!assignedTechId || !bookingDate || !startTime || !endTime) return null;
    const startStr = `${bookingDate} ${startTime}`;
    const endStr = `${bookingDate} ${endTime}`;

    // Tech Overlap check
    const techCollision = appointments.some(a => 
      a.status !== 'Cancelled' && a.status !== 'Completed' &&
      a.assignedTechId === assignedTechId &&
      ((startStr >= a.startTime && startStr < a.endTime) ||
       (endStr > a.startTime && endStr <= a.endTime) ||
       (startStr <= a.startTime && endStr >= a.endTime))
    );

    // Bay Overlap check
    const bayCollision = appointments.some(a => 
      a.status !== 'Cancelled' && a.status !== 'Completed' &&
      a.serviceBayId === Number(serviceBayId) &&
      ((startStr >= a.startTime && startStr < a.endTime) ||
       (endStr > a.startTime && endStr <= a.endTime) ||
       (startStr <= a.startTime && endStr >= a.endTime))
    );

    if (techCollision && bayCollision) {
      return "CRITICAL OVERBOOKING: Both technician AND service bay have scheduling conflicts for this time slot!";
    }
    if (techCollision) {
      return "WARNING: Selected technician has another scheduled appointment overlapping this slot.";
    }
    if (bayCollision) {
      return "WARNING: Selected service bay is already booked for this time slot.";
    }
    return null;
  };

  const conflictWarning = getConflictWarning();

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !vehicleId || !serviceType || !assignedTechId || !bookingDate || !startTime || !endTime) {
      addToast("Please fill all booking details", "warning");
      return;
    }

    const startISO = `${bookingDate} ${startTime}`;
    const endISO = `${bookingDate} ${endTime}`;
    const diffHours = (new Date(endISO).getTime() - new Date(startISO).getTime()) / (1000 * 60 * 60);

    const success = await createAppointment({
      customerId,
      vehicleId,
      serviceType,
      assignedTechId,
      serviceBayId: Number(serviceBayId),
      startTime: startISO,
      endTime: endISO,
      estimatedDuration: Math.max(0.5, Number(diffHours.toFixed(1))),
      status: 'Scheduled',
      branchId: 'BR-01'
    });

    if (success) {
      // Reset Form
      setCustomerId('');
      setVehicleId('');
      setServiceType('');
      setAssignedTechId('');
      setServiceBayId(1);
      setShowAddForm(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: Appointment['status']) => {
    await updateAppointment(id, { status: nextStatus });
    addToast(`Appointment status updated to ${nextStatus}`, 'success');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel and delete this appointment booking?")) {
      await deleteAppointment(id);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Completed': return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' };
      case 'In Service': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'Checked In': return { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
      case 'No Show': return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-error)' };
      case 'Cancelled': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' };
      default: return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' };
    }
  };

  // Group appointments by date / week days
  const weekDays = ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28'];
  const dayNames = ['Mon 22', 'Tue 23', 'Wed 24', 'Thu 25', 'Fri 26', 'Sat 27', 'Sun 28'];

  return (
    <div style={{ padding: '24px', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Appointments Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Book customer appointments, manage bays slots, and check overlapping technician timetables.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <Plus size={16} />
          Book Slot
        </button>
      </div>

      {/* Book Slot Form Card */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Schedule Appointment Slot</h2>
          
          {conflictWarning && (
            <div style={{
              background: conflictWarning.includes("CRITICAL") ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${conflictWarning.includes("CRITICAL") ? 'var(--accent-error)' : 'var(--accent-warning)'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              color: conflictWarning.includes("CRITICAL") ? 'var(--accent-error)' : 'var(--accent-warning)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={18} />
              <span>{conflictWarning}</span>
            </div>
          )}

          <form onSubmit={handleBook} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Client CRM *</label>
              <select className="input-field" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                <option value="">Select Customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
              </select>
            </div>
            
            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Vehicle Asset *</label>
              <select className="input-field" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
                <option value="">Select Vehicle...</option>
                {vehicles.filter(v => !customerId || v.customerId === customerId).map(v => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.licensePlate})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Service Category *</label>
              <input type="text" className="input-field" value={serviceType} onChange={e => setServiceType(e.target.value)} placeholder="e.g. Brake Replacement" required />
            </div>

            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Assigned Technician *</label>
              <select className="input-field" value={assignedTechId} onChange={e => setAssignedTechId(e.target.value)} required>
                <option value="">Select Technician...</option>
                {employees.filter(e => e.position === 'Technician').map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Service Bay Allocation *</label>
              <select className="input-field" value={serviceBayId} onChange={e => setServiceBayId(Number(e.target.value))} required>
                <option value={1}>Bay 1 (Heavy Lift)</option>
                <option value={2}>Bay 2 (Alignment)</option>
                <option value={3}>Bay 3 (Standard)</option>
                <option value={4}>Bay 4 (Standard)</option>
                <option value={5}>Bay 5 (Quick Lube)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Appointment Date *</label>
              <input type="date" className="input-field" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Start Time *</label>
              <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>End Time *</label>
              <input type="time" className="input-field" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', gridColumn: '1 / -1', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" className="button button-success" style={{ padding: '10px 24px', fontWeight: 600 }}>Create Booking</button>
              <button type="button" className="button button-danger" onClick={() => setShowAddForm(false)} style={{ padding: '10px 20px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar Switcher Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{
          display: 'inline-flex',
          background: 'var(--soft-panel-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '4px'
        }}>
          {[
            { id: 'day', label: 'Day Grid' },
            { id: 'week', label: 'Week Planner' },
            { id: 'month', label: 'All Lists' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === t.id ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CALENDAR PANELS */}

      {/* WEEKLY PLANNER VIEW */}
      {activeTab === 'week' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '12px',
          minWidth: '900px',
          overflowX: 'auto'
        }}>
          {weekDays.map((day, idx) => {
            const dayApts = appointments.filter(a => a.startTime.startsWith(day));
            return (
              <div key={day} style={{
                background: 'var(--board-column-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}>
                  {dayNames[idx]}
                </h3>

                {dayApts.length > 0 ? (
                  dayApts.map(a => {
                    const cust = customers.find(c => c.id === a.customerId);
                    const veh = vehicles.find(v => v.id === a.vehicleId);
                    const tech = employees.find(e => e.id === a.assignedTechId);
                    const badge = getStatusBadge(a.status);
                    
                    return (
                      <div key={a.id} className="card hover-glow" style={{ padding: '10px', fontSize: '12px', border: '1px solid var(--board-card-border)', background: 'var(--board-card-bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{a.startTime.split(' ')[1]}</span>
                          <span style={{
                            background: badge.bg,
                            color: badge.color,
                            padding: '1px 4px',
                            borderRadius: '3px',
                            fontSize: '9px',
                            fontWeight: 700
                          }}>{a.status}</span>
                        </div>
                        
                        <p style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>{a.serviceType}</p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}><User size={10} style={{ display: 'inline', marginRight: '4px' }} />{cust?.name}</p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}><Car size={10} style={{ display: 'inline', marginRight: '4px' }} />{veh?.brand} {veh?.model}</p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}><LayoutGrid size={10} style={{ display: 'inline', marginRight: '4px' }} />Bay {a.serviceBayId} | {tech?.name.split(' ')[0]}</p>

                        <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid var(--section-divider)', paddingTop: '6px' }}>
                          {a.status === 'Scheduled' && (
                            <button onClick={() => handleUpdateStatus(a.id, 'Checked In')} style={{ padding: '2px 4px', background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '9px', fontWeight: 600 }}>In</button>
                          )}
                          {a.status === 'Checked In' && (
                            <button onClick={() => handleUpdateStatus(a.id, 'In Service')} style={{ padding: '2px 4px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '9px', fontWeight: 600 }}>Work</button>
                          )}
                          {a.status === 'In Service' && (
                            <button onClick={() => handleUpdateStatus(a.id, 'Completed')} style={{ padding: '2px 4px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '9px', fontWeight: 600 }}>Done</button>
                          )}
                          {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                            <button onClick={() => handleUpdateStatus(a.id, 'No Show')} style={{ padding: '2px 4px', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-error)', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '9px', fontWeight: 600 }}>Miss</button>
                          )}
                          <button onClick={() => handleDelete(a.id)} style={{ padding: '2px 4px', background: 'var(--subcard-bg)', color: 'var(--text-muted)', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '9px', marginLeft: 'auto' }}><Trash2 size={10} /></button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>No bookings</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DAILY TIMELINE VIEW */}
      {activeTab === 'day' && (
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>June 28, 2026 - Active Service Timeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appointments.filter(a => a.startTime.startsWith('2026-06-28')).map(a => {
              const cust = customers.find(c => c.id === a.customerId);
              const veh = vehicles.find(v => v.id === a.vehicleId);
              const tech = employees.find(e => e.id === a.assignedTechId);
              const badge = getStatusBadge(a.status);
              
              return (
                <div key={a.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'var(--subcard-bg)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ minWidth: '100px', borderRight: '2px solid var(--border-color)', paddingRight: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{a.startTime.split(' ')[1]}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>to {a.endTime.split(' ')[1]}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{a.serviceType}</h3>
                      <span style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>{a.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div>Client: {cust?.name}</div>
                      <div>Vehicle: {veh?.brand} {veh?.model} ({veh?.licensePlate})</div>
                      <div>Service Bay: Bay {a.serviceBayId}</div>
                      <div>Staff: {tech?.name}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {a.status === 'Scheduled' && (
                      <button onClick={() => handleUpdateStatus(a.id, 'Checked In')} className="button button-info" style={{ fontSize: '12px', padding: '6px 12px' }}>Check In</button>
                    )}
                    {a.status === 'Checked In' && (
                      <button onClick={() => handleUpdateStatus(a.id, 'In Service')} className="button button-success" style={{ fontSize: '12px', padding: '6px 12px' }}>Start Service</button>
                    )}
                    {a.status === 'In Service' && (
                      <button onClick={() => handleUpdateStatus(a.id, 'Completed')} className="button button-success" style={{ fontSize: '12px', padding: '6px 12px' }}>Complete</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MONTHLY / GENERAL LIST VIEW */}
      {activeTab === 'month' && (
        <div className="card" style={{ padding: '20px' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Booking Slot</th>
                <th>Client</th>
                <th>Vehicle</th>
                <th>Category</th>
                <th>Staff Mechanic</th>
                <th>Service Bay</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => {
                const cust = customers.find(c => c.id === a.customerId);
                const veh = vehicles.find(v => v.id === a.vehicleId);
                const tech = employees.find(e => e.id === a.assignedTechId);
                const badge = getStatusBadge(a.status);
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.startTime}</td>
                    <td>{cust?.name}</td>
                    <td>{veh?.brand} {veh?.model}</td>
                    <td>{a.serviceType}</td>
                    <td>{tech?.name}</td>
                    <td>Bay {a.serviceBayId}</td>
                    <td>
                      <span style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>{a.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
export default AppointmentsView;
