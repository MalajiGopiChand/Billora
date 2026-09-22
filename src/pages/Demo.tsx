import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InteractiveDemoModal } from '@/components/landing/InteractiveDemoModal';
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
          <a href="#demo-console">Live Console</a>
          <Link to="/register">Create Workspace</Link>
        </div>
        <div className={styles.actions}>
          <Link to="/register" className={styles.start}>
            Start Free <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <header className={styles.header}>
        <div className={styles.demoBadge}>
          <Sparkles size={14} /> Full Interactive Simulator
        </div>
        <h1>Try Billora Live in Your Browser</h1>
        <p>Walk through the entire billing lifecycle: from dashboard metrics to rapid invoice creation, A4 printing, and live balance reconciliation.</p>
      </header>

      <section id="demo-console" className={styles.demoSection}>
        <InteractiveDemoModal isEmbedded={true} />
      </section>

      <section className={styles.cta}>
        <h2>Ready to simplify your shop's billing?</h2>
        <p>Join growing businesses across India using Billora for daily counter speed and clarity.</p>
        <Link to="/register" className={styles.primaryBtn}>
          Create Your Workspace Now <ArrowRight size={17} />
        </Link>
      </section>
      
      <footer className={styles.footer}>
        <Link to="/">← Back to Billora Home</Link>
      </footer>
    </main>
  );
}
