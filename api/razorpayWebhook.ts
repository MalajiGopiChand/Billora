import crypto from 'crypto';
import { applyCors, getRazorpayKeys, readJsonBody } from './_razorpay';

const plans = {
  monthly: { amount: 49900, months: 1 },
  half_yearly: { amount: 249900, months: 6 },
  yearly: { amount: 349900, months: 12 },
} as const;

type PlanId = keyof typeof plans;

function expiryFrom(start: Date, months: number) {
  const expiry = new Date(start);
  expiry.setMonth(expiry.getMonth() + months);
  return expiry;
}

export default async function handler(req: any, res: any) {
  if (applyCors(req, res, req.method)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const payload = readJsonBody({ body: typeof req.body === 'string' ? req.body : req.body });
  const signature = String(req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature'] || '');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) return res.status(500).json({ error: 'Set RAZORPAY_WEBHOOK_SECRET on Vercel.' });

  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (expected !== signature) return res.status(400).json({ error: 'Invalid webhook signature.' });

  const event = String(payload.event || '');
  if (event !== 'payment.captured' && event !== 'order.paid' && event !== 'payment.failed') {
    return res.status(200).json({ ok: true, ignored: event });
  }

  const nested = (payload.payload || {}) as Record<string, any>;
  const payment = nested.payment?.entity || {};
  const order = nested.order?.entity || {};
  const orderId = String(payment.order_id || order.id || '');
  const paymentId = String(payment.id || '');
  let uid = String(payment.notes?.uid || order.notes?.uid || '');
  let planId = String(payment.notes?.planId || order.notes?.planId || '') as PlanId;

  if ((!uid || !plans[planId]) && orderId) {
    try {
      const { keyId, keySecret } = getRazorpayKeys();
      const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
        headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
      });
      const orderData = await orderRes.json();
      uid = uid || String(orderData.notes?.uid || '');
      planId = (planId || orderData.notes?.planId) as PlanId;
    } catch {
      // Order lookup is optional when notes are already present.
    }
  }

  if (event === 'payment.failed') return res.status(200).json({ ok: true, event, uid, orderId });
  if (!uid || !plans[planId]) return res.status(200).json({ ok: true, skipped: 'Missing plan mapping' });

  try {
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getFirestore, FieldValue, Timestamp } = await import('firebase-admin/firestore');
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!getApps().length) {
      if (serviceAccount) initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
      else initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'billingsoftware-cdb39' });
    }
    const db = getFirestore();
    const subRef = db.doc(`subscriptions/${uid}`);
    const current = await subRef.get();
    if (current.data()?.paymentId === paymentId && paymentId) return res.status(200).json({ ok: true, duplicate: true });
    const now = new Date();
    const currentExpiry = current.data()?.expiresAt?.toDate?.();
    const startFrom = currentExpiry && currentExpiry > now ? currentExpiry : now;
    const expiresAt = expiryFrom(startFrom, plans[planId].months);
    await subRef.set({
      uid,
      email: current.data()?.email || '',
      plan: planId,
      status: 'active',
      amount: plans[planId].amount / 100,
      paymentId,
      orderId,
      startedAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return res.status(200).json({ ok: true, event, uid });
  } catch (err: any) {
    console.error('Webhook activate error:', err);
    return res.status(200).json({ ok: true, event, warning: 'Payment received; access will activate from checkout verify if Admin SDK is not configured.' });
  }
}
