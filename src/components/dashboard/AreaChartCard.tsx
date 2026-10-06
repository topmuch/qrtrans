'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartCardProps {
  title: string;
  subtitle?: string;
  data: { label: string; value: number }[];
  height?: number;
  /** Show gradient under the area line */
  gradient?: boolean;
  /** Color of the area line (defaults to brand blue) */
  color?: string;
  loading?: boolean;
}

export default function AreaChartCard({
  title,
  subtitle,
  data,
  height = 280,
  gradient = true,
  color = '#1E4B7A',
  loading,
}: AreaChartCardProps) {
  if (loading) {
    return (
      <div className="dash-card p-6">
        <div className="animate-pulse">
          <div className="h-5 w-40 rounded bg-[var(--dash-bg-3)] mb-2" />
          <div className="h-3 w-32 rounded bg-[var(--dash-bg-3)] mb-6" />
          <div className="flex items-end gap-2" style={{ height }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded bg-[var(--dash-bg-3)]"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const gradientId = `area-gradient-${color.replace('#', '')}`;

  return (
    <div className="dash-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--dash-ink)]">{title}</h3>
          {subtitle && <p className="text-sm text-[var(--dash-muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            {gradient && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--dash-border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: 'var(--dash-muted)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--dash-muted)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--dash-card)',
                border: '1px solid var(--dash-border)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(15,23,42,0.1)',
                fontSize: '13px',
                color: 'var(--dash-ink)',
              }}
              labelStyle={{ color: 'var(--dash-muted)', marginBottom: '4px' }}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill={gradient ? `url(#${gradientId})` : 'transparent'}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5, fill: color, stroke: 'var(--dash-card)', strokeWidth: 2 }}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
