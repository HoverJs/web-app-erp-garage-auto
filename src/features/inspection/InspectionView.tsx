import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Plus, 
  Calendar, ClipboardCheck
} from 'lucide-react';
import type { InspectionCategory } from '../../shared/types';

export const InspectionView: React.FC = () => {
  const { vehicles, inspections, createInspection, addToast } = useGarage();
  
  const [showForm, setShowForm] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [workOrderId, setWorkOrderId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Set up categories state
  const CATEGORY_NAMES = ['Engine', 'Transmission', 'Brakes', 'Suspension', 'Battery', 'Tires', 'Exterior', 'Interior'];
  const [categoryData, setCategoryData] = useState<{ [name: string]: { status: 'Pass' | 'Warning' | 'Critical'; notes: string } }>(
    CATEGORY_NAMES.reduce((acc, name) => {
      acc[name] = { status: 'Pass', notes: '' };
      return acc;
    }, {} as any)
  );

  const handleStatusChange = (category: string, status: 'Pass' | 'Warning' | 'Critical') => {
    setCategoryData(prev => ({
      ...prev,
      [category]: { ...prev[category], status }
    }));
  };

  const handleNotesChange = (category: string, notes: string) => {
    setCategoryData(prev => ({
      ...prev,
      [category]: { ...prev[category], notes }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      addToast("Please select a vehicle asset", "warning");
      return;
    }

    const categoriesList: InspectionCategory[] = CATEGORY_NAMES.map(name => ({
      name,
      status: categoryData[name].status,
      notes: categoryData[name].notes
    }));

    await createInspection({
      workOrderId: workOrderId || 'WO-GEN',
      vehicleId,
      date,
      categories: categoriesList,
      branchId: 'BR-01'
    });

    // Reset Form
    setVehicleId('');
    setWorkOrderId('');
    setCategoryData(
      CATEGORY_NAMES.reduce((acc, name) => {
        acc[name] = { status: 'Pass', notes: '' };
        return acc;
      }, {} as any)
    );
    setShowForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Critical': return <AlertCircle size={14} color="var(--accent-error)" />;
      case 'Warning': return <AlertTriangle size={14} color="var(--accent-warning)" />;
      default: return <CheckCircle2 size={14} color="var(--accent-success)" />;
    }
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Inspection Reports</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Conduct diagnostic worksheets for vehicles. Score inputs will automatically update the core Vehicle Health Score.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
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
          New Inspection
        </button>
      </div>

      {/* New Inspection Form Sheet */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Conduct Vehicle Diagnostics Worksheet</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Select Vehicle *</label>
                <select className="input-field" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
                  <option value="">Choose Vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.licensePlate})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Work Order ID (Optional)</label>
                <input type="text" className="input-field" placeholder="e.g. WO001" value={workOrderId} onChange={e => setWorkOrderId(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Inspection Date *</label>
                <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Category Evaluation Specs</h3>
            
            {/* Grid of categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {CATEGORY_NAMES.map(catName => {
                const data = categoryData[catName];
                return (
                  <div key={catName} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '150px 240px 1fr', 
                    gap: '16px', 
                    alignItems: 'center', 
                    paddingBottom: '12px', 
                    borderBottom: '1px solid var(--section-divider)' 
                  }}>
                    <span style={{ fontWeight: 600 }}>{catName}</span>
                    
                    {/* Status radio buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['Pass', 'Warning', 'Critical'].map(st => (
                        <label key={st} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name={`st-${catName}`} 
                            checked={data.status === st} 
                            onChange={() => handleStatusChange(catName, st as any)}
                          />
                          <span style={{ 
                            color: st === 'Critical' ? 'var(--accent-error)' : st === 'Warning' ? 'var(--accent-warning)' : 'var(--accent-success)',
                            fontWeight: 600
                          }}>{st}</span>
                        </label>
                      ))}
                    </div>

                    {/* Notes input */}
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder={`Notes for ${catName}...`} 
                      value={data.notes}
                      onChange={e => handleNotesChange(catName, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="submit" className="button button-success" style={{ padding: '10px 24px', fontWeight: 600 }}>Submit Diagnostic Sheet</button>
              <button type="button" className="button button-danger" onClick={() => setShowForm(false)} style={{ padding: '10px 20px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Inspections History List */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Diagnostic History Logs</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {inspections.map(i => {
          const veh = vehicles.find(v => v.id === i.vehicleId);
          
          return (
            <div key={i.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ClipboardCheck size={18} color="var(--accent-primary)" />
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>Log {i.id} - WO{i.workOrderId.replace('WO', '')}</span>
                  <span style={{ fontSize: '12px', background: 'var(--subcard-bg)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    {veh ? `${veh.brand} ${veh.model} (${veh.licensePlate})` : 'Unknown Vehicle'}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}><Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />{i.date}</span>
              </div>

              {/* Badges Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {i.categories.map((c: any) => (
                  <div key={c.name} style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--subcard-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{c.name}</span>
                      {getStatusIcon(c.status)}
                    </div>
                    {c.notes && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{c.notes}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
export default InspectionView;
