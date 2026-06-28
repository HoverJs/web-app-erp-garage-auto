import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { ShieldAlert, Lightbulb, Zap, CheckCircle2, Sparkles, Building } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { insights, resolveInsight, transactions, loading, refreshData } = useGarage();

  // Calculate June Branch Details for comparisons using branchId
  const juneTransactions = transactions.filter(t => t.date.startsWith('2026-06'));
  const branchAMetrix = juneTransactions.filter(t => t.branchId === 'BR-01');
  const branchBMetrix = juneTransactions.filter(t => t.branchId === 'BR-02');

  const revA = branchAMetrix.filter(t => t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0);
  const expA = branchAMetrix.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const profitA = revA - expA;
  const marginA = revA > 0 ? (profitA / revA) * 100 : 0;

  const revB = branchBMetrix.filter(t => t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0);
  const expB = branchBMetrix.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const profitB = revB - expB;
  const marginB = revB > 0 ? (profitB / revB) * 100 : 0;

  const handleActionClick = async (insightId: string, actionType: string, payload: any) => {
    await resolveInsight(insightId, actionType, payload);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <ShieldAlert size={20} color="var(--accent-danger)" />;
      case 'warning':
        return <Lightbulb size={20} color="var(--accent-warning)" />;
      case 'info':
      default:
        return <Zap size={20} color="var(--accent-info)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>Executive Dashboard &amp; Smart Insights</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>CEO-level corporate analytics and rule-based diagnostic recommendations.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={refreshData}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Sparkles size={16} />
          {loading ? 'Analyzing...' : 'Run Diagnostics'}
        </button>
      </div>

      {/* Row 1: P&L Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Gross Operating Profit</span>
          <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '8px' }}>
            ${(revA + revB).toLocaleString()}
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Aggregated corporate revenue intake</p>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Net Margin Average</span>
          <h3 style={{ fontSize: '28px', color: 'var(--accent-success)', marginTop: '8px' }}>
            {(revA + revB) > 0 ? ((((profitA + profitB) / (revA + revB)) * 100).toFixed(1)) : '0'}%
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Average EBITDA profitability ratio</p>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-success)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Active Bays Capacity</span>
          <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '8px' }}>85%</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Physical layout utilization index</p>
        </div>

      </div>

      {/* Row 2: AI Insights Feed & Strategic Actions */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-secondary)" />
              Smart Insights Engine Recommendations
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Heuristic auditing algorithms analyze monthly margins, payroll overheads, and stock thresholds.</p>
          </div>
          <span className="badge badge-info">Rule-Based Analytics</span>
        </div>

        {/* List of generated insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {insights.map(ins => (
            <div 
              key={ins.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'all 0.2s',
                borderLeft: ins.type === 'critical' 
                  ? '4px solid var(--accent-danger)' 
                  : ins.type === 'warning' 
                    ? '4px solid var(--accent-warning)' 
                    : '4px solid var(--accent-info)'
              }}
              className="insight-card"
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getInsightIcon(ins.type)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>{ins.title}</h4>
                    <span className="badge" style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-muted)'
                    }}>{ins.module}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                    {ins.description}
                  </p>
                </div>
              </div>

              {/* Action Button trigger */}
              {ins.actionLabel && ins.actionPayload && (
                <button
                  onClick={() => handleActionClick(ins.id, ins.actionPayload!.actionType, ins.actionPayload!.updates)}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    boxShadow: 'none',
                    fontWeight: 600
                  }}
                >
                  <Zap size={12} />
                  {ins.actionLabel}
                </button>
              )}
            </div>
          ))}

          {insights.length === 0 && (
            <div className="empty-state">
              <CheckCircle2 size={36} color="var(--accent-success)" style={{ marginBottom: '12px' }} />
              <h3>All Operations Healthy</h3>
              <p>The Insights Engine detected no resource imbalances, margin flags, or low stock warnings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Branch Profitability Comparison Matrix */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div>
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Multi-Branch Profitability Comparison</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Operational margins and revenue splits between active facilities.</p>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>June Data Breakdown</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '24px' }}>
          
          {/* Branch A Block */}
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            background: 'rgba(99, 102, 241, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Building size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Branch A (Downtown)</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Revenue:</span>
                <span style={{ fontWeight: 600 }}>${revA.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Expenses:</span>
                <span style={{ fontWeight: 600 }}>-${expA.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Net Profit:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>${profitA.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Operating Margin:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{marginA.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Branch B Block */}
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            background: 'rgba(139, 92, 246, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Building size={18} color="var(--accent-secondary)" />
              <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Branch B (Westside)</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Revenue:</span>
                <span style={{ fontWeight: 600 }}>${revB.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Expenses:</span>
                <span style={{ fontWeight: 600 }}>-${expB.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Net Profit:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>${profitB.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Operating Margin:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{marginB.toFixed(1)}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
export default AnalyticsView;
