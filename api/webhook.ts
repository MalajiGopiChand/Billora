import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'billora_webhook_secret_2026';
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) {
    return res.status(400).json({ error: 'Missing Razorpay signature' });
  }

  try {
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    
    // For Standard Checkout (one-time payment unlocking a subscription duration)
    if (event === 'order.paid') {
      const order = req.body.payload.order.entity;
      const { uid, planId } = order.notes;
      
      console.log(`[Webhook] Order ${order.id} paid for user ${uid} (Plan: ${planId})`);
      
      // IMPORTANT: To update Firestore from this webhook securely, you must 
      // initialize firebase-admin using a Service Account JSON.
      // Since this runs in the background on Vercel, it cannot use the 
      // client-side Firebase SDK.
      
      // Example implementation:
      // const admin = require('firebase-admin');
      // if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
      // const db = admin.firestore();
      // await db.collection('subscriptions').doc(uid).set({ ... }, { merge: true });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
