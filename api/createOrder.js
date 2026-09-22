import Razorpay from 'razorpay';

const plans = {
  monthly: { amount: 49900, months: 1 },
  half_yearly: { amount: 249900, months: 6 },
  yearly: { amount: 349900, months: 12 },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan: planId, uid } = req.body;
  if (!plans[planId]) {
    return res.status(400).json({ error: 'Choose a valid subscription plan.' });
  }

  const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_TerSsmJLRMZdu0';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'ybnkpQeMk3zgsS0qnucaUWIO';

  try {
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({
      amount: plans[planId].amount,
      currency: 'INR',
      receipt: `billora_${uid.slice(0, 10)}_${Date.now()}`,
      notes: { uid, planId }
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
      planId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Payment order could not be created.' });
  }
}
