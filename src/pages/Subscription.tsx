import { CheckCircle2, Crown, LogOut, ShieldCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import styles from './Subscription.module.css';

const plans = [
  { id: 'monthly', name: 'Monthly', price: '₹499', period: '/ month', note: 'GST included' },
  { id: 'half_yearly', name: '6 Months', price: '₹2,499', period: '/ 6 months', note: 'GST included' },
  { id: 'yearly', name: 'Yearly', price: '₹3,499', period: '/ year', note: 'Usually ₹6,000 · GST included', featured: true }
];

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function Subscription() {
  const { logout, user } = useAuth();
  const { subscription } = useSubscription();
  const active = subscription?.status === 'active';
  
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handlePayment = async (planId: string) => {
    if (!user) return;
    setLoadingPlan(planId);
    setError('');

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setError('Razorpay SDK failed to load. Are you online?');
      setLoadingPlan(null);
      return;
    }

    try {
      const orderRes = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, uid: user.uid })
      });
      if (!orderRes.ok) throw new Error('Could not create order.');
      const orderData = await orderRes.json();
      const { orderId, amount, currency, keyId } = orderData;

      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency,
        name: 'Billora',
        description: 'Workspace Subscription',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verifyPayment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              })
            });
            
            if (!verifyRes.ok) throw new Error('Payment verification failed.');
            
            // Client-side Firestore update
            const { setDoc, doc, Timestamp } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            const months = planId === 'monthly' ? 1 : planId === 'half_yearly' ? 6 : 12;
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setMonth(expiresAt.getMonth() + months);
            
            await setDoc(doc(db, 'subscriptions', user.uid), {
              uid: user.uid,
              plan: planId,
              status: 'active',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              startedAt: Timestamp.fromDate(now),
              expiresAt: Timestamp.fromDate(expiresAt),
            }, { merge: true });

            window.location.href = '/dashboard';
          } catch (err: any) {
            setError(err.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: { email: user.email },
        theme: { color: '#4f46e5' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment. Please try again later.');
    }
    setLoadingPlan(null);
  };

  return <main className={styles.page}>
    <header>
      <div className={styles.brand}><img src="/logo.jpg" alt="Billora" className={styles.brandLogo} />Billora</div>
      <button onClick={() => logout()}><LogOut size={16}/> Sign out</button>
    </header>
    
    <section className={styles.hero}>
      <div className={styles.icon}>{active ? <CheckCircle2 size={32}/> : <Crown size={32}/>}</div>
      <p>Workspace Access</p>
      <h1>{active ? 'Your subscription is active.' : 'Choose your plan'}</h1>
      <span>{active ? 'All your dashboard features are unlocked.' : 'Select a subscription plan below to instantly unlock your billing workspace and start growing your shop.'}</span>
    </section>

    {error && <div className={styles.error}><p>{error}</p></div>}

    {active ? 
      <section className={styles.activeCard}>
        <CheckCircle2 size={24}/>
        <div>
          <b>Workspace unlocked</b>
          <span>Access remains active until {subscription.expiresAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.</span>
        </div>
      </section>
      : 
      <div className={styles.plans}>
        {plans.map((plan) => (
          <article className={plan.featured ? styles.featured : ''} key={plan.id}>
            {plan.featured && <span className={styles.label}>Best value</span>}
            <h2>{plan.name}</h2>
            <p className={styles.price}><strong>{plan.price}</strong><span>{plan.period}</span></p>
            <span className={styles.gst}>{plan.note}</span>
            <button 
              className={styles.pay} 
              onClick={() => handlePayment(plan.id)}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === plan.id ? <Loader2 size={16} className={styles.spin} /> : 'Choose ' + plan.name}
            </button>
            <ul>
              <li><CheckCircle2 size={16}/> Unlimited invoices</li>
              <li><CheckCircle2 size={16}/> Products and customers</li>
              <li><CheckCircle2 size={16}/> Analytics, printing, PDF</li>
            </ul>
          </article>
        ))}
      </div>
    }
  </main>;
}
