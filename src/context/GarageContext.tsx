import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Employee, Shift, Attendance, Transaction, WorkOrder, Part, Supplier, Insight, UserRole, Vehicle, Customer, Appointment, ServiceBay, InspectionReport } from '../shared/types';
import {
  cloneDemoData,
  generateInsightsFromDemoData,
  loadStaticDemoData,
  saveStaticDemoData,
  type DemoDataSnapshot
} from '../data/staticDemo';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface GarageContextProps {
  role: UserRole;
  changeRole: (newRole: UserRole) => void;
  employees: Employee[];
  shifts: Shift[];
  attendance: Attendance[];
  transactions: Transaction[];
  workOrders: WorkOrder[];
  parts: Part[];
  suppliers: Supplier[];
  insights: Insight[];
  vehicles: Vehicle[];
  customers: Customer[];
  appointments: Appointment[];
  serviceBays: ServiceBay[];
  inspections: InspectionReport[];
  loading: boolean;
  error: string | null;
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  
  // API Mutations - Employee
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  createEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  // Shifts
  assignShift: (date: string, type: Shift['type'], employeeId: string) => Promise<boolean>;
  deleteShift: (id: string) => Promise<void>;
  updateShiftStatus: (id: string, status: Shift['status']) => Promise<void>;
  
  // Attendance
  clockIn: (employeeId: string, time: string) => Promise<void>;
  clockOut: (employeeId: string, time: string) => Promise<void>;
  
  // Transactions
  createTransaction: (data: Omit<Transaction, 'id'>) => Promise<void>;
  
  // Work Orders (Kanban)
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => Promise<void>;
  
  // Vehicles
  createVehicle: (data: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Customers
  createCustomer: (data: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Appointments
  createAppointment: (data: Omit<Appointment, 'id'>) => Promise<boolean>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Service Bays
  updateServiceBay: (id: number, data: Partial<ServiceBay>) => Promise<void>;

  // Inspections
  createInspection: (data: Omit<InspectionReport, 'id'>) => Promise<void>;
  
  // Insight Actions
  resolveInsight: (insightId: string, actionType: string, payload: any) => Promise<void>;
}

const GarageContext = createContext<GarageContextProps | undefined>(undefined);

export const GarageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('Owner');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceBays, setServiceBays] = useState<ServiceBay[]>([]);
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const isStaticModeRef = useRef(false);
  const staticModeNoticeShownRef = useRef(false);

  // Toast notifications manager
  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const changeRole = (newRole: UserRole) => {
    setRole(newRole);
    addToast(`Switched workspace role to: ${newRole}`, 'success');
  };

  const getCurrentSnapshot = useCallback(
    (): DemoDataSnapshot => ({
      employees,
      shifts,
      attendance,
      transactions,
      workOrders,
      parts,
      suppliers,
      vehicles,
      customers,
      appointments,
      serviceBays,
      inspections
    }),
    [appointments, attendance, customers, employees, inspections, parts, serviceBays, shifts, suppliers, transactions, vehicles, workOrders]
  );

  const applySnapshot = useCallback((snapshot: DemoDataSnapshot) => {
    setEmployees(snapshot.employees);
    setShifts(snapshot.shifts);
    setAttendance(snapshot.attendance);
    setTransactions(snapshot.transactions);
    setWorkOrders(snapshot.workOrders);
    setParts(snapshot.parts);
    setSuppliers(snapshot.suppliers);
    setVehicles(snapshot.vehicles);
    setCustomers(snapshot.customers);
    setAppointments(snapshot.appointments);
    setServiceBays(snapshot.serviceBays);
    setInspections(snapshot.inspections);
    setInsights(generateInsightsFromDemoData(snapshot));
    setError(null);
  }, []);

  const commitStaticSnapshot = useCallback(
    (mutator: (draft: DemoDataSnapshot) => void) => {
      const draft = cloneDemoData(getCurrentSnapshot());
      mutator(draft);
      saveStaticDemoData(draft);
      applySnapshot(draft);
      return draft;
    },
    [applySnapshot, getCurrentSnapshot]
  );

  // Central fetcher
  const refreshData = useCallback(async () => {
    if (isStaticModeRef.current) {
      applySnapshot(loadStaticDemoData());
      setLoading(false);
      return;
    }

    try {
      const fetchJson = async <T,>(url: string): Promise<T> => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`${url} responded with ${response.status}`);
        }
        return response.json() as Promise<T>;
      };

      const [
        empsRes, shiftsRes, attRes, txRes, woRes, partsRes, supRes, insightsRes,
        vehRes, custRes, aptRes, bayRes, inspectRes
      ] = await Promise.all([
        fetchJson<Employee[]>('/api/employees'),
        fetchJson<Shift[]>('/api/shifts'),
        fetchJson<Attendance[]>('/api/attendance'),
        fetchJson<Transaction[]>('/api/transactions'),
        fetchJson<WorkOrder[]>('/api/work-orders'),
        fetchJson<Part[]>('/api/parts'),
        fetchJson<Supplier[]>('/api/suppliers'),
        fetchJson<Insight[]>('/api/ceo/insights'),
        fetchJson<Vehicle[]>('/api/vehicles'),
        fetchJson<Customer[]>('/api/customers'),
        fetchJson<Appointment[]>('/api/appointments'),
        fetchJson<ServiceBay[]>('/api/service-bays'),
        fetchJson<InspectionReport[]>('/api/inspections')
      ]);

      setEmployees(empsRes);
      setShifts(shiftsRes);
      setAttendance(attRes);
      setTransactions(txRes);
      setWorkOrders(woRes);
      setParts(partsRes);
      setSuppliers(supRes);
      setInsights(insightsRes);
      setVehicles(vehRes);
      setCustomers(custRes);
      setAppointments(aptRes);
      setServiceBays(bayRes);
      setInspections(inspectRes);
      setError(null);
    } catch (err: any) {
      console.error("Data synchronization failed:", err);
      isStaticModeRef.current = true;
      const demoSnapshot = loadStaticDemoData();
      saveStaticDemoData(demoSnapshot);
      applySnapshot(demoSnapshot);
      setError(null);
      if (!staticModeNoticeShownRef.current) {
        addToast("Backend unavailable. Running in static demo mode.", "info");
        staticModeNoticeShownRef.current = true;
      }
    } finally {
      setLoading(false);
    }
  }, [addToast, applySnapshot]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Employee CRUD operations
  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          const employeeIndex = draft.employees.findIndex(employee => employee.id === id);
          if (employeeIndex === -1) {
            throw new Error(`Employee ${id} not found`);
          }
          draft.employees[employeeIndex] = { ...draft.employees[employeeIndex], ...data };
        });
        addToast("Employee profile updated successfully", "success");
      } catch (err: any) {
        addToast(`Update employee failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      addToast("Employee profile updated successfully", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Update employee failed: ${err.message}`, "error");
    }
  };

  const createEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    if (isStaticModeRef.current) {
      try {
        const newId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
        commitStaticSnapshot(draft => {
          draft.employees.push({ ...employeeData, id: newId });
        });
        addToast(`Created profile for ${employeeData.name}`, "success");
      } catch (err: any) {
        addToast(`Creation failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const newId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
      const fullEmployee = { ...employeeData, id: newId };
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEmployee)
      });
      if (!res.ok) throw new Error(await res.text());
      addToast(`Created profile for ${employeeData.name}`, "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Creation failed: ${err.message}`, "error");
    }
  };

  const deleteEmployee = async (id: string) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          draft.employees = draft.employees.filter(employee => employee.id !== id);
        });
        addToast("Employee deleted from registry", "success");
      } catch (err: any) {
        addToast(`Deletion failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      addToast("Employee deleted from registry", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Deletion failed: ${err.message}`, "error");
    }
  };

  // Shift assignment and scheduler logic
  const assignShift = async (date: string, type: Shift['type'], employeeId: string): Promise<boolean> => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee && employee.status === 'On Leave') {
      addToast(`Conflict: ${employee.name} is currently registered on leave.`, 'error');
      return false;
    }

    const existingDateShifts = shifts.filter(s => s.date === date && s.employeeId === employeeId);
    if (existingDateShifts.length > 0) {
      addToast(`Conflict: ${employee?.name} is already assigned a shift on ${date}.`, 'warning');
    }

    if (isStaticModeRef.current) {
      try {
        const newShift: Shift = {
          id: `SHF-${Date.now()}`,
          date,
          type,
          employeeId,
          status: 'Assigned'
        };
        commitStaticSnapshot(draft => {
          draft.shifts.push(newShift);
        });
        addToast(`Shift assigned to ${employee?.name || employeeId}`, "success");
        return true;
      } catch (err: any) {
        addToast(`Failed to assign shift: ${err.message}`, "error");
        return false;
      }
    }

    try {
      const newShift: Shift = {
        id: `SHF-${Date.now()}`,
        date,
        type,
        employeeId,
        status: 'Assigned'
      };

      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift)
      });
      if (!res.ok) throw new Error(await res.text());
      addToast(`Shift assigned to ${employee?.name || employeeId}`, "success");
      await refreshData();
      return true;
    } catch (err: any) {
      addToast(`Failed to assign shift: ${err.message}`, "error");
      return false;
    }
  };

  const deleteShift = async (id: string) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          draft.shifts = draft.shifts.filter(shift => shift.id !== id);
        });
        addToast("Shift removed from calendar", "success");
      } catch (err: any) {
        addToast(`Failed to delete shift: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      addToast("Shift removed from calendar", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Failed to delete shift: ${err.message}`, "error");
    }
  };

  const updateShiftStatus = async (id: string, status: Shift['status']) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          const shift = draft.shifts.find(item => item.id === id);
          if (!shift) {
            throw new Error(`Shift ${id} not found`);
          }
          shift.status = status;
        });
      } catch (err: any) {
        addToast(`Failed to update shift: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/shifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error(await res.text());
      await refreshData();
    } catch (err: any) {
      addToast(`Failed to update shift: ${err.message}`, "error");
    }
  };

  // Clock-in/out logic
  const clockIn = async (employeeId: string, time: string) => {
    if (isStaticModeRef.current) {
      try {
        const date = new Date().toISOString().split('T')[0];
        commitStaticSnapshot(draft => {
          const existing = draft.attendance.find(item => item.employeeId === employeeId && item.date === date);
          if (existing) {
            throw new Error("Employee already clocked in today");
          }
          draft.attendance.push({
            id: `ATT-${Date.now()}`,
            date,
            employeeId,
            checkIn: time,
            checkOut: null,
            status: time > '08:15:00' ? 'Late' : 'On Time'
          });
        });
        addToast("Attendance clock-in registered", "success");
      } catch (err: any) {
        addToast(err.message || "Clock-in registration failed", "error");
      }
      return;
    }

    try {
      const date = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, date, time })
      });
      if (!res.ok) throw new Error(await res.text());
      addToast("Attendance clock-in registered", "success");
      await refreshData();
    } catch (err: any) {
      addToast(err.message || "Clock-in registration failed", "error");
    }
  };

  const clockOut = async (employeeId: string, time: string) => {
    if (isStaticModeRef.current) {
      try {
        const date = new Date().toISOString().split('T')[0];
        commitStaticSnapshot(draft => {
          const existing = draft.attendance.find(item => item.employeeId === employeeId && item.date === date);
          if (!existing) {
            throw new Error("No clock-in record found for today");
          }
          existing.checkOut = time;
          existing.status = time > '17:30:00' ? 'Overtime' : existing.status;
        });
        addToast("Attendance clock-out registered", "success");
      } catch (err: any) {
        addToast(err.message || "Clock-out registration failed", "error");
      }
      return;
    }

    try {
      const date = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/attendance/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, date, time })
      });
      if (!res.ok) throw new Error(await res.text());
      addToast("Attendance clock-out registered", "success");
      await refreshData();
    } catch (err: any) {
      addToast(err.message || "Clock-out registration failed", "error");
    }
  };

  // Financial transactions
  const createTransaction = async (txData: Omit<Transaction, 'id'>) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          draft.transactions.push({ ...txData, id: `T-${Date.now()}` });
        });
        addToast(`Logged ${txData.type}: $${txData.amount}`, "success");
      } catch (err: any) {
        addToast(`Transaction logging failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const newTx = { ...txData, id: `T-${Date.now()}` };
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      if (!res.ok) throw new Error(await res.text());
      addToast(`Logged ${txData.type}: $${txData.amount}`, "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Transaction logging failed: ${err.message}`, "error");
    }
  };

  // Garage operations (Kanban Stage updates)
  const updateWorkOrder = async (id: string, data: Partial<WorkOrder>) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          const order = draft.workOrders.find(item => item.id === id);
          if (!order) {
            throw new Error(`Work Order ${id} not found`);
          }

          const stageChanged = data.status && data.status !== order.status;
          const finalUpdates: Partial<WorkOrder> = { ...data };

          if (stageChanged) {
            const now = new Date().toISOString();
            const updatedHistory = [...(order.stageHistory || [])];

            if (updatedHistory.length > 0) {
              updatedHistory[updatedHistory.length - 1] = {
                ...updatedHistory[updatedHistory.length - 1],
                exitedAt: now
              };
            }

            updatedHistory.push({
              stage: data.status!,
              enteredAt: now
            });

            finalUpdates.stageHistory = updatedHistory;

            if (data.status === 'Delivered') {
              let totalCost = 150;
              order.partsUsed.forEach(partUsage => {
                const foundPart = draft.parts.find(part => part.id === partUsage.partId);
                if (foundPart) {
                  totalCost += foundPart.unitPrice * partUsage.quantity;
                }
              });

              const roundedCost = Number(totalCost.toFixed(2));
              draft.transactions.push({
                id: `T-${Date.now()}`,
                date: now.split('T')[0],
                type: 'Revenue',
                sourceOrCategory: 'Repair Services',
                amount: roundedCost,
                description: `Disbursed billing statement for completed job WO${id.replace('WO', '')}`,
                customerId: order.customerId,
                vehicleId: order.vehicleId,
                workOrderId: id,
                branchId: order.branchId
              });

              const customer = draft.customers.find(item => item.id === order.customerId);
              if (customer) {
                const newSpent = Number((customer.totalSpending + roundedCost).toFixed(2));
                customer.totalSpending = newSpent;
                customer.lastVisit = now.split('T')[0];
                if (newSpent >= 10000) customer.loyaltyTier = 'Platinum';
                else if (newSpent >= 5000) customer.loyaltyTier = 'Gold';
                else if (newSpent >= 2000) customer.loyaltyTier = 'Silver';
              }
            }
          }

          Object.assign(order, finalUpdates);
        });

        const partsNotice = data.status === 'Delivered' ? ' and disbersed invoice transaction' : '';
        addToast(`Work order WO${id.replace('WO', '')} updated${partsNotice}`, "success");
      } catch (err: any) {
        addToast(`Work order update failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/work-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      
      const parts = data.status === 'Delivered' ? ' and disbersed invoice transaction' : '';
      addToast(`Work order WO${id.replace('WO', '')} updated${parts}`, "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Work order update failed: ${err.message}`, "error");
    }
  };

  // Vehicle mutations
  const createVehicle = async (vehData: Omit<Vehicle, 'id'>) => {
    if (isStaticModeRef.current) {
      try {
        const newId = `VEH${String(vehicles.length + 1).padStart(3, '0')}`;
        commitStaticSnapshot(draft => {
          draft.vehicles.push({ ...vehData, id: newId });
        });
        addToast(`Registered vehicle ${vehData.licensePlate}`, "success");
      } catch (err: any) {
        addToast(`Vehicle registration failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const newId = `VEH${String(vehicles.length + 1).padStart(3, '0')}`;
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehData, id: newId })
      });
      if (!res.ok) throw new Error(await res.text());
      addToast(`Registered vehicle ${vehData.licensePlate}`, "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Vehicle registration failed: ${err.message}`, "error");
    }
  };

  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          const vehicle = draft.vehicles.find(item => item.id === id);
          if (!vehicle) {
            throw new Error(`Vehicle ${id} not found`);
          }
          Object.assign(vehicle, data);
        });
        addToast("Vehicle details updated", "success");
      } catch (err: any) {
        addToast(`Update vehicle failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      addToast("Vehicle details updated", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Update vehicle failed: ${err.message}`, "error");
    }
  };

  const deleteVehicle = async (id: string) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          draft.vehicles = draft.vehicles.filter(vehicle => vehicle.id !== id);
        });
        addToast("Vehicle deleted from records", "success");
      } catch (err: any) {
        addToast(`Deletion failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      addToast("Vehicle deleted from records", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Deletion failed: ${err.message}`, "error");
    }
  };

  // Customer CRM mutations
  const createCustomer = async (custData: Omit<Customer, 'id'>) => {
    if (isStaticModeRef.current) {
      try {
        const newId = `CUS${String(customers.length + 1).padStart(3, '0')}`;
        commitStaticSnapshot(draft => {
          draft.customers.push({ ...custData, id: newId });
        });
        addToast(`Customer ${custData.name} registered`, "success");
      } catch (err: any) {
        addToast(`Customer creation failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const newId = `CUS${String(customers.length + 1).padStart(3, '0')}`;
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...custData, id: newId })
      });
      if (!res.ok) throw new Error(await res.text());
      addToast(`Customer ${custData.name} registered`, "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Customer creation failed: ${err.message}`, "error");
    }
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          const customer = draft.customers.find(item => item.id === id);
          if (!customer) {
            throw new Error(`Customer ${id} not found`);
          }
          Object.assign(customer, data);
        });
        addToast("Customer details updated", "success");
      } catch (err: any) {
        addToast(`Update customer failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      addToast("Customer details updated", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Update customer failed: ${err.message}`, "error");
    }
  };

  const deleteCustomer = async (id: string) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          draft.customers = draft.customers.filter(customer => customer.id !== id);
        });
        addToast("Customer deleted from directory", "success");
      } catch (err: any) {
        addToast(`Deletion failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      addToast("Customer deleted from directory", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Deletion failed: ${err.message}`, "error");
    }
  };

  // Appointments mutations (with scheduling conflict checking)
  const createAppointment = async (aptData: Omit<Appointment, 'id'>): Promise<boolean> => {
    // Conflict detection
    const warnings: string[] = [];

    // Check Technician overlap
    const techCollisions = appointments.filter(a => 
      a.status !== 'Cancelled' && a.status !== 'Completed' &&
      a.assignedTechId === aptData.assignedTechId &&
      ((aptData.startTime >= a.startTime && aptData.startTime < a.endTime) ||
       (aptData.endTime > a.startTime && aptData.endTime <= a.endTime) ||
       (aptData.startTime <= a.startTime && aptData.endTime >= a.endTime))
    );
    if (techCollisions.length > 0) {
      const tech = employees.find(e => e.id === aptData.assignedTechId);
      warnings.push(`Technician ${tech?.name || 'assigned'} has overlapping booking conflict`);
    }

    // Check Service Bay overlap
    const bayCollisions = appointments.filter(a => 
      a.status !== 'Cancelled' && a.status !== 'Completed' &&
      a.serviceBayId === aptData.serviceBayId &&
      ((aptData.startTime >= a.startTime && aptData.startTime < a.endTime) ||
       (aptData.endTime > a.startTime && aptData.endTime <= a.endTime) ||
       (aptData.startTime <= a.startTime && aptData.endTime >= a.endTime))
    );
    if (bayCollisions.length > 0) {
      warnings.push(`Service Bay ${aptData.serviceBayId} is already reserved for this slot`);
    }

    // Fire warnings
    if (warnings.length > 0) {
      warnings.forEach(w => addToast(w, 'warning'));
    }

    if (isStaticModeRef.current) {
      try {
        const newId = `APT${String(appointments.length + 1).padStart(3, '0')}`;
        commitStaticSnapshot(draft => {
          draft.appointments.push({ ...aptData, id: newId });
        });
        addToast(`Appointment scheduled successfully`, "success");
        return true;
      } catch (err: any) {
        addToast(`Failed to schedule: ${err.message}`, "error");
        return false;
      }
    }

    try {
      const newId = `APT${String(appointments.length + 1).padStart(3, '0')}`;
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aptData, id: newId })
      });
      if (!res.ok) throw new Error(await res.text());
      addToast(`Appointment scheduled successfully`, "success");
      await refreshData();
      return true;
    } catch (err: any) {
      addToast(`Failed to schedule: ${err.message}`, "error");
      return false;
    }
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          const appointment = draft.appointments.find(item => item.id === id);
          if (!appointment) {
            throw new Error(`Appointment ${id} not found`);
          }
          Object.assign(appointment, data);
        });
        addToast("Appointment updated", "success");
      } catch (err: any) {
        addToast(`Update appointment failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      addToast("Appointment updated", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Update appointment failed: ${err.message}`, "error");
    }
  };

  const deleteAppointment = async (id: string) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          draft.appointments = draft.appointments.filter(appointment => appointment.id !== id);
        });
        addToast("Appointment cancelled and removed", "success");
      } catch (err: any) {
        addToast(`Cancellation failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      addToast("Appointment cancelled and removed", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Cancellation failed: ${err.message}`, "error");
    }
  };

  // Service Bay mutations
  const updateServiceBay = async (id: number, data: Partial<ServiceBay>) => {
    if (isStaticModeRef.current) {
      try {
        commitStaticSnapshot(draft => {
          const serviceBay = draft.serviceBays.find(item => item.id === id);
          if (!serviceBay) {
            throw new Error(`Service Bay ${id} not found`);
          }
          Object.assign(serviceBay, data);
        });
      } catch (err: any) {
        addToast(`Update service bay failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch(`/api/service-bays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(await res.text());
      await refreshData();
    } catch (err: any) {
      addToast(`Update service bay failed: ${err.message}`, "error");
    }
  };

  // Inspection sheets
  const createInspection = async (inspectData: Omit<InspectionReport, 'id'>) => {
    if (isStaticModeRef.current) {
      try {
        const newId = `ISP${String(inspections.length + 1).padStart(3, '0')}`;
        commitStaticSnapshot(draft => {
          draft.inspections.push({ ...inspectData, id: newId });
          const vehicle = draft.vehicles.find(item => item.id === inspectData.vehicleId);
          if (vehicle) {
            let score = 100;
            inspectData.categories.forEach(category => {
              if (category.status === 'Critical') score -= 15;
              else if (category.status === 'Warning') score -= 5;
            });
            vehicle.healthScore = Math.max(0, score);
            vehicle.lastVisit = inspectData.date;
          }
        });
        addToast("Inspection report logged. Vehicle health score updated.", "success");
      } catch (err: any) {
        addToast(`Failed to log inspection: ${err.message}`, "error");
      }
      return;
    }

    try {
      const newId = `ISP${String(inspections.length + 1).padStart(3, '0')}`;
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inspectData, id: newId })
      });
      if (!res.ok) throw new Error(await res.text());
      addToast("Inspection report logged. Vehicle health score updated.", "success");
      await refreshData();
    } catch (err: any) {
      addToast(`Failed to log inspection: ${err.message}`, "error");
    }
  };

  // AI Strategic Insight Resolution
  const resolveInsight = async (insightId: string, actionType: string, payload: any) => {
    if (isStaticModeRef.current) {
      try {
        if (actionType === 'RESTOCK_INVENTORY') {
          const partIds: string[] = payload || [];
          commitStaticSnapshot(draft => {
            partIds.forEach(partId => {
              const part = draft.parts.find(item => item.id === partId);
              if (!part) {
                return;
              }
              part.stock += 15;
              const reorderCost = Number((part.unitPrice * 15 * 0.7).toFixed(2));
              draft.transactions.push({
                id: `T-${Date.now()}-${partId}`,
                date: new Date().toISOString().split('T')[0],
                type: 'Expense',
                sourceOrCategory: 'Parts Purchases',
                amount: reorderCost,
                description: `Automated reorder replenishment (15 units) of ${part.name}`,
                branchId: part.branchId
              });
            });
          });
          addToast("Inventory reordered and restocked successfully.", "success");
          return;
        }

        throw new Error(`Action ${actionType} is not supported in static demo mode`);
      } catch (err: any) {
        addToast(`Action failed: ${err.message}`, "error");
      }
      return;
    }

    try {
      const res = await fetch('/api/ceo/resolve-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId, actionType, payload })
      });
      if (!res.ok) throw new Error(await res.text());
      const resData = await res.json();
      if (resData.success) {
        addToast(resData.message || "Action successfully completed", "success");
        await refreshData();
      } else {
        throw new Error(resData.message);
      }
    } catch (err: any) {
      addToast(`Action failed: ${err.message}`, "error");
    }
  };

  return (
    <GarageContext.Provider value={{
      role,
      changeRole,
      employees,
      shifts,
      attendance,
      transactions,
      workOrders,
      parts,
      suppliers,
      insights,
      vehicles,
      customers,
      appointments,
      serviceBays,
      inspections,
      loading,
      error,
      toasts,
      addToast,
      removeToast,
      refreshData,
      
      updateEmployee,
      createEmployee,
      deleteEmployee,
      assignShift,
      deleteShift,
      updateShiftStatus,
      clockIn,
      clockOut,
      createTransaction,
      updateWorkOrder,

      createVehicle,
      updateVehicle,
      deleteVehicle,
      createCustomer,
      updateCustomer,
      deleteCustomer,
      createAppointment,
      updateAppointment,
      deleteAppointment,
      updateServiceBay,
      createInspection,
      resolveInsight
    }}>
      {children}
    </GarageContext.Provider>
  );
};

export const useGarage = () => {
  const context = useContext(GarageContext);
  if (context === undefined) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
};
