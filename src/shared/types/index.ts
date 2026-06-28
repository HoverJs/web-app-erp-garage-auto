export interface EmployeeContact {
  email: string;
  phone: string;
  address: string;
}

export interface Employee {
  id: string;
  name: string;
  position: 'Technician' | 'Service Advisor' | 'Receptionist' | 'Inventory Staff' | 'Accountant' | 'Branch Manager' | 'Administrator';
  department: 'Workshop' | 'Service Front' | 'Inventory' | 'Finance' | 'Administration';
  branch: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Terminated';
  contact: EmployeeContact;
  hireDate: string;
  dob: string;
  baseSalary: number;
  allowance: number;
  bonus: number;
  overtimeRate: number;
  kpiScore: number;
  productivity: number;
  attendanceRate: number;
  rating: number;
  branchId: string;
}

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'Morning' | 'Afternoon' | 'Evening' | 'Custom';
  employeeId: string;
  status: 'Assigned' | 'Completed' | 'Leave';
}

export interface Attendance {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'On Time' | 'Late' | 'Overtime' | 'Absent';
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  vin: string;
  customerId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  lastVisit: string; // YYYY-MM-DD
  healthScore: number; // 0 - 100
  imageUrl?: string;
  branchId: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalSpending: number;
  lastVisit: string; // YYYY-MM-DD
  preferredContactMethod: 'Phone' | 'Email' | 'SMS';
  marketingOptIn: boolean;
  notes: string[];
  branchId: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceType: string;
  assignedTechId: string;
  serviceBayId: number; // 1 to 5
  startTime: string; // YYYY-MM-DD HH:MM
  endTime: string; // YYYY-MM-DD HH:MM
  estimatedDuration: number; // hours
  status: 'Scheduled' | 'Checked In' | 'In Service' | 'Completed' | 'No Show' | 'Cancelled';
  branchId: string;
}

export interface ServiceBay {
  id: number; // 1 to 5
  name: string;
  status: 'Available' | 'Occupied' | 'Waiting Parts' | 'Inspection' | 'Completed';
  currentVehicleId?: string;
  assignedTechId?: string;
  progress?: number; // 0 - 100
  eta?: string; // HH:MM
  branchId: string;
}

export interface InspectionCategory {
  name: string;
  status: 'Pass' | 'Warning' | 'Critical';
  notes: string;
}

export interface InspectionReport {
  id: string;
  workOrderId: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  categories: InspectionCategory[];
  branchId: string;
}

export interface WorkOrderStageHistory {
  stage: 'Check In' | 'Inspection' | 'Diagnosis' | 'Waiting Parts' | 'Repair' | 'Quality Check' | 'Ready Pickup' | 'Delivered';
  enteredAt: string; // ISO DateTime
  exitedAt?: string; // ISO DateTime
}

export interface WorkOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  appointmentId?: string;
  serviceBayId?: number;
  description: string;
  assignedTechId: string;
  status: 'Check In' | 'Inspection' | 'Diagnosis' | 'Waiting Parts' | 'Repair' | 'Quality Check' | 'Ready Pickup' | 'Delivered';
  partsUsed: {
    partId: string;
    quantity: number;
  }[];
  stageHistory: WorkOrderStageHistory[];
  branchId: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'Revenue' | 'Expense';
  sourceOrCategory: string;
  amount: number;
  description: string;
  customerId?: string;
  vehicleId?: string;
  workOrderId?: string;
  appointmentId?: string;
  branchId: string;
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  supplierId: string;
  branchId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  branchId: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'critical';
  module: 'finance' | 'workforce' | 'hr' | 'inventory' | 'garage' | 'customer';
  actionLabel?: string;
  actionPayload?: {
    actionType: string;
    targetId?: string;
    updates?: any;
  };
}

export type UserRole = 'Owner' | 'Admin' | 'Branch Manager' | 'Service Advisor' | 'Technician' | 'Accountant' | 'Inventory Staff';
export type BranchId = 'BR-01' | 'BR-02';
