import { CheckCircle2, Crown, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import styles from './Subscription.module.css';

export function Subscription() {
  const { logout } = useAuth();
  const { subscription } = useSubscription();
  const active = subscription?.status === 'active';

  return <main className={styles.page}><header><div className={styles.brand}><span>B</span>Billora</div><button onClick={() => logout()}><LogOut size={16}/> Sign out</button></header><section className={styles.hero}><div className={styles.icon}>{active ? <CheckCircle2 size={28}/> : <Crown size={28}/>}</div><p>Workspace Access</p><h1>{active ? 'Your subscription is active.' : 'Admin Approval Needed'}</h1><span>{active ? 'All your dashboard features are unlocked.' : 'Your account has been created successfully. Please contact the administrator to process your manual payment and grant access to your workspace.'}</span></section>{active ? <section className={styles.activeCard}><CheckCircle2 size={23}/><div><b>Workspace unlocked</b><span>Access remains active until {subscription.expiresAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.</span></div></section> : <section className={styles.help}><ShieldCheck size={22}/><div><b>Awaiting Manual Activation</b><span>Once your payment is verified by the admin, your account will be activated immediately and you can start creating bills.</span></div></section>}</main>;
}
