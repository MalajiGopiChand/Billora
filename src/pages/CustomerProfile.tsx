import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, IndianRupee, ReceiptText, Phone, MapPin, Eye, Printer } from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';
import { useAuth } from '../context/AuthContext';
import { listCustomers, listInvoices, getCompanySettings } from '../lib/firestore';
import { currency } from '../lib/money';
import type { Customer, Invoice, CompanySettings } from '../types';
import styles from './CustomerProfile.module.css';

export function CustomerProfile() {
  const { customerId } = useParams();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [preview, setPreview] = useState<Invoice | null>(null);
  const [autoPrint, setAutoPrint] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      listCustomers(user.uid),
      listInvoices(user.uid),
      getCompanySettings(user.uid)
    ]).then(([customers, bills, companySettings]) => {
      const found = customers.find((item) => item.id === customerId) || null;
      setCustomer(found);
      setInvoices(
        found ? bills.filter((bill) => bill.shopName.toLowerCase() === found.name.toLowerCase()) : []
      );
      setCompany(companySettings);
    });
  }, [user, customerId]);

  const total = invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);

  const topItems = useMemo(() => {
    const tally = new Map<string, number>();
    invoices.forEach((bill) =>
      bill.items.forEach((item) =>
        tally.set(
          item.description || 'General Item',
          (tally.get(item.description || 'General Item') || 0) + Number(item.qty || 0)
        )
      )
    );
    return [...tally].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [invoices]);

  if (!customer) return <div className="page-loader">Loading customer profile...</div>;

  return (
    <div className={styles.wrapper}>
      <Link className={styles.back} to="/customers">
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      {/* Customer Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.customerAvatarLarge}>
          {(customer.name || 'C')[0].toUpperCase()}
        </div>
        <div className={styles.heroDetails}>
          <p>Customer Profile</p>
          <h2>{customer.name}</h2>
          <div className={styles.heroMeta}>
            {customer.phone && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Phone size={14} /> {customer.phone}
              </span>
            )}
            {customer.address && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={14} /> {customer.address}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 3 Stat KPI Cards */}
      <div className={styles.stats}>
        <article className={styles.statCard}>
          <div className={styles.statHeader}>
            <p>Total Revenue</p>
            <div className={styles.statIcon} style={{ background: '#ecfdf5', color: '#10b981' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <strong>{currency(total)}</strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statHeader}>
            <p>Average Bill Size</p>
            <div className={styles.statIcon} style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <ReceiptText size={18} />
            </div>
          </div>
          <strong>{currency(invoices.length ? total / invoices.length : 0)}</strong>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statHeader}>
            <p>Total Invoices</p>
            <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>
              <FileText size={18} />
            </div>
          </div>
          <strong>{invoices.length} bills</strong>
        </article>
      </div>

      {/* Split Grid */}
      <section className={styles.grid}>
        <article className={styles.card}>
          <h3>Top Items Purchased</h3>
          {topItems.length ? (
            <ol>
              {topItems.map(([name, qty]) => (
                <li key={name}>
                  <span>{name}</span>
                  <b>{qty} units</b>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.muted}>No items purchased yet.</p>
          )}
        </article>

        <article className={styles.card}>
          <h3>Invoice History</h3>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><strong>#{invoice.invoiceNo}</strong></td>
                    <td>{invoice.date}</td>
                    <td>{currency(invoice.grandTotal)}</td>
                    <td className="row-actions">
                      <button
                        type="button"
                        title="View invoice"
                        onClick={() => {
                          setAutoPrint(false);
                          setPreview(invoice);
                        }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        title="Print invoice"
                        onClick={() => {
                          setAutoPrint(true);
                          setPreview(invoice);
                        }}
                      >
                        <Printer size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!invoices.length && (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      No invoices found for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Invoice Preview / Print Modal */}
      {preview && (
        <InvoiceModal
          invoice={preview}
          company={company}
          autoPrint={autoPrint}
          onClose={() => {
            setPreview(null);
            setAutoPrint(false);
          }}
        />
      )}
    </div>
  );
}
