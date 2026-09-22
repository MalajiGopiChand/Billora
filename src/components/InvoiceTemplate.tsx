import type { CompanySettings, InvoiceDraft } from '../types';
import { currency } from '../lib/money';
import styles from './InvoiceTemplate.module.css';

interface InvoiceTemplateProps {
  invoice: InvoiceDraft;
  company: CompanySettings | null;
  paperSize?: 'a4' | 'a5';
}

export function InvoiceTemplate({ invoice, company, paperSize = 'a4' }: InvoiceTemplateProps) {
  const visibleItems = invoice.items.filter((item) => item.description || item.qty || item.rate);
  const sizeClass = paperSize === 'a5' ? styles.paperA5 : styles.paperA4;
  const itemTotal = visibleItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <article id="printable-invoice" className={`${styles.invoice} ${sizeClass}`}>
      {/* 1. Header with Shop Branding and Invoice Badge */}
      <header className={styles.header}>
        <div className={styles.shopInfo}>
          <h1>{company?.companyName || 'Your Shop Name'}</h1>
          <p>
            {company?.address || 'Shop Address, City, State'}
            {company?.phone ? `\nTel: ${company.phone}` : ''}
          </p>
        </div>

        <div className={styles.invoiceBadge}>
          <span className={styles.badgeTitle}>TAX INVOICE</span>
          <span className={styles.badgeNo}>#{invoice.invoiceNo || 'DRAFT'}</span>
          <span className={styles.badgeMeta}>Date: {invoice.date}</span>
        </div>
      </header>

      {/* 2. Customer & Transport Details Grid */}
      <section className={styles.metaGrid}>
        <div className={styles.metaCol}>
          <span className={styles.metaLabel}>Billed To</span>
          <span className={styles.metaCustomerName}>{invoice.shopName || 'Walk-in Customer'}</span>
          {invoice.phone && <span className={styles.metaText}>Phone: {invoice.phone}</span>}
          {invoice.address && <span className={styles.metaText}>Address: {invoice.address}</span>}
        </div>

        <div className={styles.metaCol}>
          <span className={styles.metaLabel}>Transport & Logistics</span>
          <span className={styles.metaText}>GB Slip No: {invoice.gbSlipNo || '-'}</span>
          <span className={styles.metaText}>LR No: {invoice.lrNo || '-'}</span>
          <span className={styles.metaText}>Transport: {invoice.transport || '-'}</span>
          <span className={styles.metaText}>Total Boxes: {invoice.globalBoxes || '-'}</span>
        </div>
      </section>

      {/* 3. Items Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Description</th>
              <th style={{ width: '45px' }}>Box</th>
              <th style={{ width: '45px' }}>Qty</th>
              <th style={{ width: '75px' }}>Rate</th>
              <th style={{ width: '55px' }}>Disc %</th>
              <th style={{ width: '80px' }}>Gross</th>
              <th style={{ width: '85px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.description || '-'}</td>
                <td>{item.box || '-'}</td>
                <td>{item.qty}</td>
                <td>{currency(item.rate)}</td>
                <td>{item.discount ? `${item.discount}%` : '-'}</td>
                <td>{currency(item.gross)}</td>
                <td><strong>{currency(item.amount)}</strong></td>
              </tr>
            ))}
            {visibleItems.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>
                  No items listed in this invoice.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Bottom Grid: Terms & Financial Totals */}
      <section className={styles.bottomGrid}>
        <div className={styles.termsBox}>
          <strong>Terms & Conditions</strong>
          <p>{invoice.terms || company?.terms || '1. Goods once sold will not be taken back or exchanged.\n2. Payment is due upon receipt of invoice.'}</p>
        </div>

        <div className={styles.totalsBox}>
          <div className={styles.totalRow}>
            <span>Item Subtotal</span>
            <span>{currency(itemTotal)}</span>
          </div>
          {Number(invoice.tax) > 0 && (
            <div className={styles.totalRow}>
              <span>GST / Tax</span>
              <span>{currency(invoice.tax)}</span>
            </div>
          )}
          {Number(invoice.hamali) > 0 && (
            <div className={styles.totalRow}>
              <span>{invoice.hamaliLabel || 'Hamali / Delivery'}</span>
              <span>{currency(invoice.hamali)}</span>
            </div>
          )}
          <div className={styles.grandTotalRow}>
            <span>Grand Total</span>
            <span>{currency(invoice.grandTotal)}</span>
          </div>
        </div>
      </section>

      {/* 5. Footer with Signature and Thank You */}
      <footer className={styles.invoiceFooter}>
        <span className={styles.thankYou}>Thank you for your business!</span>
        <div className={styles.signBox}>
          <div className={styles.signLine} />
          <span className={styles.signText}>Authorised Signatory</span>
        </div>
      </footer>
    </article>
  );
}
