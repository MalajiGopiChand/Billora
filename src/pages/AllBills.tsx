import { useEffect, useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth, startOfToday } from 'date-fns';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { InvoiceModal } from '../components/InvoiceModal';
import { useAuth } from '../context/AuthContext';
import { getCompanySettings, listInvoices, removeInvoice } from '../lib/firestore';
import { currency } from '../lib/money';
import type { CompanySettings, Invoice } from '../types';
import styles from './AllBills.module.css';

type Range = 'All' | 'Today' | 'This Month';
export function AllBills() {
  const { user } = useAuth(); const navigate = useNavigate(); const [bills, setBills] = useState<Invoice[]>([]); const [company, setCompany] = useState<CompanySettings | null>(null); const [search, setSearch] = useState(''); const [range, setRange] = useState<Range>('All'); const [preview, setPreview] = useState<Invoice | null>(null);
  const load = () => user && listInvoices(user.uid).then(setBills); useEffect(() => { if (user) { load(); getCompanySettings(user.uid).then(setCompany); } }, [user]);
  const visible = useMemo(() => { const today = startOfToday(); const start = startOfMonth(today); const end = endOfMonth(today); return bills.filter((bill) => { const date = new Date(`${bill.date}T00:00:00`); const matchesRange = range === 'All' || (range === 'Today' && bill.date === format(today, 'yyyy-MM-dd')) || (range === 'This Month' && date >= start && date <= end); const query = `${bill.shopName} ${bill.invoiceNo}`.toLowerCase(); return matchesRange && query.includes(search.toLowerCase()); }); }, [bills, range, search]);
  return <><div className={styles.toolbar}><div><h2>All bills</h2><p>Search, preview, edit, or remove saved invoices.</p></div><Link className="primary-button" to="/create-bill"><Plus size={17}/>Create bill</Link></div><section className={styles.card}><div className={styles.filters}><label className="search-box"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Customer name or bill no." /></label><div className={styles.range}>{(['All', 'Today', 'This Month'] as Range[]).map((item) => <button key={item} onClick={() => setRange(item)} className={range === item ? styles.active : ''}>{item}</button>)}</div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Transport</th><th>Total</th><th></th></tr></thead><tbody>{visible.map((bill) => <tr key={bill.id}><td><b>#{bill.invoiceNo}</b></td><td>{bill.date}</td><td>{bill.shopName || 'Walk-in Customer'}</td><td>{bill.transport || '-'}</td><td>{currency(bill.grandTotal)}</td><td className="row-actions"><button title="Preview invoice" onClick={() => setPreview(bill)}><Eye size={17}/></button><button title="Edit invoice" onClick={() => navigate('/create-bill', { state: { invoice: bill } })}><Pencil size={17}/></button><button title="Delete invoice" onClick={async () => { if (window.confirm(`Delete invoice #${bill.invoiceNo}? This cannot be undone.`)) { await removeInvoice(bill.id); load(); } }}><Trash2 size={17}/></button></td></tr>)}{!visible.length && <tr><td colSpan={6} className="empty-cell">No bills match your filters.</td></tr>}</tbody></table></div></section>{preview && <InvoiceModal invoice={preview} company={company} onClose={() => setPreview(null)} />}</>;
}
