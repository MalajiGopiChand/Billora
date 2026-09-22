import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Printer, X, FileText, Check } from 'lucide-react';
import type { CompanySettings, InvoiceDraft } from '../types';
import { InvoiceTemplate } from './InvoiceTemplate';
import styles from './InvoiceModal.module.css';

interface InvoiceModalProps {
  invoice: InvoiceDraft;
  company: CompanySettings | null;
  onClose: () => void;
}

export function InvoiceModal({ invoice, company, onClose }: InvoiceModalProps) {
  const [busy, setBusy] = useState(false);
  const [paperSize, setPaperSize] = useState<'a4' | 'a5'>('a4');
  const printContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const downloadPdf = async () => {
    if (!printContentRef.current) return;
    setBusy(true);

    try {
      // High-resolution capture at 2x scale
      const canvas = await html2canvas(printContentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: paperSize === 'a5' ? 620 : 860,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', paperSize);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice.invoiceNo || 'Draft'}-${paperSize.toUpperCase()}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {/* Top Header Actions (Excluded in Print) */}
        <div className={`${styles.actions} no-print`}>
          <div className={styles.titleArea}>
            <h2>Invoice #{invoice.invoiceNo || 'Draft'}</h2>
            <p>Select paper size, then print or download PDF</p>
          </div>

          <div className={styles.controlsGroup}>
            {/* Paper Size Switcher */}
            <div className={styles.paperToggle}>
              <button
                type="button"
                className={`${styles.paperBtn} ${paperSize === 'a4' ? styles.paperBtnActive : ''}`}
                onClick={() => setPaperSize('a4')}
              >
                <FileText size={14} /> A4 Sheet
              </button>
              <button
                type="button"
                className={`${styles.paperBtn} ${paperSize === 'a5' ? styles.paperBtnActive : ''}`}
                onClick={() => setPaperSize('a5')}
              >
                <FileText size={14} /> A5 Compact
              </button>
            </div>

            {/* Action Buttons */}
            <div className={styles.btnGroup}>
              <button type="button" className={styles.printBtn} onClick={handlePrint}>
                <Printer size={16} /> Print
              </button>
              <button
                type="button"
                className={styles.pdfBtn}
                onClick={downloadPdf}
                disabled={busy}
              >
                <Download size={16} /> {busy ? 'Exporting...' : 'Download PDF'}
              </button>
              <button
                type="button"
                aria-label="Close invoice preview"
                className={styles.closeBtn}
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Preview Viewport */}
        <div className={styles.previewContainer}>
          <div ref={printContentRef}>
            <InvoiceTemplate invoice={invoice} company={company} paperSize={paperSize} />
          </div>
        </div>
      </div>
    </div>
  );
}
