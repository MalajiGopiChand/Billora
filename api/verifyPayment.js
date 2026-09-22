import crypto from 'crypto';

const plans = {
  monthly: { amount: 49900, months: 1 },
  half_yearly: { amount: 249900, months: 6 },
  yearly: { amount: 349900, months: 12 },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, paymentId, signature } = req.body;
  
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'Incomplete payment verification data.' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || 'ybnkpQeMk3zgsS0qnucaUWIO';
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  
  if (expected !== signature) {
    return res.status(403).json({ error: 'Payment signature is invalid.' });
  }

  // With Vercel APIs without Firebase Admin, we just return success
  // and let the frontend perform the Firestore write.
  return res.status(200).json({ active: true });
}
