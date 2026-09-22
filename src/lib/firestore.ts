import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CompanySettings, Customer, Invoice, InvoiceDraft, Product } from '../types';

const scoped = (name: 'customers' | 'products' | 'invoices', uid: string) =>
  query(collection(db, name), where('userId', '==', uid));

export async function getCompanySettings(uid: string): Promise<CompanySettings | null> {
  const snap = await getDoc(doc(db, 'company_settings', uid));
  return snap.exists() ? (snap.data() as CompanySettings) : null;
}

export const saveCompanySettings = (uid: string, data: CompanySettings) =>
  setDoc(doc(db, 'company_settings', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });

export async function listProducts(uid: string): Promise<Product[]> {
  const snap = await getDocs(scoped('products', uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)).sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveProduct(uid: string, product: Omit<Product, 'id' | 'userId'>, id?: string) {
  const payload = { ...product, userId: uid, updatedAt: serverTimestamp() };
  if (id) return updateDoc(doc(db, 'products', id), payload);
  return addDoc(collection(db, 'products'), { ...payload, createdAt: serverTimestamp() });
}

export const removeProduct = (id: string) => deleteDoc(doc(db, 'products', id));

export async function listCustomers(uid: string): Promise<Customer[]> {
  const snap = await getDocs(scoped('customers', uid));
  const customers = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
  
  const unique = new Map<string, Customer>();
  const toDelete: string[] = [];
  
  for (const c of customers) {
    const key = c.name.toLowerCase().trim();
    if (unique.has(key)) {
      toDelete.push(c.id);
      const kept = unique.get(key)!;
      let needsUpdate = false;
      if (!kept.phone && c.phone) { kept.phone = c.phone; needsUpdate = true; }
      if (!kept.address && c.address) { kept.address = c.address; needsUpdate = true; }
      if (needsUpdate) updateDoc(doc(db, 'customers', kept.id), { phone: kept.phone, address: kept.address });
    } else {
      unique.set(key, c);
    }
  }
  
  if (toDelete.length > 0) {
    Promise.all(toDelete.map(id => deleteDoc(doc(db, 'customers', id)))).catch(() => {});
  }
  
  return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveCustomer(uid: string, customer: Omit<Customer, 'id' | 'userId'>, id?: string) {
  const payload = { ...customer, userId: uid, updatedAt: serverTimestamp() };
  if (id) return updateDoc(doc(db, 'customers', id), payload);
  return addDoc(collection(db, 'customers'), { ...payload, createdAt: serverTimestamp() });
}

export const removeCustomer = (id: string) => deleteDoc(doc(db, 'customers', id));

export async function upsertCustomerFromInvoice(uid: string, name: string, phone: string, address: string) {
  const cleanName = name.trim();
  if (!cleanName) return;
  
  const allCustomers = await listCustomers(uid);
  const match = allCustomers.find((c) => c.name.toLowerCase() === cleanName.toLowerCase());
  
  if (!match) {
    return saveCustomer(uid, { name: cleanName, phone, address });
  }
  return updateDoc(doc(db, 'customers', match.id), { phone, address, updatedAt: serverTimestamp() });
}

export async function listInvoices(uid: string): Promise<Invoice[]> {
  const snap = await getDocs(query(collection(db, 'invoices'), where('userId', '==', uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice))
    .sort((a, b) => {
      const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
      const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    });
}

export async function nextInvoiceNumber(uid: string): Promise<number> {
  const invoices = await listInvoices(uid);
  if (!invoices.length) return 1;
  const highest = Math.max(...invoices.map(i => Number(i.invoiceNo || 0)));
  return highest + 1;
}

export async function createInvoice(uid: string, invoice: InvoiceDraft) {
  const result = await addDoc(collection(db, 'invoices'), { ...invoice, userId: uid, createdAt: serverTimestamp() });
  await upsertCustomerFromInvoice(uid, invoice.shopName, invoice.phone, invoice.address);
  return result.id;
}

export async function updateInvoice(uid: string, id: string, invoice: InvoiceDraft) {
  await updateDoc(doc(db, 'invoices', id), { ...invoice, userId: uid, updatedAt: serverTimestamp() });
  await upsertCustomerFromInvoice(uid, invoice.shopName, invoice.phone, invoice.address);
}

export const removeInvoice = (id: string) => deleteDoc(doc(db, 'invoices', id));

export interface ContactMessageData {
  userId?: string;
  name?: string;
  email: string;
  phone?: string;
  businessName?: string;
  subject: string;
  message: string;
  read?: boolean;
  createdAt?: any;
}

export async function saveContactMessage(dataOrUid: string | ContactMessageData, email?: string, subject?: string, message?: string) {
  let payload: Record<string, any>;
  if (typeof dataOrUid === 'object') {
    payload = {
      userId: dataOrUid.userId || 'guest',
      name: dataOrUid.name || 'Anonymous Visitor',
      email: dataOrUid.email,
      phone: dataOrUid.phone || '',
      businessName: dataOrUid.businessName || '',
      subject: dataOrUid.subject,
      message: dataOrUid.message,
      read: false,
      createdAt: serverTimestamp()
    };
  } else {
    payload = {
      userId: dataOrUid || 'guest',
      email: email || 'Unknown',
      subject: subject || '',
      message: message || '',
      read: false,
      createdAt: serverTimestamp()
    };
  }
  return addDoc(collection(db, 'contact_messages'), payload);
}

export async function listContactMessages() {
  const snap = await getDocs(query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getContactNotice(): Promise<{ notice?: string; phone?: string; email?: string } | null> {
  try {
    const snap = await getDoc(doc(db, 'site_settings', 'contact_notice'));
    return snap.exists() ? (snap.data() as any) : null;
  } catch {
    return null;
  }
}

export async function saveContactNotice(notice: string, phone?: string, email?: string) {
  return setDoc(doc(db, 'site_settings', 'contact_notice'), {
    notice,
    phone: phone || '+91 97055 27264',
    email: email || 'thegopichand@gmail.com',
    updatedAt: serverTimestamp()
  }, { merge: true });
}
