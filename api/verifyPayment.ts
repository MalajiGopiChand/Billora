import crypto from 'crypto';

const plans = {
  monthly: { amount: 49900, months: 1 },
  half_yearly: { amount: 249900, months: 6 },
  yearly: { amount: 349900, months: 12 },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body.' });
  }

  const { orderId, paymentId, signature } = req.body;
  
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'Incomplete payment verification data.' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || 'hGbV6odm8CyDJs4wQakiphBk';
  try {
    const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    
    if (expected !== signature) {
      return res.status(403).json({ error: 'Payment signature is invalid.' });
    }

    return res.status(200).json({ active: true });
  } catch (err: any) {
    console.error('Verify Error:', err);
    return res.status(500).json({ error: 'Verification failed', details: err?.message || err });
  }
}
