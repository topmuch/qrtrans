'use client';

import { useEffect, useRef } from 'react';

/**
 * Subtle particle/star background for hero sections.
 * Lightweight canvas-based animation, respects prefers-reduced-motion.
 */
export default function ParticleBackground({
  density = 80,
  className = '',
  theme = 'light',
}: {
  density?: number;
  className?: string;
  theme?: 'light' | 'dark';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleColor = theme === 'dark' ? '110, 231, 183' : '72, 122, 168';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      twinkle: number;
    };

    let particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Re-seed particles
      const count = Math.min(density, Math.floor((width * height) / 9000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.6 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.twinkle += 0.02;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        const twinkle = (Math.sin(p.twinkle) + 1) / 2;
        const alpha = p.alpha * (0.5 + twinkle * 0.5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${alpha})`;
        ctx.fill();
      }

      // Draw subtle connecting lines between near particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${particleColor}, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    if (prefersReducedMotion) {
      // Render a single frame without animation
      draw();
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(draw);
    }

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
