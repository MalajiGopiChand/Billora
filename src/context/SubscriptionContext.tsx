import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Subscription } from '@/types';
import { isSubscriptionCurrentlyActive, toDate } from '@/lib/subscription';
import { useAuth } from './AuthContext';

interface SubscriptionContextValue {
  subscription: Subscription | null;
  loading: boolean;
  hasAccess: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!user) { setSubscription(null); setLoading(false); return; }
    setLoading(true);
    return onSnapshot(doc(db, 'subscriptions', user.uid), (snapshot) => {
      setSubscription(snapshot.exists() ? snapshot.data() as Subscription : null);
      setLoading(false);
      setNow(new Date());
    }, () => setLoading(false));
  }, [user]);

  useEffect(() => {
    const expiresAt = toDate(subscription?.expiresAt);
    if (!expiresAt) return;
    const remaining = expiresAt.getTime() - Date.now();
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setNow(new Date()), remaining + 250);
    return () => window.clearTimeout(timer);
  }, [subscription?.expiresAt]);

  useEffect(() => {
    if (!user || !subscription) return;
    const stillValid = isSubscriptionCurrentlyActive(subscription, now);
    if (stillValid || subscription.status === 'expired' || subscription.status === 'cancelled') return;
    updateDoc(doc(db, 'subscriptions', user.uid), { status: 'expired' }).catch(() => {});
  }, [user, subscription, now]);

  const hasAccess = useMemo(() => Boolean(
    isAdmin
    || user?.email === 'maramnagaprasad1992@gmail.com'
    || isSubscriptionCurrentlyActive(subscription, now)
  ), [isAdmin, user?.email, subscription, now]);

  return <SubscriptionContext.Provider value={{ subscription, loading, hasAccess }}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const value = useContext(SubscriptionContext);
  if (!value) throw new Error('useSubscription must be used within SubscriptionProvider');
  return value;
}
