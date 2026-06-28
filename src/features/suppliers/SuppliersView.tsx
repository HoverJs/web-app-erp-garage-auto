import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { Mail, Phone } from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers } = useGarage();

  const mockPurchaseOrders = [
    { id: 'PO-99120', supplier: 'Apex Auto Parts Wholesale', item: 'Ceramic Front Brake Pads', qty: 20, amount: 900.00, status: 'Completed', date: '2026-06-20' },
    { id: 'PO-99121', supplier: 'CarQuest Wholesale Dist.', item: '120A Alternator Assembly', qty: 5, amount: 900.00, status: 'Completed', date: '2026-06-20' },
    { id: 'PO-99122', supplier: 'Lubricant Solutions Inc.', item: 'Synthetic Engine Oil 5W-30 (1L)', qty: 40, amount: 500.00, status: 'Completed', date: '2026-06-20' },
    { id: 'PO-99123', supplier: 'Apex Auto Parts Wholesale', item: 'All-Season Wiper Blade 22"', qty: 10, amount: 150.00, status: 'Dispatched', date: '2026-06-28' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>Supplier Registry & Procurement</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Maintain corporate vendor logs, active supply chain agreements, and historical purchase orders.</p>
      </div>

      {/* Row 1: Suppliers directory */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Corporate Vendors</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {suppliers.map(sup => (
            <div key={sup.id} style={{
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.01)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>{sup.name}</h4>
                <span className="badge badge-info">{sup.id}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Contact Agent: <strong>{sup.contactName}</strong></p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={12} />
                  <span>{sup.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={12} />
                  <span>{sup.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Purchase orders ledger */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Purchase Order (PO) Logs</h3>
        
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Item Replenishment</th>
                <th>Quantity</th>
                <th>Total Wholesale Cost</th>
                <th>Order Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockPurchaseOrders.map(po => (
                <tr key={po.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{po.id}</td>
                  <td style={{ fontWeight: 600 }}>{po.supplier}</td>
                  <td>{po.item}</td>
                  <td>{po.qty} units</td>
                  <td>${po.amount.toFixed(2)}</td>
                  <td>{po.date}</td>
                  <td>
                    <span className={`badge ${po.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default SuppliersView;
