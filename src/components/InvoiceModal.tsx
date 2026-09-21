import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Printer, X } from 'lucide-react';
import type { CompanySettings, InvoiceDraft } from '../types';
import { InvoiceTemplate } from './InvoiceTemplate';
import styles from './InvoiceModal.module.css';

export function InvoiceModal({ invoice, company, onClose }: { invoice: InvoiceDraft; company: CompanySettings | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const downloadPdf = async () => {
    if (!ref.current) return;
    setBusy(true);
    const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: '#ffffff' });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(img, 'PNG', 0, 0, 210, 297);
    pdf.save(`invoice-${invoice.invoiceNo || 'draft'}.pdf`);
    setBusy(false);
  };
  return <div className={styles.backdrop} role="dialog" aria-modal="true"><div className={styles.modal}><div className={`${styles.actions} no-print`}><h2>Invoice Preview</h2><div><button onClick={() => window.print()}><Printer size={17} />Print</button><button onClick={downloadPdf} disabled={busy}><Download size={17} />{busy ? 'Preparing...' : 'Download PDF'}</button><button aria-label="Close preview" className={styles.iconButton} onClick={onClose}><X size={20} /></button></div></div><div ref={ref}><InvoiceTemplate invoice={invoice} company={company} /></div></div></div>;
}
