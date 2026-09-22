import { useState } from 'react';
import { 
  FileText, 
  Package, 
  Users, 
  CreditCard, 
  BarChart3, 
  Check, 
  Sparkles, 
  ArrowRight,
  Search,
  Plus,
  Printer,
  Smartphone,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import styles from './OneWorkspaceSection.module.css';

type WorkspaceTab = 'invoicing' | 'products' | 'customers' | 'payments' | 'analytics';

export function OneWorkspaceSection() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('invoicing');

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.badge}><Sparkles size={14} /> The All-In-One Solution</span>
        <h2>Everything your shop needs. One workspace.</h2>
        <p>No more jumping between scattered spreadsheets, dusty ledger books, and clunky legacy software.</p>
      </div>

      {/* 5 Interactive Category Tabs */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'invoicing' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('invoicing')}
        >
          <FileText size={18} /> Invoicing
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'products' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={18} /> Products
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'customers' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={18} /> Customers
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'payments' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={18} /> Payments
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={18} /> Analytics
        </button>
      </div>

      {/* Dynamic Module Showcase */}
      <div className={styles.displayCard}>
        {/* INVOICING TAB */}
        {activeTab === 'invoicing' && (
          <div className={styles.moduleGrid}>
            <div className={styles.moduleText}>
              <div className={styles.featurePill}>Fast Counter Billing</div>
              <h3>Create a professional bill in seconds.</h3>
              <p>Type items naturally with keyboard-first navigation. Hit Enter to move through quantities, discounts, and auto GST calculation without touching the mouse.</p>
              <ul className={styles.checkList}>
                <li><Check size={16} /> Instant product auto-fill & saved rate recall</li>
                <li><Check size={16} /> Clean GST & non-GST tax calculations</li>
                <li><Check size={16} /> 1-Click A4 thermal & laser printer support</li>
                <li><Check size={16} /> Send instant PDF copies via WhatsApp</li>
              </ul>
              <div className={styles.shortcutNotice}>
                <span className={styles.kbd}>Enter</span> key jumps fields & adds rows instantly
              </div>
            </div>

            <div className={styles.moduleMockup}>
              <div className={styles.mockupHeader}>
                <strong>New Bill #INV-1043</strong>
                <span className={styles.statusPill}>Live Preview</span>
              </div>
              <div className={styles.mockInvoiceRow}>
                <div><strong>Customer:</strong> Rahul Kumar</div>
                <div><strong>Phone:</strong> 98765 43210</div>
              </div>
              <table className={styles.mockTable}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basmati Rice 5kg</td>
                    <td>2</td>
                    <td>₹1,200</td>
                    <td>₹2,400</td>
                  </tr>
                  <tr>
                    <td>Cooking Oil 1L</td>
                    <td>3</td>
                    <td>₹180</td>
                    <td>₹540</td>
                  </tr>
                  <tr>
                    <td>Refined Sugar 5kg</td>
                    <td>2</td>
                    <td>₹250</td>
                    <td>₹500</td>
                  </tr>
                </tbody>
              </table>
              <div className={styles.mockTotals}>
                <div><span>Subtotal:</span> <strong>₹3,440</strong></div>
                <div><span>Discount:</span> <strong className={styles.greenText}>-₹100</strong></div>
                <div><span>GST (5%):</span> <strong>₹167</strong></div>
                <div className={styles.grandLine}><span>Grand Total:</span> <strong>₹3,507</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className={styles.moduleGrid}>
            <div className={styles.moduleText}>
              <div className={styles.featurePill}>Inventory & Pricing</div>
              <h3>Your products, always organised.</h3>
              <p>Keep your entire catalog at your fingertips. Save prices once, update wholesale or retail rates anytime, and spot low-stock items before shelves go empty.</p>
              <ul className={styles.checkList}>
                <li><Check size={16} /> Fast search across barcodes and item names</li>
                <li><Check size={16} /> Track purchase rate vs selling rate margins</li>
                <li><Check size={16} /> Low-stock alerts and unit classifications</li>
                <li><Check size={16} /> Bulk product import and export</li>
              </ul>
            </div>

            <div className={styles.moduleMockup}>
              <div className={styles.mockupHeader}>
                <strong>Product Inventory</strong>
                <span className={styles.countBadge}>542 Items</span>
              </div>
              <table className={styles.mockTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Rate</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Basmati Rice 5kg</strong></td>
                    <td>Groceries</td>
                    <td>₹1,200</td>
                    <td>48 bags</td>
                    <td><span className={styles.inStockTag}>In Stock</span></td>
                  </tr>
                  <tr>
                    <td><strong>Cooking Oil 1L</strong></td>
                    <td>Edibles</td>
                    <td>₹180</td>
                    <td>92 pouches</td>
                    <td><span className={styles.inStockTag}>In Stock</span></td>
                  </tr>
                  <tr>
                    <td><strong>Refined Sugar 5kg</strong></td>
                    <td>Groceries</td>
                    <td>₹250</td>
                    <td>14 bags</td>
                    <td><span className={styles.lowStockTag}>Low Stock</span></td>
                  </tr>
                  <tr>
                    <td><strong>Wheat Flour 10kg</strong></td>
                    <td>Grains</td>
                    <td>₹450</td>
                    <td>35 bags</td>
                    <td><span className={styles.inStockTag}>In Stock</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className={styles.moduleGrid}>
            <div className={styles.moduleText}>
              <div className={styles.featurePill}>Smart Customer CRM</div>
              <h3>Remember every customer & their ledger.</h3>
              <p>Every time you create an invoice, Billora automatically saves the customer's purchase history, contact details, and outstanding balances.</p>
              <ul className={styles.checkList}>
                <li><Check size={16} /> Automatic customer profiling from invoice history</li>
                <li><Check size={16} /> Track khata balances and pending dues</li>
                <li><Check size={16} /> View lifetime spend and top purchased items</li>
                <li><Check size={16} /> Fast search by phone number or shop name</li>
              </ul>
            </div>

            <div className={styles.moduleMockup}>
              <div className={styles.customerProfileCard}>
                <div className={styles.profileTop}>
                  <div className={styles.avatar}>RK</div>
                  <div>
                    <h4>Rahul Kumar</h4>
                    <span>Regular Retail Customer · +91 98765 43210</span>
                  </div>
                </div>
                <div className={styles.crmStatsGrid}>
                  <div className={styles.crmStat}>
                    <span>Total Purchases</span>
                    <strong>₹48,520</strong>
                  </div>
                  <div className={styles.crmStat}>
                    <span>Total Bills</span>
                    <strong>28</strong>
                  </div>
                  <div className={styles.crmStat}>
                    <span>Avg Order</span>
                    <strong>₹1,733</strong>
                  </div>
                  <div className={styles.crmStat}>
                    <span>Last Purchase</span>
                    <strong>Today</strong>
                  </div>
                </div>
                <div className={styles.crmRecent}>
                  <strong>Recent Purchases:</strong>
                  <div className={styles.crmBillRow}>
                    <span>#INV-1042 · Today</span>
                    <strong>₹2,450 (Paid)</strong>
                  </div>
                  <div className={styles.crmBillRow}>
                    <span>#INV-1028 · 14 Sep 2026</span>
                    <strong>₹4,120 (Paid)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className={styles.moduleGrid}>
            <div className={styles.moduleText}>
              <div className={styles.featurePill}>Cash, UPI & Credit Tracking</div>
              <h3>Know your money in real time.</h3>
              <p>Reconcile cash in counter with UPI QR payments and customer credit books effortlessly. Stop losing track of who owes you money.</p>
              <ul className={styles.checkList}>
                <li><Check size={16} /> Instant UPI, Cash, and Card breakdown</li>
                <li><Check size={16} /> Clear outstanding balance reports</li>
                <li><Check size={16} /> Daily cash collection summary</li>
                <li><Check size={16} /> Zero payment reconciliation headaches</li>
              </ul>
            </div>

            <div className={styles.moduleMockup}>
              <div className={styles.paymentsSummary}>
                <div className={styles.paymentCard}>
                  <div className={styles.payIcon}><Smartphone size={18} /></div>
                  <div>
                    <span>UPI Received</span>
                    <strong>₹16,420</strong>
                    <small>68% of total volume</small>
                  </div>
                </div>
                <div className={styles.paymentCard}>
                  <div className={styles.payIcon}><CreditCard size={18} /></div>
                  <div>
                    <span>Cash Collected</span>
                    <strong>₹8,160</strong>
                    <small>32% in counter drawer</small>
                  </div>
                </div>
                <div className={`${styles.paymentCard} ${styles.outstandingCard}`}>
                  <div className={styles.payIcon}><ShieldCheck size={18} /></div>
                  <div>
                    <span>Pending Outstanding</span>
                    <strong>₹18,420</strong>
                    <small>8 active credit accounts</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className={styles.moduleGrid}>
            <div className={styles.moduleText}>
              <div className={styles.featurePill}>Business Insights</div>
              <h3>Stop guessing. Start understanding.</h3>
              <p>Visual dashboards tell you which days are busiest, what products make the most profit, and how your store is growing month over month.</p>
              <ul className={styles.checkList}>
                <li><Check size={16} /> Real-time sales graph with 7d, 30d, 1y views</li>
                <li><Check size={16} /> Top-selling products by volume and revenue</li>
                <li><Check size={16} /> Daily turnover and average ticket size</li>
                <li><Check size={16} /> Tax and GST liability estimates</li>
              </ul>
            </div>

            <div className={styles.moduleMockup}>
              <div className={styles.analyticsPreview}>
                <div className={styles.analyticsStats}>
                  <div>
                    <span>Today's Sales</span>
                    <strong>₹24,580</strong>
                  </div>
                  <div>
                    <span>This Month</span>
                    <strong>₹1,84,500</strong>
                  </div>
                  <div>
                    <span>Average Ticket</span>
                    <strong>₹1,296</strong>
                  </div>
                </div>
                <div className={styles.miniChart}>
                  <div className={styles.chartBar} style={{ height: '50%' }}><small>Mon</small></div>
                  <div className={styles.chartBar} style={{ height: '70%' }}><small>Tue</small></div>
                  <div className={styles.chartBar} style={{ height: '60%' }}><small>Wed</small></div>
                  <div className={styles.chartBar} style={{ height: '85%' }}><small>Thu</small></div>
                  <div className={styles.chartBar} style={{ height: '75%' }}><small>Fri</small></div>
                  <div className={styles.chartBar} style={{ height: '95%' }}><small>Sat</small></div>
                  <div className={`${styles.chartBar} ${styles.barHighlight}`} style={{ height: '80%' }}><small>Sun</small></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
