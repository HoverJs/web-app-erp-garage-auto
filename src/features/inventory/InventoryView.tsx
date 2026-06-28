import React from 'react';
import { useGarage } from '../../context/GarageContext';
import { AlertTriangle, Truck, ArrowDown } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { parts, suppliers, resolveInsight } = useGarage();

  const handleRestockAll = async () => {
    const lowStockIds = parts.filter(p => p.stock <= p.minStock).map(p => p.id);
    if (lowStockIds.length === 0) {
      alert("All inventory items are currently above safety thresholds.");
      return;
    }
    await resolveInsight('MOCK-RESTOCK', 'RESTOCK_INVENTORY', lowStockIds);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>Parts Inventory Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Inspect spare parts stock volumes, safety thresholds, and dispatch supplier purchase orders.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleRestockAll}>
          <Truck size={16} />
          Replenish Low Stocks
        </button>
      </div>

      {/* Roster Grid */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Part SKU</th>
                <th>Item Name</th>
                <th>Quantity in Stock</th>
                <th>Minimum Limit</th>
                <th>Unit wholesale Price</th>
                <th>Preferred Supplier</th>
                <th>Safety Status</th>
              </tr>
            </thead>
            <tbody>
              {parts.map(part => {
                const supplier = suppliers.find(s => s.id === part.supplierId);
                const isLow = part.stock <= part.minStock;

                return (
                  <tr key={part.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{part.sku}</td>
                    <td style={{ fontWeight: 600 }}>{part.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{part.stock} units</span>
                        {isLow && <ArrowDown size={14} color="var(--accent-danger)" />}
                      </div>
                    </td>
                    <td>{part.minStock} units</td>
                    <td>${part.unitPrice.toFixed(2)}</td>
                    <td>{supplier?.name || 'Unassigned'}</td>
                    <td>
                      <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                        {isLow ? 'Low Stock' : 'Optimized'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Warning banner */}
      <div style={{
        padding: '20px',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        background: 'rgba(245, 158, 11, 0.02)',
        borderLeft: '4px solid var(--accent-warning)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <AlertTriangle color="var(--accent-warning)" size={24} />
        <div>
          <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>Warehouse Automated Procurement</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            When items fall below the minimum threshold, they trigger alert notifications on the CEO dashboard. Click "Replenish Low Stocks" to auto-dispatch batch purchase invoices and trigger warehouse refills.
          </p>
        </div>
      </div>
    </div>
  );
};
export default InventoryView;
