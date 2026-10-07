'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Activity,
  Database,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Filter,
  Terminal,
} from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';

interface DiagnosticCheck {
  name: string;
  status: 'ok' | 'warn' | 'error';
  detail: string;
  latencyMs?: number;
}

interface DiagnosticResult {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  checks: DiagnosticCheck[];
}

interface SystemLog {
  id: string;
  level: string;
  message: string;
  source: string;
  metadata: string | null;
  createdAt: string;
}

export default function MonitoringPage() {
  const { t } = useTranslation();
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');
  const [page, setPage] = useState(1);

  const runDiagnostic = useCallback(async () => {
    setLoading(true);
    setDiagnosticError(null);
    try {
      const res = await fetch('/api/admin/diagnostic', { credentials: 'same-origin' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setDiagnosticError('Session expirée ou non autorisé — Veuillez vous reconnecter');
          return;
        }
        const err = await res.json().catch(() => ({}));
        setDiagnosticError(err.error || `Erreur HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.status && data.checks) {
        setDiagnostic(data);
      } else {
        setDiagnosticError('Réponse inattendue du serveur.');
      }
    } catch (err) {
      setDiagnosticError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (filterLevel) params.set('level', filterLevel);
      if (filterSource) params.set('source', filterSource);
      const res = await fetch(`/api/admin/system-logs?${params}`, { credentials: 'same-origin' });

      if (res.status === 401 || res.status === 403) return;

      const data = await res.json();
      setLogs(data.logs || []);
      setTotalLogs(data.pagination?.total || 0);
    } catch {
      // ignore
    }
  }, [page, filterLevel, filterSource]);

  const purgeLogs = async () => {
    if (!confirm('Supprimer tous les logs de plus de 30 jours ?')) return;
    try {
      const res = await fetch('/api/admin/system-logs', { method: 'DELETE', credentials: 'same-origin' });
      const data = await res.json();
      alert(data.message);
      fetchLogs();
    } catch {
      alert('Erreur lors de la purge');
    }
  };

  useEffect(() => { runDiagnostic(); }, [runDiagnostic]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    let cancelled = false;
    const tick = async () => {
      setRefreshing(true);
      try {
        await Promise.all([runDiagnostic(), fetchLogs()]);
      } catch (err) {
        console.error('Auto-refresh error:', err);
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    };
    // Run immediately on toggle
    tick();
    const interval = setInterval(tick, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [autoRefresh, runDiagnostic, fetchLogs]);

  const statusBadgeClass = (status: string): string => {
    if (status === 'healthy' || status === 'ok') return 'dash-badge dash-badge-success';
    if (status === 'degraded' || status === 'warn') return 'dash-badge dash-badge-warning';
    return 'dash-badge dash-badge-danger';
  };

  const statusLabel = (status: string): string => {
    if (status === 'healthy' || status === 'ok') return 'OK';
    if (status === 'degraded' || status === 'warn') return 'WARN';
    if (status === 'critical' || status === 'error') return 'ERROR';
    return status.toUpperCase();
  };

  const levelBadge: Record<string, string> = {
    info: 'dash-badge dash-badge-info',
    warn: 'dash-badge dash-badge-warning',
    error: 'dash-badge dash-badge-danger',
    fatal: 'dash-badge dash-badge-danger',
  };

  const levelBorder: Record<string, string> = {
    info: 'border-l-[var(--dash-brand)]',
    warn: 'border-l-amber-400',
    error: 'border-l-red-500',
    fatal: 'border-l-red-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[var(--dash-brand)]" />
            Monitoring
          </h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Diagnostic système et logs centralisés</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              autoRefresh
                ? 'btn-brand border-transparent text-white'
                : 'border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)]'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {autoRefresh ? `Auto-refresh ON (30s)` : 'Auto-refresh'}
          </button>
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="btn-emerald btn-magnetic inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Activity className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Analyse...' : 'Lancer diagnostic'}
          </button>
        </div>
      </div>

      {/* Diagnostic Error */}
      {diagnosticError && (
        <div className="dash-card p-5 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">Erreur de diagnostic</p>
          </div>
          <p className="text-sm text-[var(--dash-ink-2)] mt-1">{diagnosticError}</p>
        </div>
      )}

      {/* Diagnostic Result */}
      {diagnostic && (
        <div className="dash-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-[var(--dash-ink)] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--dash-brand)]" />
              Statut système
            </h3>
            <span className={statusBadgeClass(diagnostic.status)}>
              {statusLabel(diagnostic.status)}
            </span>
          </div>
          <div className="space-y-2">
            {diagnostic.checks.map((check, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-[var(--dash-border)] last:border-0 pb-2 last:pb-0">
                <span className="font-medium text-[var(--dash-ink)]">{check.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--dash-muted)]">{check.detail}</span>
                  {typeof check.latencyMs === 'number' && (
                    <span className="text-xs text-[var(--dash-muted-2)] font-mono">
                      {check.latencyMs}ms
                    </span>
                  )}
                  <span className={statusBadgeClass(check.status)}>
                    {statusLabel(check.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--dash-muted-2)] mt-3">
            Dernière vérification : {new Date(diagnostic.timestamp).toLocaleString('fr-FR')}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Logs totaux"
          value={totalLogs}
          subtitle="Enregistrés"
          icon={Database}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Erreurs"
          value={logs.filter(l => l.level === 'error').length}
          subtitle="Cette page"
          icon={XCircle}
          color="rose"
          loading={loading}
        />
        <KpiCard
          label="Fatals"
          value={logs.filter(l => l.level === 'fatal').length}
          subtitle="Cette page"
          icon={AlertTriangle}
          color="rose"
          loading={loading}
        />
        <KpiCard
          label="Info"
          value={logs.filter(l => l.level === 'info').length}
          subtitle="Cette page"
          icon={CheckCircle}
          color="emerald"
          loading={loading}
        />
      </div>

      {/* Logs */}
      <div className="dash-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-[var(--dash-ink)] flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[var(--dash-brand)]" />
            Logs système
          </h3>
          <button
            onClick={purgeLogs}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Purge 30j
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--dash-muted-2)] hidden sm:block" />
            <select
              value={filterLevel}
              onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
              className="text-sm border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--dash-brand)]"
            >
              <option value="">Tous niveaux</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="fatal">Fatal</option>
            </select>
          </div>
          <input
            value={filterSource}
            onChange={(e) => { setFilterSource(e.target.value); setPage(1); }}
            placeholder="Filtrer par source..."
            className="text-sm border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink)] rounded-lg px-3 py-1.5 flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--dash-brand)]"
          />
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-3">
              <Terminal className="w-8 h-8 text-[var(--dash-muted)]" />
            </div>
            <p className="text-[var(--dash-muted)]">Aucun log trouvé</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`border-l-4 ${levelBorder[log.level] || 'border-l-[var(--dash-border)]'} bg-[var(--dash-bg-3)] rounded-r-lg px-3 py-2`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={levelBadge[log.level] || 'dash-badge dash-badge-neutral'}>
                    {log.level}
                  </span>
                  <span className="text-xs text-[var(--dash-muted-2)] font-mono">{log.source}</span>
                  <span className="text-xs text-[var(--dash-muted-2)] ml-auto">
                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <p className="text-sm text-[var(--dash-ink)] mt-0.5">{log.message}</p>
                {log.metadata && (
                  <details className="mt-1">
                    <summary className="text-xs text-[var(--dash-muted-2)] cursor-pointer">Metadata</summary>
                    <pre className="text-xs text-[var(--dash-muted)] bg-[var(--dash-card)] border border-[var(--dash-border)] p-2 mt-1 rounded overflow-x-auto max-h-32">
                      {log.metadata}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--dash-border)]">
          <p className="text-sm text-[var(--dash-muted)]">{totalLogs} logs au total</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Préc.
            </button>
            <span className="px-3 py-1 text-sm font-medium bg-[var(--dash-bg-3)] text-[var(--dash-ink)] rounded-lg">
              Page {page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] transition-colors"
            >
              Suiv.
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
