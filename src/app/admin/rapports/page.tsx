'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Luggage,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Plane,
  UserCheck,
  Phone,
} from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import AreaChartCard from '@/components/dashboard/AreaChartCard';

interface Stats {
  total: number;
  pending_activation: number;
  active: number;
  scanned: number;
  lost: number;
  found: number;
  blocked: number;
  hajj: number;
  voyageur: number;
  withFounder: number;
}

interface DailyStat {
  date: string;
  count: number;
  label: string;
}

interface WeeklyStat {
  week: number;
  count: number;
  label: string;
}

interface FounderBaggage {
  id: string;
  reference: string;
  status: string;
  founderName: string | null;
  founderPhone: string | null;
  founderAt: string | null;
  travelerName: string;
  agencyName: string;
  lastScanDate: string | null;
}

interface ReportData {
  stats: Stats;
  recoveryRate: number;
  dailyStats: DailyStat[];
  weeklyStats: WeeklyStat[];
  scanLogsCount: number;
  period: string;
  founderBaggages: FounderBaggage[];
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}&founders=true`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv') => {
    window.open(`/api/reports/export?period=${period}`, '_blank');
  };

  // Calculate max for chart
  const maxDaily = data?.dailyStats ? Math.max(...data.dailyStats.map(d => d.count), 1) : 1;
  const maxWeekly = data?.weeklyStats ? Math.max(...data.weeklyStats.map(d => d.count), 1) : 1;

  // Map stats to chart-friendly data for AreaChartCard
  const dailyChartData = (data?.dailyStats || []).map(d => ({ label: d.label, value: d.count }));
  const weeklyChartData = (data?.weeklyStats || []).map(w => ({ label: w.label, value: w.count }));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">Rapports</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Statistiques et analyses de l&apos;activité</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-lg text-[var(--dash-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dash-brand)]"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>

          {/* Export Button */}
          <button
            onClick={() => handleExport('csv')}
            className="btn-emerald btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total colis"
              value={data.stats.total}
              subtitle="Tous statuts confondus"
              icon={Luggage}
              color="brand"
            />
            <KpiCard
              label="Colis actifs"
              value={data.stats.active}
              subtitle="En service"
              icon={CheckCircle}
              color="emerald"
            />
            <KpiCard
              label="Colis scannés"
              value={data.stats.scanned}
              subtitle="Au moins un scan"
              icon={QrCode}
              color="amber"
            />
            <KpiCard
              label="Colis perdus"
              value={data.stats.lost}
              subtitle="À retrouver"
              icon={AlertTriangle}
              color="rose"
            />
          </div>

          {/* Charts Row — using AreaChartCard */}
          <div className="grid lg:grid-cols-2 gap-6">
            <AreaChartCard
              title="Évolution quotidienne"
              subtitle="Création de colis par jour"
              data={dailyChartData}
              color="#1E4B7A"
              loading={loading}
            />
            <AreaChartCard
              title="Évolution hebdomadaire"
              subtitle="Création de colis par semaine"
              data={weeklyChartData}
              color="#10B981"
              loading={loading}
            />
          </div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <div className="dash-card p-6">
              <h3 className="font-display text-lg font-bold text-[var(--dash-ink)] mb-4">Répartition par statut</h3>
              <div className="space-y-3">
                <StatusRow label="En attente" count={data.stats.pending_activation} total={data.stats.total} color="amber" />
                <StatusRow label="Actifs" count={data.stats.active} total={data.stats.total} color="emerald" />
                <StatusRow label="Scannés" count={data.stats.scanned} total={data.stats.total} color="brand" />
                <StatusRow label="Perdus" count={data.stats.lost} total={data.stats.total} color="rose" />
                <StatusRow label="Retrouvés" count={data.stats.found} total={data.stats.total} color="emerald" />
                <StatusRow label="Bloqués" count={data.stats.blocked} total={data.stats.total} color="neutral" />
              </div>
            </div>

            {/* Type Distribution */}
            <div className="dash-card p-6">
              <h3 className="font-display text-lg font-bold text-[var(--dash-ink)] mb-4">Par type</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-[var(--dash-emerald-soft)] rounded-xl">
                  <div className="w-12 h-12 bg-[var(--dash-emerald)]/20 rounded-xl flex items-center justify-center">
                    <Plane className="w-6 h-6 text-[var(--dash-emerald)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--dash-muted)] text-sm">Hajj</p>
                    <p className="text-2xl font-bold text-[var(--dash-ink)]">{data.stats.hajj}</p>
                  </div>
                  <span className="text-sm text-[var(--dash-emerald)] font-medium">
                    {data.stats.total > 0 ? Math.round((data.stats.hajj / data.stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Luggage className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--dash-muted)] text-sm">Voyageur</p>
                    <p className="text-2xl font-bold text-[var(--dash-ink)]">{data.stats.voyageur}</p>
                  </div>
                  <span className="text-sm text-amber-500 font-medium">
                    {data.stats.total > 0 ? Math.round((data.stats.voyageur / data.stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="dash-card p-6">
              <h3 className="font-display text-lg font-bold text-[var(--dash-ink)] mb-4">Indicateurs clés</h3>
              <div className="space-y-4">
                <div className="p-4 bg-[var(--dash-bg-3)] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--dash-muted)] text-sm">Taux de récupération</span>
                    <CheckCircle className="w-4 h-4 text-[var(--dash-emerald)]" />
                  </div>
                  <p className="text-3xl font-bold text-[var(--dash-emerald)]">{data.recoveryRate}%</p>
                  <p className="text-xs text-[var(--dash-muted-2)] mt-1">Colis retrouvés / perdus</p>
                </div>
                <div className="p-4 bg-[var(--dash-bg-3)] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--dash-muted)] text-sm">Scans enregistrés</span>
                    <QrCode className="w-4 h-4 text-[var(--dash-brand)]" />
                  </div>
                  <p className="text-3xl font-bold text-[var(--dash-brand)]">{data.scanLogsCount}</p>
                  <p className="text-xs text-[var(--dash-muted-2)] mt-1">Total sur la période</p>
                </div>
                <div className="p-4 bg-[var(--dash-bg-3)] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--dash-muted)] text-sm">Avec trouveur</span>
                    <UserCheck className="w-4 h-4 text-[var(--dash-emerald)]" />
                  </div>
                  <p className="text-3xl font-bold text-[var(--dash-emerald)]">{data.stats.withFounder || 0}</p>
                  <p className="text-xs text-[var(--dash-muted-2)] mt-1">Infos trouveur enregistrées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Founders Waiting Section */}
          {data.founderBaggages && data.founderBaggages.length > 0 && (
            <div className="dash-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[var(--dash-ink)]">Trouveurs en attente</h3>
                    <p className="text-sm text-[var(--dash-muted)]">Colis trouvés par un trouveur, en attente de confirmation</p>
                  </div>
                </div>
                <span className="dash-badge dash-badge-warning">
                  {data.founderBaggages.length} en attente
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.founderBaggages.map((baggage) => (
                  <div
                    key={baggage.id}
                    className="dash-card p-5"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-semibold text-[var(--dash-ink)] text-sm">{baggage.reference}</span>
                      {baggage.founderAt && (
                        <span className="text-xs text-[var(--dash-muted-2)]">
                          {new Date(baggage.founderAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
                        <span className="text-[var(--dash-muted-2)] w-16 shrink-0 text-xs">Voyageur</span>
                        <span className="truncate">{baggage.travelerName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--dash-ink)]">
                        <UserCheck className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="font-medium text-sm">{baggage.founderName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
                        <span className="text-[var(--dash-muted-2)] w-16 shrink-0 text-xs">Agence</span>
                        <span className="truncate">{baggage.agencyName}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[var(--dash-border)]">
                      {baggage.founderPhone && (
                        <a
                          href={`https://wa.me/${baggage.founderPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--dash-emerald)] hover:opacity-90 text-white rounded-lg text-xs font-medium transition-opacity"
                        >
                          <Phone className="w-3 h-3" />
                          WhatsApp
                        </a>
                      )}
                      <Link
                        href={`/admin/baggage/${baggage.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--dash-bg-3)] hover:bg-[var(--dash-border)] text-[var(--dash-ink-2)] rounded-lg text-xs font-medium transition-colors"
                      >
                        Détails
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-[var(--dash-muted)]">
          Aucune donnée disponible
        </div>
      )}
    </div>
  );
}

// Status Row Component
function StatusRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-500',
    emerald: 'bg-[var(--dash-emerald)]',
    brand: 'bg-[var(--dash-brand)]',
    rose: 'bg-red-500',
    neutral: 'bg-[var(--dash-muted-2)]',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--dash-muted)] w-24">{label}</span>
      <div className="flex-1 h-2 bg-[var(--dash-bg-3)] rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-[var(--dash-ink)] w-8 text-right">{count}</span>
    </div>
  );
}
