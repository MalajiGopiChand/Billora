import { useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  Package, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Play
} from 'lucide-react';
import styles from './HeroDashboardPreview.module.css';

interface HeroDashboardPreviewProps {
  onOpenDemo: () => void;
}

export function HeroDashboardPreview({ onOpenDemo }: HeroDashboardPreviewProps) {
  const [activeTab, setActiveTab] = useState<'7 Days' | '30 Days' | '3 Months' | '1 Year'>('7 Days');

  return (
    <div className={styles.wrapper}>
      {/* 4 Floating Contextual Cards */}
      <div className={`${styles.floatingCard} ${styles.floatTopLeft}`}>
        <div className={styles.floatIconCheck}><CheckCircle2 size={16} /></div>
        <div>
          <strong>Invoice created</strong>
          <span>₹3,507 · INV-1043</span>
        </div>
      </div>

      <div className={`${styles.floatingCard} ${styles.floatTopRight}`}>
        <div className={styles.floatIconTrend}><TrendingUp size={16} /></div>
        <div>
          <strong>Sales increased</strong>
          <span>+12.8% vs last week</span>
        </div>
      </div>

      <div className={`${styles.floatingCard} ${styles.floatBottomLeft}`}>
        <div className={styles.floatIconUser}><Users size={16} /></div>
        <div>
          <strong>New customer</strong>
          <span>Rahul Kumar added</span>
        </div>
      </div>

      <div className={`${styles.floatingCard} ${styles.floatBottomRight}`}>
        <div className={styles.floatIconPayment}>💳</div>
        <div>
          <strong>Payment received</strong>
          <span>₹3,507 via UPI</span>
        </div>
      </div>

      {/* Main Browser Mockup Frame */}
      <div className={styles.browserFrame}>
        {/* Browser Top Bar */}
        <div className={styles.browserTopBar}>
          <div className={styles.trafficLights}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <div className={styles.addressBar}>
            <span className={styles.lockIcon}>🔒</span>
            <span className={styles.addressText}>app.billora.in/workspace/dashboard</span>
          </div>
          <div className={styles.demoTriggerBadge} onClick={onOpenDemo}>
            <span className={styles.pulseDot} /> Live Simulation · Click to test
          </div>
        </div>

        {/* Dashboard In-App Header */}
        <div className={styles.appHeader}>
          <div className={styles.storeBranding}>
            <div className={styles.storeLogo}>SL</div>
            <div>
              <h3>Sri Lakshmi General Stores</h3>
              <p>Andhra Pradesh, India · GSTIN: 37AAAAA0000A1Z5</p>
            </div>
          </div>
          <div className={styles.appNavTabs}>
            <span className={styles.navTabActive}>Dashboard</span>
            <span className={styles.navTab} onClick={onOpenDemo}>Create Bill</span>
            <span className={styles.navTab} onClick={onOpenDemo}>Products</span>
            <span className={styles.navTab} onClick={onOpenDemo}>Customers</span>
            <span className={styles.navTab} onClick={onOpenDemo}>Reports</span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className={styles.dashBody}>
          {/* Quick Metrics Bar */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricItem}>
              <div className={styles.metricLabel}>
                <span>Today's Sales</span>
                <span className={styles.greenTag}>+12.8%</span>
              </div>
              <div className={styles.metricValue}>₹24,580</div>
              <div className={styles.metricFooter}>142 bills recorded today</div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricLabel}>
                <span>Total Bills</span>
                <FileText size={14} className={styles.mutedIcon} />
              </div>
              <div className={styles.metricValue}>142</div>
              <div className={styles.metricFooter}>Average bill ₹173</div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricLabel}>
                <span>Customers</span>
                <Users size={14} className={styles.mutedIcon} />
              </div>
              <div className={styles.metricValue}>368</div>
              <div className={styles.metricFooter}>+4 added today</div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricLabel}>
                <span>Products</span>
                <Package size={14} className={styles.mutedIcon} />
              </div>
              <div className={styles.metricValue}>542</div>
              <div className={styles.metricFooter}>In stock & ready to bill</div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricLabel}>
                <span>Outstanding</span>
                <ShieldCheck size={14} className={styles.mutedIcon} />
              </div>
              <div className={`${styles.metricValue} ${styles.outstandingVal}`}>₹18,420</div>
              <div className={styles.metricFooter}>Across 8 khata accounts</div>
            </div>
          </div>

          {/* Graph Section */}
          <div className={styles.graphSection}>
            <div className={styles.graphTopRow}>
              <div>
                <strong>Sales Revenue Trends</strong>
                <p>Track hourly and daily gross volume</p>
              </div>
              <div className={styles.graphPills}>
                {(['7 Days', '30 Days', '3 Months', '1 Year'] as const).map(tab => (
                  <button 
                    key={tab} 
                    className={activeTab === tab ? styles.pillActive : ''}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.barsContainer}>
              <div className={styles.graphColumn}>
                <div className={styles.colBar} style={{ height: activeTab === '7 Days' ? '45%' : '60%' }}>
                  <span className={styles.tooltip}>₹18.4k</span>
                </div>
                <span>Mon</span>
              </div>
              <div className={styles.graphColumn}>
                <div className={styles.colBar} style={{ height: activeTab === '7 Days' ? '55%' : '75%' }}>
                  <span className={styles.tooltip}>₹22.1k</span>
                </div>
                <span>Tue</span>
              </div>
              <div className={styles.graphColumn}>
                <div className={styles.colBar} style={{ height: activeTab === '7 Days' ? '50%' : '65%' }}>
                  <span className={styles.tooltip}>₹20.3k</span>
                </div>
                <span>Wed</span>
              </div>
              <div className={styles.graphColumn}>
                <div className={styles.colBar} style={{ height: activeTab === '7 Days' ? '70%' : '85%' }}>
                  <span className={styles.tooltip}>₹27.8k</span>
                </div>
                <span>Thu</span>
              </div>
              <div className={styles.graphColumn}>
                <div className={styles.colBar} style={{ height: activeTab === '7 Days' ? '62%' : '80%' }}>
                  <span className={styles.tooltip}>₹25.2k</span>
                </div>
                <span>Fri</span>
              </div>
              <div className={styles.graphColumn}>
                <div className={styles.colBar} style={{ height: activeTab === '7 Days' ? '88%' : '94%' }}>
                  <span className={styles.tooltip}>₹34.6k</span>
                </div>
                <span>Sat</span>
              </div>
              <div className={styles.graphColumn}>
                <div className={`${styles.colBar} ${styles.colActive}`} style={{ height: activeTab === '7 Days' ? '68%' : '78%' }}>
                  <span className={styles.tooltip}>₹24.5k</span>
                </div>
                <span className={styles.todayLabel}>Today</span>
              </div>
            </div>
          </div>

          {/* Bottom Tables Split */}
          <div className={styles.bottomSplit}>
            <div className={styles.tableBlock}>
              <div className={styles.tableHeader}>
                <strong>Recent Bills</strong>
                <span onClick={onOpenDemo} className={styles.linkText}>View all 142 bills →</span>
              </div>
              <table className={styles.previewTable}>
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
                    <td><b>INV-1042</b></td>
                    <td>Rahul Kumar</td>
                    <td>₹2,450</td>
                    <td>UPI</td>
                    <td><span className={styles.badgePaid}>Paid</span></td>
                  </tr>
                  <tr>
                    <td><b>INV-1041</b></td>
                    <td>Sri Lakshmi Stores</td>
                    <td>₹5,280</td>
                    <td>Cash</td>
                    <td><span className={styles.badgePaid}>Paid</span></td>
                  </tr>
                  <tr>
                    <td><b>INV-1040</b></td>
                    <td>Anil Traders</td>
                    <td>₹1,850</td>
                    <td>Credit</td>
                    <td><span className={styles.badgePending}>Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.tableBlock}>
              <div className={styles.tableHeader}>
                <strong>Top Products Sold</strong>
                <span onClick={onOpenDemo} className={styles.linkText}>Full Inventory →</span>
              </div>
              <div className={styles.topProdList}>
                <div className={styles.prodItem}>
                  <div>
                    <strong>Rice 25kg Bag</strong>
                    <span>₹1,150 / bag · 64 units</span>
                  </div>
                  <b>₹18,450</b>
                </div>
                <div className={styles.prodItem}>
                  <div>
                    <strong>Cooking Oil 1L</strong>
                    <span>₹180 / pouch · 72 units</span>
                  </div>
                  <b>₹12,840</b>
                </div>
                <div className={styles.prodItem}>
                  <div>
                    <strong>Basmati Rice 5kg</strong>
                    <span>₹1,200 / bag · 28 units</span>
                  </div>
                  <b>₹9,640</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover / Overlay Interactive Prompt */}
        <div className={styles.interactiveOverlay} onClick={onOpenDemo}>
          <button className={styles.playDemoBtn}>
            <Play size={16} fill="currentColor" /> Click to launch interactive demo <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
