import { ArrowRight, CheckCircle2, Crown, LogOut, ShieldCheck, Loader2, Clock } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Timestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { computeRenewalExpiry, formatPlanDate, planMonths, toDate } from '@/lib/subscription';
import { ConfettiButton, confetti } from '@/registry/magicui/confetti';
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
  const navigate = useNavigate();
  const { subscription, hasAccess } = useSubscription();
  const hadPlan = Boolean(subscription?.expiresAt || subscription?.plan);
  const expired = hadPlan && !hasAccess;

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState<{
    planName: string;
    paymentId: string;
  } | null>(null);

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
      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(`Order failed: ${errText}`);
      }
      const orderData = await orderRes.json();
      const { orderId, amount, currency, keyId } = orderData;

      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency,
        name: 'Billora',
        description: expired ? 'Workspace Renewal' : 'Workspace Subscription',
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

            const now = new Date();
            const expiresAt = computeRenewalExpiry(toDate(subscription?.expiresAt), planMonths(planId), now);

            await setDoc(doc(db, 'subscriptions', user.uid), {
              uid: user.uid,
              email: user.email || subscription?.email || '',
              plan: planId,
              status: 'active',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              startedAt: Timestamp.fromDate(now),
              expiresAt: Timestamp.fromDate(expiresAt),
              updatedAt: Timestamp.fromDate(now),
            }, { merge: true });

            const resolvedPlanName =
              planId === 'yearly'
                ? 'Yearly Plan'
                : planId === 'half_yearly'
                ? '6 Months Plan'
                : 'Monthly Plan';

            setPaymentSuccess({
              planName: resolvedPlanName,
              paymentId: response.razorpay_payment_id || 'PAY-VERIFIED',
            });

            // Burst celebration confetti
            void confetti({
              particleCount: 160,
              spread: 100,
              origin: { y: 0.55 },
            });

            // Automatically open dashboard after celebration
            setTimeout(() => {
              navigate('/dashboard');
            }, 3500);
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
    {/* PAYMENT SUCCESS OVERLAY & CONFETTI CELEBRATION */}
    {paymentSuccess && (
      <div className={styles.successOverlay}>
        <div className={styles.successCard}>
          <div className={styles.successIconPulse}>
            <CheckCircle2 size={42} />
          </div>
          <h2>Payment Successful! 🎉</h2>
          <p className={styles.successSub}>
            Your <strong>{paymentSuccess.planName}</strong> is verified and active. All billing and business tools are unlocked!
          </p>

          <div className={styles.successMeta}>
            <div className={styles.successMetaRow}>
              <span>Payment Reference:</span>
              <strong>{paymentSuccess.paymentId}</strong>
            </div>
            <div className={styles.successMetaRow}>
              <span>Status:</span>
              <strong style={{ color: '#16a34a' }}>Active & Verified</strong>
            </div>
          </div>

          <div className="relative">
            <ConfettiButton
              onClick={() => {
                navigate('/dashboard');
              }}
              className={styles.confettiSuccessBtn}
            >
              Confetti 🎉 Open Dashboard <ArrowRight size={16} />
            </ConfettiButton>
          </div>

          <p className={styles.autoRedirectText}>
            Directly opening your dashboard in a few seconds...
          </p>
        </div>
      </div>
    )}
    <header>
      <div className={styles.brand}><img src="/logo.jpg" alt="Billora" className={styles.brandLogo} />Billora</div>
      <button onClick={() => logout()}><LogOut size={16}/> Sign out</button>
    </header>

    <section className={styles.hero}>
      <div className={styles.icon}>{hasAccess ? <CheckCircle2 size={32}/> : expired ? <Clock size={32}/> : <Crown size={32}/>}</div>
      <p>Workspace Access</p>
      <h1>
        {hasAccess ? 'Your subscription is active.' : expired ? 'Your plan has expired.' : 'Choose your plan'}
      </h1>
      <span>
        {hasAccess
          ? 'All your dashboard features are unlocked for this plan period.'
          : expired
            ? 'Access is on hold until you renew. Your bills, products, customers, and shop data are still saved and will return as soon as payment is complete.'
            : 'Select a subscription plan below to unlock your billing workspace for that plan period.'}
      </span>
    </section>

    {error && <div className={styles.error}><p>{error}</p></div>}

    {hasAccess &&
      <section className={styles.activeCard}>
        <CheckCircle2 size={24}/>
        <div>
          <b>Workspace unlocked</b>
          <span>Access remains active until {formatPlanDate(subscription?.expiresAt)}.</span>
          <Link className={styles.dashLink} to="/dashboard">Open dashboard</Link>
        </div>
      </section>
    }

    {expired &&
      <section className={styles.holdCard}>
        <ShieldCheck size={24}/>
        <div>
          <b>Data is held, not deleted</b>
          <span>
            Your previous {subscription?.plan?.replace('_', ' ')} plan ended on {formatPlanDate(subscription?.expiresAt)}.
            Renew any plan below to restore this account’s dashboard access and the same records.
          </span>
        </div>
      </section>
    }

    {(!hasAccess || expired) &&
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
              {loadingPlan === plan.id ? <Loader2 size={16} className={styles.spin} /> : (expired ? 'Renew ' : 'Choose ') + plan.name}
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
