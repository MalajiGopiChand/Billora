import * as crypto from 'crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import Razorpay from 'razorpay';

initializeApp();
const adminDb = getFirestore();
const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');
const region = 'asia-south1';

const plans = {
  monthly: { amount: 49900, months: 1 },
  half_yearly: { amount: 249900, months: 6 },
  yearly: { amount: 349900, months: 12 },
} as const;

type PlanId = keyof typeof plans;
const requireUser = (uid: string | undefined) => { if (!uid) throw new HttpsError('unauthenticated', 'Sign in is required.'); return uid; };
const requireAdmin = (admin: boolean | undefined) => { if (!admin) throw new HttpsError('permission-denied', 'Administrator access is required.'); };

function expiryFrom(start: Date, months: number) { const expiry = new Date(start); expiry.setMonth(expiry.getMonth() + months); return expiry; }

export const createSubscriptionOrder = onCall({ region, secrets: [razorpayKeyId, razorpayKeySecret] }, async (request) => {
  const uid = requireUser(request.auth?.uid);
  const planId = request.data?.plan as PlanId;
  if (!Object.hasOwn(plans, planId)) throw new HttpsError('invalid-argument', 'Choose a valid subscription plan.');
  
  const plan = plans[planId];
  
  const rzp = new Razorpay({
    key_id: razorpayKeyId.value() || process.env.RAZORPAY_KEY_ID || 'rzp_test_TerSsmJLRMZdu0',
    key_secret: razorpayKeySecret.value() || process.env.RAZORPAY_KEY_SECRET || 'ybnkpQeMk3zgsS0qnucaUWIO'
  });

  try {
    const order = await rzp.orders.create({
      amount: plan.amount,
      currency: 'INR',
      receipt: `billora_${uid.slice(0, 10)}_${Date.now()}`,
      notes: { uid, planId }
    });

    await adminDb.doc(`payment_attempts/${order.id}`).set({ uid, planId, amount: plan.amount, createdAt: FieldValue.serverTimestamp() });
    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId: rzp.key_id, planId };
  } catch (err: any) {
    throw new HttpsError('internal', 'Payment order could not be created.');
  }
});

export const verifySubscriptionPayment = onCall({ region, secrets: [razorpayKeyId, razorpayKeySecret] }, async (request) => {
  const uid = requireUser(request.auth?.uid);
  const { orderId, paymentId, signature } = request.data || {} as Record<string, string>;
  if (!orderId || !paymentId || !signature) throw new HttpsError('invalid-argument', 'Incomplete payment verification data.');
  
  const secret = razorpayKeySecret.value() || process.env.RAZORPAY_KEY_SECRET || 'ybnkpQeMk3zgsS0qnucaUWIO';
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  
  if (expected !== signature) throw new HttpsError('permission-denied', 'Payment signature is invalid.');
  
  const attempt = await adminDb.doc(`payment_attempts/${orderId}`).get();
  if (!attempt.exists || attempt.data()?.uid !== uid) throw new HttpsError('permission-denied', 'Payment order is not assigned to this account.');
  
  const planId = attempt.data()?.planId as PlanId;
  const now = new Date(); const expiresAt = expiryFrom(now, plans[planId].months);
  
  await adminDb.doc(`subscriptions/${uid}`).set({ uid, email: request.auth?.token.email || '', plan: planId, status: 'active', amount: plans[planId].amount / 100, paymentId, orderId, startedAt: Timestamp.fromDate(now), expiresAt: Timestamp.fromDate(expiresAt), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await attempt.ref.update({ paymentId, verifiedAt: FieldValue.serverTimestamp() });
  
  return { active: true, expiresAt: expiresAt.toISOString() };
});

export const grantComplimentaryAccess = onCall({ region }, async (request) => {
  requireAdmin(request.auth?.token.admin as boolean | undefined);
  const { email, password, months = 12 } = request.data || {} as { email: string; password: string; months?: number };
  if (!email || !password || password.length < 6) throw new HttpsError('invalid-argument', 'Enter an email and a password of at least six characters.');
  let account; try { account = await getAuth().createUser({ email, password }); } catch (error: unknown) { throw new HttpsError('already-exists', error instanceof Error ? error.message : 'The user could not be created.'); }
  const now = new Date(); const expiresAt = expiryFrom(now, Math.max(1, Math.min(months, 60)));
  await Promise.all([adminDb.doc(`users/${account.uid}`).set({ uid: account.uid, email, createdAt: FieldValue.serverTimestamp() }), adminDb.doc(`subscriptions/${account.uid}`).set({ uid: account.uid, email, plan: 'complimentary', status: 'active', amount: 0, startedAt: Timestamp.fromDate(now), expiresAt: Timestamp.fromDate(expiresAt), grantedBy: request.auth?.uid, updatedAt: FieldValue.serverTimestamp() })]);
  return { uid: account.uid, expiresAt: expiresAt.toISOString() };
});

export const getAdminOverview = onCall({ region }, async (request) => {
  requireAdmin(request.auth?.token.admin as boolean | undefined);
  const [users, subscriptions, invoices] = await Promise.all([adminDb.collection('users').get(), adminDb.collection('subscriptions').get(), adminDb.collection('invoices').get()]);
  const now = new Date(); const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const activeSubscriptions = subscriptions.docs.filter((item) => item.data().status === 'active' && item.data().expiresAt?.toDate() > now);
  const invoiceData = invoices.docs.map((item) => item.data());
  const sum = (entries: typeof invoiceData) => entries.reduce((total, invoice) => total + Number(invoice.grandTotal || 0), 0);
  const recentClients = users.docs.slice(0, 10).map((item) => ({ uid: item.id, email: item.data().email || '', createdAt: item.data().createdAt?.toDate()?.toISOString() || null, subscription: subscriptions.docs.find((subscription) => subscription.id === item.id)?.data().status || 'none' }));
  return { clients: users.size, activeSubscriptions: activeSubscriptions.length, totalTurnover: sum(invoiceData), monthlyTurnover: sum(invoiceData.filter((invoice) => invoice.createdAt?.toDate() >= startMonth)), dailyTurnover: sum(invoiceData.filter((invoice) => invoice.createdAt?.toDate() >= startToday)), recentClients };
});
