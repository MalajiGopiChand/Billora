import { useEffect, useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth, startOfToday } from 'date-fns';
import { Eye, Pencil, Plus, Search, Trash2, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { InvoiceModal } from '../components/InvoiceModal';
import { useAuth } from '../context/AuthContext';
import { getCompanySettings, listInvoices, removeInvoice } from '../lib/firestore';
import { currency } from '../lib/money';
import type { CompanySettings, Invoice } from '../types';
import styles from './AllBills.module.css';

type Range = 'All' | 'Today' | 'This Month';

export function AllBills() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState<Invoice[]>([]);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<Range>('All');
  const [preview, setPreview] = useState<Invoice | null>(null);

  const load = () => user && listInvoices(user.uid).then(setBills);

  useEffect(() => {
    if (user) {
      load();
      getCompanySettings(user.uid).then(setCompany);
    }
  }, [user]);

  const visible = useMemo(() => {
    const today = startOfToday();
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    return bills.filter((bill) => {
      const date = new Date(`${bill.date}T00:00:00`);
      const matchesRange =
        range === 'All' ||
        (range === 'Today' && bill.date === format(today, 'yyyy-MM-dd')) ||
        (range === 'This Month' && date >= start && date <= end);

      const query = `${bill.shopName} ${bill.invoiceNo}`.toLowerCase();
      return matchesRange && query.includes(search.toLowerCase());
    });
  }, [bills, range, search]);

  return (
    <div className={styles.wrapper}>
      {/* 1. Header Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.titleArea}>
          <h2>All Invoices & Bills</h2>
          <p>Search, preview, print, or download invoices saved in your workspace.</p>
        </div>
        <Link className="primary-button" to="/create-bill">
          <Plus size={16} /> Create Bill
        </Link>
      </div>

      {/* 2. Main Invoices Card */}
      <section className={styles.card}>
        <div className={styles.filters}>
          <label className="search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name or invoice #..."
            />
          </label>

          <div className={styles.rangePills}>
            {(['All', 'Today', 'This Month'] as Range[]).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setRange(item)}
                className={`${styles.rangeBtn} ${range === item ? styles.rangeBtnActive : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Transport</th>
                <th>Total Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((bill) => (
                <tr key={bill.id}>
                  <td>
                    <span className={styles.invoicePill}>#{bill.invoiceNo}</span>
                  </td>
                  <td>{bill.date}</td>
                  <td>
                    <div className={styles.customerCell}>
                      <div className={styles.customerAvatar}>
                        {(bill.shopName || 'C')[0].toUpperCase()}
                      </div>
                      <span>{bill.shopName || 'Walk-in Customer'}</span>
                    </div>
                  </td>
                  <td>{bill.transport || '-'}</td>
                  <td>
                    <strong>{currency(bill.grandTotal)}</strong>
                  </td>
                  <td className="row-actions">
                    <button
                      type="button"
                      title="Preview / Print / PDF"
                      onClick={() => setPreview(bill)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      title="Edit Invoice"
                      onClick={() => navigate('/create-bill', { state: { invoice: bill } })}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      title="Delete Invoice"
                      className="icon-danger"
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Delete invoice #${bill.invoiceNo}? This action cannot be undone.`
                          )
                        ) {
                          await removeInvoice(bill.id);
                          load();
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No bills match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invoice Print & PDF Modal */}
      {preview && (
        <InvoiceModal
          invoice={preview}
          company={company}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
