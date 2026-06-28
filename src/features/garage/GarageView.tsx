import React, { useState } from 'react';
import { useGarage } from '../../context/GarageContext';
import type { WorkOrder } from '../../shared/types';
import { 
  Clock, AlertTriangle, User, ArrowRight, ArrowLeft
} from 'lucide-react';

type StageType = WorkOrder['status'];
const STAGES: StageType[] = [
  'Check In',
  'Inspection',
  'Diagnosis',
  'Waiting Parts',
  'Repair',
  'Quality Check',
  'Ready Pickup',
  'Delivered'
];

export const GarageView: React.FC = () => {
  const { workOrders, employees, vehicles, customers, updateWorkOrder, role } = useGarage();
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  const isAuthorizedToEdit = role !== 'Accountant' && role !== 'Inventory Staff';

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isAuthorizedToEdit) return;
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = async (e: React.DragEvent, stage: StageType) => {
    e.preventDefault();
    if (!isAuthorizedToEdit) return;
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      await updateWorkOrder(orderId, { status: stage });
    }
  };

  const handleMoveStage = async (id: string, currentStage: StageType, direction: 'forward' | 'backward') => {
    if (!isAuthorizedToEdit) return;
    const currentIdx = STAGES.indexOf(currentStage);
    let nextIdx = direction === 'forward' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx >= 0 && nextIdx < STAGES.length) {
      await updateWorkOrder(id, { status: STAGES[nextIdx] });
      // Update selected order details if open
      if (selectedOrder && selectedOrder.id === id) {
        const order = workOrders.find(w => w.id === id);
        if (order) {
          setSelectedOrder({ ...order, status: STAGES[nextIdx] });
        }
      }
    }
  };

  // Helper to calculate time elapsed in a stage
  const getElapsedTime = (enteredAt: string, exitedAt?: string) => {
    const start = new Date(enteredAt).getTime();
    const end = exitedAt ? new Date(exitedAt).getTime() : Date.now();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min`;
    const diffHrs = (diffMs / 3600000).toFixed(1);
    return `${diffHrs} hr`;
  };

  // Check bottleneck threshold warnings
  const isBottleneck = (stage: StageType, enteredAt: string, exitedAt?: string) => {
    if (exitedAt) return false; // resolved
    const start = new Date(enteredAt).getTime();
    const elapsedHrs = (Date.now() - start) / 3600000;

    switch (stage) {
      case 'Check In': return elapsedHrs > 2; // > 2 hours
      case 'Diagnosis': return elapsedHrs > 4; // > 4 hours
      case 'Waiting Parts': return elapsedHrs > 24; // > 24 hours
      case 'Repair': return elapsedHrs > 12; // > 12 hours
      case 'Quality Check': return elapsedHrs > 2; // > 2 hours
      default: return false;
    }
  };

  const getStageHeaderColor = (stage: StageType) => {
    switch (stage) {
      case 'Check In': return 'rgba(148, 163, 184, 0.1)';
      case 'Inspection': return 'rgba(168, 85, 247, 0.1)';
      case 'Diagnosis': return 'rgba(59, 130, 246, 0.1)';
      case 'Waiting Parts': return 'rgba(239, 68, 68, 0.1)';
      case 'Repair': return 'rgba(245, 158, 11, 0.1)';
      case 'Quality Check': return 'rgba(14, 116, 144, 0.1)';
      case 'Ready Pickup': return 'rgba(16, 185, 129, 0.1)';
      default: return 'rgba(241, 245, 249, 0.05)';
    }
  };

  return (
    <div style={{ padding: '24px', color: 'var(--text-primary)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Garage Workshop Control</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Visual Kanban dispatch board. Drag cards to update stages. Multi-stage elapsed times are tracked automatically to reveal shop bottlenecks.
        </p>
      </div>

      {/* Kanban Board Container */}
      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '20px',
        flex: 1,
        alignItems: 'stretch'
      }}>
        {STAGES.map(stage => {
          const stageOrders = workOrders.filter(w => w.status === stage);
          const headerBg = getStageHeaderColor(stage);
          
          return (
            <div 
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              style={{
                minWidth: '280px',
                width: '280px',
                background: 'var(--board-column-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '12px'
              }}
            >
              {/* Stage Title Header */}
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: headerBg,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.02)'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{stage}</span>
                <span style={{
                  fontSize: '11px',
                  background: 'var(--board-chip-bg)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  {stageOrders.length}
                </span>
              </div>

              {/* Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                {stageOrders.map(o => {
                  const veh = vehicles.find(v => v.id === o.vehicleId);
                  const cust = customers.find(c => c.id === o.customerId);
                  const tech = employees.find(e => e.id === o.assignedTechId);
                  
                  // Calculate active stage duration
                  const activeHistory = o.stageHistory?.find(h => h.stage === stage);
                  const elapsed = activeHistory ? getElapsedTime(activeHistory.enteredAt, activeHistory.exitedAt) : '';
                  const bottleneck = activeHistory ? isBottleneck(stage, activeHistory.enteredAt, activeHistory.exitedAt) : false;

                  return (
                    <div
                      key={o.id}
                      draggable={isAuthorizedToEdit}
                      onDragStart={(e) => handleDragStart(e, o.id)}
                      onClick={() => setSelectedOrder(o)}
                      className="card hover-glow"
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        background: 'var(--board-card-bg)',
                        border: bottleneck ? '1px solid var(--accent-error)' : '1px solid var(--board-card-border)',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                          WO{o.id.replace('WO', '')}
                        </span>
                        {elapsed && (
                          <span style={{ fontSize: '10px', color: bottleneck ? 'var(--accent-error)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} />
                            {elapsed}
                          </span>
                        )}
                      </div>

                      {/* Vehicle Spec */}
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {veh ? `${veh.brand} ${veh.model}` : 'Unknown Car'}
                      </h4>
                      
                      {/* Customer Name */}
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <User size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {cust?.name || 'Walk-in'}
                      </p>

                      {/* Bottleneck alert block */}
                      {bottleneck && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          color: 'var(--accent-error)',
                          fontSize: '9px',
                          fontWeight: 700,
                          marginBottom: '8px'
                        }}>
                          <AlertTriangle size={10} />
                          STAGE DELAY EXCEEDED
                        </div>
                      )}

                      {/* Tech assignment footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--board-divider)', paddingTop: '8px', marginTop: '4px', fontSize: '10px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Mechanic: <strong style={{ color: 'var(--text-secondary)' }}>{tech?.name.split(' ')[0] || 'Idle'}</strong>
                        </span>

                        {/* Arrows for manual clicks */}
                        {isAuthorizedToEdit && (
                          <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleMoveStage(o.id, stage, 'backward')} disabled={stage === 'Check In'} style={{ padding: '2px 4px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <ArrowLeft size={10} />
                            </button>
                            <button onClick={() => handleMoveStage(o.id, stage, 'forward')} disabled={stage === 'Delivered'} style={{ padding: '2px 4px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <ArrowRight size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL DRAWER / INSPECTOR BLOCK (Split UI at bottom or as side slide-over) */}
      {selectedOrder && (
        <div className="card" style={{ padding: '20px', marginTop: '20px', borderTop: '3px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WORK ORDER DISPATCH DETAILS</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>WO{selectedOrder.id.replace('WO', '')} - Detail Sheet</h3>
            </div>
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Close inspector
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Description */}
            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Description</h4>
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{selectedOrder.description}</p>
              
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '16px', marginBottom: '8px' }}>Assignee</h4>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                {employees.find(e => e.id === selectedOrder.assignedTechId)?.name || 'Idle'}
              </span>
            </div>

            {/* Stage timing logs */}
            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Stage Tracking &amp; Delays</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.stageHistory?.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{h.stage}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {getElapsedTime(h.enteredAt, h.exitedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing details */}
            <div>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Invoice Projection</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Labor Fees:</span>
                  <span style={{ fontWeight: 600 }}>$150.00</span>
                </div>
                {selectedOrder.partsUsed?.map((pu, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Part {pu.partId}:</span>
                    <span>Qty {pu.quantity}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontWeight: 700 }}>
                  <span>Estimated Total:</span>
                  <span style={{ color: 'var(--accent-success)' }}>
                    ${(150.00 + (selectedOrder.partsUsed?.length ? 85.00 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default GarageView;
