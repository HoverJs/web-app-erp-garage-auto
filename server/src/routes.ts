import { Router, Request, Response } from 'express';
import { jsonDb } from './db/jsonDb';
import { InsightsEngine } from './services/insightsEngine';
import { Employee, Shift, Attendance, Transaction, WorkOrder, Vehicle, Customer, Appointment, ServiceBay, InspectionReport } from './types';

const router = Router();
const insightsEngine = new InsightsEngine(jsonDb);

// Helper for sending standard responses
const handleResponse = (res: Response, fn: () => Promise<any>) => {
  fn()
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    });
};

/* --- Employee Directory Routes --- */
router.get('/employees', (req, res) => {
  handleResponse(res, () => jsonDb.employees.getAll());
});
router.get('/employees/:id', (req, res) => {
  handleResponse(res, () => jsonDb.employees.getById(req.params.id));
});
router.post('/employees', (req, res) => {
  handleResponse(res, () => jsonDb.employees.create(req.body));
});
router.put('/employees/:id', (req, res) => {
  handleResponse(res, () => jsonDb.employees.update(req.params.id, req.body));
});
router.delete('/employees/:id', (req, res) => {
  handleResponse(res, () => jsonDb.employees.delete(req.params.id));
});

/* --- Shift Scheduler Routes --- */
router.get('/shifts', (req, res) => {
  handleResponse(res, () => jsonDb.shifts.getAll());
});
router.post('/shifts', (req, res) => {
  handleResponse(res, () => jsonDb.shifts.create(req.body));
});
router.put('/shifts/:id', (req, res) => {
  handleResponse(res, () => jsonDb.shifts.update(req.params.id, req.body));
});
router.delete('/shifts/:id', (req, res) => {
  handleResponse(res, () => jsonDb.shifts.delete(req.params.id));
});

/* --- Attendance Tracking Routes --- */
router.get('/attendance', (req, res) => {
  handleResponse(res, () => jsonDb.attendance.getAll());
});
router.post('/attendance/clock-in', (req: Request, res: Response) => {
  const { employeeId, date, time } = req.body;
  handleResponse(res, async () => {
    const list = await jsonDb.attendance.getAll();
    const existing = list.find(a => a.employeeId === employeeId && a.date === date);
    if (existing) throw new Error("Employee already clocked in today");
    let status: 'On Time' | 'Late' = 'On Time';
    if (time > "08:15:00") status = "Late";
    const newLog: Attendance = {
      id: `ATT-${Date.now()}`,
      date,
      employeeId,
      checkIn: time,
      checkOut: null,
      status
    };
    return jsonDb.attendance.create(newLog);
  });
});
router.post('/attendance/clock-out', (req: Request, res: Response) => {
  const { employeeId, date, time } = req.body;
  handleResponse(res, async () => {
    const list = await jsonDb.attendance.getAll();
    const existing = list.find(a => a.employeeId === employeeId && a.date === date);
    if (!existing) throw new Error("No clock-in record found for today");
    let status = existing.status;
    if (time > "17:30:00") status = "Overtime";
    return jsonDb.attendance.update(existing.id, { checkOut: time, status });
  });
});

/* --- Vehicle Management Routes --- */
router.get('/vehicles', (req, res) => {
  handleResponse(res, () => jsonDb.vehicles.getAll());
});
router.get('/vehicles/:id', (req, res) => {
  handleResponse(res, () => jsonDb.vehicles.getById(req.params.id));
});
router.post('/vehicles', (req, res) => {
  handleResponse(res, () => jsonDb.vehicles.create(req.body));
});
router.put('/vehicles/:id', (req, res) => {
  handleResponse(res, () => jsonDb.vehicles.update(req.params.id, req.body));
});
router.delete('/vehicles/:id', (req, res) => {
  handleResponse(res, () => jsonDb.vehicles.delete(req.params.id));
});

/* --- Customer CRM Routes --- */
router.get('/customers', (req, res) => {
  handleResponse(res, () => jsonDb.customers.getAll());
});
router.get('/customers/:id', (req, res) => {
  handleResponse(res, () => jsonDb.customers.getById(req.params.id));
});
router.post('/customers', (req, res) => {
  handleResponse(res, () => jsonDb.customers.create(req.body));
});
router.put('/customers/:id', (req, res) => {
  handleResponse(res, () => jsonDb.customers.update(req.params.id, req.body));
});
router.delete('/customers/:id', (req, res) => {
  handleResponse(res, () => jsonDb.customers.delete(req.params.id));
});

/* --- Appointment Scheduler Routes --- */
router.get('/appointments', (req, res) => {
  handleResponse(res, () => jsonDb.appointments.getAll());
});
router.post('/appointments', (req, res) => {
  handleResponse(res, () => jsonDb.appointments.create(req.body));
});
router.put('/appointments/:id', (req, res) => {
  handleResponse(res, () => jsonDb.appointments.update(req.params.id, req.body));
});
router.delete('/appointments/:id', (req, res) => {
  handleResponse(res, () => jsonDb.appointments.delete(req.params.id));
});

/* --- Service Bay Management Routes --- */
router.get('/service-bays', (req, res) => {
  handleResponse(res, () => jsonDb.serviceBays.getAll());
});
router.put('/service-bays/:id', (req, res) => {
  const bayId = Number(req.params.id);
  handleResponse(res, () => jsonDb.serviceBays.update(bayId, req.body));
});

