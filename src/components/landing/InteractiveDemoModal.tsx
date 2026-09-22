import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  FileText, 
  Package, 
  Users, 
  Plus, 
  ArrowRight, 
  Printer, 
  Download, 
  Share2, 
  RotateCcw, 
  X, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  CreditCard,
  Banknote,
  Search
} from 'lucide-react';
import styles from './InteractiveDemoModal.module.css';

interface InteractiveDemoProps {
  onClose?: () => void;
  isEmbedded?: boolean;
}

export function InteractiveDemoModal({ onClose, isEmbedded = false }: InteractiveDemoProps) {
  // Demo step: 1 (Dashboard), 2 (Create Bill), 3 (Invoice Preview), 4 (Payment Success), 5 (Updated Dashboard)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [graphPeriod, setGraphPeriod] = useState<'7 Days' | '30 Days' | '3 Months' | '1 Year'>('7 Days');

  // Animated counter for step 5
  const [salesDisplay, setSalesDisplay] = useState(24580);
  const [billsDisplay, setBillsDisplay] = useState(142);

  useEffect(() => {
    if (step === 5) {
      // Smooth counter transition from 24580 to 28087
      const targetSales = 28087;
      const targetBills = 143;
      const startSales = 24580;
      const duration = 1200;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setSalesDisplay(Math.round(startSales + (targetSales - startSales) * ease));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setBillsDisplay(targetBills);
        }
      };
      requestAnimationFrame(animate);
    } else {
      setSalesDisplay(24580);
      setBillsDisplay(142);
    }
  }, [step]);

  const resetDemo = () => {
    setStep(1);
    setPaymentMode('UPI');
    setSalesDisplay(24580);
    setBillsDisplay(142);
  };

  return (
    <div className={isEmbedded ? styles.embeddedContainer : styles.modalOverlay}>
      <div className={styles.modalWindow}>
        {/* Demo Mode Top Banner */}
        <div className={styles.demoBanner}>
          <div className={styles.bannerInfo}>
            <span className={styles.badge}><Sparkles size={13} /> Interactive Product Demo</span>
            <p>You're viewing a live Billora demo. Data shown here is for demonstration purposes.</p>
          </div>
          <div className={styles.bannerActions}>
            <button onClick={resetDemo} className={styles.resetBtn} title="Reset demo to initial step">
              <RotateCcw size={14} /> Reset Demo
            </button>
            {onClose && (
              <button onClick={onClose} className={styles.closeBtn} title="Exit demo">
                <X size={16} /> Exit Demo
              </button>
            )}
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className={styles.stepIndicatorBar}>
          <div className={`${styles.stepPill} ${step === 1 ? styles.activeStep : step > 1 ? styles.completedStep : ''}`}>
            <span>1</span> Dashboard
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepPill} ${step === 2 ? styles.activeStep : step > 2 ? styles.completedStep : ''}`}>
            <span>2</span> Create Bill
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepPill} ${step === 3 ? styles.activeStep : step > 3 ? styles.completedStep : ''}`}>
            <span>3</span> Invoice Preview
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepPill} ${step === 4 ? styles.activeStep : step > 4 ? styles.completedStep : ''}`}>
            <span>4</span> Payment
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepPill} ${step === 5 ? styles.activeStep : ''}`}>
            <span>5</span> Live Results
          </div>
        </div>

        {/* Body content based on step */}
        <div className={styles.contentArea}>
          {/* STEP 1: INITIAL DASHBOARD */}
          {step === 1 && (
            <div className={styles.dashboardView}>
              <div className={styles.dashHeader}>
                <div>
                  <h2>Good afternoon, Sri Lakshmi Stores</h2>
                  <p className={styles.subtitle}>Here is what's happening with your business today.</p>
                </div>
                <button onClick={() => setStep(2)} className={styles.primaryActionBtn}>
                  <Plus size={16} /> Create New Bill <ArrowRight size={15} />
                </button>
              </div>

              {/* KPI Grid */}
              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span>Today's Sales</span>
                    <TrendingUp size={16} className={styles.trendIcon} />
                  </div>
                  <div className={styles.kpiVal}>₹24,580</div>
                  <div className={styles.kpiBadge}>+12.8% from yesterday</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span>Total Bills</span>
                    <FileText size={16} />
                  </div>
                  <div className={styles.kpiVal}>142</div>
                  <div className={styles.kpiMuted}>Today's count</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span>Customers</span>
                    <Users size={16} />
                  </div>
                  <div className={styles.kpiVal}>368</div>
                  <div className={styles.kpiMuted}>Active profiles</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span>Products</span>
                    <Package size={16} />
                  </div>
                  <div className={styles.kpiVal}>542</div>
                  <div className={styles.kpiMuted}>Catalog items</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span>Outstanding</span>
                    <ShieldCheck size={16} />
                  </div>
                  <div className={`${styles.kpiVal} ${styles.outstanding}`}>₹18,420</div>
                  <div className={styles.kpiMuted}>Pending dues</div>
                </div>
              </div>

              {/* Sales Graph Preview */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3>Sales Overview</h3>
                    <p>Real-time revenue performance</p>
                  </div>
                  <div className={styles.chartTabs}>
                    {(['7 Days', '30 Days', '3 Months', '1 Year'] as const).map(tab => (
                      <button 
                        key={tab} 
                        className={graphPeriod === tab ? styles.tabSelected : ''}
                        onClick={() => setGraphPeriod(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.mockGraph}>
                  <div className={styles.barGroup}>
                    <div className={styles.bar} style={{ height: '45%' }}><span>₹18.2k</span></div>
                    <label>Mon</label>
                  </div>
                  <div className={styles.barGroup}>
                    <div className={styles.bar} style={{ height: '60%' }}><span>₹21.5k</span></div>
                    <label>Tue</label>
                  </div>
                  <div className={styles.barGroup}>
                    <div className={styles.bar} style={{ height: '52%' }}><span>₹19.4k</span></div>
                    <label>Wed</label>
                  </div>
                  <div className={styles.barGroup}>
                    <div className={styles.bar} style={{ height: '78%' }}><span>₹26.1k</span></div>
                    <label>Thu</label>
                  </div>
                  <div className={styles.barGroup}>
                    <div className={styles.bar} style={{ height: '65%' }}><span>₹22.8k</span></div>
                    <label>Fri</label>
                  </div>
                  <div className={styles.barGroup}>
                    <div className={styles.bar} style={{ height: '88%' }}><span>₹31.4k</span></div>
                    <label>Sat</label>
                  </div>
                  <div className={styles.barGroup}>
                    <div className={`${styles.bar} ${styles.barHighlight}`} style={{ height: '70%' }}><span>₹24.5k</span></div>
                    <label>Today</label>
                  </div>
                </div>
              </div>

              {/* Tables Split */}
              <div className={styles.splitTables}>
                <div className={styles.tableCard}>
                  <h3>Recent Invoices</h3>
                  <table className={styles.miniTable}>
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>INV-1042</strong></td>
                        <td>Rahul Kumar</td>
                        <td>₹2,450</td>
                        <td>UPI</td>
                        <td><span className={styles.paidBadge}>Paid</span></td>
                      </tr>
                      <tr>
                        <td><strong>INV-1041</strong></td>
                        <td>Sri Lakshmi Stores</td>
                        <td>₹5,280</td>
                        <td>Cash</td>
                        <td><span className={styles.paidBadge}>Paid</span></td>
                      </tr>
                      <tr>
                        <td><strong>INV-1040</strong></td>
                        <td>Anil Traders</td>
                        <td>₹1,850</td>
                        <td>Credit</td>
                        <td><span className={styles.pendingBadge}>Pending</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className={styles.tableCard}>
                  <h3>Top Products</h3>
                  <div className={styles.productList}>
                    <div className={styles.productRow}>
                      <div className={styles.productInfo}>
                        <strong>Rice 25kg Bag</strong>
                        <span>Groceries · 64 bags sold</span>
                      </div>
                      <div className={styles.productRevenue}>₹18,450</div>
                    </div>
                    <div className={styles.productRow}>
                      <div className={styles.productInfo}>
                        <strong>Cooking Oil 1L</strong>
                        <span>Edibles · 72 pouches sold</span>
                      </div>
                      <div className={styles.productRevenue}>₹12,840</div>
                    </div>
                    <div className={styles.productRow}>
                      <div className={styles.productInfo}>
                        <strong>Basmati Rice 5kg</strong>
                        <span>Premium · 28 bags sold</span>
                      </div>
                      <div className={styles.productRevenue}>₹9,640</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.demoCallout}>
                <p>👉 Ready to see how fast billing is? Click <strong>Create New Bill</strong> above to test the interactive billing flow.</p>
              </div>
            </div>
          )}

          {/* STEP 2: CREATE BILL */}
          {step === 2 && (
            <div className={styles.createBillView}>
              <div className={styles.billFormHeader}>
                <div>
                  <h2>Create New Invoice #INV-1043</h2>
                  <p>Fast keyboard-first entry. Enter key jumps to the next item line.</p>
                </div>
                <div className={styles.btnGroup}>
                  <button onClick={() => setStep(1)} className={styles.secondaryBtn}>Back</button>
                  <button onClick={() => setStep(3)} className={styles.primaryActionBtn}>
                    Generate Invoice <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Customer search block */}
              <div className={styles.customerBox}>
                <div className={styles.fieldGroup}>
                  <label>Customer Name</label>
                  <div className={styles.inputWithIcon}>
                    <Search size={16} />
                    <input type="text" readOnly value="Rahul Kumar" />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Phone Number</label>
                  <input type="text" readOnly value="+91 98765 43210" />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Invoice Date</label>
                  <input type="text" readOnly value="22 Sep 2026" />
                </div>
              </div>

              {/* Items Table */}
              <div className={styles.invoiceItemsCard}>
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Product Description</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Basmati Rice 5kg</strong>
                        <span className={styles.subtext}>SKU: BAS-005 · Groceries</span>
                      </td>
                      <td>2</td>
                      <td>₹1,200</td>
                      <td><strong>₹2,400</strong></td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Cooking Oil 1L</strong>
                        <span className={styles.subtext}>SKU: OIL-001 · Edibles</span>
                      </td>
                      <td>3</td>
                      <td>₹180</td>
                      <td><strong>₹540</strong></td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Sugar 5kg</strong>
                        <span className={styles.subtext}>SKU: SUG-005 · Groceries</span>
                      </td>
                      <td>2</td>
                      <td>₹250</td>
                      <td><strong>₹500</strong></td>
                    </tr>
                  </tbody>
                </table>

                {/* Calculation & Payment section */}
                <div className={styles.billFooterRow}>
                  <div className={styles.paymentSelector}>
                    <label>Select Payment Method:</label>
                    <div className={styles.paymentOptions}>
                      <button 
                        type="button"
                        className={`${styles.payOption} ${paymentMode === 'UPI' ? styles.payActive : ''}`}
                        onClick={() => setPaymentMode('UPI')}
                      >
                        <Smartphone size={16} /> UPI
                      </button>
                      <button 
                        type="button"
                        className={`${styles.payOption} ${paymentMode === 'Cash' ? styles.payActive : ''}`}
                        onClick={() => setPaymentMode('Cash')}
                      >
                        <Banknote size={16} /> Cash
                      </button>
                      <button 
                        type="button"
                        className={`${styles.payOption} ${paymentMode === 'Card' ? styles.payActive : ''}`}
                        onClick={() => setPaymentMode('Card')}
                      >
                        <CreditCard size={16} /> Card
                      </button>
                    </div>
                  </div>

                  <div className={styles.totalsSummary}>
                    <div className={styles.summaryLine}>
                      <span>Subtotal:</span>
                      <strong>₹3,440</strong>
                    </div>
                    <div className={styles.summaryLine}>
                      <span>Discount:</span>
                      <span className={styles.discountText}>-₹100</span>
                    </div>
                    <div className={styles.summaryLine}>
                      <span>GST (5%):</span>
                      <span>+₹167</span>
                    </div>
                    <div className={`${styles.summaryLine} ${styles.grandTotalLine}`}>
                      <span>Grand Total:</span>
                      <strong>₹3,507</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formFooterActions}>
                <button onClick={() => setStep(3)} className={styles.primaryActionBtnWide}>
                  Generate Invoice #INV-1043 (₹3,507) <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REALISTIC A4 INVOICE PREVIEW */}
          {step === 3 && (
            <div className={styles.previewView}>
              <div className={styles.previewToolbar}>
                <div>
                  <h2>Invoice Preview #INV-1043</h2>
                  <p>Standard A4 tax invoice ready for printing or instant PDF download.</p>
                </div>
                <div className={styles.btnGroup}>
                  <button className={styles.iconBtn} title="Download PDF"><Download size={15} /> PDF</button>
                  <button className={styles.iconBtn} title="Print"><Printer size={15} /> Print</button>
                  <button className={styles.iconBtn} title="Share"><Share2 size={15} /> WhatsApp</button>
                  <button onClick={() => setStep(4)} className={styles.primaryActionBtn}>
                    Confirm & Record Payment <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Realistic A4 Document Box */}
              <div className={styles.a4Page}>
                <div className={styles.invoiceHeader}>
                  <div>
                    <h1 className={styles.shopTitle}>SRI LAKSHMI GENERAL STORES</h1>
                    <p className={styles.shopSub}>Wholesale & Retail Groceries</p>
                    <p>Main Bazar, Guntur, Andhra Pradesh - 522001</p>
                    <p>Phone: +91 97055 27264 · GSTIN: 37AAAAA0000A1Z5</p>
                  </div>
                  <div className={styles.invoiceMeta}>
                    <div className={styles.taxBadge}>TAX INVOICE</div>
                    <p><strong>Invoice No:</strong> INV-1043</p>
                    <p><strong>Date:</strong> 22 Sep 2026</p>
                    <p><strong>Payment:</strong> {paymentMode} (Received)</p>
                  </div>
                </div>

                <div className={styles.billToBox}>
                  <strong>Billed To:</strong>
                  <p><strong>Rahul Kumar</strong></p>
                  <p>Phone: +91 98765 43210</p>
                  <p>Address: Station Road, Guntur, AP</p>
                </div>

                <table className={styles.a4Table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Description</th>
                      <th>Qty</th>
                      <th>Rate (₹)</th>
                      <th>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Basmati Rice 5kg Bag</td>
                      <td>2</td>
                      <td>1,200.00</td>
                      <td>2,400.00</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Cooking Oil 1L Pouch</td>
                      <td>3</td>
                      <td>180.00</td>
                      <td>540.00</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Refined Sugar 5kg Bag</td>
                      <td>2</td>
                      <td>250.00</td>
                      <td>500.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className={styles.a4Totals}>
                  <div className={styles.a4Notes}>
                    <p><strong>Terms & Conditions:</strong></p>
                    <p>1. Goods once sold will not be returned without bill.</p>
                    <p>2. Thank you for shopping with Sri Lakshmi Stores!</p>
                  </div>
                  <div className={styles.a4Summary}>
                    <p><span>Subtotal:</span> <strong>₹3,440.00</strong></p>
                    <p><span>Discount:</span> <strong>-₹100.00</strong></p>
                    <p><span>GST (5%):</span> <strong>₹167.00</strong></p>
                    <div className={styles.a4Grand}>
                      <span>Grand Total:</span>
                      <strong>₹3,507.00</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.a4Footer}>
                  <p>Computer Generated Tax Invoice · Powered by Billora</p>
                  <p>Authorised Signatory</p>
                </div>
              </div>

              <div className={styles.formFooterActions}>
                <button onClick={() => setStep(4)} className={styles.primaryActionBtnWide}>
                  Mark as Paid & Record to Dashboard →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT SUCCESS */}
          {step === 4 && (
            <div className={styles.successView}>
              <div className={styles.successCard}>
                <div className={styles.successIconWrapper}>
                  <CheckCircle2 size={64} className={styles.successCheck} />
                </div>
                <h2>Payment Recorded Successfully!</h2>
                <div className={styles.successAmount}>₹3,507</div>
                <div className={styles.successDetails}>
                  <div className={styles.successLine}>
                    <span>Invoice:</span>
                    <strong>INV-1043</strong>
                  </div>
                  <div className={styles.successLine}>
                    <span>Customer:</span>
                    <strong>Rahul Kumar</strong>
                  </div>
                  <div className={styles.successLine}>
                    <span>Payment Method:</span>
                    <strong>{paymentMode}</strong>
                  </div>
                  <div className={styles.successLine}>
                    <span>Date & Time:</span>
                    <strong>22 Sep 2026, 04:30 PM</strong>
                  </div>
                </div>

                <p className={styles.successNote}>
                  Invoice saved. Customer records updated and daily sales recalculating now.
                </p>

                <button onClick={() => setStep(5)} className={styles.primaryActionBtnWide}>
                  View Updated Dashboard <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: UPDATED DASHBOARD */}
          {step === 5 && (
            <div className={styles.dashboardView}>
              <div className={styles.updatedAlert}>
                <div className={styles.updatedIcon}><CheckCircle2 size={20} /></div>
                <div>
                  <strong>Live Update Complete!</strong>
                  <p>Invoice #INV-1043 (₹3,507) has been added to Sri Lakshmi Stores. Today's sales and bill count updated automatically.</p>
                </div>
                <button onClick={resetDemo} className={styles.outlineBtn}>
                  <RotateCcw size={14} /> Try Again
                </button>
              </div>

              <div className={styles.dashHeader}>
                <div>
                  <h2>Good afternoon, Sri Lakshmi Stores</h2>
                  <p className={styles.subtitle}>Here is your real-time updated business snapshot.</p>
                </div>
                <button onClick={() => setStep(2)} className={styles.primaryActionBtn}>
                  <Plus size={16} /> Create Another Bill
                </button>
              </div>

              {/* KPI Grid with animated values */}
              <div className={styles.kpiGrid}>
                <div className={`${styles.kpiCard} ${styles.cardUpdated}`}>
                  <div className={styles.kpiTop}>
                    <span>Today's Sales</span>
                    <span className={styles.flashBadge}>UPDATED</span>
                  </div>
                  <div className={styles.kpiValHighlight}>₹{salesDisplay.toLocaleString('en-IN')}</div>
                  <div className={styles.kpiBadge}>+₹3,507 new bill recorded</div>
                </div>

                <div className={`${styles.kpiCard} ${styles.cardUpdated}`}>
                  <div className={styles.kpiTop}>
                    <span>Total Bills</span>
                    <span className={styles.flashBadge}>+1</span>
                  </div>
                  <div className={styles.kpiValHighlight}>{billsDisplay}</div>
                  <div className={styles.kpiMuted}>From 142 previously</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span>Customers</span>
                    <Users size={16} />
                  </div>
                  <div className={styles.kpiVal}>368</div>
                  <div className={styles.kpiMuted}>Active profiles</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span>Products</span>
                    <Package size={16} />
                  </div>
                  <div className={styles.kpiVal}>542</div>
                  <div className={styles.kpiMuted}>Catalog items</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <span>Outstanding</span>
                    <ShieldCheck size={16} />
                  </div>
                  <div className={`${styles.kpiVal} ${styles.outstanding}`}>₹18,420</div>
                  <div className={styles.kpiMuted}>Pending dues</div>
                </div>
              </div>

              {/* Recent Bills with NEW record highlighted */}
              <div className={styles.splitTables}>
                <div className={`${styles.tableCard} ${styles.fullWidth}`}>
                  <div className={styles.tableTitleRow}>
                    <h3>Recent Invoices (Live Feed)</h3>
                    <span className={styles.livePulse}>● Live Data Feed</span>
                  </div>
                  <table className={styles.miniTable}>
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={styles.newRowHighlight}>
                        <td>
                          <strong>INV-1043</strong>
                          <span className={styles.newBadge}>NEW</span>
                        </td>
                        <td><strong>Rahul Kumar</strong></td>
                        <td><strong>₹3,507</strong></td>
                        <td>{paymentMode}</td>
                        <td><span className={styles.paidBadge}>Paid Just Now</span></td>
                      </tr>
                      <tr>
                        <td><strong>INV-1042</strong></td>
                        <td>Rahul Kumar</td>
                        <td>₹2,450</td>
                        <td>UPI</td>
                        <td><span className={styles.paidBadge}>Paid</span></td>
                      </tr>
                      <tr>
                        <td><strong>INV-1041</strong></td>
                        <td>Sri Lakshmi Stores</td>
                        <td>₹5,280</td>
                        <td>Cash</td>
                        <td><span className={styles.paidBadge}>Paid</span></td>
                      </tr>
                      <tr>
                        <td><strong>INV-1040</strong></td>
                        <td>Anil Traders</td>
                        <td>₹1,850</td>
                        <td>Credit</td>
                        <td><span className={styles.pendingBadge}>Pending</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* End of Demo CTA Banner */}
              <div className={styles.finishCtaBanner}>
                <div>
                  <h3>Experience this speed in your own shop</h3>
                  <p>Billora makes everyday billing smooth, accurate, and completely effortless.</p>
                </div>
                <div className={styles.btnGroup}>
                  <button onClick={resetDemo} className={styles.secondaryBtn}>
                    <RotateCcw size={15} /> Restart Demo
                  </button>
                  <a href="/register" className={styles.ctaPrimary}>
                    Create Your Workspace →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
