const KEY_ID_PATTERN = /^rzp_(live|test)_[A-Za-z0-9]{10,20}$/;

function splitMashedKey(value: string) {
  const mashed = value.match(/^(rzp_(?:live|test)_[A-Za-z0-9]{14})([A-Za-z0-9]{20,40})$/);
  if (!mashed) return null;
  return { keyId: mashed[1], keySecret: mashed[2] };
}

export function getRazorpayKeys() {
  const explicitId = process.env.RAZORPAY_KEY_ID?.trim();
  const explicitSecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const viteId = process.env.VITE_RAZORPAY_KEY_ID?.trim();

  if (explicitId && explicitSecret && KEY_ID_PATTERN.test(explicitId)) {
    return { keyId: explicitId, keySecret: explicitSecret };
  }

  for (const candidate of [explicitId, viteId]) {
    if (!candidate) continue;
    if (KEY_ID_PATTERN.test(candidate) && explicitSecret) {
      return { keyId: candidate, keySecret: explicitSecret };
    }
    const split = splitMashedKey(candidate);
    if (split) return split;
  }

  throw new Error('Razorpay keys are missing. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on Vercel.');
}

export function applyCors(req: { headers?: { origin?: string } }, res: { setHeader: (name: string, value: string) => void; status: (code: number) => { end: () => unknown } }, reqMethod?: string) {
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (reqMethod === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function readJsonBody(req: { body?: unknown }) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body as Record<string, unknown>;
}
