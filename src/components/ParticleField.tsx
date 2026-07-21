'use client';

import { useRef, useEffect, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  isStar: boolean;
}

interface ParticleFieldProps {
  className?: string;
}

export default function ParticleField({ className }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const [particles] = useState<Particle[]>(() => {
    const count = 80 + Math.floor(Math.random() * 20);
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const isStar = Math.random() < 0.12;
      arr.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.05,
        vy: -(0.1 + Math.random() * 0.2),
        size: isStar ? 2 + Math.random() * 1 : 1 + Math.random() * 1,
        opacity: isStar ? 0.2 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2,
        color: Math.random() < 0.25 ? '#64d2ff' : '#ffffff',
        isStar,
      });
    }
    return arr;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;
    }

    resize();
    window.addEventListener('resize', resize);

    const maxDist = 120;

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx / w;
        p.y += p.vy / h;

        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;

        const px = p.x * w;
        const py = p.y * h;

        ctx!.beginPath();
        ctx!.arc(px, py, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.opacity;
        ctx!.fill();

        if (p.isStar) {
          ctx!.beginPath();
          ctx!.arc(px, py, p.size * 1.5, 0, Math.PI * 2);
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = p.opacity * 0.2;
          ctx!.fill();
        }
      }

      ctx!.globalAlpha = 1;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = 0.08 * (1 - dist / maxDist);
            ctx!.beginPath();
            ctx!.moveTo(a.x * w, a.y * h);
            ctx!.lineTo(b.x * w, b.y * h);
            ctx!.strokeStyle = `rgba(100,210,255,${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [particles]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
