

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

  const { plan: planId, uid } = req.body;
  if (!plans[planId as keyof typeof plans]) {
    return res.status(400).json({ error: 'Choose a valid subscription plan.' });
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_TezNKzfigVHfrK';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'hGbV6odm8CyDJs4wQakiphBk';

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: plans[planId as keyof typeof plans].amount,
        currency: 'INR',
        receipt: `billora_${uid.slice(0, 10)}_${Date.now()}`,
        notes: { uid, planId }
      })
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(order.error?.description || 'Failed to create order on Razorpay');
    }

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
      planId
    });
  } catch (err: any) {
    console.error('Razorpay Error:', err);
    return res.status(500).json({ error: 'Payment order could not be created.', details: err?.message || err?.error || err });
  }
}
