import { ArrowRight, BarChart3, FileText, LockKeyhole, Package, UsersRound, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Demo.module.css';

export function Demo() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>
          <img src="/logo.jpg" alt="Billora" className={styles.brandLogo} />
          Billora
        </Link>
        <div className={styles.links}>
          <Link to="/">Home</Link>
          <a href="#dashboard">Dashboard</a>
          <a href="#billing">Billing</a>
          <a href="#customers">Customers</a>
        </div>
        <div className={styles.actions}>
          <Link to="/register" className={styles.start}>Start now <ArrowRight size={16} /></Link>
        </div>
      </nav>

      <header className={styles.header}>
        <h1>See how Billora works</h1>
        <p>A complete walkthrough of all the features available in your workspace.</p>
      </header>

      <section id="dashboard" className={styles.section}>
        <div className={styles.content}>
          <div className={styles.icon}><BarChart3 size={32} /></div>
          <h2>1. Dashboard Analytics</h2>
          <p>
            The dashboard gives you a real-time overview of your shop's performance. 
            You can see your total sales for today, this month, and your overall turnover.
            Interactive charts show you your sales trends over the last 7 days, 30 days, or the entire year.
            It also highlights your top-selling products by invoiced value.
          </p>
        </div>
        <div className={styles.demoVisual}>
          <div className={styles.mockDashboard}>
            <div className={styles.mockKpis}>
              <div /><div /><div />
            </div>
            <div className={styles.mockChart}></div>
          </div>
        </div>
      </section>

      <section id="billing" className={`${styles.section} ${styles.reverse}`}>
        <div className={styles.content}>
          <div className={styles.icon}><FileText size={32} /></div>
          <h2>2. Fast, Keyboard-First Billing</h2>
          <p>
            Creating a bill is incredibly fast. Select a customer or type a new one, and the system remembers them. 
            Use your <strong>Enter key</strong> to move seamlessly between product description, boxes, quantity, rate, and discount.
            Press Enter on the discount field to instantly add a new row.
            Print directly to A4 or download a PDF invoice in one click.
          </p>
        </div>
        <div className={styles.demoVisual}>
          <div className={styles.mockInvoice}>
            <div className={styles.mockHeader}></div>
            <div className={styles.mockTable}>
              <div className={styles.mockRow}></div>
              <div className={styles.mockRow}></div>
              <div className={styles.mockRow}></div>
            </div>
            <div className={styles.mockTotal}></div>
          </div>
        </div>
      </section>

      <section id="customers" className={styles.section}>
        <div className={styles.content}>
          <div className={styles.icon}><UsersRound size={32} /></div>
          <h2>3. Customer & Product Management</h2>
          <p>
            Every customer you bill is automatically saved. 
            You can view a complete history of every invoice linked to a customer, their average order value, and their most purchased items.
            Similarly, save your products and their standard rates to auto-fill them during billing, saving you precious time at the counter.
          </p>
        </div>
        <div className={styles.demoVisual}>
          <div className={styles.mockCustomers}>
            <div className={styles.mockCustomerCard}></div>
            <div className={styles.mockCustomerCard}></div>
            <div className={styles.mockCustomerCard}></div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Ready to simplify your billing?</h2>
        <p>Join now and experience the fastest way to manage your shop.</p>
        <Link to="/register" className={styles.primaryBtn}>Create your workspace <ArrowRight size={17} /></Link>
      </section>
      
      <footer className={styles.footer}>
        <Link to="/">Back to Home</Link>
      </footer>
    </main>
  );
}
