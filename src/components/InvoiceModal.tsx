import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Printer, X, FileText } from 'lucide-react';
import type { CompanySettings, InvoiceDraft } from '../types';
import { InvoiceTemplate } from './InvoiceTemplate';
import styles from './InvoiceModal.module.css';

interface InvoiceModalProps {
  invoice: InvoiceDraft;
  company: CompanySettings | null;
  onClose: () => void;
  autoPrint?: boolean;
}

export function InvoiceModal({ invoice, company, onClose, autoPrint = false }: InvoiceModalProps) {
  const [busy, setBusy] = useState(false);
  const [paperSize, setPaperSize] = useState<'a4' | 'a5'>('a4');
  const printContentRef = useRef<HTMLDivElement>(null);

  // Mark body so print media query knows invoice modal is open
  useEffect(() => {
    document.body.classList.add('invoice-modal-active');

    // Close modal on Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('invoice-modal-active');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  // Trigger quick print if opened with autoPrint
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

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

  const modalNode = (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Dynamic @page sizing for A4 or A5 */}
      <style>{`
        @media print {
          @page {
            size: ${paperSize === 'a5' ? '148mm 210mm' : '210mm 297mm'};
            margin: ${paperSize === 'a5' ? '4mm' : '6mm'};
          }
        }
      `}</style>

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

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}

