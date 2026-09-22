import { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Crown, 
  FilePlus2, 
  Files, 
  LogOut, 
  Menu, 
  Package, 
  User, 
  Users, 
  X, 
  Phone,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { formatPlanDate } from '@/lib/subscription';
import styles from './AppLayout.module.css';

const links = [
  ['/dashboard', 'Dashboard', BarChart3],
  ['/create-bill', 'Create Bill', FilePlus2],
  ['/all-bills', 'All Bills', Files],
  ['/products', 'Products', Package],
  ['/customers', 'Customers', Users],
  ['/settings', 'My Profile', User],
  ['/contact', 'Contact Us', Phone],
] as const;

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { logout, user, isAdmin } = useAuth();
  const { subscription } = useSubscription();
  const location = useLocation();
  const title = links.find(([path]) => path === location.pathname)?.[1] ?? 'Workspace';

  // Admin shouldn't see normal shop links, except Settings
  const visibleLinks = isAdmin ? links.filter(([path]) => path === '/settings') : links;

  return (
    <div className={`app-shell ${styles.appShell}`}>
      {/* 1. Modern Sidebar */}
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.brand}>
          <img src="/logo.jpg" alt="Billora Logo" className={styles.brandLogo} />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Billora</span>
            <span className={styles.brandSubtitle}>Retail Suite</span>
          </div>
          <button className={styles.close} onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav>
          {visibleLinks.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              <Crown size={18} />
              <span>Admin Console</span>
            </NavLink>
          )}
        </nav>

        <div className={styles.account}>
          <span className={styles.userEmail}>{user?.email}</span>
          {subscription?.expiresAt && (
            <span className={styles.planUntil}>
              <ShieldCheck size={13} /> Active till {formatPlanDate(subscription.expiresAt)}
            </span>
          )}
          <button onClick={() => logout()} className={styles.signOutBtn}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {open && <button aria-label="Close navigation" className={styles.overlay} onClick={() => setOpen(false)} />}

      {/* 2. Main Content Area */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menu} onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div className={styles.headerTitle}>
              <p>Shop Workspace</p>
              <h1>{title}</h1>
            </div>
          </div>

          <div className={styles.headerRight}>
            {!isAdmin && (
              <Link to="/create-bill" className={styles.quickNewBillBtn}>
                <Plus size={16} /> New Bill
              </Link>
            )}
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>

      {/* 3. Mobile Bottom Navigation Dock */}
      <nav className={styles.bottomNav}>
        {(isAdmin ? ([['/admin', 'Admin', Crown] as const, ...visibleLinks.slice(0, 3)]) : visibleLinks.slice(0, 4)).map(
          ([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          )
        )}
        <button className={styles.menuBottom} onClick={() => setOpen(true)} aria-label="More navigation">
          <Menu size={19} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
