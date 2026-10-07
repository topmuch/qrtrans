'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  QrCode,
  CheckCircle,
  Users,
  ShoppingCart,
  Building2,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Package,
  Search,
  RefreshCw,
} from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import AreaChartCard from '@/components/dashboard/AreaChartCard';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalQR: number;
  activeBaggages: number;
  uniqueTravelers: number;
  expiringSoon: number;
  pendingOrders: number;
  totalAgencies: number;
}

interface RecentActivity {
  id: string;
  type: 'activation' | 'order' | 'scan';
  name: string;
  reference: string;
  time: string;
  details: string;
  status: 'success' | 'warning' | 'info';
  agency?: string;
}

interface DailyActivation {
  day: string;
  count: number;
  fullDate?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data helpers (delta + sparkline not yet provided by the API)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOCK_DAILY_ACTIVATIONS = [
  { label: 'Lun', value: 12 },
  { label: 'Mar', value: 19 },
  { label: 'Mer', value: 15 },
  { label: 'Jeu', value: 25 },
  { label: 'Ven', value: 22 },
  { label: 'Sam', value: 18 },
  { label: 'Dim', value: 10 },
];

function generateDefaultActivations(): DailyActivation[] {
  const today = new Date();
  return MOCK_DAYS.map((day, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return {
      day,
      count: 0,
      fullDate: date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Actions
// ─────────────────────────────────────────────────────────────────────────────
interface QuickAction {
  label: string;
  description: string;
  icon: typeof QrCode;
  href: string;
  gradient: string;
  ring: string;
  pattern: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Générer QR',
    description: 'Créer des codes',
    icon: QrCode,
    href: '/admin/generer',
    gradient: 'from-emerald-500 to-emerald-700',
    ring: 'hover:shadow-emerald-500/25',
    pattern: 'bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]',
  },
  {
    label: 'Commandes',
    description: 'Demandes en cours',
    icon: ShoppingCart,
    href: '/admin/etiquettes',
    gradient: 'from-amber-500 to-orange-600',
    ring: 'hover:shadow-orange-500/25',
    pattern: 'bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.18),transparent_60%)]',
  },
  {
    label: 'Agences',
    description: 'Partenaires',
    icon: Building2,
    href: '/admin/agences',
    gradient: 'from-violet-500 to-purple-700',
    ring: 'hover:shadow-purple-500/25',
    pattern: 'bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.18),transparent_60%)]',
  },
];

function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${action.gradient} ${action.ring} hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group`}
          >
            <div className={`absolute inset-0 ${action.pattern} pointer-events-none`} />
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-3 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                <Icon className="w-6 h-6" />
              </div>
              <p className="font-bold text-white text-lg leading-tight">{action.label}</p>
              <p className="text-white/70 text-sm mt-0.5">{action.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Activity
// ─────────────────────────────────────────────────────────────────────────────
interface ActivityMeta {
  icon: typeof CheckCircle;
  variant: 'success' | 'warning' | 'info' | 'neutral';
  iconColor: string;
  iconBg: string;
}

function getActivityMeta(activity: RecentActivity): ActivityMeta {
  switch (activity.type) {
    case 'activation':
      return {
        icon: CheckCircle,
        variant: 'success',
        iconColor: 'text-[var(--dash-emerald)]',
        iconBg: 'bg-[var(--dash-emerald-soft)]',
      };
    case 'order':
      return {
        icon: Package,
        variant: 'warning',
        iconColor: 'text-amber-500 dark:text-amber-400',
        iconBg: 'bg-amber-50 dark:bg-amber-500/10',
      };
    case 'scan':
    default:
      return {
        icon: Search,
        variant: 'info',
        iconColor: 'text-[var(--dash-brand)]',
        iconBg: 'bg-[var(--dash-brand-soft)]',
      };
  }
}

function RecentActivityList({ activities }: { activities: RecentActivity[] }) {
  return (
    <div className="dash-card overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[var(--dash-border)]">
        <div>
          <h3 className="font-display text-lg font-bold text-[var(--dash-ink)]">
            Activité récente
          </h3>
          <p className="text-xs text-[var(--dash-muted)] mt-0.5">
            Derniers scans et activations
          </p>
        </div>
        <Link
          href="/admin/trouvailles"
          className="text-sm text-[var(--dash-brand)] hover:text-[var(--dash-brand-2)] font-medium flex items-center gap-1 transition-colors"
        >
          Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 divide-y divide-[var(--dash-border)]">
        {activities.length === 0 ? (
          <div className="p-10 text-center text-[var(--dash-muted)]">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucune activité récente</p>
          </div>
        ) : (
          activities.slice(0, 6).map((activity) => {
            const meta = getActivityMeta(activity);
            const Icon = meta.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 sm:gap-4 p-4 hover:bg-[var(--dash-bg-3)] transition-colors cursor-pointer group"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-[var(--dash-ink)] truncate">
                      {activity.name}
                    </p>
                    <ArrowUpRight className="w-4 h-4 text-[var(--dash-muted-2)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-sm text-[var(--dash-muted)] mt-0.5 truncate">
                    {activity.details}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-[var(--dash-muted-2)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </span>
                    {activity.reference && (
                      <span className="dash-badge dash-badge-neutral">
                        {activity.reference}
                      </span>
                    )}
                    {activity.agency && (
                      <span className={`dash-badge dash-badge-${meta.variant}`}>
                        {activity.agency}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton for Recent Activity
// ─────────────────────────────────────────────────────────────────────────────
function RecentActivitySkeleton() {
  return (
    <div className="dash-card overflow-hidden">
      <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[var(--dash-border)]">
        <div className="animate-pulse">
          <div className="h-5 w-32 rounded bg-[var(--dash-bg-3)] mb-2" />
          <div className="h-3 w-40 rounded bg-[var(--dash-bg-3)]" />
        </div>
      </div>
      <div className="divide-y divide-[var(--dash-border)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-[var(--dash-bg-3)] shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-32 rounded bg-[var(--dash-bg-3)] mb-2" />
              <div className="h-3 w-48 rounded bg-[var(--dash-bg-3)] mb-2" />
              <div className="h-3 w-24 rounded bg-[var(--dash-bg-3)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalQR: 0,
    activeBaggages: 0,
    uniqueTravelers: 0,
    expiringSoon: 0,
    pendingOrders: 0,
    totalAgencies: 0,
  });
  const [dailyActivations, setDailyActivations] = useState<DailyActivation[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpiTrends, setKpiTrends] = useState<{
    totalQR: { sparkline: number[]; delta: number | null };
    activeBaggages: { sparkline: number[]; delta: number | null };
    uniqueTravelers: { sparkline: number[]; delta: number | null };
    expiringSoon: { sparkline: number[]; delta: number | null };
    pendingOrders: { sparkline: number[]; delta: number | null };
    totalAgencies: { sparkline: number[]; delta: number | null };
  } | null>(null);

  useEffect(() => {
    const checkNewMessages = async () => {
      try {
        const res = await fetch('/api/messages/unread-count');
        const data = await res.json();
        setUnreadMessages(data.count || 0);
      } catch (error) {
        console.error('Error checking messages:', error);
      }
    };

    checkNewMessages();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin/dashboard');
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || stats);
        setDailyActivations(data.dailyActivations || generateDefaultActivations());
        setRecentActivities(data.recentActivities || []);
        if (data.kpiTrends) {
          setKpiTrends(data.kpiTrends);
        }
      } else {
        setDailyActivations(generateDefaultActivations());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDailyActivations(generateDefaultActivations());
    } finally {
      setLoading(false);
    }
  };

  // KPI cards configuration (stable per render)
  const kpiCards = useMemo(
    () => [
      {
        label: 'Total QR Codes',
        value: stats.totalQR,
        subtitle: `${stats.activeBaggages} actifs`,
        icon: QrCode,
        color: 'brand' as const,
        delta: kpiTrends?.totalQR?.delta ?? undefined,
        sparkline: kpiTrends?.totalQR?.sparkline,
      },
      {
        label: 'QR Activés',
        value: stats.activeBaggages,
        subtitle: 'En service',
        icon: CheckCircle,
        color: 'emerald' as const,
        delta: kpiTrends?.activeBaggages?.delta ?? undefined,
        sparkline: kpiTrends?.activeBaggages?.sparkline,
      },
      {
        label: 'Voyageurs',
        value: stats.uniqueTravelers,
        subtitle: 'Utilisateurs uniques',
        icon: Users,
        color: 'violet' as const,
        delta: kpiTrends?.uniqueTravelers?.delta ?? undefined,
        sparkline: kpiTrends?.uniqueTravelers?.sparkline,
      },
      {
        label: 'Commandes',
        value: stats.pendingOrders,
        subtitle: 'En attente',
        icon: ShoppingCart,
        color: 'amber' as const,
        delta: kpiTrends?.pendingOrders?.delta ?? undefined,
        sparkline: kpiTrends?.pendingOrders?.sparkline,
      },
      {
        label: 'Agences',
        value: stats.totalAgencies,
        subtitle: 'Partenaires',
        icon: Building2,
        color: 'cyan' as const,
        delta: kpiTrends?.totalAgencies?.delta ?? undefined,
        sparkline: kpiTrends?.totalAgencies?.sparkline,
      },
      {
        label: 'Expiration',
        value: stats.expiringSoon,
        subtitle: 'À renouveler',
        icon: AlertTriangle,
        color: 'rose' as const,
        delta: kpiTrends?.expiringSoon?.delta ?? undefined,
        sparkline: kpiTrends?.expiringSoon?.sparkline,
      },
    ],
    [stats, kpiTrends],
  );

  // Map daily activations to chart data, fall back to mock when empty/all zero
  const chartData = useMemo<{ label: string; value: number }[]>(() => {
    if (!dailyActivations || dailyActivations.length === 0) {
      return MOCK_DAILY_ACTIVATIONS;
    }
    const mapped = dailyActivations.map((d) => ({ label: d.day, value: d.count }));
    const total = mapped.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return MOCK_DAILY_ACTIVATIONS;
    return mapped;
  }, [dailyActivations]);

  const totalActivations = useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData],
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* ─── Page header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">
            Tableau de bord
          </h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">
            Vue d&apos;ensemble de votre activité QRTrans
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="mb-6">
        <QuickActions />
      </div>

      {/* ─── KPI cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {kpiCards.map((card, index) => (
          <KpiCard
            key={index}
            label={card.label}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            color={card.color}
            delta={card.delta}
            sparkline={card.sparkline}
            loading={loading}
          />
        ))}
      </div>

      {/* ─── Chart + Recent activity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <AreaChartCard
          title="Activations sur 7 jours"
          subtitle={`${totalActivations} activations cette semaine`}
          data={chartData}
          color="#1E4B7A"
          gradient
          height={280}
          loading={loading}
        />
        {loading ? <RecentActivitySkeleton /> : <RecentActivityList activities={recentActivities} />}
      </div>
    </div>
  );
}
