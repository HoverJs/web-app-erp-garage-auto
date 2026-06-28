import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IDatabaseAdapter } from './adapter';
import { Employee, Shift, Attendance, Transaction, WorkOrder, Part, Supplier, Vehicle, Customer, Appointment, ServiceBay, InspectionReport } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data.json');

// Helper to read data from local JSON
function readData(): {
  employees: Employee[];
  shifts: Shift[];
  attendance: Attendance[];
  vehicles: Vehicle[];
  customers: Customer[];
  appointments: Appointment[];
  serviceBays: ServiceBay[];
  inspections: InspectionReport[];
  transactions: Transaction[];
  workOrders: WorkOrder[];
  parts: Part[];
  suppliers: Supplier[];
} {
  try {
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Data file not found at ${dbPath}`);
    }
    const raw = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('JSON Database read failure, resolving default', err);
    return {
      employees: [],
      shifts: [],
      attendance: [],
      vehicles: [],
      customers: [],
      appointments: [],
      serviceBays: [],
      inspections: [],
      transactions: [],
      workOrders: [],
      parts: [],
      suppliers: []
    };
  }
}

// Helper to write data back to local JSON
function writeData(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('JSON Database write failure', err);
  }
}

export const jsonDb: IDatabaseAdapter = {
  employees: {
    async getAll(): Promise<Employee[]> {
      return readData().employees;
    },
    async getById(id: string): Promise<Employee | null> {
      const emps = readData().employees;
      return emps.find(e => e.id === id) || null;
    },
    async create(employee: Employee): Promise<Employee> {
      const data = readData();
      data.employees.push(employee);
      writeData(data);
      return employee;
    },
    async update(id: string, employee: Partial<Employee>): Promise<Employee> {
      const data = readData();
      const idx = data.employees.findIndex(e => e.id === id);
      if (idx === -1) throw new Error(`Employee with ID ${id} not found`);
      data.employees[idx] = { ...data.employees[idx], ...employee };
      writeData(data);
      return data.employees[idx];
    },
    async delete(id: string): Promise<boolean> {
      const data = readData();
      const initialLen = data.employees.length;
      data.employees = data.employees.filter(e => e.id !== id);
      writeData(data);
      return data.employees.length < initialLen;
    }
  },
  shifts: {
    async getAll(): Promise<Shift[]> {
      return readData().shifts;
    },
    async create(shift: Shift): Promise<Shift> {
      const data = readData();
      data.shifts.push(shift);
      writeData(data);
      return shift;
    },
    async update(id: string, shift: Partial<Shift>): Promise<Shift> {
      const data = readData();
      const idx = data.shifts.findIndex(s => s.id === id);
      if (idx === -1) throw new Error(`Shift with ID ${id} not found`);
      data.shifts[idx] = { ...data.shifts[idx], ...shift };
      writeData(data);
      return data.shifts[idx];
    },
    async delete(id: string): Promise<boolean> {
      const data = readData();
      const initialLen = data.shifts.length;
      data.shifts = data.shifts.filter(s => s.id !== id);
      writeData(data);
      return data.shifts.length < initialLen;
    }
  },
  attendance: {
    async getAll(): Promise<Attendance[]> {
      return readData().attendance;
    },
    async create(attendance: Attendance): Promise<Attendance> {
      const data = readData();
      data.attendance.push(attendance);
      writeData(data);
      return attendance;
    },
    async update(id: string, attendance: Partial<Attendance>): Promise<Attendance> {
      const data = readData();
      const idx = data.attendance.findIndex(a => a.id === id);
      if (idx === -1) throw new Error(`Attendance record ${id} not found`);
      data.attendance[idx] = { ...data.attendance[idx], ...attendance };
      writeData(data);
      return data.attendance[idx];
    }
  },
  vehicles: {
    async getAll(): Promise<Vehicle[]> {
      return readData().vehicles;
    },
    async getById(id: string): Promise<Vehicle | null> {
      return readData().vehicles.find(v => v.id === id) || null;
    },
    async create(vehicle: Vehicle): Promise<Vehicle> {
      const data = readData();
      data.vehicles.push(vehicle);
      writeData(data);
      return vehicle;
    },
    async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
      const data = readData();
      const idx = data.vehicles.findIndex(v => v.id === id);
      if (idx === -1) throw new Error(`Vehicle ${id} not found`);
      data.vehicles[idx] = { ...data.vehicles[idx], ...vehicle };
      writeData(data);
      return data.vehicles[idx];
    },
    async delete(id: string): Promise<boolean> {
      const data = readData();
      const initialLen = data.vehicles.length;
      data.vehicles = data.vehicles.filter(v => v.id !== id);
      writeData(data);
      return data.vehicles.length < initialLen;
    }
  },
  customers: {
    async getAll(): Promise<Customer[]> {
      return readData().customers;
    },
    async getById(id: string): Promise<Customer | null> {
      return readData().customers.find(c => c.id === id) || null;
    },
    async create(customer: Customer): Promise<Customer> {
      const data = readData();
      data.customers.push(customer);
      writeData(data);
      return customer;
    },
    async update(id: string, customer: Partial<Customer>): Promise<Customer> {
      const data = readData();
      const idx = data.customers.findIndex(c => c.id === id);
      if (idx === -1) throw new Error(`Customer ${id} not found`);
      data.customers[idx] = { ...data.customers[idx], ...customer };
      writeData(data);
      return data.customers[idx];
    },
    async delete(id: string): Promise<boolean> {
      const data = readData();
      const initialLen = data.customers.length;
      data.customers = data.customers.filter(c => c.id !== id);
      writeData(data);
      return data.customers.length < initialLen;
    }
  },
  appointments: {
    async getAll(): Promise<Appointment[]> {
      return readData().appointments;
    },
    async create(appointment: Appointment): Promise<Appointment> {
      const data = readData();
      data.appointments.push(appointment);
      writeData(data);
      return appointment;
    },
    async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
      const data = readData();
      const idx = data.appointments.findIndex(a => a.id === id);
      if (idx === -1) throw new Error(`Appointment ${id} not found`);
      data.appointments[idx] = { ...data.appointments[idx], ...appointment };
      writeData(data);
      return data.appointments[idx];
    },
    async delete(id: string): Promise<boolean> {
      const data = readData();
      const initialLen = data.appointments.length;
      data.appointments = data.appointments.filter(a => a.id !== id);
      writeData(data);
      return data.appointments.length < initialLen;
    }
  },
  serviceBays: {
    async getAll(): Promise<ServiceBay[]> {
      return readData().serviceBays;
    },
    async update(id: number, bay: Partial<ServiceBay>): Promise<ServiceBay> {
      const data = readData();
      const idx = data.serviceBays.findIndex(b => b.id === id);
      if (idx === -1) throw new Error(`Service Bay ${id} not found`);
      data.serviceBays[idx] = { ...data.serviceBays[idx], ...bay };
      writeData(data);
      return data.serviceBays[idx];
    }
  },
  inspections: {
    async getAll(): Promise<InspectionReport[]> {
      return readData().inspections;
    },
    async create(report: InspectionReport): Promise<InspectionReport> {
      const data = readData();
      data.inspections.push(report);
      writeData(data);
      return report;
    }
  },
  transactions: {
    async getAll(): Promise<Transaction[]> {
      return readData().transactions;
    },
    async create(transaction: Transaction): Promise<Transaction> {
      const data = readData();
      data.transactions.push(transaction);
      writeData(data);
      return transaction;
    }
  },
  workOrders: {
    async getAll(): Promise<WorkOrder[]> {
      return readData().workOrders;
    },
    async getById(id: string): Promise<WorkOrder | null> {
      const orders = readData().workOrders;
      return orders.find(o => o.id === id) || null;
    },
    async create(order: WorkOrder): Promise<WorkOrder> {
      const data = readData();
      data.workOrders.push(order);
      writeData(data);
      return order;
    },
    async update(id: string, order: Partial<WorkOrder>): Promise<WorkOrder> {
      const data = readData();
      const idx = data.workOrders.findIndex(o => o.id === id);
      if (idx === -1) throw new Error(`Work order ${id} not found`);
      data.workOrders[idx] = { ...data.workOrders[idx], ...order };
      writeData(data);
      return data.workOrders[idx];
    }
  },
  parts: {
    async getAll(): Promise<Part[]> {
      return readData().parts;
    },
    async update(id: string, part: Partial<Part>): Promise<Part> {
      const data = readData();
      const idx = data.parts.findIndex(p => p.id === id);
      if (idx === -1) throw new Error(`Part ${id} not found`);
      data.parts[idx] = { ...data.parts[idx], ...part };
      writeData(data);
      return data.parts[idx];
    }
  },
  suppliers: {
    async getAll(): Promise<Supplier[]> {
      return readData().suppliers;
    }
  }
};
export default jsonDb;
