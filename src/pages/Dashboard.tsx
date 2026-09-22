import { useEffect, useMemo, useState } from 'react';
import { format, startOfMonth, startOfToday, subDays } from 'date-fns';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { 
  FileText, 
  IndianRupee, 
  Package, 
  Users, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  ShoppingBag, 
  Sparkles, 
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number';
import { listCustomers, listInvoices, listProducts } from '../lib/firestore';
import { currency } from '../lib/money';
import type { Invoice } from '../types';
import styles from './Dashboard.module.css';

const periods = ['7 Days', '30 Days', 'Year'] as const;
const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export function Dashboard() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [counts, setCounts] = useState({ customers: 0, products: 0 });
  const [period, setPeriod] = useState<(typeof periods)[number]>('7 Days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      listInvoices(user.uid),
      listCustomers(user.uid),
      listProducts(user.uid)
    ])
      .then(([bills, customers, products]) => {
        setInvoices(bills);
        setCounts({ customers: customers.length, products: products.length });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const now = startOfToday();
  const today = format(now, 'yyyy-MM-dd');
  const month = startOfMonth(now);

  const kpis = useMemo(() => ({
    today: invoices.filter((i) => i.date === today).reduce((sum, i) => sum + i.grandTotal, 0),
    month: invoices.filter((i) => new Date(`${i.date}T00:00:00`) >= month).reduce((sum, i) => sum + i.grandTotal, 0),
    turnover: invoices.reduce((sum, i) => sum + i.grandTotal, 0),
  }), [invoices, today, month]);

  const trend = useMemo(() => {
    const days = period === '7 Days' ? 7 : period === '30 Days' ? 30 : 365;
    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      map.set(format(subDays(now, i), period === 'Year' ? 'MMM yy' : 'dd MMM'), 0);
    }
    invoices.forEach((bill) => {
      const d = new Date(`${bill.date}T00:00:00`);
      if (d >= subDays(now, days - 1)) {
        const key = format(d, period === 'Year' ? 'MMM yy' : 'dd MMM');
        map.set(key, (map.get(key) || 0) + bill.grandTotal);
      }
    });
    return [...map].map(([date, sales]) => ({ date, sales }));
  }, [invoices, now, period]);

  const topProducts = useMemo(() => {
    const tally = new Map<string, number>();
    invoices.forEach((bill) =>
      bill.items.forEach((item) =>
        tally.set(
          item.description || 'General Item',
          (tally.get(item.description || 'General Item') || 0) + item.amount
        )
      )
    );
    return [...tally]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return invoices.slice(0, 5);
  }, [invoices]);

  if (loading) return <div className="page-loader">Loading shop dashboard...</div>;

  const kpiCards = [
    {
      label: "Today's Sales",
      value: kpis.today,
      icon: IndianRupee,
      isCurrency: true,
      color: '#4f46e5',
      bg: '#eef2ff',
    },
    {
      label: "This Month",
      value: kpis.month,
      icon: TrendingUp,
      isCurrency: true,
      color: '#06b6d4',
      bg: '#ecfeff',
    },
    {
      label: 'Total Turnover',
      value: kpis.turnover,
      icon: IndianRupee,
      isCurrency: true,
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      label: 'Total Invoices',
      value: invoices.length,
      icon: FileText,
      isCurrency: false,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      label: 'Registered Customers',
      value: counts.customers,
      icon: Users,
      isCurrency: false,
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    {
      label: 'Products Catalog',
      value: counts.products,
      icon: Package,
      isCurrency: false,
      color: '#ec4899',
      bg: '#fdf2f8',
    },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      {/* 1. Welcome & Quick Action Header */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <h2>Shop Command Center</h2>
          <p>Real-time metrics, counter speed, and daily revenue snapshot.</p>
        </div>
        <div className={styles.quickActions}>
          <Link to="/create-bill" className={`${styles.actionChip} ${styles.actionChipPrimary}`}>
            <Plus size={15} /> Create Bill
          </Link>
          <Link to="/products" className={styles.actionChip}>
            <Package size={15} /> Add Product
          </Link>
          <Link to="/customers" className={styles.actionChip}>
            <Users size={15} /> Add Customer
          </Link>
          <Link to="/all-bills" className={styles.actionChip}>
            <FileText size={15} /> All Bills
          </Link>
        </div>
      </section>

      {/* 2. 6 KPI Cards */}
      <section className={styles.kpisGrid}>
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className={styles.kpiCard} key={card.label}>
              <div className={styles.kpiHeader}>
                <p className={styles.kpiLabel}>{card.label}</p>
                <div className={styles.kpiIcon} style={{ background: card.bg, color: card.color }}>
                  <Icon size={19} />
                </div>
              </div>
              <div className={styles.kpiValue}>
                {card.isCurrency && '₹'}
                <SlidingNumber number={card.value} fromNumber={0} thousandSeparator="," />
              </div>
            </article>
          );
        })}
      </section>

      {/* 3. Analytics Charts Grid */}
      <section className={styles.chartsGrid}>
        {/* Sales Trend Area Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <h3>Sales Revenue Trend</h3>
              <p>Invoiced revenue over time</p>
            </div>
            <div className={styles.periodPills}>
              {periods.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`${styles.periodBtn} ${period === item ? styles.periodBtnActive : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tickFormatter={(v) => `₹${v}`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(v) => [currency(Number(v)), 'Sales']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Pie/Donut Chart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <h3>Top Selling Products</h3>
              <p>Ranked by invoiced sales value</p>
            </div>
          </div>

          <div className={styles.chartContainer}>
            {topProducts.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [currency(Number(v)), 'Sales']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>
                <ShoppingBag size={32} />
                <p>Your best-selling products will appear here after creating invoices.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Recent Invoices Activity Table */}
      <section className={styles.recentCard}>
        <div className={styles.recentHeader}>
          <h3>Recent Invoices</h3>
          <Link to="/all-bills" className={styles.viewAllLink}>
            View all bills <ArrowRight size={15} />
          </Link>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Transport</th>
                <th>Grand Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td><strong>#{invoice.invoiceNo}</strong></td>
                  <td>{invoice.date}</td>
                  <td>{invoice.shopName || 'Walk-in Customer'}</td>
                  <td>{invoice.transport || '-'}</td>
                  <td><strong>{currency(invoice.grandTotal)}</strong></td>
                  <td>
                    <Link to="/all-bills" className="secondary-button" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {!recentInvoices.length && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No invoices generated yet. Click "Create Bill" above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
