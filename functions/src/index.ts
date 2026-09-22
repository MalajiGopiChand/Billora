import * as crypto from 'crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import Razorpay from 'razorpay';

initializeApp();
const adminDb = getFirestore();
const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');
const razorpayWebhookSecret = defineSecret('RAZORPAY_WEBHOOK_SECRET');
const region = 'asia-south1';
const callableAuth = { region, cors: true as const, invoker: 'public' as const };
const callablePayments = { ...callableAuth, secrets: [razorpayKeyId, razorpayKeySecret] };
const webhookHttp = { region, cors: false as const, invoker: 'public' as const, secrets: [razorpayKeyId, razorpayKeySecret, razorpayWebhookSecret] };

const plans = {
  monthly: { amount: 49900, months: 1 },
  half_yearly: { amount: 249900, months: 6 },
  yearly: { amount: 349900, months: 12 },
} as const;

type PlanId = keyof typeof plans;
const requireUser = (uid: string | undefined) => { if (!uid) throw new HttpsError('unauthenticated', 'Sign in is required.'); return uid; };
const requireAdmin = (admin: boolean | undefined) => { if (!admin) throw new HttpsError('permission-denied', 'Administrator access is required.'); };

function expiryFrom(start: Date, months: number) { const expiry = new Date(start); expiry.setMonth(expiry.getMonth() + months); return expiry; }

