import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Crown, FilePlus2, Files, LogOut, Menu, Package, User, Users, X, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  const location = useLocation();
  const title = links.find(([path]) => path === location.pathname)?.[1] ?? 'Customer Profile';
  
  // Admin shouldn't see normal shop links, except maybe Settings
  const visibleLinks = isAdmin ? links.filter(([path]) => path === '/settings') : links;

  return <div className="app-shell">
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <div className={styles.brand}><img src="/logo.jpg" alt="Billora Logo" className={styles.brandLogo} /><div><strong>Billora</strong><small>Billing Suite</small></div><button className={styles.close} onClick={() => setOpen(false)}><X size={20} /></button></div>
      <nav>{visibleLinks.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/dashboard'} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? styles.active : ''}><Icon size={19} />{label}</NavLink>)}{isAdmin && <NavLink to="/admin" onClick={() => setOpen(false)} className={({ isActive }) => isActive ? styles.active : ''}><Crown size={19}/>Admin</NavLink>}</nav>
      <div className={styles.account}><span>{user?.email}</span><button onClick={() => logout()}><LogOut size={17} /> Sign out</button></div>
    </aside>
    {open && <button aria-label="Close navigation" className={styles.overlay} onClick={() => setOpen(false)} />}
    <main className={styles.main}>
      <header className={styles.header}><button className={styles.menu} onClick={() => setOpen(true)}><Menu size={22} /></button><div><p>Shop workspace</p><h1>{title}</h1></div></header>
      <div className={styles.content}><Outlet /></div>
    </main>
    <nav className={styles.bottomNav}>
      {(isAdmin ? [['/admin', 'Admin', Crown] as const, ...visibleLinks.slice(0, 3)] : visibleLinks.slice(0, 4)).map(([to, label, Icon]) => (
        <NavLink key={to} to={to} end={to === '/dashboard'} className={({ isActive }) => isActive ? styles.active : ''}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button className={styles.menuBottom} onClick={() => setOpen(true)}>
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </nav>
  </div>;
}
