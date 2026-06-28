import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { 
  Car, Search, ArrowLeft, Wrench, FileText, 
  DollarSign, Clock, Milestone, Calendar, Eye, Plus
} from 'lucide-react';
import type { Vehicle } from '../../shared/types';

export const VehiclesView: React.FC = () => {
  const { vehicles, customers, workOrders, inspections, appointments, transactions, createVehicle, addToast } = useGarage();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedAge, setSelectedAge] = useState('All');
  const [selectedMileage, setSelectedMileage] = useState('All');
  const [selectedHealth, setSelectedHealth] = useState('All');

  // Form states for creating a new vehicle
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newVin, setNewVin] = useState('');
  const [newCustId, setNewCustId] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newMileage, setNewMileage] = useState(0);

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const activeCustomer = activeVehicle ? customers.find(c => c.id === activeVehicle.customerId) : null;

  // Filter Logic
  const filteredVehicles = vehicles.filter(v => {
    const cust = customers.find(c => c.id === v.customerId);
    const custName = cust ? cust.name.toLowerCase() : '';
    const matchSearch = 
      v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custName.includes(searchQuery.toLowerCase());

    const matchBrand = selectedBrand === 'All' || v.brand === selectedBrand;
    
    // Vehicle Age Calculation
    const currentYear = new Date().getFullYear();
    const age = currentYear - v.year;
    const matchAge = 
      selectedAge === 'All' ||
      (selectedAge === 'New (<3y)' && age < 3) ||
      (selectedAge === 'Mid (3-7y)' && age >= 3 && age <= 7) ||
      (selectedAge === 'Old (>7y)' && age > 7);

    // Mileage Range
    const matchMileage =
      selectedMileage === 'All' ||
      (selectedMileage === 'Low (<30k)' && v.mileage < 30000) ||
      (selectedMileage === 'Mid (30-80k)' && v.mileage >= 30000 && v.mileage <= 80000) ||
      (selectedMileage === 'High (>80k)' && v.mileage > 80000);

    // Health score color grouping
    const matchHealth =
      selectedHealth === 'All' ||
      (selectedHealth === 'Critical (<60%)' && v.healthScore < 60) ||
      (selectedHealth === 'Warning (60-80%)' && v.healthScore >= 60 && v.healthScore <= 80) ||
      (selectedHealth === 'Good (>80%)' && v.healthScore > 80);

    return matchSearch && matchBrand && matchAge && matchMileage && matchHealth;
  });

  const uniqueBrands = Array.from(new Set(vehicles.map(v => v.brand)));

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newVin || !newCustId || !newBrand || !newModel) {
      addToast("Please fill in all required fields", "warning");
      return;
    }
    await createVehicle({
      licensePlate: newPlate,
      vin: newVin,
      customerId: newCustId,
      brand: newBrand,
      model: newModel,
      year: Number(newYear),
      mileage: Number(newMileage),
      lastVisit: new Date().toISOString().split('T')[0],
      healthScore: 100,
      branchId: 'BR-01'
    });
    // Reset Form
    setNewPlate('');
    setNewVin('');
    setNewCustId('');
    setNewBrand('');
    setNewModel('');
    setNewYear(new Date().getFullYear());
    setNewMileage(0);
    setShowAddForm(false);
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
      {!selectedVehicleId ? (
        // LIST VIEW
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Vehicle Registry</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Manage vehicle asset records, inspection diagnostics, and historical service timelines.
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
              Add Vehicle
            </button>
          </div>

          {/* Add Vehicle Modal / Block */}
          {showAddForm && (
            <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Register New Vehicle</h2>
              <form onSubmit={handleCreateVehicle} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>License Plate *</label>
                  <input type="text" className="input-field" value={newPlate} onChange={e => setNewPlate(e.target.value)} placeholder="e.g. 51F-9999" required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>VIN (17 chars) *</label>
                  <input type="text" className="input-field" value={newVin} onChange={e => setNewVin(e.target.value)} maxLength={17} placeholder="e.g. 1T1AA11..." required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Customer Owner *</label>
                  <select className="input-field" value={newCustId} onChange={e => setNewCustId(e.target.value)} required>
                    <option value="">Select Customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Brand *</label>
                  <input type="text" className="input-field" value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="e.g. Toyota" required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Model *</label>
                  <input type="text" className="input-field" value={newModel} onChange={e => setNewModel(e.target.value)} placeholder="e.g. Camry" required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Year *</label>
                  <input type="number" className="input-field" value={newYear} onChange={e => setNewYear(Number(e.target.value))} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Odometer Mileage *</label>
                  <input type="number" className="input-field" value={newMileage} onChange={e => setNewMileage(Number(e.target.value))} required />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <button type="submit" className="button button-success" style={{ flex: 1, padding: '10px' }}>Register</button>
                  <button type="button" className="button button-danger" onClick={() => setShowAddForm(false)} style={{ padding: '10px' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Filters Panel */}
          <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search license plate, brand, VIN or owner..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Brand Filter</label>
                <select className="input-field" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
                  <option value="All">All Brands</option>
                  {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Mileage Filter</label>
                <select className="input-field" value={selectedMileage} onChange={e => setSelectedMileage(e.target.value)}>
                  <option value="All">All Mileage Levels</option>
                  <option value="Low (<30k)">Low (&lt; 30k mi)</option>
                  <option value="Mid (30-80k)">Mid (30-80k mi)</option>
                  <option value="High (>80k)">High (&gt; 80k mi)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Vehicle Age</label>
                <select className="input-field" value={selectedAge} onChange={e => setSelectedAge(e.target.value)}>
                  <option value="All">All Ages</option>
                  <option value="New (<3y)">New (&lt; 3 years)</option>
                  <option value="Mid (3-7y)">Mid (3 - 7 years)</option>
                  <option value="Old (>7y)">Old (&gt; 7 years)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Health Status</label>
                <select className="input-field" value={selectedHealth} onChange={e => setSelectedHealth(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Good (>80%)">Good (&gt; 80%)</option>
                  <option value="Warning (60-80%)">Warning (60-80%)</option>
                  <option value="Critical (<60%)">Critical (&lt; 60%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Cards of Vehicles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredVehicles.map(v => {
              const cust = customers.find(c => c.id === v.customerId);
              
              // Health color
              let healthColor = 'var(--accent-success)';
              if (v.healthScore < 60) healthColor = 'var(--accent-error)';
              else if (v.healthScore <= 80) healthColor = 'var(--accent-warning)';

              return (
                <div key={v.id} className="card hover-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--accent-primary)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                      }}>
                        {v.licensePlate}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Health</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: healthColor }}>
                          {v.healthScore}%
                        </span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {v.brand} {v.model}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Year: {v.year} | VIN: {v.vin.substring(0, 8)}...
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{cust?.name || 'Unknown'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Mileage:</span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{v.mileage.toLocaleString()} mi</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Last Visit:</span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{v.lastVisit}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedVehicleId(v.id)}
                    style={{
                      marginTop: '16px',
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                    className="button-hover-dark"
                  >
                    <Eye size={14} />
                    View Profile
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // PROFILE DETAIL VIEW
        <VehicleProfileView 
          vehicle={activeVehicle!}
          customer={activeCustomer}
          workOrders={workOrders.filter(w => w.vehicleId === selectedVehicleId)}
          inspections={inspections.filter(i => i.vehicleId === selectedVehicleId)}
          appointments={appointments.filter(a => a.vehicleId === selectedVehicleId)}
          transactions={transactions.filter(t => t.vehicleId === selectedVehicleId)}
          onBack={() => setSelectedVehicleId(null)}
        />
      )}
    </div>
  );
};

/* --- SUB COMPONENT: VEHICLE PROFILE DETAIL --- */
interface VehicleProfileViewProps {
  vehicle: Vehicle;
  customer: any;
  workOrders: any[];
  inspections: any[];
  appointments: any[];
  transactions: any[];
  onBack: () => void;
}

const VehicleProfileView: React.FC<VehicleProfileViewProps> = ({
  vehicle, customer, workOrders, inspections, appointments, transactions, onBack
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'inspections' | 'parts' | 'finance' | 'timeline'>('overview');

  let healthColor = 'var(--accent-success)';
  let healthBg = 'rgba(16, 185, 129, 0.1)';
  if (vehicle.healthScore < 60) {
    healthColor = 'var(--accent-error)';
    healthBg = 'rgba(239, 68, 68, 0.1)';
  } else if (vehicle.healthScore <= 80) {
    healthColor = 'var(--accent-warning)';
    healthBg = 'rgba(245, 158, 11, 0.1)';
  }

  // Calculate Parts History
  const partsHistory: { id: string; name: string; quantity: number; date: string }[] = [];
  workOrders.forEach(w => {
    if (w.partsUsed && (w.status === 'Completed' || w.status === 'Delivered')) {
      w.partsUsed.forEach((pu: any) => {
        partsHistory.push({
          id: pu.partId,
          name: pu.partId === 'P001' ? 'Ceramic Front Brake Pads' : pu.partId === 'P002' ? 'Synthetic Engine Oil' : pu.partId === 'P003' ? 'NGK Spark Plug' : pu.partId === 'P004' ? '120A Alternator Assembly' : pu.partId === 'P005' ? 'CarQuest 12V Battery' : pu.partId === 'P006' ? 'Cabin Air Filter' : pu.partId === 'P007' ? 'Wiper Blade' : 'Spare Part',
          quantity: pu.quantity,
          date: w.stageHistory?.[w.stageHistory.length - 1]?.enteredAt?.split('T')[0] || vehicle.lastVisit
        });
      });
    }
  });

  // Calculate Timeline events
  const timelineEvents: { title: string; desc: string; date: string; icon: any; color: string }[] = [];
  
  appointments.forEach(a => {
    timelineEvents.push({
      title: `Appointment: ${a.serviceType}`,
      desc: `Scheduled on Service Bay ${a.serviceBayId} | Status: ${a.status}`,
      date: a.startTime.split(' ')[0],
      icon: Calendar,
      color: '#6366f1'
    });
  });

  workOrders.forEach(w => {
    timelineEvents.push({
      title: `Work Order: ${w.status}`,
      desc: w.description,
      date: w.stageHistory?.[0]?.enteredAt?.split('T')[0] || vehicle.lastVisit,
      icon: Wrench,
      color: '#f59e0b'
    });
  });

  inspections.forEach(i => {
    timelineEvents.push({
      title: `Safety Inspection Report`,
      desc: `Completed general diagnostic worksheet check`,
      date: i.date,
      icon: FileText,
      color: '#10b981'
    });
  });

  transactions.forEach(t => {
    timelineEvents.push({
      title: `${t.type} Generated`,
      desc: t.description,
      date: t.date,
      icon: DollarSign,
      color: t.type === 'Revenue' ? '#10b981' : '#ef4444'
    });
  });

  timelineEvents.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      {/* Back Header */}
      <button 
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          marginBottom: '20px',
          fontWeight: 600,
          fontSize: '14px'
        }}
      >
        <ArrowLeft size={16} />
        Back to Registry
      </button>

      {/* Hero Section */}
      <div className="card" style={{ 
        padding: '24px', 
        marginBottom: '24px', 
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center',
        background: 'var(--app-card-bg)'
      }}>
        {/* Fallback Vehicle Photo/Avatar */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <Car size={48} color="var(--accent-primary)" />
        </div>

        {/* Core Specs */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800 }}>{vehicle.brand} {vehicle.model}</h1>
            <span style={{
              background: 'var(--subcard-bg)',
              color: 'var(--text-primary)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid var(--border-color)',
              letterSpacing: '0.05em'
            }}>
              {vehicle.licensePlate}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>VIN:</span> {vehicle.vin}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Year:</span> {vehicle.year}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Mileage:</span> {vehicle.mileage.toLocaleString()} mi</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Last Visit:</span> {vehicle.lastVisit}</div>
          </div>
        </div>

        {/* Health gauge */}
        <div style={{
          padding: '16px 24px',
          borderRadius: '12px',
          background: healthBg,
          border: `1px solid ${healthColor}40`,
          textAlign: 'center',
          minWidth: '150px'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>Health Score</span>
          <span style={{ fontSize: '32px', fontWeight: 800, color: healthColor }}>{vehicle.healthScore}%</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '24px',
        overflowX: 'auto',
        gap: '8px'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: Car },
          { id: 'history', label: 'Service History', icon: Wrench },
          { id: 'inspections', label: 'Inspection Reports', icon: FileText },
          { id: 'parts', label: 'Parts Replaced', icon: Milestone },
          { id: 'finance', label: 'Invoices', icon: DollarSign },
          { id: 'timeline', label: 'Timeline', icon: Clock }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                borderBottom: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'all 0.2s',
                outline: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Vehicle Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--section-divider)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Brand &amp; Model</span>
                  <span style={{ fontWeight: 600 }}>{vehicle.brand} {vehicle.model}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--section-divider)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Manufacture Year</span>
                  <span style={{ fontWeight: 600 }}>{vehicle.year}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--section-divider)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Odometer Mileage</span>
                  <span style={{ fontWeight: 600 }}>{vehicle.mileage.toLocaleString()} miles</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--section-divider)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>VIN Number</span>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{vehicle.vin}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Multi-Branch Owner</span>
                  <span style={{ fontWeight: 600 }}>Branch A (Downtown)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Customer Owner Profile</h3>
              {customer ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--section-divider)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Owner Name</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{customer.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--section-divider)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Phone Contact</span>
                    <span style={{ fontWeight: 600 }}>{customer.phone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--section-divider)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Email</span>
                    <span style={{ fontWeight: 600 }}>{customer.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Loyalty Tier</span>
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: 'var(--accent-warning)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>{customer.loyaltyTier}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No customer profile linked to this vehicle.</p>
              )}
            </div>
          </div>
        )}

        {/* SERVICE HISTORY PANEL */}
        {activeTab === 'history' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Repair &amp; Service History</h3>
            {workOrders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {workOrders.map((w: any) => (
                  <div key={w.id} style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'var(--subcard-bg)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>WO-{w.id.replace('WO', '')}</span>
                        <span style={{
                          fontSize: '11px',
                          background: 'rgba(99,102,241,0.1)',
                          color: 'var(--accent-primary)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>{w.status}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{w.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Date Logged</span>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>
                        {w.stageHistory?.[0]?.enteredAt?.split('T')[0] || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No past work orders found.</p>
            )}
          </div>
        )}

        {/* INSPECTIONS PANEL */}
        {activeTab === 'inspections' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Historical Inspection Records</h3>
            {inspections.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {inspections.map((i: any) => (
                  <div key={i.id} style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'var(--subcard-bg)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--section-divider)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>Inspection {i.id}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{i.date}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                      {i.categories.map((c: any) => {
                        let statusColor = 'var(--accent-success)';
                        if (c.status === 'Critical') statusColor = 'var(--accent-error)';
                        else if (c.status === 'Warning') statusColor = 'var(--accent-warning)';
                        return (
                          <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--subcard-bg-strong)', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                            <span style={{ color: statusColor, fontWeight: 700 }}>{c.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No inspections completed yet.</p>
            )}
          </div>
        )}

        {/* PARTS HISTORY PANEL */}
        {activeTab === 'parts' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Replaced Materials &amp; Parts</h3>
            {partsHistory.length > 0 ? (
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Part Name</th>
                    <th>Part SKU Code</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Replacement Date</th>
                  </tr>
                </thead>
                <tbody>
                  {partsHistory.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.id}</span></td>
                      <td style={{ textAlign: 'center' }}>{p.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No parts replacements recorded.</p>
            )}
          </div>
        )}

        {/* FINANCIALS PANEL */}
        {activeTab === 'finance' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Invoice Ledger</h3>
            {transactions.length > 0 ? (
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Date Paid</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Paid Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t: any) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent-success)' }}>{t.id}</td>
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-success)' }}>
                        +${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No financial invoices posted for this vehicle.</p>
            )}
          </div>
        )}

        {/* TIMELINE PANEL */}
        {activeTab === 'timeline' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>Visits &amp; Operations Timeline</h3>
            {timelineEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
                {/* Vertical line */}
                <div style={{
                  position: 'absolute',
                  left: '7px',
                  top: '8px',
                  bottom: '8px',
                  width: '2px',
                  background: 'var(--border-color)'
                }} />

                {timelineEvents.map((e, idx) => {
                  const EventIcon = e.icon;
                  return (
                    <div key={idx} style={{ position: 'relative', display: 'flex', gap: '16px' }}>
                      {/* Node Dot */}
                      <div style={{
                        position: 'absolute',
                        left: '-24px',
                        top: '2px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'var(--app-card-bg)',
                        border: `3px solid ${e.color}`,
                        zIndex: 2
                      }} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{e.date}</span>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <EventIcon size={14} style={{ color: e.color }} />
                          {e.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{e.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Timeline is empty.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
export default VehiclesView;