async function activatePaidPlan(uid: string, planId: PlanId, paymentId: string, orderId: string, email = '') {
  const subRef = adminDb.doc(`subscriptions/${uid}`);
  const current = await subRef.get();
  if (current.data()?.paymentId === paymentId) return current.data()?.expiresAt?.toDate?.() as Date | undefined;
  const now = new Date();
  const currentExpiry = current.data()?.expiresAt?.toDate?.();
  const startFrom = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const expiresAt = expiryFrom(startFrom, plans[planId].months);
  await subRef.set({
    uid,
    email: email || current.data()?.email || '',
    plan: planId,
    status: 'active',
    amount: plans[planId].amount / 100,
    paymentId,
    orderId,
    startedAt: Timestamp.fromDate(now),
    expiresAt: Timestamp.fromDate(expiresAt),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  await adminDb.doc(`payment_attempts/${orderId}`).set({ uid, planId, paymentId, verifiedAt: FieldValue.serverTimestamp() }, { merge: true });
  return expiresAt;
}

function readSecret(secret: { value: () => string }, fallbackEnv: string | undefined, fallback: string) {
  try {
    const value = secret.value();
    if (value) return value;
  } catch {
    // Secret not bound on this instance.
  }
  return fallbackEnv || fallback;
}

function razorpayCredentials() {
  const rawId = readSecret(razorpayKeyId, process.env.RAZORPAY_KEY_ID, 'rzp_test_TerSsmJLRMZdu0');
  const rawSecret = readSecret(razorpayKeySecret, process.env.RAZORPAY_KEY_SECRET, 'ybnkpQeMk3zgsS0qnucaUWIO');
  const mashed = rawId.match(/^(rzp_(?:live|test)_[A-Za-z0-9]{14})([A-Za-z0-9]{20,40})$/);
  if (mashed) return { keyId: mashed[1], keySecret: mashed[2] };
  return { keyId: rawId, keySecret: rawSecret };
}

export const createSubscriptionOrder = onCall(callablePayments, async (request) => {
  const uid = requireUser(request.auth?.uid);
  const planId = request.data?.plan as PlanId;
  if (!Object.hasOwn(plans, planId)) throw new HttpsError('invalid-argument', 'Choose a valid subscription plan.');
  
  const plan = plans[planId];
  const { keyId, keySecret } = razorpayCredentials();
  
  const rzp = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  try {
    const order = await rzp.orders.create({
      amount: plan.amount,
      currency: 'INR',
      receipt: `billora_${uid.slice(0, 10)}_${Date.now()}`,
      notes: { uid, planId }
    });

    await adminDb.doc(`payment_attempts/${order.id}`).set({ uid, planId, amount: plan.amount, createdAt: FieldValue.serverTimestamp() });
    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId, planId };
  } catch (err: any) {
    throw new HttpsError('internal', 'Payment order could not be created.');
  }
});

export const verifySubscriptionPayment = onCall(callablePayments, async (request) => {
  const uid = requireUser(request.auth?.uid);
  const { orderId, paymentId, signature } = request.data || {} as Record<string, string>;
  if (!orderId || !paymentId || !signature) throw new HttpsError('invalid-argument', 'Incomplete payment verification data.');
  
  const { keySecret } = razorpayCredentials();
  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  
  if (expected !== signature) throw new HttpsError('permission-denied', 'Payment signature is invalid.');
  
  const attempt = await adminDb.doc(`payment_attempts/${orderId}`).get();
  if (!attempt.exists || attempt.data()?.uid !== uid) throw new HttpsError('permission-denied', 'Payment order is not assigned to this account.');
  
  const planId = attempt.data()?.planId as PlanId;
  const expiresAt = await activatePaidPlan(uid, planId, paymentId, orderId, request.auth?.token.email || '');
  return { active: true, expiresAt: expiresAt?.toISOString() };
});

export const grantComplimentaryAccess = onCall(callableAuth, async (request) => {
  requireAdmin(request.auth?.token.admin as boolean | undefined);
  const { email, password, months = 12 } = request.data || {} as { email: string; password: string; months?: number };
  if (!email || !password || password.length < 6) throw new HttpsError('invalid-argument', 'Enter an email and a password of at least six characters.');
  let account; try { account = await getAuth().createUser({ email, password }); } catch (error: unknown) { throw new HttpsError('already-exists', error instanceof Error ? error.message : 'The user could not be created.'); }
  const now = new Date(); const expiresAt = expiryFrom(now, Math.max(1, Math.min(months, 60)));
  await Promise.all([adminDb.doc(`users/${account.uid}`).set({ uid: account.uid, email, createdAt: FieldValue.serverTimestamp() }), adminDb.doc(`subscriptions/${account.uid}`).set({ uid: account.uid, email, plan: 'complimentary', status: 'active', amount: 0, startedAt: Timestamp.fromDate(now), expiresAt: Timestamp.fromDate(expiresAt), grantedBy: request.auth?.uid, updatedAt: FieldValue.serverTimestamp() })]);
  return { uid: account.uid, expiresAt: expiresAt.toISOString() };
});

export const getAdminOverview = onCall(callableAuth, async (request) => {
  requireAdmin(request.auth?.token.admin as boolean | undefined);
  const [users, subscriptions, invoices] = await Promise.all([adminDb.collection('users').get(), adminDb.collection('subscriptions').get(), adminDb.collection('invoices').get()]);
  const now = new Date(); const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const activeSubscriptions = subscriptions.docs.filter((item) => item.data().status !== 'cancelled' && item.data().expiresAt?.toDate() > now);
  const invoiceData = invoices.docs.map((item) => item.data());
  const sum = (entries: typeof invoiceData) => entries.reduce((total, invoice) => total + Number(invoice.grandTotal || 0), 0);
  const recentClients = users.docs.slice(0, 10).map((item) => {
    const sub = subscriptions.docs.find((subscription) => subscription.id === item.id)?.data();
    const isActive = sub?.expiresAt?.toDate() > now && sub?.status !== 'cancelled';
    return { uid: item.id, email: item.data().email || '', createdAt: item.data().createdAt?.toDate()?.toISOString() || null, subscription: isActive ? 'active' : (sub ? 'expired' : 'none') };
  });
  return { clients: users.size, activeSubscriptions: activeSubscriptions.length, totalTurnover: sum(invoiceData), monthlyTurnover: sum(invoiceData.filter((invoice) => invoice.createdAt?.toDate() >= startMonth)), dailyTurnover: sum(invoiceData.filter((invoice) => invoice.createdAt?.toDate() >= startToday)), recentClients };
});

export const razorpayWebhook = onRequest(webhookHttp, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const signature = String(req.headers['x-razorpay-signature'] || '');
  const secret = readSecret(razorpayWebhookSecret, process.env.RAZORPAY_WEBHOOK_SECRET, '');
  const raw = (req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body || {}));
  if (!secret) {
    res.status(500).json({ error: 'Webhook secret is not configured.' });
    return;
  }
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (expected !== signature) {
    res.status(400).json({ error: 'Invalid webhook signature.' });
    return;
  }

  const event = req.body?.event as string;
  if (event === 'payment.failed') {
    const payment = req.body?.payload?.payment?.entity || {};
    await adminDb.doc(`payment_attempts/${payment.order_id || payment.id || 'unknown'}`).set({
      status: 'failed',
      paymentId: payment.id || '',
      failedAt: FieldValue.serverTimestamp(),
      error: payment.error_description || 'Payment failed',
    }, { merge: true });
    res.status(200).json({ ok: true, event });
    return;
  }

  if (event !== 'payment.captured' && event !== 'order.paid') {
    res.status(200).json({ ok: true, ignored: event });
    return;
  }

  const payment = req.body?.payload?.payment?.entity || {};
  const order = req.body?.payload?.order?.entity || {};
  const orderId = String(payment.order_id || order.id || '');
  const paymentId = String(payment.id || order.payments?.[0] || '');
  let uid = String(payment.notes?.uid || order.notes?.uid || '');
  let planId = String(payment.notes?.planId || order.notes?.planId || '') as PlanId;

  if ((!uid || !Object.hasOwn(plans, planId)) && orderId) {
    const attempt = await adminDb.doc(`payment_attempts/${orderId}`).get();
    uid = uid || String(attempt.data()?.uid || '');
    planId = (planId || attempt.data()?.planId) as PlanId;
  }

  if (!uid || !Object.hasOwn(plans, planId) || !orderId) {
    res.status(200).json({ ok: true, skipped: 'Missing order mapping' });
    return;
  }

  const emailSnap = await adminDb.doc(`users/${uid}`).get();
  await activatePaidPlan(uid, planId, paymentId || orderId, orderId, String(emailSnap.data()?.email || ''));
  res.status(200).json({ ok: true, event, uid });
});
