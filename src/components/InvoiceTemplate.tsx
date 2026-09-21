import type { CompanySettings, InvoiceDraft } from '../types';
import { currency, numberValue } from '../lib/money';
import styles from './InvoiceTemplate.module.css';

export function InvoiceTemplate({ invoice, company }: { invoice: InvoiceDraft; company: CompanySettings | null }) {
  const visibleItems = invoice.items.filter((item) => item.description || item.qty || item.rate);
  return <article id="printable-invoice" className={styles.invoice}>
    <header className={styles.header}>
      <div><h1>{company?.companyName || 'Your Shop Name'}</h1><p>{company?.address || 'Shop address'}{company?.phone ? `\n${company.phone}` : ''}</p></div>
      <div className={styles.invoiceTitle}><strong>TAX INVOICE</strong><span>Invoice No. {invoice.invoiceNo || 'Draft'}</span><span>{invoice.date}</span></div>
    </header>
    <section className={styles.meta}><div><b>Bill To</b><strong>{invoice.shopName || 'Walk-in Customer'}</strong><span>{invoice.phone}</span><span>{invoice.address}</span></div><div><b>Transport Details</b><span>GB Slip No: {invoice.gbSlipNo || '-'}</span><span>LR No: {invoice.lrNo || '-'}</span><span>Transport: {invoice.transport || '-'}</span><span>Total Boxes: {invoice.globalBoxes || '-'}</span></div></section>
    <table><thead><tr><th>#</th><th>Description</th><th>Box</th><th>Qty</th><th>Rate</th><th>Disc %</th><th>Gross</th><th>Amount</th></tr></thead><tbody>{visibleItems.map((item, index) => <tr key={index}><td>{index + 1}</td><td>{item.description}</td><td>{item.box}</td><td>{item.qty}</td><td>{currency(item.rate)}</td><td>{item.discount || 0}</td><td>{currency(item.gross)}</td><td>{currency(item.amount)}</td></tr>)}{visibleItems.length === 0 && <tr><td colSpan={8}>No items added</td></tr>}</tbody></table>
    <section className={styles.bottom}><div className={styles.terms}><b>Terms and Conditions</b><p>{invoice.terms || company?.terms || 'Payment due as agreed.'}</p></div><div className={styles.total}><p><span>Item Total</span><b>{currency(visibleItems.reduce((sum, item) => sum + item.amount, 0))}</b></p><p><span>Tax</span><b>{currency(invoice.tax)}</b></p><p><span>{invoice.hamaliLabel || 'Hamali'}</span><b>{currency(invoice.hamali)}</b></p><p className={styles.grand}><span>Grand Total</span><b>{currency(invoice.grandTotal)}</b></p></div></section>
    <footer><span>Thank you for your business.</span><span>Authorised Signature</span></footer>
  </article>;
}
