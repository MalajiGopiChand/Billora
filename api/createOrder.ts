import { applyCors, getRazorpayKeys, readJsonBody } from './_razorpay';

const plans = {
  monthly: { amount: 49900, months: 1 },
  half_yearly: { amount: 249900, months: 6 },
  yearly: { amount: 349900, months: 12 },
} as const;

export default async function handler(req: any, res: any) {
  if (applyCors(req, res, req.method)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = readJsonBody(req);
  const planId = String(body.plan || '');
  const uid = String(body.uid || '');


  if (!plans[planId as keyof typeof plans]) {
    return res.status(400).json({ error: 'Choose a valid subscription plan.' });
  }
  if (!uid) {
    return res.status(400).json({ error: 'Sign in is required to start payment.' });
  }

  let keys;
  try {
    keys = getRazorpayKeys();
  } catch (err: any) {
    return res.status(500).json({ error: 'Payment order could not be created.', details: err?.message });
  }

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: plans[planId as keyof typeof plans].amount,
        currency: 'INR',
        receipt: `billora_${uid.slice(0, 10)}_${Date.now()}`.slice(0, 40),
        notes: { uid, planId },
      }),
    });

    const order = await response.json();
    if (!response.ok) {
      throw new Error(order.error?.description || 'Failed to create order on Razorpay');
    }

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keys.keyId,
      planId,
    });
  } catch (err: any) {
    console.error('Razorpay Error:', err);
    return res.status(500).json({ error: 'Payment order could not be created.', details: err?.message || err });
  }
}
