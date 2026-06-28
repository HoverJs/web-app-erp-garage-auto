import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import type { Shift, UserRole } from '../../shared/types';
import { Clock, AlertTriangle, Play, Trash2 } from 'lucide-react';

export const WorkforceView: React.FC = () => {
  const { 
    employees, 
    shifts, 
    attendance, 
    assignShift, 
    deleteShift, 
    clockIn, 
    clockOut, 
    role, 
    addToast 
  } = useGarage();

  const [draggedEmpId, setDraggedEmpId] = useState<string | null>(null);
  const [selectedDayForShift, setSelectedDayForShift] = useState<string | null>(null);
  const [showShiftPicker, setShowShiftPicker] = useState(false);
  const activeDate = '2026-06-28'; // Simulated current date

  // Generate days of the current week (June 22 - June 28, 2026)
  const currentWeekDays = [
    { date: '2026-06-22', name: 'Mon', label: 'June 22' },
    { date: '2026-06-23', name: 'Tue', label: 'June 23' },
    { date: '2026-06-24', name: 'Wed', label: 'June 24' },
    { date: '2026-06-25', name: 'Thu', label: 'June 25' },
    { date: '2026-06-26', name: 'Fri', label: 'June 26' },
    { date: '2026-06-27', name: 'Sat', label: 'June 27' },
    { date: '2026-06-28', name: 'Sun', label: 'June 28' }
  ];

  // RBAC permissions check
  const isManagerOrAdmin = role === 'Owner' || role === 'Admin' || role === 'Branch Manager';

  // Get active technicians
  const technicians = employees.filter(e => e.position === 'Technician');

  // Drag and Drop triggers
  const handleDragStart = (e: React.DragEvent, empId: string) => {
    setDraggedEmpId(empId);
    e.dataTransfer.setData('text/plain', empId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    if (!isManagerOrAdmin) {
      addToast("Unauthorized: Only managers and admins can edit schedules", "error");
      return;
    }
    const empId = e.dataTransfer.getData('text/plain') || draggedEmpId;
    if (empId) {
      setSelectedDayForShift(targetDate);
      setShowShiftPicker(true);
    }
  };

  const handleSelectShiftType = async (type: Shift['type']) => {
    if (selectedDayForShift && draggedEmpId) {
      await assignShift(selectedDayForShift, type, draggedEmpId);
    }
    setShowShiftPicker(false);
    setDraggedEmpId(null);
    setSelectedDayForShift(null);
  };

  // Find simulated logged-in employee ID for attendance
  const getLoggedInEmpId = (currentRole: UserRole): string => {
    switch (currentRole) {
      case 'Technician': return 'EMP004'; // David Miller
      case 'Accountant': return 'EMP007'; // Grace Lee
      case 'Admin': return 'EMP002'; // Alice Smith
      default: return 'EMP001'; // John Doe
    }
  };

  const loggedInEmpId = getLoggedInEmpId(role);
  const loggedInEmp = employees.find(e => e.id === loggedInEmpId);
  const todayLog = attendance.find(a => a.employeeId === loggedInEmpId && a.date === activeDate);

  const handleClockIn = () => {
    const time = new Date().toTimeString().split(' ')[0];
    clockIn(loggedInEmpId, time);
  };

  const handleClockOut = () => {
    const time = new Date().toTimeString().split(' ')[0];
    clockOut(loggedInEmpId, time);
  };

  // Compute technician utilization (simulated heatmap)
  const getTechLoadToday = (techId: string) => {
    const todayShifts = shifts.filter(s => s.date === activeDate && s.employeeId === techId);
    const tech = employees.find(e => e.id === techId);
    
    if (tech?.status === 'On Leave') return 'leave';
    if (todayShifts.length === 0) return 'available';
    if (todayShifts.length === 1) return 'busy';
    return 'overloaded'; // 2 or more shifts assigned
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>Workforce Scheduling & Shifts</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Plan working hours, track real-time attendance clock-ins, and inspect technician capacity.</p>
      </div>

      {/* Row 1: Attendance Tracker Widget & Capacity Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Attendance Logger Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Attendance Desk</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Log your daily shifts check-in/out to compile timesheets.</p>
            
            <div style={{
              margin: '20px 0',
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Logged In As</p>
              <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>{loggedInEmp?.name}</h4>
              <span style={{ fontSize: '11px', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 600 }}>{loggedInEmp?.position}</span>
            </div>

            {todayLog ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Check-In Time:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-success)' }}>{todayLog.checkIn}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Check-Out Time:</span>
                  <span style={{ fontWeight: 600, color: todayLog.checkOut ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {todayLog.checkOut || 'Active Now'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shift Status:</span>
                  <span className={`badge ${
                    todayLog.status === 'On Time' ? 'badge-success' : 
                    todayLog.status === 'Late' ? 'badge-warning' : 'badge-info'
                  }`}>{todayLog.status}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No clock-in record for today.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleClockIn} 
              disabled={!!todayLog}
              style={{ flex: 1, padding: '12px' }}
            >
              <Play size={14} />
              Clock In
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleClockOut} 
              disabled={!todayLog || !!todayLog.checkOut}
              style={{ flex: 1, padding: '12px' }}
            >
              <Clock size={14} />
              Clock Out
            </button>
          </div>
        </div>

        {/* Capacity planning Heatmap */}
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>Technician Capacity Heatmap</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live utilization tracking for workshop dispatching on {activeDate}.</p>
          
          <div className="heatmap-grid" style={{ marginTop: '20px' }}>
            {technicians.map(tech => {
              const load = getTechLoadToday(tech.id);
              let label = 'Available';
              if (load === 'leave') label = 'On Leave';
              else if (load === 'busy') label = 'Medium Load';
              else if (load === 'overloaded') label = 'Overloaded';

              return (
                <div key={tech.id} className={`heatmap-cell ${load}`}>
                  <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{tech.name.split(' ')[0]}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', margin: '4px 0' }}>{tech.id}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600 }} className={
                    load === 'available' ? 'badge badge-success' :
                    load === 'busy' ? 'badge badge-warning' :
                    load === 'overloaded' ? 'badge badge-danger' : 'badge'
                  }>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Color Key Guide */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', fontSize: '12px', color: 'var(--text-secondary)', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-success)' }} />
              <span>Available (Green)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-warning)' }} />
              <span>Medium Load (Yellow)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-danger)' }} />
              <span>Overloaded (Red)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Drag and Drop Calendar Scheduler Board */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Left: Staff roster to drag */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>Staff Roster</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Drag employees to calendar days to schedule shifts.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {employees.map(emp => (
              <div
                key={emp.id}
                draggable={isManagerOrAdmin}
                onDragStart={(e) => handleDragStart(e, emp.id)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: 'var(--roster-card-bg)',
                  border: '1px solid var(--border-color)',
                  cursor: isManagerOrAdmin ? 'grab' : 'not-allowed',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
                className="draggable-member"
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.position}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: The Grid Calendar */}
        <div className="glass-card" style={{ overflow: 'visible' }}>
          <div className="glass-card-header">
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Shift Scheduler Board</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Weekly shift planner grid. Click trash icon to remove assignments.</p>
            </div>
            {!isManagerOrAdmin && (
              <span className="badge badge-warning" style={{ display: 'flex', gap: '4px' }}>
                <AlertTriangle size={12} /> Read-Only Mode
              </span>
            )}
          </div>

          {/* Calendar Columns Grid */}
          <div className="calendar-board">
            {currentWeekDays.map(day => {
              const dayShifts = shifts.filter(s => s.date === day.date);

              return (
                <div key={day.date} className="calendar-day-col">
                  <div className={`calendar-day-header ${day.date === activeDate ? 'today' : ''}`}>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{day.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{day.label}</span>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day.date)}
                    className="calendar-dropzone"
                  >
                    {dayShifts.map(shift => {
                      const emp = employees.find(e => e.id === shift.employeeId);
                      return (
                        <div key={shift.id} className={`shift-card ${shift.type} ${shift.status}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: 700, color: 'var(--shift-card-text)' }}>{emp?.name.split(' ')[0] || 'Unknown'}</span>
                            {isManagerOrAdmin && (
                              <button 
                                onClick={() => deleteShift(shift.id)}
                                style={{
                                  background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--shift-card-subtext)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{shift.type}</span>
                            <span style={{ textTransform: 'lowercase', opacity: 0.7 }}>{shift.status}</span>
                          </div>
                        </div>
                      );
                    })}
                    {dayShifts.length === 0 && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
                        No Shifts
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Roster Assignment Modal picker */}
      {showShiftPicker && (
        <div className="drawer-backdrop" onClick={() => setShowShiftPicker(false)}>
          <div className="glass-card" style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '320px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '16px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Select Shift Type</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Assign shift on {selectedDayForShift} for employee: {employees.find(e => e.id === draggedEmpId)?.name}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => handleSelectShiftType('Morning')}>Morning Shift (08:00 - 17:00)</button>
              <button className="btn btn-secondary" onClick={() => handleSelectShiftType('Afternoon')}>Afternoon Shift (13:00 - 21:00)</button>
              <button className="btn btn-secondary" onClick={() => handleSelectShiftType('Evening')}>Evening Shift (17:00 - 23:00)</button>
              <button className="btn btn-secondary" onClick={() => handleSelectShiftType('Custom')}>Custom Shift</button>
            </div>
            <button className="btn btn-danger" style={{ marginTop: '8px' }} onClick={() => setShowShiftPicker(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
};
export default WorkforceView;
