import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { transactions, employees, attendance } = useGarage();
  const [selectedPayeeId, setSelectedPayeeId] = useState<string>('EMP004'); // default: David Miller

  // 1. Dynamic Calculations (June 2026)
  const juneTransactions = transactions.filter(t => t.date.startsWith('2026-06'));
  
  const monthlyRevenue = juneTransactions
    .filter(t => t.type === 'Revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = juneTransactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = monthlyRevenue - monthlyExpenses;

  const payrollCosts = juneTransactions
    .filter(t => t.type === 'Expense' && t.sourceOrCategory === 'Payroll')
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Chart Data Construction
  // P&L Trend (April, May, June)
  const getPeriodStats = (prefix: string) => {
    const periodTxs = transactions.filter(t => t.date.startsWith(prefix));
    const rev = periodTxs.filter(t => t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0);
    const exp = periodTxs.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    return { name: prefix === '2026-04' ? 'April' : prefix === '2026-05' ? 'May' : 'June', Revenue: rev, Expense: exp };
  };

  const plChartData = [
    getPeriodStats('2026-04'),
    getPeriodStats('2026-05'),
    getPeriodStats('2026-06')
  ];

  // Expense Breakdown Pie Data
  const categories = ['Rent', 'Utilities', 'Payroll', 'Parts Purchases', 'Software Subscriptions', 'Internet'];
  const colors = ['#8b5cf6', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6'];

  const expenseBreakdownData = categories.map(cat => {
    const total = juneTransactions
      .filter(t => t.type === 'Expense' && t.sourceOrCategory === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat, value: total };
  }).filter(item => item.value > 0);

  // 3. Payroll Calculation Card for Selected Employee
  const payee = employees.find(e => e.id === selectedPayeeId) || employees[0];
  const calculatePayrollComponents = (emp: typeof payee) => {
    if (!emp) return { base: 0, overtimePay: 0, bonus: 0, allowance: 0, deductions: 0, net: 0, otHours: 0 };
    
    // Calculate overtime hours (simulated from attendance clock logs of status 'Overtime' in June)
    const empLogs = attendance.filter(a => a.employeeId === emp.id && a.date.startsWith('2026-06'));
    const otDays = empLogs.filter(l => l.status === 'Overtime').length;
    const otHours = otDays * 2.5; // assume 2.5 hours per overtime check-out
    
    const base = emp.baseSalary;
    const allowance = emp.allowance;
    const bonus = emp.bonus;
    const overtimePay = otHours * emp.overtimeRate;
    
    const gross = base + allowance + bonus + overtimePay;
    const deductions = Number((gross * 0.12).toFixed(2)); // 12% standard income tax & benefit deductions
    const net = gross - deductions;

    return { base, overtimePay, bonus, allowance, deductions, net, otHours };
  };

  const payroll = calculatePayrollComponents(payee);

  // Accounts Boards Data Mocks
  const accountsReceivable = [
    { client: 'Alice Cooper', desc: 'WO-001 outstanding invoice balance', amount: 350, due: 'Overdue by 3 days' },
    { client: 'Bruce Wayne', desc: 'Preventive service check account', amount: 540, due: 'Due in 5 days' },
    { client: 'Geico Insurance Corp', desc: 'Vehicle collision claim payoff', amount: 6200, due: 'Due in 14 days' }
  ];

  const accountsPayable = [
    { supplier: 'Apex Auto Parts Wholesale', desc: 'Invoice AP-992 Brake components', amount: 1850, due: 'Due in 2 days' },
    { supplier: 'City Municipal Utilities', desc: 'Electricity and water services', amount: 1100, due: 'Due in 6 days' },
    { supplier: 'Vanguard Realty Group', desc: 'Downtown facility monthly rent', amount: 3500, due: 'Due in 7 days' }
  ];

  const totalAR = accountsReceivable.reduce((sum, item) => sum + item.amount, 0);
  const totalAP = accountsPayable.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>Financial Ledger &amp; Payroll</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Manage corporate accounts receivable, operational payables, and staff salary statements.</p>
      </div>

      {/* Row 1: KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-success)', flexShrink: 0
          }}>
            <ArrowUpRight size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>June Revenues</span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '4px' }}>${monthlyRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-error)', flexShrink: 0
          }}>
            <ArrowDownRight size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>June Expenses</span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '4px' }}>${monthlyExpenses.toLocaleString()}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0
          }}>
            <DollarSign size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Operating EBITDA</span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '4px' }}>${netProfit.toLocaleString()}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-info)', flexShrink: 0
          }}>
            <DollarSign size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Payroll Overhead</span>
            <h3 style={{ fontSize: '28px', color: 'var(--text-primary)', marginTop: '4px' }}>${payrollCosts.toLocaleString()}</h3>
          </div>
        </div>

      </div>

      {/* Row 2: Charts (P&L Trend vs Expense Breakdown) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* P&L Trend bar chart */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Revenues vs Expenses Trends</h3>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" tickFormatter={tick => `$${tick}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'var(--border-color)', color: '#fff' }} />
                <Legend />
                <Bar dataKey="Revenue" fill="var(--accent-success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="var(--accent-error)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense breakdown pie */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '10px' }}>June Expense Breakdown</h3>
          <div style={{ flex: 1, width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdownData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'var(--border-color)', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div style={{
              position: 'absolute', bottom: '10px', left: 0, right: 0,
              display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', fontSize: '11px'
            }}>
              {expenseBreakdownData.map((item, idx) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors[idx % colors.length] }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}: ${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: AR/AP Ledger Boards & Transaction Creator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Accounts Receivable */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Accounts Receivable (AR)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Customer debts and outstanding insurance settlements.</p>
            </div>
            <span className="badge badge-success" style={{ fontWeight: 600 }}>Total AR: ${totalAR.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {accountsReceivable.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px',
                borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)'
              }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.client}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>${item.amount.toLocaleString()}</span>
                  <span style={{ fontSize: '9px', display: 'block', color: item.due.includes('Overdue') ? 'var(--accent-danger)' : 'var(--text-muted)', marginTop: '2px' }}>
                    {item.due}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Accounts Payable (AP)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Upcoming supplier billables and operating contracts.</p>
            </div>
            <span className="badge badge-warning" style={{ fontWeight: 600 }}>Total AP: ${totalAP.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {accountsPayable.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px',
                borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)'
              }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.supplier}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>${item.amount.toLocaleString()}</span>
                  <span style={{ fontSize: '9px', display: 'block', color: 'var(--text-muted)', marginTop: '2px' }}>{item.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 4: Payroll Card Run Selector */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Employee Payroll Card Generator</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Select an employee profile file to review overtime work offsets and calculate net monthly salary.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginTop: '24px', alignItems: 'flex-start' }}>
          
          {/* Employee list picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedPayeeId(emp.id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: selectedPayeeId === emp.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: selectedPayeeId === emp.id ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.01)',
                  color: selectedPayeeId === emp.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: selectedPayeeId === emp.id ? 600 : 500,
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  outline: 'none'
                }}
              >
                <span>{emp.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.6 }}>{emp.position}</span>
              </button>
            ))}
          </div>

          {/* The Payroll Card */}
          {payee && (
            <div style={{
              border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px',
              background: 'rgba(255,255,255,0.02)', position: 'relative'
            }}>
              {/* Card Header branding */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>AUTO-ERP PAYROLL STATEMENT</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Statement Period: June 01 - June 28, 2026</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--accent-primary)' }}>{payee.id}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{payee.branch.split(' (')[0]}</span>
                </div>
              </div>

              {/* Employee Summary details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <p>Employee Name: <strong style={{ color: '#fff' }}>{payee.name}</strong></p>
                  <p style={{ marginTop: '4px' }}>Position Title: <strong>{payee.position}</strong></p>
                </div>
                <div>
                  <p>Hourly Overtime Rate: <strong>${payee.overtimeRate}/hr</strong></p>
                  <p style={{ marginTop: '4px' }}>Calculated Overtime Hours: <strong style={{ color: 'var(--accent-warning)' }}>{payroll.otHours.toFixed(1)} hrs</strong></p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px' }}>
                
                {/* Earnings */}
                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px dotted var(--border-color)', paddingBottom: '4px', marginBottom: '10px' }}>EARNINGS COMPONENT</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base Monthly Salary:</span>
                      <span>${payroll.base.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Allowances:</span>
                      <span>${payroll.allowance}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Standard Bonus:</span>
                      <span>${payroll.bonus}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-warning)' }}>
                      <span>Overtime Offset:</span>
                      <span>${payroll.overtimePay}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px dotted var(--border-color)', paddingBottom: '4px', marginBottom: '10px' }}>TAXES &amp; DEDUCTIONS</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Federal/State Taxes (12%):</span>
                      <span style={{ color: 'var(--accent-danger)' }}>-${payroll.deductions.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Social Benefit Fund:</span>
                      <span style={{ color: 'var(--text-muted)' }}>$0.00 (Incl.)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Total Settlement footer */}
              <div style={{
                background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: '8px',
                border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <h5 style={{ fontSize: '13px', color: 'var(--accent-success)' }}>NET DISBURSED OUTFLOW</h5>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Direct Bank Transfer</span>
                </div>
                <h3 style={{ fontSize: '28px', color: 'var(--accent-success)' }}>${payroll.net.toLocaleString()}</h3>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};
export default FinanceView;
