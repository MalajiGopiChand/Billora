import React, { useEffect, useRef } from 'react';

export interface Floating3DParticlesProps {
  color?: string;
  particleCount?: number;
  className?: string;
  speed?: number;
  connectDistance?: number;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  phase: number;
  driftSpeed: number;
}

export function Floating3DParticles({
  color = '#60a5fa',
  particleCount = 120,
  className = '',
  speed = 0.0015,
  connectDistance = 65,
}: Floating3DParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 800);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      height = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    };

    window.addEventListener('resize', handleResize);

    // Generate pseudo-3D particles
    const particles: Particle3D[] = [];
    const spread = Math.max(width, height) * 0.9;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread * 0.75,
        z: (Math.random() - 0.5) * spread,
        size: Math.random() * 2.5 + 1.2,
        baseAlpha: Math.random() * 0.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.002 + 0.001,
      });
    }

    let angleX = 0;
    let angleY = 0;
    let time = 0;

    const render = () => {
      time += 0.016;
      angleY += speed;
      angleX = Math.sin(time * 0.5) * 0.15;

      ctx.clearRect(0, 0, width, height);

      const fov = 420;
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Projected particles cache for drawing connecting lines
      const projected: { x2d: number; y2d: number; alpha: number; z: number }[] = [];

      // Sort by depth (z) for realistic depth ordering
      const transformedParticles = particles.map((p) => {
        // Buoyant vertical drift
        const buoyantY = p.y + Math.sin(time * 1.5 + p.phase) * 14;

        // Y-axis rotation
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        // X-axis rotation
        const y2 = buoyantY * cosX - z1 * sinX;
        const z2 = z1 * cosX + buoyantY * sinX;

        return {
          x: x1,
          y: y2,
          z: z2,
          size: p.size,
          baseAlpha: p.baseAlpha,
        };
      });

      transformedParticles.sort((a, b) => b.z - a.z);

      // Render projected 3D points
      for (let i = 0; i < transformedParticles.length; i++) {
        const p = transformedParticles[i];
        const depth = p.z + fov;
        if (depth <= 10) continue;

        const scale = fov / depth;
        const x2d = p.x * scale + width / 2;
        const y2d = p.y * scale + height / 2;
        const radius = Math.max(0.6, p.size * scale);

        // Alpha fade by depth
        const depthFactor = Math.min(Math.max((depth - 100) / (fov * 1.5), 0.15), 1);
        const alpha = p.baseAlpha * depthFactor;

        projected.push({ x2d, y2d, alpha, z: p.z });

        ctx.beginPath();
        ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
        ctx.fillStyle = color.startsWith('#')
          ? hexToRgba(color, alpha)
          : color;
        ctx.fill();
      }

      // Render subtle 3D connecting lines
      if (connectDistance > 0) {
        ctx.lineWidth = 0.75;
        const len = projected.length;
        for (let i = 0; i < len; i++) {
          for (let j = i + 1; j < Math.min(i + 15, len); j++) {
            const dx = projected[i].x2d - projected[j].x2d;
            const dy = projected[i].y2d - projected[j].y2d;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectDistance) {
              const lineAlpha = (1 - dist / connectDistance) * 0.18 * projected[i].alpha;
              ctx.beginPath();
              ctx.moveTo(projected[i].x2d, projected[i].y2d);
              ctx.lineTo(projected[j].x2d, projected[j].y2d);
              ctx.strokeStyle = color.startsWith('#')
                ? hexToRgba(color, lineAlpha)
                : `rgba(255, 255, 255, ${lineAlpha})`;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, particleCount, speed, connectDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}
