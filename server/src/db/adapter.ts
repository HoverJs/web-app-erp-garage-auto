import { Employee, Shift, Attendance, Transaction, WorkOrder, Part, Supplier, Vehicle, Customer, Appointment, ServiceBay, InspectionReport } from '../types';

export interface IEmployeeRepository {
  getAll(): Promise<Employee[]>;
  getById(id: string): Promise<Employee | null>;
  create(employee: Employee): Promise<Employee>;
  update(id: string, employee: Partial<Employee>): Promise<Employee>;
  delete(id: string): Promise<boolean>;
}

export interface IShiftRepository {
  getAll(): Promise<Shift[]>;
  create(shift: Shift): Promise<Shift>;
  update(id: string, shift: Partial<Shift>): Promise<Shift>;
  delete(id: string): Promise<boolean>;
}

export interface IAttendanceRepository {
  getAll(): Promise<Attendance[]>;
  create(attendance: Attendance): Promise<Attendance>;
  update(id: string, attendance: Partial<Attendance>): Promise<Attendance>;
}

export interface IVehicleRepository {
  getAll(): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | null>;
  create(vehicle: Vehicle): Promise<Vehicle>;
  update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle>;
  delete(id: string): Promise<boolean>;
}

export interface ICustomerRepository {
  getAll(): Promise<Customer[]>;
  getById(id: string): Promise<Customer | null>;
  create(customer: Customer): Promise<Customer>;
  update(id: string, customer: Partial<Customer>): Promise<Customer>;
  delete(id: string): Promise<boolean>;
}

export interface IAppointmentRepository {
  getAll(): Promise<Appointment[]>;
  create(appointment: Appointment): Promise<Appointment>;
  update(id: string, appointment: Partial<Appointment>): Promise<Appointment>;
  delete(id: string): Promise<boolean>;
}

export interface IServiceBayRepository {
  getAll(): Promise<ServiceBay[]>;
  update(id: number, bay: Partial<ServiceBay>): Promise<ServiceBay>;
}

export interface IInspectionRepository {
  getAll(): Promise<InspectionReport[]>;
  create(report: InspectionReport): Promise<InspectionReport>;
}

export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<Transaction>;
}

export interface IWorkOrderRepository {
  getAll(): Promise<WorkOrder[]>;
  getById(id: string): Promise<WorkOrder | null>;
  create(order: WorkOrder): Promise<WorkOrder>;
  update(id: string, order: Partial<WorkOrder>): Promise<WorkOrder>;
}

export interface IPartRepository {
  getAll(): Promise<Part[]>;
  update(id: string, part: Partial<Part>): Promise<Part>;
}

export interface ISupplierRepository {
  getAll(): Promise<Supplier[]>;
}

export interface IDatabaseAdapter {
  employees: IEmployeeRepository;
  shifts: IShiftRepository;
  attendance: IAttendanceRepository;
  vehicles: IVehicleRepository;
  customers: ICustomerRepository;
  appointments: IAppointmentRepository;
  serviceBays: IServiceBayRepository;
  inspections: IInspectionRepository;
  transactions: ITransactionRepository;
  workOrders: IWorkOrderRepository;
  parts: IPartRepository;
  suppliers: ISupplierRepository;
}
