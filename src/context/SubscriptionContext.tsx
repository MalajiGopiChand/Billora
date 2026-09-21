import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Subscription } from '@/types';
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

  useEffect(() => {
    if (!user) { setSubscription(null); setLoading(false); return; }
    setLoading(true);
    return onSnapshot(doc(db, 'subscriptions', user.uid), (snapshot) => {
      setSubscription(snapshot.exists() ? snapshot.data() as Subscription : null);
      setLoading(false);
    }, () => setLoading(false));
  }, [user]);

  const expiresAt = subscription?.expiresAt?.toDate();
  const hasAccess = Boolean(isAdmin || user?.email === 'maramnagaprasad1992@gmail.com' || (subscription?.status === 'active' && expiresAt && expiresAt > new Date()));
  return <SubscriptionContext.Provider value={{ subscription, loading, hasAccess }}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const value = useContext(SubscriptionContext);
  if (!value) throw new Error('useSubscription must be used within SubscriptionProvider');
  return value;
}
