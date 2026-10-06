'use client';

import { ReactNode } from 'react';

/**
 * Standard premium section heading: eyebrow + title + optional subtitle.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  const alignClasses = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`${alignClasses} max-w-3xl ${className}`}>
      {eyebrow && (
        <p className="font-display text-xs sm:text-sm uppercase tracking-[0.3em] text-emerald-300 mb-4 reveal-up">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1] reveal-up">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed reveal-up">
          {subtitle}
        </p>
      )}
    </div>
  );
}
