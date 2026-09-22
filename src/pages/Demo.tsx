import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InteractiveDemoModal } from '@/components/landing/InteractiveDemoModal';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { PublicNavbar } from '@/components/landing/PublicNavbar';
import styles from './Demo.module.css';

export function Demo() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <PublicNavbar />
      <main className={styles.page} style={{ flex: 1 }}>
        <AnimatedBackground />

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
    </div>
  );
}
