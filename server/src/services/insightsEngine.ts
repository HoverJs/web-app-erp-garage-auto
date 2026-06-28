import { IDatabaseAdapter } from '../db/adapter';
import { Insight } from '../types';

export class InsightsEngine {
  private db: IDatabaseAdapter;

  constructor(db: IDatabaseAdapter) {
    this.db = db;
  }

  public async generateInsights(): Promise<Insight[]> {
    const insights: Insight[] = [];

    const employees = await this.db.employees.getAll();
    const shifts = await this.db.shifts.getAll();
    const attendance = await this.db.attendance.getAll();
    const transactions = await this.db.transactions.getAll();
    const workOrders = await this.db.workOrders.getAll();
    const parts = await this.db.parts.getAll();
    const vehicles = await this.db.vehicles.getAll();
    const customers = await this.db.customers.getAll();
    const appointments = await this.db.appointments.getAll();
    const serviceBays = await this.db.serviceBays.getAll();

    // 1. Calculate June 2026 Financial Stats
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
    
    // Alert: Labor cost ratio
    if (laborRatio > 35) {
      insights.push({
        id: "INS-LABOR-01",
        title: "Labor Cost Inflation Alert",
        description: `Labor costs represent ${laborRatio.toFixed(1)}% of total revenue this month ($${payrollExpense.toLocaleString()} of $${revenue.toLocaleString()}), exceeding the optimal ERP target of 35%.`,
        type: "warning",
        module: "finance",
        actionLabel: "Optimize Shifts Schedule",
        actionPayload: { actionType: "NAVIGATE_WORKFORCE" }
      });
    }

    // 2. Customer Retention Alert (LTV / CRM check)
    // Repeat visit rate: percent of customers who have spent > $2,000 or visited more than once
    const repeatCustomers = customers.filter(c => c.totalSpending > 2000);
    const retentionRate = customers.length > 0 ? (repeatCustomers.length / customers.length) * 100 : 0;
    
    if (retentionRate < 70) {
      insights.push({
        id: "INS-CRM-01",
        title: "Customer Retention Alert",
        description: `Customer repeat visit rate is currently at ${retentionRate.toFixed(0)}%, falling short of the corporate target (70%).`,
        type: "warning",
        module: "customer",
        actionLabel: "Initiate Customer Outreach",
        actionPayload: { actionType: "NAVIGATE_CRM" }
      });
    } else {
      insights.push({
        id: "INS-CRM-01-OK",
        title: "Loyalty Retention High",
        description: `Customer retention meets ERP goals at ${retentionRate.toFixed(0)}% repeat visits, driven by Gold and Platinum tiers.`,
        type: "info",
        module: "customer"
      });
    }

    // 3. Vehicle Maintenance Risk (High mileage + Low health score)
    const atRiskVehicles = vehicles.filter(v => v.healthScore < 60 && v.mileage > 50000);
    if (atRiskVehicles.length > 0) {
      const plates = atRiskVehicles.map(v => v.licensePlate).join(", ");
      insights.push({
        id: "INS-VEHICLE-01",
        title: "Proactive Service Risk Warning",
        description: `${atRiskVehicles.length} vehicles are at critical maintenance risk (health score < 60% & mileage > 50k). Registered plates: ${plates}.`,
        type: "critical",
        module: "garage",
        actionLabel: "Schedule Service Alerts",
        actionPayload: { actionType: "NAVIGATE_VEHICLES" }
      });
    }

    // 4. Technician Overload V2
    const activeStages = ['Check In', 'Inspection', 'Diagnosis', 'Waiting Parts', 'Repair', 'Quality Check'];
    const activeOrders = workOrders.filter(w => activeStages.includes(w.status));

    const techLoads: { [techId: string]: number } = {};
    activeOrders.forEach(o => {
      techLoads[o.assignedTechId] = (techLoads[o.assignedTechId] || 0) + 1;
    });

    const overloadedTechId = Object.keys(techLoads).find(tid => techLoads[tid] > 2);
    if (overloadedTechId) {
      const tech = employees.find(e => e.id === overloadedTechId);
      insights.push({
        id: "INS-OVERLOAD-01",
        title: "Technician Dispatch Overload",
        description: `Technician ${tech?.name || overloadedTechId} has ${techLoads[overloadedTechId]} active work orders in repair lanes, exceeding safety threshold (max 2).`,
        type: "warning",
        module: "workforce",
        actionLabel: "Rebalance Work Orders",
        actionPayload: { actionType: "NAVIGATE_GARAGE" }
      });
    }

    // 5. Service Bay Utilization V2
    const dtBays = serviceBays.filter(b => b.branchId === 'BR-01');
    const occupiedDtBays = dtBays.filter(b => b.status !== 'Available').length;
    const dtBayUtilization = dtBays.length > 0 ? (occupiedDtBays / dtBays.length) * 100 : 0;

    if (dtBayUtilization > 80) {
      insights.push({
        id: "INS-BAY-UTIL-01",
        title: "High Workshop Bay Saturation",
        description: `Service bay utilization is critical at ${dtBayUtilization.toFixed(0)}% at Downtown Headquarters. All repair lifts are occupied.`,
        type: "warning",
        module: "garage",
        actionLabel: "Inspect Shop Floor",
        actionPayload: { actionType: "NAVIGATE_BAYS" }
      });
    } else {
      insights.push({
        id: "INS-BAY-UTIL-01-OK",
        title: "Service Bay Flow Stable",
        description: `Service bay utilization is at ${dtBayUtilization.toFixed(0)}% at Downtown Headquarters, indicating optimal scheduling flow.`,
        type: "info",
        module: "garage"
      });
    }

    // 6. Appointment No-Shows
    const noShowApts = appointments.filter(a => a.status === 'No Show');
    const noShowRatio = appointments.length > 0 ? (noShowApts.length / appointments.length) * 100 : 0;
    if (noShowRatio > 15) {
      insights.push({
        id: "INS-NOSHOW-01",
        title: "High Booking No-Show Rate",
        description: `Customer appointment no-shows are at ${noShowRatio.toFixed(0)}% this week, impacting shop floor productivity.`,
        type: "warning",
        module: "workforce",
        actionLabel: "Send Booking Reminders",
        actionPayload: { actionType: "NAVIGATE_APPOINTMENTS" }
      });
    }

    // 7. Inventory Forecasting V2 (Stock Outage Risk)
    const partsNeeded: { [partId: string]: number } = {};
    activeOrders.forEach(o => {
      o.partsUsed.forEach(p => {
        partsNeeded[p.partId] = (partsNeeded[p.partId] || 0) + p.quantity;
      });
    });

    const stockOutageIds: string[] = [];
    Object.keys(partsNeeded).forEach(pid => {
      const part = parts.find(p => p.id === pid);
      if (part && part.stock < partsNeeded[pid]) {
        stockOutageIds.push(pid);
      }
    });

    if (stockOutageIds.length > 0) {
      const partNames = stockOutageIds.map(pid => parts.find(p => p.id === pid)?.name).join(", ");
      insights.push({
        id: "INS-FORECAST-OUTAGE",
        title: "Material Stockout Risk",
        description: `Active repair orders require materials that exceed warehouse stock levels (Deficient parts: ${partNames}). Outage risk detected.`,
        type: "critical",
        module: "inventory",
        actionLabel: "Disburse Supplier Reorder",
        actionPayload: { actionType: "RESTOCK_INVENTORY", updates: stockOutageIds }
      });
    }

    // 8. Low Stock parts warning
    const lowStockParts = parts.filter(p => p.stock <= p.minStock);
    if (lowStockParts.length > 0 && stockOutageIds.length === 0) {
      const partNames = lowStockParts.slice(0, 3).map(p => p.name).join(", ");
      insights.push({
        id: "INS-INVENTORY-01",
        title: "Inventory Stock Level Warning",
        description: `${lowStockParts.length} critical parts are at or below safety stock thresholds (Low parts: ${partNames}${lowStockParts.length > 3 ? '...' : ''}).`,
        type: "critical",
        module: "inventory",
        actionLabel: "Reorder Low Stock Items",
        actionPayload: { actionType: "RESTOCK_INVENTORY", updates: lowStockParts.map(p => p.id) }
      });
    }

    // 9. Multi-Branch Margin comparison
    const revA = juneTransactions.filter(t => t.branchId === 'BR-01' && t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0);
    const expA = juneTransactions.filter(t => t.branchId === 'BR-01' && t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const profitA = revA - expA;
    const marginA = revA > 0 ? (profitA / revA) * 100 : 0;

    const revB = juneTransactions.filter(t => t.branchId === 'BR-02' && t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0);
    const expB = juneTransactions.filter(t => t.branchId === 'BR-02' && t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const profitB = revB - expB;
    const marginB = revB > 0 ? (profitB / revB) * 100 : 0;

    const profitDifference = profitA - profitB;
    if (profitDifference > 0 && profitB > 0) {
      const perfDifference = (profitDifference / profitB) * 100;
      insights.push({
        id: "INS-BRANCH-01",
        title: "Branch Profitability Variance",
        description: `Branch A (Downtown) generates ${perfDifference.toFixed(0)}% more profit than Branch B (Westside) in June. Downtown Margin: ${marginA.toFixed(1)}% | Westside Margin: ${marginB.toFixed(1)}%.`,
        type: "info",
        module: "finance",
        actionLabel: "Compare Locations Matrix",
        actionPayload: { actionType: "NAVIGATE_BRANCHES" }
      });
    }

    return insights;
  }
}
export default InsightsEngine;
