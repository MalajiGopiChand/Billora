import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, IndianRupee, ReceiptText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listCustomers, listInvoices } from '../lib/firestore';
import { currency } from '../lib/money';
import type { Customer, Invoice } from '../types';
import styles from './CustomerProfile.module.css';

export function CustomerProfile() {
  const { customerId } = useParams(); const { user } = useAuth(); const [customer, setCustomer] = useState<Customer | null>(null); const [invoices, setInvoices] = useState<Invoice[]>([]);
  useEffect(() => { if (!user) return; Promise.all([listCustomers(user.uid), listInvoices(user.uid)]).then(([customers, bills]) => { const found = customers.find((item) => item.id === customerId) || null; setCustomer(found); setInvoices(found ? bills.filter((bill) => bill.shopName.toLowerCase() === found.name.toLowerCase()) : []); }); }, [user, customerId]);
  const total = invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0); const topItems = useMemo(() => { const tally = new Map<string, number>(); invoices.forEach((bill) => bill.items.forEach((item) => tally.set(item.description, (tally.get(item.description) || 0) + Number(item.qty || 0)))); return [...tally].sort((a,b) => b[1]-a[1]).slice(0,5); }, [invoices]);
  if (!customer) return <div className="page-loader">Loading customer profile...</div>;
  return <><Link className={styles.back} to="/customers"><ArrowLeft size={16}/>Back to customers</Link><section className={styles.hero}><div><p>Customer profile</p><h2>{customer.name}</h2><span>{customer.phone || 'No phone'} · {customer.address || 'No address'}</span></div></section><div className={styles.stats}><article><IndianRupee size={20}/><p>Total Billed Amount (Payouts)</p><strong>{currency(total)}</strong></article><article><ReceiptText size={20}/><p>Average bill size</p><strong>{currency(invoices.length ? total / invoices.length : 0)}</strong></article><article><FileText size={20}/><p>Total invoices</p><strong>{invoices.length}</strong></article></div><section className={styles.grid}><article className={styles.card}><h3>Top items bought</h3>{topItems.length ? <ol>{topItems.map(([name, qty]) => <li key={name}><span>{name || 'Unspecified item'}</span><b>{qty} units</b></li>)}</ol> : <p className={styles.muted}>No invoices yet.</p>}</article><article className={styles.card}><h3>Invoice history</h3><div className="table-scroll"><table className="data-table"><thead><tr><th>Invoice</th><th>Date</th><th>Total</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td>#{invoice.invoiceNo}</td><td>{invoice.date}</td><td>{currency(invoice.grandTotal)}</td></tr>)}{!invoices.length && <tr><td colSpan={3} className="empty-cell">No invoices found.</td></tr>}</tbody></table></div></article></section></>;
}
