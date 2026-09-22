import crypto from 'node:crypto';
import { applyCors, getRazorpayKeys, readJsonBody } from './_razorpay.js';

export default async function handler(req: any, res: any) {
  if (applyCors(req, res, req.method)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, paymentId, signature } = readJsonBody(req);
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'Incomplete payment verification data.' });
  }

  try {
    const { keySecret } = getRazorpayKeys();
    const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    if (expected !== signature) {
      return res.status(403).json({ error: 'Payment signature is invalid.' });
    }
    return res.status(200).json({ active: true });
  } catch (err: any) {
    console.error('Verify Error:', err);
    return res.status(500).json({ error: 'Verification failed', details: err?.message || err });
  }
}
