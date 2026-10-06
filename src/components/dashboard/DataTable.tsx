'use client';

import { LucideIcon } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  emptyMessage = 'Aucune donnée',
  emptyIcon: EmptyIcon,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="dash-card overflow-hidden">
        <div className="animate-pulse">
          <div className="h-11 bg-[var(--dash-bg-3)]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b border-[var(--dash-border)] flex items-center px-4 gap-4">
              {columns.map((_, j) => (
                <div key={j} className="h-4 flex-1 rounded bg-[var(--dash-bg-3)]" style={{ maxWidth: `${100 / columns.length}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="dash-card p-12 text-center">
        {EmptyIcon && (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <EmptyIcon className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
        )}
        <p className="text-sm text-[var(--dash-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="dash-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="dash-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={col.className || ''}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={col.className || ''}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.render ? col.render(row) : row[col.key as keyof T]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
