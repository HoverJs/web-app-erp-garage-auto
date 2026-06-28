import rawDemoData from '../../server/src/db/data.json';
import type {
  Appointment,
  Attendance,
  Customer,
  Employee,
  Insight,
  InspectionReport,
  Part,
  ServiceBay,
  Shift,
  Supplier,
  Transaction,
  Vehicle,
  WorkOrder
} from '../shared/types';

export interface DemoDataSnapshot {
  employees: Employee[];
  shifts: Shift[];
  attendance: Attendance[];
  transactions: Transaction[];
  workOrders: WorkOrder[];
  parts: Part[];
  suppliers: Supplier[];
  vehicles: Vehicle[];
  customers: Customer[];
  appointments: Appointment[];
  serviceBays: ServiceBay[];
  inspections: InspectionReport[];
}

const DEMO_STORAGE_KEY = 'garage-management-static-demo-v1';

export const cloneDemoData = <T,>(data: T): T => JSON.parse(JSON.stringify(data)) as T;

const demoSeed = cloneDemoData(rawDemoData) as DemoDataSnapshot;

export const getSeedDemoData = (): DemoDataSnapshot => cloneDemoData(demoSeed);

export const loadStaticDemoData = (): DemoDataSnapshot => {
  if (typeof window === 'undefined') {
    return getSeedDemoData();
  }

  const stored = window.localStorage.getItem(DEMO_STORAGE_KEY);
  if (!stored) {
    return getSeedDemoData();
  }

  try {
    return JSON.parse(stored) as DemoDataSnapshot;
  } catch {
    return getSeedDemoData();
  }
};

export const saveStaticDemoData = (data: DemoDataSnapshot) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
};

