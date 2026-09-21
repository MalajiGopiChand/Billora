import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  driftX: number;
  driftY: number;
};

export interface ParticleTextProps {
  text: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: 'hover' | 'load';
  fontSize?: string;
  fontWeight?: number;
  fontFamily?: string;
  glow?: boolean;
  className?: string;
}

export function ParticleText({
  text,
  particleSize = 2,
  density = 4,
  color = '#ffffff',
  highlightColor = '#8b5cf6',
  scatter = 180,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 40,
  repelRadius = 120,
  idleDrift = 0.7,
  trigger = 'hover',
  fontSize = 'clamp(3rem, 12vw, 8rem)',
  fontWeight = 800,
  fontFamily = 'inherit',
  glow = false,
  className,
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let frame = 0;
    let particles: Particle[] = [];
    let revealed = trigger === 'load';
    let revealAt = performance.now();
    let pointer = { x: -9999, y: -9999, active: false };
    let bounds = canvas.getBoundingClientRect();

    const parsedFont = () => {
      const match = fontSize.match(/clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
      if (!match) return Number.parseFloat(fontSize) || 64;
      const min = Number.parseFloat(match[1]);
      const viewport = (Number.parseFloat(match[2]) / 100) * window.innerWidth;
      const max = Number.parseFloat(match[3]);
      return Math.max(min, Math.min(viewport, max));
    };

    const setup = () => {
      bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(bounds.height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const width = bounds.width;
      const height = bounds.height;
      const buffer = document.createElement('canvas');
      buffer.width = Math.max(1, Math.floor(width));
      buffer.height = Math.max(1, Math.floor(height));
      const bufferContext = buffer.getContext('2d', { willReadFrequently: true });
      if (!bufferContext) return;
      const size = Math.min(parsedFont(), width * 0.9);
      bufferContext.clearRect(0, 0, width, height);
      bufferContext.fillStyle = '#fff';
      bufferContext.font = `${fontWeight} ${size}px ${fontFamily}`;
      bufferContext.textAlign = 'center';
      bufferContext.textBaseline = 'middle';
      bufferContext.fillText(text, width / 2, height / 2);
      const image = bufferContext.getImageData(0, 0, buffer.width, buffer.height).data;
      const step = Math.max(2, Math.round(density));
      const next: Particle[] = [];
      for (let y = 0; y < buffer.height; y += step) {
        for (let x = 0; x < buffer.width; x += step) {
          if (image[(y * buffer.width + x) * 4 + 3] > 128) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * scatter;
            next.push({ x: x + Math.cos(angle) * distance, y: y + Math.sin(angle) * distance, homeX: x, homeY: y, driftX: (Math.random() - 0.5) * idleDrift, driftY: (Math.random() - 0.5) * idleDrift });
          }
        }
      }
      particles = next;
    };

    const draw = (time: number) => {
      const progress = revealed ? Math.min(1, (time - revealAt) / gatherDuration) : 0;
      const eased = 1 - Math.pow(1 - progress, 3);
      context.clearRect(0, 0, bounds.width, bounds.height);
      context.fillStyle = color;
      if (glow) { context.shadowBlur = 12; context.shadowColor = highlightColor; }
      particles.forEach((particle, index) => {
        const individualProgress = Math.max(0, Math.min(1, (eased * (gatherDuration + stagger) - (index % Math.max(1, stagger))) / gatherDuration));
        let targetX = particle.x + particle.driftX * Math.sin(time / 750 + index);
        let targetY = particle.y + particle.driftY * Math.cos(time / 800 + index);
        targetX += (particle.homeX - targetX) * individualProgress;
        targetY += (particle.homeY - targetY) * individualProgress;
        if (pointer.active) {
          const dx = targetX - pointer.x;
          const dy = targetY - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < repelRadius) {
            const force = (1 - distance / repelRadius) * pointerRepel;
            targetX += (dx / distance) * force;
            targetY += (dy / distance) * force;
          }
        }
        context.fillStyle = pointer.active && Math.hypot(targetX - pointer.x, targetY - pointer.y) < repelRadius ? highlightColor : color;
        context.fillRect(targetX, targetY, particleSize, particleSize);
      });
      context.shadowBlur = 0;
      frame = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => { pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true }; };
    const handlePointerLeave = () => { pointer.active = false; if (trigger === 'hover') revealed = false; };
    const handlePointerEnter = () => { if (trigger === 'hover') { revealed = true; revealAt = performance.now(); } };
    const observer = new ResizeObserver(setup);
    setup();
    observer.observe(canvas);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener('pointermove', handlePointerMove); canvas.removeEventListener('pointerleave', handlePointerLeave); canvas.removeEventListener('pointerenter', handlePointerEnter); };
  }, [text, particleSize, density, color, highlightColor, scatter, gatherDuration, stagger, pointerRepel, repelRadius, idleDrift, trigger, fontSize, fontWeight, fontFamily, glow]);

  return <canvas ref={canvasRef} className={className} aria-label={text} role="img" />;
}
