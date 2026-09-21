import type { Timestamp } from 'firebase/firestore';

export interface CompanySettings {
  companyName: string;
  phone?: string;
  address: string;
  terms: string;
}

export type SubscriptionPlan = 'monthly' | 'half_yearly' | 'yearly' | 'complimentary';
export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled';

export interface Subscription {
  uid: string;
  email: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt?: Timestamp;
  expiresAt?: Timestamp;
  amount?: number;
  paymentId?: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  rate?: number | null;
}

export interface InvoiceItem {
  description: string;
  box: number | '';
  qty: number | '';
  rate: number | '';
  discount: number | '';
  gross: number;
  amount: number;
}

export interface Invoice {
  id: string;
  userId: string;
  shopName: string;
  phone: string;
  address: string;
  date: string;
  invoiceNo: number;
  gbSlipNo: string;
  transport: string;
  lrNo: string;
  globalBoxes: number | '';
  terms: string;
  tax: number | '';
  hamali: number | '';
  hamaliLabel: string;
  grandTotal: number;
  createdAt?: Timestamp;
  items: InvoiceItem[];
}

export type InvoiceDraft = Omit<Invoice, 'id' | 'userId' | 'createdAt'>;
