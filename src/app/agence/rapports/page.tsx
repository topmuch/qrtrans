'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Luggage,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  QrCode,
  Plane,
  Share2,
  Calendar,
  Globe,
} from 'lucide-react';
import { useAgency } from '../layout';
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

interface ReportData {
  stats: Stats;
  recoveryRate: number;
  dailyStats: DailyStat[];
  weeklyStats: WeeklyStat[];
  scanLogsCount: number;
  period: string;
}

export default function AgencyReportsPage() {
  const { agencyId, agencyName, agencyData } = useAgency();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchReports();
  }, [period, agencyId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}&agencyId=${agencyId}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    window.open(`/api/reports/export?agencyId=${agencyId}&period=${period}`, '_blank');
  };

  const handleSharePublicPage = () => {
    const slug = agencyData?.slug || 'agency';
    const url = `${window.location.origin}/agency/${slug}`;
    navigator.clipboard.writeText(url);
    alert(`Lien copié ! ${url}`);
  };

  const dailyChartData = (data?.dailyStats || []).map(d => ({ label: d.label, value: d.count }));
  const weeklyChartData = (data?.weeklyStats || []).map(w => ({ label: w.label, value: w.count }));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[var(--dash-brand)]" />
            Rapports
          </h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Statistiques de {agencyName}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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

          {/* Share Public Page */}
          <button
            onClick={handleSharePublicPage}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
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
              label="Actifs"
              value={data.stats.active}
              subtitle="En service"
              icon={CheckCircle}
              color="emerald"
            />
            <KpiCard
              label="Scannés"
              value={data.stats.scanned}
              subtitle="Au moins un scan"
              icon={QrCode}
              color="amber"
            />
            <KpiCard
              label="Perdus"
              value={data.stats.lost}
              subtitle="À retrouver"
              icon={AlertTriangle}
              color="rose"
            />
          </div>

          {/* Charts Row */}
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
              </div>
            </div>
          </div>

          {/* Public Page Info */}
          <div className="dash-card p-6 border-l-4 border-l-[var(--dash-brand)]">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-12 h-12 bg-[var(--dash-brand-soft)] rounded-xl flex items-center justify-center">
                <Share2 className="w-6 h-6 text-[var(--dash-brand)]" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h3 className="font-display text-lg font-semibold text-[var(--dash-ink)] mb-2">
                  Page publique de votre agence
                </h3>
                <p className="text-[var(--dash-muted)] text-sm mb-3">
                  Partagez ce lien avec vos clients pour leur montrer les colis que vous protégez :
                </p>
                <code className="bg-[var(--dash-bg-3)] px-3 py-1.5 rounded-lg text-sm text-[var(--dash-brand)] border border-[var(--dash-border)] break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/agency/{agencyData?.slug || 'agency'}
                </code>
              </div>
              <button
                onClick={handleSharePublicPage}
                className="btn-brand btn-magnetic px-4 py-2 rounded-lg text-sm font-medium"
              >
                Copier le lien
              </button>
            </div>
          </div>
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
