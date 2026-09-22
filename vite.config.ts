import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function vercelApiDevPlugin(): Plugin {
  const routes: Record<string, string> = {
    '/api/createOrder': path.resolve(__dirname, 'api/createOrder.ts'),
    '/api/verifyPayment': path.resolve(__dirname, 'api/verifyPayment.ts'),
  };

  const attach = (server: { middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void }; ssrLoadModule: (id: string) => Promise<Record<string, any>> }) => {
    server.middlewares.use(async (req, res, next) => {
      const url = (req.url || '').split('?')[0];
      const file = routes[url];
      if (!file) return next();
      try {
        const raw = await readBody(req);
        const handler = (await server.ssrLoadModule(file)).default;
        let sent = false;
        const fakeRes = {
          statusCode: 200,
          headers: {} as Record<string, string>,
          setHeader(name: string, value: string) { this.headers[name] = value; },
          status(code: number) { this.statusCode = code; return this; },
          json(data: unknown) {
            if (sent) return;
            sent = true;
            res.statusCode = this.statusCode;
            Object.entries(this.headers).forEach(([key, value]) => res.setHeader(key, value));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          },
          end() {
            if (sent) return;
            sent = true;
            res.statusCode = this.statusCode;
            Object.entries(this.headers).forEach(([key, value]) => res.setHeader(key, value));
            res.end();
          },
        };
        await handler({ method: req.method, headers: req.headers, body: raw ? JSON.parse(raw) : {} }, fakeRes);
        if (!sent) fakeRes.status(500).json({ error: 'Payment API did not respond.' });
      } catch (err: any) {
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Payment API failed.', details: err?.message || String(err) }));
        }
      }
    });
  };

  return {
    name: 'vercel-api-dev',
    configureServer(server) { attach(server); },
    configurePreviewServer(server) { attach(server); },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), tailwindcss(), vercelApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