/* --- Vehicle Inspections & Health Score --- */
router.get('/inspections', (req, res) => {
  handleResponse(res, () => jsonDb.inspections.getAll());
});
router.post('/inspections', (req: Request, res: Response) => {
  const report: InspectionReport = req.body;
  handleResponse(res, async () => {
    // 1. Save inspection report
    const createdReport = await jsonDb.inspections.create(report);

    // 2. Automate health score recalculation for vehicle
    const vehicle = await jsonDb.vehicles.getById(report.vehicleId);
    if (vehicle) {
      let score = 100;
      report.categories.forEach(c => {
        if (c.status === 'Critical') score -= 15;
        else if (c.status === 'Warning') score -= 5;
      });
      score = Math.max(0, score);
      
      await jsonDb.vehicles.update(report.vehicleId, {
        healthScore: score,
        lastVisit: report.date
      });
    }

    return createdReport;
  });
});

/* --- Financial Transactions --- */
router.get('/transactions', (req, res) => {
  handleResponse(res, () => jsonDb.transactions.getAll());
});
router.post('/transactions', (req, res) => {
  handleResponse(res, () => jsonDb.transactions.create(req.body));
});

/* --- Work Orders & Kanban Workflows --- */
router.get('/work-orders', (req, res) => {
  handleResponse(res, () => jsonDb.workOrders.getAll());
});
router.put('/work-orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Partial<WorkOrder> = req.body;

  handleResponse(res, async () => {
    const order = await jsonDb.workOrders.getById(id);
    if (!order) throw new Error(`Work Order ${id} not found`);

    const stageChanged = updates.status && updates.status !== order.status;
    let finalUpdates = { ...updates };

    if (stageChanged) {
      const now = new Date().toISOString();
      const updatedHistory = [...(order.stageHistory || [])];

      // Mark the end of the previous stage
      if (updatedHistory.length > 0) {
        updatedHistory[updatedHistory.length - 1] = {
          ...updatedHistory[updatedHistory.length - 1],
          exitedAt: now
        };
      }

      // Add the new stage
      updatedHistory.push({
        stage: updates.status!,
        enteredAt: now
      });

      finalUpdates.stageHistory = updatedHistory;

      // Close-Loop: If status changed to "Delivered", log a Revenue Transaction & update CRM spent
      if (updates.status === 'Delivered') {
        let totalCost = 150.00; // Flat labor fee
        
        // Calculate parts costs
        const parts = await jsonDb.parts.getAll();
        if (order.partsUsed) {
          order.partsUsed.forEach(pu => {
            const p = parts.find(partItem => partItem.id === pu.partId);
            if (p) totalCost += p.unitPrice * pu.quantity;
          });
        }

        const costVal = Number(totalCost.toFixed(2));
        
        // Log transaction
        await jsonDb.transactions.create({
          id: `T-${Date.now()}`,
          date: now.split('T')[0],
          type: 'Revenue',
          sourceOrCategory: 'Repair Services',
          amount: costVal,
          description: `Disbursed billing statement for completed job WO${id.replace('WO', '')}`,
          customerId: order.customerId,
          vehicleId: order.vehicleId,
          workOrderId: id,
          branchId: order.branchId
        });

        // Update customer LTV
        const customer = await jsonDb.customers.getById(order.customerId);
        if (customer) {
          const newSpent = Number((customer.totalSpending + costVal).toFixed(2));
          let tier = customer.loyaltyTier;
          if (newSpent >= 10000) tier = 'Platinum';
          else if (newSpent >= 5000) tier = 'Gold';
          else if (newSpent >= 2000) tier = 'Silver';

          await jsonDb.customers.update(order.customerId, {
            totalSpending: newSpent,
            lastVisit: now.split('T')[0],
            loyaltyTier: tier
          });
        }
      }
    }

    return jsonDb.workOrders.update(id, finalUpdates);
  });
});

/* --- Parts & Inventory Catalog --- */
router.get('/parts', (req, res) => {
  handleResponse(res, () => jsonDb.parts.getAll());
});
router.put('/parts/:id', (req: Request, res: Response) => {
  handleResponse(res, () => jsonDb.parts.update(req.params.id, req.body));
});
router.get('/suppliers', (req, res) => {
  handleResponse(res, () => jsonDb.suppliers.getAll());
});

/* --- CEO Analytics & AI Insights --- */
router.get('/ceo/insights', (req, res) => {
  handleResponse(res, () => insightsEngine.generateInsights());
});

// Strategic Actions
router.post('/ceo/resolve-insight', (req: Request, res: Response) => {
  const { actionType, payload } = req.body;
  handleResponse(res, async () => {
    if (actionType === 'RESTOCK_INVENTORY') {
      const partIds: string[] = payload || [];
      const updatedParts = [];
      for (const pid of partIds) {
        const part = (await jsonDb.parts.getAll()).find(p => p.id === pid);
        if (part) {
          const newStock = part.stock + 15;
          const updated = await jsonDb.parts.update(pid, { stock: newStock });
          updatedParts.push(updated);
          const cost = part.unitPrice * 15 * 0.7;
          await jsonDb.transactions.create({
            id: `T-${Date.now()}-${pid}`,
            date: new Date().toISOString().split('T')[0],
            type: 'Expense',
            sourceOrCategory: 'Parts Purchases',
            amount: Number(cost.toFixed(2)),
            description: `Automated reorder replenishment (15 units) of ${part.name}`,
            branchId: part.branchId
          });
        }
      }
      return { success: true, updatedParts, message: "Inventory reordered and restocked successfully." };
    }
    return { success: false, message: "Action type not supported." };
  });
});

export default router;
