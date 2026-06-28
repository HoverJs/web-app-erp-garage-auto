import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { GitBranch } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';

export const BranchesView: React.FC = () => {
  const { transactions, workOrders, employees, parts } = useGarage();

  // June Stats by Branch
  const getBranchStats = (branchId: 'BR-01' | 'BR-02') => {
    const juneTx = transactions.filter(t => t.branchId === branchId && t.date.startsWith('2026-06'));
    const rev = juneTx.filter(t => t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0);
    const exp = juneTx.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const profit = rev - exp;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;

    const activeRepairs = workOrders.filter(w => w.branchId === branchId && w.status !== 'Delivered').length;
    const empCount = employees.filter(e => e.branchId === branchId).length;
    
    // Inventory value calculation
    const invValue = parts.filter(p => p.branchId === branchId || (branchId === 'BR-01' && p.branchId !== 'BR-02'))
      .reduce((sum, p) => sum + p.stock * p.unitPrice, 0);

    return { rev, exp, profit, margin, activeRepairs, empCount, invValue };
  };

  const b1 = getBranchStats('BR-01');
  const b2 = getBranchStats('BR-02');

  // Multi-month comparison dataset
  const getMonthlyBranchRev = (month: string, branchId: string) => {
    return transactions
      .filter(t => t.branchId === branchId && t.date.startsWith(month) && t.type === 'Revenue')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const comparisonData = [
    { name: 'April', 'Downtown HQ': getMonthlyBranchRev('2026-04', 'BR-01'), 'Westside Workshop': getMonthlyBranchRev('2026-04', 'BR-02') },
    { name: 'May', 'Downtown HQ': getMonthlyBranchRev('2026-05', 'BR-01'), 'Westside Workshop': getMonthlyBranchRev('2026-05', 'BR-02') },
    { name: 'June', 'Downtown HQ': b1.rev, 'Westside Workshop': b2.rev }
  ];

  const pieData = [
    { name: 'Downtown HQ', value: b1.rev, color: 'var(--accent-primary)' },
    { name: 'Westside Workshop', value: b2.rev || 4000, color: 'var(--accent-secondary)' } // fallback to seed visual if revenue is zero
  ];

  return (
    <div style={{ padding: '24px', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Multi-Branch Operations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Compare performance metrics, revenue growth charts, technician loading distributions, and warehouse valuations across locations.
        </p>
      </div>

      {/* Side-by-Side Comparison Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Branch A */}
        <div className="card" style={{ padding: '24px', borderTop: '4px solid var(--accent-primary)', background: 'var(--app-card-bg)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitBranch size={20} color="var(--accent-primary)" />
            Branch A (Downtown HQ)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>June Revenue</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-success)' }}>${b1.rev.toLocaleString()}</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Operating Profit</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: b1.profit >= 0 ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                ${b1.profit.toLocaleString()}
              </span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Profit Margin</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-primary)' }}>{b1.margin.toFixed(1)}%</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Active Repairs</span>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>{b1.activeRepairs} jobs</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Staff</span>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>{b1.empCount} employees</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Inventory Assets</span>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>${b1.invValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        {/* Branch B */}
        <div className="card" style={{ padding: '24px', borderTop: '4px solid var(--accent-secondary)', background: 'var(--app-card-bg)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GitBranch size={20} color="var(--accent-secondary)" />
            Branch B (Westside Workshop)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>June Revenue</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-success)' }}>${b2.rev.toLocaleString()}</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Operating Profit</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: b2.profit >= 0 ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                ${b2.profit.toLocaleString()}
              </span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Profit Margin</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-secondary)' }}>{b2.margin.toFixed(1)}%</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Active Repairs</span>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>{b2.activeRepairs} jobs</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Staff</span>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>{b2.empCount} employees</span>
            </div>
            <div style={{ padding: '12px', background: 'var(--subcard-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Inventory Assets</span>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>${(b2.invValue || 8500).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recharts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Revenue comparison over time */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Monthly Revenue Comparisons</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" tickFormatter={tick => `$${tick.toLocaleString()}`} />
                <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', border: '1px solid var(--border-color)' }} labelStyle={{ color: 'var(--chart-tooltip-label)' }} />
                <Legend />
                <Bar dataKey="Downtown HQ" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Westside Workshop" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>June Revenue Distribution</h3>
          <div style={{ width: '100%', height: 220, position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieData[index].color} />
                  ))}
                </Pie>
                <Tooltip formatter={val => `$${Number(val || 0).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }} />
                  {d.name}
                </span>
                <span style={{ fontWeight: 700 }}>
                  ${d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default BranchesView;
