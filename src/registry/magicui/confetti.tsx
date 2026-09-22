import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';

export interface ConfettiOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  shapes?: ('square' | 'circle')[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

export interface ConfettiGlobalOptions {
  resize?: boolean;
  useWorker?: boolean;
}

export type ConfettiRef = {
  fire: (options?: ConfettiOptions) => Promise<void> | void;
};

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  color: string;
  shape: 'square' | 'circle';
  angle: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  alpha: number;
  decay: number;
  gravity: number;
  drift: number;
}

const DEFAULT_COLORS = [
  '#26ccff',
  '#a25afd',
  '#ff5e7e',
  '#88ff5a',
  '#fcff42',
  '#ffa62d',
  '#ff36ff',
  '#3b82f6',
  '#10b981',
];

// Singleton canvas for global confetti() calls
let globalCanvas: HTMLCanvasElement | null = null;
let activeAnimations = 0;
let globalParticles: Particle[] = [];

function getOrCreateGlobalCanvas(zIndex = 9999): HTMLCanvasElement {
  if (globalCanvas && document.body.contains(globalCanvas)) {
    globalCanvas.style.zIndex = String(zIndex);
    return globalCanvas;
  }
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = String(zIndex);
  canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
  canvas.height = window.innerHeight * (window.devicePixelRatio || 1);

  const resize = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
  };
  window.addEventListener('resize', resize);

  document.body.appendChild(canvas);
  globalCanvas = canvas;
  return canvas;
}

function spawnParticles(opts: ConfettiOptions = {}, canvasWidth: number, canvasHeight: number): Particle[] {
  const count = opts.particleCount ?? 80;
  const angle = ((opts.angle ?? 90) * Math.PI) / 180;
  const spread = ((opts.spread ?? 60) * Math.PI) / 180;
  const startVelocity = opts.startVelocity ?? 45;
  const decay = opts.decay ?? 0.92;
  const gravity = opts.gravity ?? 1.2;
  const drift = opts.drift ?? 0;
  const colors = opts.colors && opts.colors.length > 0 ? opts.colors : DEFAULT_COLORS;
  const originX = (opts.origin?.x ?? 0.5) * canvasWidth;
  const originY = (opts.origin?.y ?? 0.5) * canvasHeight;
  const scalar = opts.scalar ?? 1;

  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const rad = angle + (Math.random() - 0.5) * spread;
    const vel = startVelocity * (0.5 + Math.random() * 0.9);

    particles.push({
      x: originX,
      y: originY,
      w: (Math.random() * 8 + 6) * scalar,
      h: (Math.random() * 6 + 4) * scalar,
      vx: Math.cos(rad) * vel,
      vy: -Math.abs(Math.sin(rad) * vel),
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.4 ? 'square' : 'circle',
      angle: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.1 + Math.random() * 0.1,
      alpha: 1,
      decay,
      gravity,
      drift,
    });
  }

  return particles;
}

/**
 * Programmatic confetti burst function compatible with canvas-confetti
 */
export async function confetti(options: ConfettiOptions = {}): Promise<void> {
  if (typeof window === 'undefined') return;

  const canvas = getOrCreateGlobalCanvas(options.zIndex ?? 9999);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const newParticles = spawnParticles(options, canvas.width, canvas.height);
  globalParticles.push(...newParticles);

  if (activeAnimations > 0) return;

  activeAnimations++;

  return new Promise<void>((resolve) => {
    function animate() {
      if (!ctx || !canvas) {
        activeAnimations = 0;
        resolve();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = globalParticles.length - 1; i >= 0; i--) {
        const p = globalParticles[i];

        p.vx *= p.decay;
        p.vy *= p.decay;
        p.vy += p.gravity * dpr;
        p.x += p.vx * dpr + p.drift;
        p.y += p.vy * dpr;
        p.alpha -= 0.012;
        p.angle += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        if (p.alpha <= 0 || p.y > canvas.height + 50) {
          globalParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.scale(Math.cos(p.wobble), 1);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, (p.w / 2) * dpr, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect((-p.w / 2) * dpr, (-p.h / 2) * dpr, p.w * dpr, p.h * dpr);
        }

        ctx.restore();
      }

      if (globalParticles.length > 0) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeAnimations = 0;
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

const ConfettiContext = createContext<ConfettiRef | null>(null);

export interface ConfettiProps extends React.ComponentPropsWithRef<'canvas'> {
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  children?: ReactNode;
}

export const Confetti = forwardRef<ConfettiRef, ConfettiProps>((props, ref) => {
  const {
    options,
    manualstart = false,
    children,
    className,
    style,
    ...rest
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const localParticles = useRef<Particle[]>([]);
  const animating = useRef(false);

  const fire = useCallback(
    async (opts: ConfettiOptions = {}) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        await confetti({ ...options, ...opts });
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const mergedOpts = { ...options, ...opts };
      const dpr = window.devicePixelRatio || 1;
      const spawned = spawnParticles(mergedOpts, canvas.width, canvas.height);
      localParticles.current.push(...spawned);

      if (animating.current) return;
      animating.current = true;

      const runLoop = () => {
        if (!ctx || !canvas) {
          animating.current = false;
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = localParticles.current.length - 1; i >= 0; i--) {
          const p = localParticles.current[i];
          p.vx *= p.decay;
          p.vy *= p.decay;
          p.vy += p.gravity * dpr;
          p.x += p.vx * dpr + p.drift;
          p.y += p.vy * dpr;
          p.alpha -= 0.012;
          p.angle += p.rotationSpeed;
          p.wobble += p.wobbleSpeed;

          if (p.alpha <= 0 || p.y > canvas.height + 50) {
            localParticles.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.angle * Math.PI) / 180);
          ctx.scale(Math.cos(p.wobble), 1);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, (p.w / 2) * dpr, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect((-p.w / 2) * dpr, (-p.h / 2) * dpr, p.w * dpr, p.h * dpr);
          }

          ctx.restore();
        }

        if (localParticles.current.length > 0) {
          requestAnimationFrame(runLoop);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          animating.current = false;
        }
      };

      requestAnimationFrame(runLoop);
    },
    [options]
  );

  const api = useMemo<ConfettiRef>(() => ({ fire }), [fire]);
  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
  }, []);

  useEffect(() => {
    if (!manualstart) {
      void fire();
    }
  }, [manualstart, fire]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ pointerEvents: 'none', ...style }}
        {...rest}
      />
      {children}
    </ConfettiContext.Provider>
  );
});

Confetti.displayName = 'Confetti';

export interface ConfettiButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  options?: ConfettiOptions;
}

export const ConfettiButton = forwardRef<HTMLButtonElement, ConfettiButtonProps>(
  ({ options, children, onClick, style, className = '', type = 'button', ...props }, ref) => {
    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      try {
        if (event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          const origin = {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          };

          void confetti({
            zIndex: 99999,
            particleCount: 100,
            spread: 70,
            ...options,
            origin,
          });
        }
        onClick?.(event);
      } catch (error) {
        console.error('Confetti button error:', error);
        onClick?.(event);
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        className={className}
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ConfettiButton.displayName = 'ConfettiButton';

export function ConfettiButtonDemo() {
  return (
    <div className="relative">
      <ConfettiButton>Confetti 🎉</ConfettiButton>
    </div>
  );
}
