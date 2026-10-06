'use client';

import { useEffect, useRef } from 'react';

/**
 * Aurora blobs — animated gradient orbs for premium backgrounds.
 * Use behind sections for an ambient, aurora-like glow.
 */
export default function AuroraBackground({
  className = '',
  theme = 'light',
}: {
  className?: string;
  theme?: 'light' | 'dark';
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      container.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Theme-driven blob colors
  const blob1 = theme === 'dark'
    ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent 70%)'
    : 'radial-gradient(circle, rgba(72, 122, 168, 0.35), transparent 70%)';
  const blob2 = theme === 'dark'
    ? 'radial-gradient(circle, rgba(59, 107, 217, 0.4), transparent 70%)'
    : 'radial-gradient(circle, rgba(30, 75, 122, 0.30), transparent 70%)';
  const blob3 = theme === 'dark'
    ? 'radial-gradient(circle, rgba(217, 175, 55, 0.18), transparent 70%)'
    : 'radial-gradient(circle, rgba(16, 185, 129, 0.18), transparent 70%)';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div
        className="aurora-blob"
        style={{
          top: '-20%',
          left: '10%',
          width: '40vw',
          height: '40vw',
          background: blob1,
          animationDelay: '0s',
        }}
      />
      <div
        className="aurora-blob"
        style={{
          top: '10%',
          right: '-5%',
          width: '35vw',
          height: '35vw',
          background: blob2,
          animationDelay: '-7s',
        }}
      />
      <div
        className="aurora-blob"
        style={{
          bottom: '-15%',
          left: '30%',
          width: '45vw',
          height: '45vw',
          background: blob3,
          animationDelay: '-14s',
        }}
      />
    </div>
  );
}