export const generateInsightsFromDemoData = (data: DemoDataSnapshot): Insight[] => {
  const insights: Insight[] = [];
  const {
    employees,
    transactions,
    workOrders,
    parts,
    vehicles,
    customers,
    appointments,
    serviceBays
  } = data;

  const juneTransactions = transactions.filter(t => t.date.startsWith('2026-06'));
  const revenue = juneTransactions
    .filter(t => t.type === 'Revenue')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = juneTransactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const payrollExpense = juneTransactions
    .filter(t => t.type === 'Expense' && t.sourceOrCategory === 'Payroll')
    .reduce((sum, t) => sum + t.amount, 0);

  const laborRatio = revenue > 0 ? (payrollExpense / revenue) * 100 : 0;
  if (laborRatio > 35) {
    insights.push({
      id: 'INS-LABOR-01',
      title: 'Labor Cost Inflation Alert',
      description: `Labor costs represent ${laborRatio.toFixed(1)}% of total revenue this month ($${payrollExpense.toLocaleString()} of $${revenue.toLocaleString()}), exceeding the target threshold of 35%.`,
      type: 'warning',
      module: 'finance',
      actionLabel: 'Optimize Shift Schedule',
      actionPayload: { actionType: 'NAVIGATE_WORKFORCE' }
    });
  }

  const repeatCustomers = customers.filter(c => c.totalSpending > 2000);
  const retentionRate = customers.length > 0 ? (repeatCustomers.length / customers.length) * 100 : 0;
  if (retentionRate < 70) {
    insights.push({
      id: 'INS-CRM-01',
      title: 'Customer Retention Alert',
      description: `Customer repeat visit rate is currently ${retentionRate.toFixed(0)}%, below the target of 70%.`,
      type: 'warning',
      module: 'customer',
      actionLabel: 'Initiate Customer Outreach',
      actionPayload: { actionType: 'NAVIGATE_CRM' }
    });
  } else {
    insights.push({
      id: 'INS-CRM-01-OK',
      title: 'Loyalty Retention High',
      description: `Customer retention is healthy at ${retentionRate.toFixed(0)}% repeat visits.`,
      type: 'info',
      module: 'customer'
    });
  }

  const atRiskVehicles = vehicles.filter(v => v.healthScore < 60 && v.mileage > 50000);
  if (atRiskVehicles.length > 0) {
    insights.push({
      id: 'INS-VEHICLE-01',
      title: 'Proactive Service Risk Warning',
      description: `${atRiskVehicles.length} vehicles are at critical maintenance risk. Plates: ${atRiskVehicles.map(v => v.licensePlate).join(', ')}.`,
      type: 'critical',
      module: 'garage',
      actionLabel: 'Schedule Service Alerts',
      actionPayload: { actionType: 'NAVIGATE_VEHICLES' }
    });
  }

  const activeStages = ['Check In', 'Inspection', 'Diagnosis', 'Waiting Parts', 'Repair', 'Quality Check'];
  const activeOrders = workOrders.filter(w => activeStages.includes(w.status));
  const techLoads: Record<string, number> = {};

  activeOrders.forEach(order => {
    techLoads[order.assignedTechId] = (techLoads[order.assignedTechId] || 0) + 1;
  });

  const overloadedTechId = Object.keys(techLoads).find(techId => techLoads[techId] > 2);
  if (overloadedTechId) {
    const tech = employees.find(employee => employee.id === overloadedTechId);
    insights.push({
      id: 'INS-OVERLOAD-01',
      title: 'Technician Dispatch Overload',
      description: `Technician ${tech?.name || overloadedTechId} has ${techLoads[overloadedTechId]} active work orders.`,
      type: 'warning',
      module: 'workforce',
      actionLabel: 'Rebalance Work Orders',
      actionPayload: { actionType: 'NAVIGATE_GARAGE' }
    });
  }

  const downtownBays = serviceBays.filter(bay => bay.branchId === 'BR-01');
  const occupiedBays = downtownBays.filter(bay => bay.status !== 'Available').length;
  const bayUtilization = downtownBays.length > 0 ? (occupiedBays / downtownBays.length) * 100 : 0;

  if (bayUtilization > 80) {
    insights.push({
      id: 'INS-BAY-UTIL-01',
      title: 'High Workshop Bay Saturation',
      description: `Downtown service bay utilization is ${bayUtilization.toFixed(0)}%.`,
      type: 'warning',
      module: 'garage',
      actionLabel: 'Inspect Shop Floor',
      actionPayload: { actionType: 'NAVIGATE_BAYS' }
    });
  } else {
    insights.push({
      id: 'INS-BAY-UTIL-01-OK',
      title: 'Service Bay Flow Stable',
      description: `Downtown service bay utilization is ${bayUtilization.toFixed(0)}%, which indicates stable scheduling flow.`,
      type: 'info',
      module: 'garage'
    });
  }

  const noShowAppointments = appointments.filter(appointment => appointment.status === 'No Show');
  const noShowRatio = appointments.length > 0 ? (noShowAppointments.length / appointments.length) * 100 : 0;
  if (noShowRatio > 15) {
    insights.push({
      id: 'INS-NOSHOW-01',
      title: 'High Booking No-Show Rate',
      description: `Customer no-shows are at ${noShowRatio.toFixed(0)}% this week.`,
      type: 'warning',
      module: 'workforce',
      actionLabel: 'Send Booking Reminders',
      actionPayload: { actionType: 'NAVIGATE_APPOINTMENTS' }
    });
  }

  const partsNeeded: Record<string, number> = {};
  activeOrders.forEach(order => {
    order.partsUsed.forEach(part => {
      partsNeeded[part.partId] = (partsNeeded[part.partId] || 0) + part.quantity;
    });
  });

  const stockOutageIds: string[] = [];
  Object.keys(partsNeeded).forEach(partId => {
    const part = parts.find(item => item.id === partId);
    if (part && part.stock < partsNeeded[partId]) {
      stockOutageIds.push(partId);
    }
  });

  if (stockOutageIds.length > 0) {
    const partNames = stockOutageIds
      .map(partId => parts.find(part => part.id === partId)?.name)
      .filter(Boolean)
      .join(', ');

    insights.push({
      id: 'INS-FORECAST-OUTAGE',
      title: 'Material Stockout Risk',
      description: `Active repair orders are projected to exceed stock levels for: ${partNames}.`,
      type: 'critical',
      module: 'inventory',
      actionLabel: 'Restock Inventory',
      actionPayload: { actionType: 'RESTOCK_INVENTORY', updates: stockOutageIds }
    });
  }

  const lowStockParts = parts.filter(part => part.stock <= part.minStock);
  if (lowStockParts.length > 0 && stockOutageIds.length === 0) {
    const partNames = lowStockParts
      .slice(0, 3)
      .map(part => part.name)
      .join(', ');

    insights.push({
      id: 'INS-INVENTORY-01',
      title: 'Inventory Stock Level Warning',
      description: `${lowStockParts.length} critical parts are at or below safety stock thresholds (${partNames}${lowStockParts.length > 3 ? '...' : ''}).`,
      type: 'critical',
      module: 'inventory',
      actionLabel: 'Reorder Low Stock Items',
      actionPayload: { actionType: 'RESTOCK_INVENTORY', updates: lowStockParts.map(part => part.id) }
    });
  }

  const branchARevenue = juneTransactions
    .filter(transaction => transaction.branchId === 'BR-01' && transaction.type === 'Revenue')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const branchAExpenses = juneTransactions
    .filter(transaction => transaction.branchId === 'BR-01' && transaction.type === 'Expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const branchBRevenue = juneTransactions
    .filter(transaction => transaction.branchId === 'BR-02' && transaction.type === 'Revenue')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const branchBExpenses = juneTransactions
    .filter(transaction => transaction.branchId === 'BR-02' && transaction.type === 'Expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const branchAProfit = branchARevenue - branchAExpenses;
  const branchBProfit = branchBRevenue - branchBExpenses;

  if (branchAProfit > branchBProfit && branchBProfit > 0) {
    const profitDifference = ((branchAProfit - branchBProfit) / branchBProfit) * 100;
    const branchAMargin = branchARevenue > 0 ? (branchAProfit / branchARevenue) * 100 : 0;
    const branchBMargin = branchBRevenue > 0 ? (branchBProfit / branchBRevenue) * 100 : 0;

    insights.push({
      id: 'INS-BRANCH-01',
      title: 'Branch Profitability Variance',
      description: `Branch A is generating ${profitDifference.toFixed(0)}% more profit than Branch B in June. Branch A margin: ${branchAMargin.toFixed(1)}% | Branch B margin: ${branchBMargin.toFixed(1)}%.`,
      type: 'info',
      module: 'finance',
      actionLabel: 'Compare Locations Matrix',
      actionPayload: { actionType: 'NAVIGATE_BRANCHES' }
    });
  }

  const netResult = revenue - expenses;
  if (insights.length === 0) {
    insights.push({
      id: 'INS-GENERAL-OK',
      title: 'Operations Snapshot Stable',
      description: `Static demo data is healthy overall. Net June result: $${netResult.toLocaleString()}.`,
      type: 'info',
      module: 'finance'
    });
  }

  return insights;
};
