const KEY_ID_PATTERN = /^rzp_(live|test)_[A-Za-z0-9]{10,20}$/;

function splitMashedKey(value: string) {
  const mashed = value.match(/^(rzp_(?:live|test)_[A-Za-z0-9]{14})([A-Za-z0-9]{20,40})$/);
  if (!mashed) return null;
  return { keyId: mashed[1], keySecret: mashed[2] };
}

export function getRazorpayKeys() {
  return { keyId: 'rzp_live_Tf12rQGvYAALeT', keySecret: 'BF2ltTH0M5dAoKChZe9vnyFX' };
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
