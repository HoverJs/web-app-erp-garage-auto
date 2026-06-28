import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Employee, Shift, Attendance, Transaction, WorkOrder, Part, Supplier, Insight, UserRole, Vehicle, Customer, Appointment, ServiceBay, InspectionReport } from '../shared/types';

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

  // Central fetcher
  const refreshData = useCallback(async () => {
    try {
      const [
        empsRes, shiftsRes, attRes, txRes, woRes, partsRes, supRes, insightsRes,
        vehRes, custRes, aptRes, bayRes, inspectRes
      ] = await Promise.all([
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/shifts').then(r => r.json()),
        fetch('/api/attendance').then(r => r.json()),
        fetch('/api/transactions').then(r => r.json()),
        fetch('/api/work-orders').then(r => r.json()),
        fetch('/api/parts').then(r => r.json()),
        fetch('/api/suppliers').then(r => r.json()),
        fetch('/api/ceo/insights').then(r => r.json()),
        fetch('/api/vehicles').then(r => r.json()),
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/appointments').then(r => r.json()),
        fetch('/api/service-bays').then(r => r.json()),
        fetch('/api/inspections').then(r => r.json())
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
      setError("Failed to sync database. Is the backend server running?");
      addToast("Failed to synchronize with server", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Employee CRUD operations
  const updateEmployee = async (id: string, data: Partial<Employee>) => {
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
