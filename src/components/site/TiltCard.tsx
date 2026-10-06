'use client';

import { ReactNode, useRef, useState } from 'react';

/**
 * Glass card with optional 3D tilt effect on mouse move.
 */
export default function TiltCard({
  children,
  className = '',
  tilt = true,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: boolean; // emerald glow at the hovered corner
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 10;
    const rotateX = -(y - 0.5) * 10;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`);
    setGlowPos({ x: x * 100, y: y * 100 });
  };

  const handleLeave = () => {
    setTransform('');
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`glass-card p-6 sm:p-8 ${tilt ? 'tilt-card' : ''} ${className}`}
      style={{
        transform,
        transition: transform ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {glow && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(16, 185, 129, 0.18), transparent 50%)`,
          }}
        />
      )}
      <div className={tilt ? 'tilt-card-inner' : ''}>{children}</div>
    </div>
  );
}
