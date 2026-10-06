'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  /** Color theme for the icon tile */
  color?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';
  /** Delta percentage vs previous period (e.g. +12.5 or -3.2) */
  delta?: number;
  /** Sparkline data points (array of numbers, last ~12) */
  sparkline?: number[];
  /** Loading state */
  loading?: boolean;
}

const COLOR_TILES: Record<string, string> = {
  brand: 'from-[#1E4B7A] to-[#487AA8]',
  emerald: 'from-[#10B981] to-[#34D399]',
  amber: 'from-[#F59E0B] to-[#FBBF24]',
  rose: 'from-[#EF4444] to-[#F87171]',
  violet: 'from-[#8B5CF6] to-[#A78BFA]',
  cyan: 'from-[#06B6D4] to-[#22D3EE]',
};

export default function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = 'brand',
  delta,
  sparkline,
  loading,
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="dash-kpi animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--dash-bg-3)]" />
          <div className="w-12 h-4 rounded bg-[var(--dash-bg-3)]" />
        </div>
        <div className="w-20 h-8 rounded bg-[var(--dash-bg-3)] mb-2" />
        <div className="w-16 h-3 rounded bg-[var(--dash-bg-3)]" />
      </div>
    );
  }

  // Normalize sparkline data (fill with zeros if too short)
  const data = sparkline && sparkline.length > 0 ? sparkline : [0];
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const isPositiveDelta = delta !== undefined && delta >= 0;

  return (
    <div className="dash-kpi group">
      {/* Top row: icon + delta badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLOR_TILES[color]} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {delta !== undefined && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              isPositiveDelta
                ? 'bg-[var(--dash-emerald-soft)] text-[var(--dash-emerald)]'
                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {isPositiveDelta ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositiveDelta ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Value + label */}
      <p className="text-2xl font-bold text-[var(--dash-ink)] tabular-nums">
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
      </p>
      <p className="text-sm text-[var(--dash-muted)] mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-[var(--dash-muted-2)] mt-1">{subtitle}</p>}

      {/* Sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="flex items-end gap-[3px] h-8 mt-3">
          {sparkline.map((v, i) => {
            const heightPct = ((v - min) / range) * 100;
            const isLast = i === sparkline.length - 1;
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-all duration-300 ${
                  isLast
                    ? isPositiveDelta
                      ? 'bg-[var(--dash-emerald)]'
                      : 'bg-red-400'
                    : 'bg-[var(--dash-brand-2)] opacity-30 group-hover:opacity-50'
                }`}
                style={{ height: `${Math.max(heightPct, 5)}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
