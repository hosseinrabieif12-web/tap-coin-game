import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  shape: 'circle' | 'spark' | 'coin';
  rotation: number;
  rotationSpeed: number;
}

interface ParticleCanvasProps {
  triggerCelebration?: boolean;
}

// Global emitter function so any component can trigger particle bursts
type BurstEvent = { x: number; y: number; count?: number; type?: 'tap' | 'celebration' };
const listeners: ((e: BurstEvent) => void)[] = [];

export const triggerParticleBurst = (x: number, y: number, count: number = 12, type: 'tap' | 'celebration' = 'tap') => {
  listeners.forEach((fn) => fn({ x, y, count, type }));
};

export const ParticleCanvas: React.FC<ParticleCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#FDE68A', '#F59E0B', '#FBBF24', '#D97706', '#FEF3C7', '#FFFFFF'];

    const addBurst = ({ x, y, count = 12, type = 'tap' }: BurstEvent) => {
      const isCelebration = type === 'celebration';
      const actualCount = isCelebration ? 80 : count;

      for (let i = 0; i < actualCount; i++) {
        const angle = isCelebration
          ? Math.random() * Math.PI * 2
          : Math.random() * Math.PI * 2;
        const speed = isCelebration ? 4 + Math.random() * 8 : 2 + Math.random() * 5;

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isCelebration ? 4 : 1),
          size: isCelebration ? 3 + Math.random() * 5 : 2 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: isCelebration ? 0.012 + Math.random() * 0.015 : 0.025 + Math.random() * 0.03,
          gravity: isCelebration ? 0.2 : 0.12,
          shape: isCelebration && Math.random() > 0.5 ? 'coin' : Math.random() > 0.6 ? 'spark' : 'circle',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
        });
      }
    };

    listeners.push(addBurst);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'spark') {
          ctx.beginPath();
          ctx.moveTo(-p.size * 1.5, 0);
          ctx.lineTo(p.size * 1.5, 0);
          ctx.moveTo(0, -p.size * 1.5);
          ctx.lineTo(0, p.size * 1.5);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (p.shape === 'coin') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      const idx = listeners.indexOf(addBurst);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden="true"
    />
  );
};
