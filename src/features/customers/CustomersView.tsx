import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { 
  Search, Plus, DollarSign, TrendingUp, Phone, Mail, 
  MessageSquare, UserCheck, Eye, ArrowLeft, Car, Wrench, Notebook, Send
} from 'lucide-react';
import type { Customer } from '../../shared/types';

export const CustomersView: React.FC = () => {
  const { customers, vehicles, workOrders, transactions, createCustomer, updateCustomer, addToast } = useGarage();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  // Form states for creating a new customer
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newContactMethod, setNewContactMethod] = useState<'Phone' | 'Email' | 'SMS'>('Email');
  const [newMarketing, setNewMarketing] = useState(true);

  // Note text input
  const [noteText, setNoteText] = useState('');

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);
  const activeVehicles = vehicles.filter(v => v.customerId === selectedCustomerId);
  const activeWorkOrders = workOrders.filter(w => w.customerId === selectedCustomerId);
  const activeTransactions = transactions.filter(t => t.customerId === selectedCustomerId);

  // CRM KPI Calculations
  const totalSpendingSum = customers.reduce((sum, c) => sum + c.totalSpending, 0);
  const customerLTV = customers.length > 0 ? totalSpendingSum / customers.length : 0;
  const highTierCount = customers.filter(c => c.loyaltyTier === 'Gold' || c.loyaltyTier === 'Platinum').length;
  const retentionRate = customers.length > 0 ? (highTierCount / customers.length) * 100 : 0;
  const topSpenders = [...customers].sort((a, b) => b.totalSpending - a.totalSpending).slice(0, 3);

  // Filter Logic
  const filteredCustomers = customers.filter(c => {
    const matchSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchTier = selectedTier === 'All' || c.loyaltyTier === selectedTier;
    return matchSearch && matchTier;
  });

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newEmail) {
      addToast("Please fill in all required fields", "warning");
      return;
    }
    await createCustomer({
      name: newName,
      phone: newPhone,
      email: newEmail,
      loyaltyTier: 'Bronze',
      totalSpending: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      preferredContactMethod: newContactMethod,
      marketingOptIn: newMarketing,
      notes: [],
      branchId: 'BR-01'
    });
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setShowAddForm(false);
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !activeCustomer) return;
    const updatedNotes = [...(activeCustomer.notes || []), noteText.trim()];
    await updateCustomer(activeCustomer.id, { notes: updatedNotes });
    setNoteText('');
    addToast("CRM account note updated", "success");
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return '#a855f7'; // Purple
      case 'Gold': return '#eab308'; // Amber/Gold
      case 'Silver': return '#94a3b8'; // Slate/Silver
      default: return '#b45309'; // Bronze
    }
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
      {!selectedCustomerId ? (
        // CRM INDEX VIEW
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Customer CRM Portal</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Automated Loyalty systems, Customer Lifetime Value monitors, and client contact managers.
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
              Register Client
            </button>
          </div>

          {/* CRM Analytics Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Customer Lifetime Value (LTV)</span>
                <span style={{ fontSize: '20px', fontWeight: 800 }}>
                  ${customerLTV.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-success)' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Repeat Retention Rate</span>
                <span style={{ fontSize: '20px', fontWeight: 800 }}>{retentionRate.toFixed(0)}%</span>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Top Loyal Spenders</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {topSpenders.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{i+1}. {c.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>${c.totalSpending.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Client Form */}
          {showAddForm && (
            <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Register New Customer</h2>
              <form onSubmit={handleCreateCustomer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Customer Name *</label>
                  <input type="text" className="input-field" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Tony Stark" required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Phone Contact *</label>
                  <input type="text" className="input-field" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="e.g. +1 (555) 012-3344" required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email Address *</label>
                  <input type="email" className="input-field" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="e.g. tony@stark.com" required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Contact Method</label>
                  <select className="input-field" value={newContactMethod} onChange={e => setNewContactMethod(e.target.value as any)}>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '32px' }}>
                  <input type="checkbox" id="mOpt" checked={newMarketing} onChange={e => setNewMarketing(e.target.checked)} />
                  <label htmlFor="mOpt" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Opt-In Marketing News</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <button type="submit" className="button button-success" style={{ flex: 1, padding: '10px' }}>Register</button>
                  <button type="button" className="button button-danger" onClick={() => setShowAddForm(false)} style={{ padding: '10px' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* CRM Index List */}
          <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search client directory by name, phone or email..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <select 
                className="input-field" 
                value={selectedTier} 
                onChange={e => setSelectedTier(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="All">All Tiers</option>
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
              </select>
            </div>

            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Loyalty Tier</th>
                  <th>Preferred Channel</th>
                  <th>Owned Vehicles</th>
                  <th>Total Spent</th>
                  <th>Last Visit</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => {
                  const clientVehicles = vehicles.filter(v => v.customerId === c.id);
                  const tierColor = getTierColor(c.loyaltyTier);

                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>
                        <span style={{
                          background: `${tierColor}15`,
                          color: tierColor,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: `1px solid ${tierColor}30`
                        }}>
                          {c.loyaltyTier}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {c.preferredContactMethod}
                        </span>
                      </td>
                      <td>{clientVehicles.length} vehicles</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>
                        ${c.totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td>{c.lastVisit}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedCustomerId(c.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            color: 'var(--accent-primary)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          <Eye size={12} />
                          Open CRM
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // CLIENT DETAIL DRAWER / PAGE VIEW
        <CustomerProfileView 
          customer={activeCustomer!}
          vehicles={activeVehicles}
          workOrders={activeWorkOrders}
          transactions={activeTransactions}
          noteText={noteText}
          setNoteText={setNoteText}
          onAddNote={handleAddNote}
          onBack={() => setSelectedCustomerId(null)}
          getTierColor={getTierColor}
        />
      )}
    </div>
  );
};

/* --- SUB COMPONENT: CUSTOMER PROFILE CRM DETAIL --- */
interface CustomerProfileViewProps {
  customer: Customer;
  vehicles: any[];
  workOrders: any[];
  transactions: any[];
  noteText: string;
  setNoteText: (t: string) => void;
  onAddNote: () => void;
  onBack: () => void;
  getTierColor: (t: string) => string;
}

const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  customer, vehicles, workOrders, transactions, noteText, setNoteText, onAddNote, onBack, getTierColor
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'history' | 'finance' | 'notes'>('overview');
  const tierColor = getTierColor(customer.loyaltyTier);

  return (
    <div>
      {/* Back Button */}
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
        Back to CRM Directory
      </button>

      {/* Hero Header */}
      <div className="card" style={{ 
        padding: '24px', 
        marginBottom: '24px', 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <UserCheck size={36} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800 }}>{customer.name}</h1>
              <span style={{
                background: `${tierColor}15`,
                color: tierColor,
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                border: `1px solid ${tierColor}30`
              }}>
                {customer.loyaltyTier}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div><Phone size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />{customer.phone}</div>
              <div><Mail size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />{customer.email}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>Total LTV Spent</span>
            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-success)' }}>
              ${customer.totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '24px',
        overflowX: 'auto',
        gap: '8px'
      }}>
        {[
          { id: 'overview', label: 'CRM Details', icon: UserCheck },
          { id: 'vehicles', label: 'Owned Vehicles', icon: Car },
          { id: 'history', label: 'Service History', icon: Wrench },
          { id: 'finance', label: 'Payments', icon: DollarSign },
          { id: 'notes', label: 'Internal Notes', icon: Notebook }
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

      {/* Panel */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* CRM DETAILS */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px' }}>Account Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Marketing Subscription</span>
                  <span style={{ fontWeight: 600, color: customer.marketingOptIn ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                    {customer.marketingOptIn ? 'Subscribed (Opt-In)' : 'Unsubscribed'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Preferred Channel</span>
                  <span style={{ fontWeight: 600 }}>{customer.preferredContactMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Registered Location</span>
                  <span style={{ fontWeight: 600 }}>Branch A (Downtown)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Last Visit Date</span>
                  <span style={{ fontWeight: 600 }}>{customer.lastVisit}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px' }}>CRM Status Gauge</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                This profile is registered under the loyalty system. Spending of $5,000+ unlocks Gold tier, and $10,000+ unlocks Platinum. Customers under Gold and Platinum tiers receive priority scheduling, premium shuttle allocations, and automatic 10% discounts on non-warranty spare parts.
              </p>
            </div>
          </div>
        )}

        {/* OWNED VEHICLES */}
        {activeTab === 'vehicles' && (
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px' }}>Registered Vehicles</h3>
            {vehicles.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {vehicles.map(v => (
                  <div key={v.id} style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{v.brand} {v.model}</span>
                      <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                        {v.licensePlate}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div>VIN: {v.vin}</div>
                      <div>Odometer: {v.mileage.toLocaleString()} mi</div>
                      <div>Health score: <span style={{ color: v.healthScore < 60 ? 'var(--accent-error)' : 'var(--accent-success)', fontWeight: 700 }}>{v.healthScore}%</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No vehicles linked to this customer account.</p>
            )}
          </div>
        )}

        {/* SERVICE HISTORY */}
        {activeTab === 'history' && (
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px' }}>Work Order Tickets</h3>
            {workOrders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {workOrders.map((w: any) => (
                  <div key={w.id} style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>WO-{w.id.replace('WO', '')}</span>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{w.description}</p>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      background: 'rgba(99,102,241,0.1)',
                      color: 'var(--accent-primary)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>{w.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No historical tickets logged.</p>
            )}
          </div>
        )}

        {/* FINANCE INVOICES */}
        {activeTab === 'finance' && (
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px' }}>Transaction Statements</h3>
            {transactions.length > 0 ? (
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Date Paid</th>
                    <th>Billing Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
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
              <p style={{ color: 'var(--text-muted)' }}>No payments registered on this account.</p>
            )}
          </div>
        )}

        {/* INTERNAL NOTES */}
        {activeTab === 'notes' && (
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px' }}>CRM Internal Account Notes</h3>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Type customer account notes (e.g. key specs, service preferences)..." 
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <button 
                onClick={onAddNote}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={14} />
                Save
              </button>
            </div>

            {customer.notes && customer.notes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customer.notes.map((note, idx) => (
                  <div key={idx} style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <MessageSquare size={14} style={{ marginTop: '2px', color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>No internal notes saved on this client profile.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
export default CustomersView;
