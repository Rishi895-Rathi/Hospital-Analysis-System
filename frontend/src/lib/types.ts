export interface Doctor {
  id: number;
  name: string;
  emailId?: string;
  contactNumber?: number | string;
  specialization?: string;
  department?: string;
  available?: boolean;
  bio?: string;
  leaveStartDate?: string | null;
  leaveEndDate?: string | null;
}

export interface Patient {
  id: number;
  name: string;
  age?: number;
  email?: string;
  phone?: string;
  disease?: string;
  bloodGroup?: string;
  address?: string;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "POSTPONED"
  | "COMPLETED";

export interface Appointment {
  id: number;
  patientId?: number;
  doctorId?: number;
  patientName?: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  reason?: string;
  status?: AppointmentStatus;
}

export type PaymentMethod = "CASH" | "CARD" | "UPI";
export type PaymentStatus = "PAID" | "PARTIAL" | "PENDING";

export interface Billing {
  id?: number;
  patientId?: number;
  patientName: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
}
