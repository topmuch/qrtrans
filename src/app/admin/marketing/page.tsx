'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRequireAuth } from '@/contexts/AuthContext';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  ShieldCheck,
  ShieldX,
  TrendingUp,
  Search,
  RefreshCw,
  MessageCircle,
  Mail,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Luggage,
  Plane,
  Train,
  Ship,
  Bus,
  MapPin,
  Clock,
  Building2,
  Phone,
  CalendarDays,
  Filter,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

/* ══════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════ */
interface TravelerBaggage {
  reference: string;
  type: string;
  baggageType: string;
  status: string;
  expiresAt: string | null;
  // TRANSPORT-FEATURE: Transport mode + conditional fields
  transportMode?: string;
  flightNumber: string | null;
  trainNumber?: string | null;
  shipName?: string | null;
  busLineNumber?: string | null;
  destination: string | null;
  agencyName: string | null;
}

interface Traveler {
  name: string;
  whatsapp: string | null;
  email: string | null;
  registeredAt: string;
  expirationDate: string | null;
  status: 'active' | 'expired' | 'pending';
  baggages: TravelerBaggage[];
  totalBaggages: number;
}

interface MarketingStats {
  totalUsers: number;
  activeBaggages: number;
  expiredBaggages: number;
  renewalRate: number;
}

interface MarketingData {
  stats: MarketingStats;
  travelers: Traveler[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/* ══════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════ */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

function getMailtoUrl(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildRenewalMessage(name: string, reference: string, expiryDate: string): string {
  return `Bonjour ${name}, votre colis QRTrans (${reference}) arrive à expiration le ${expiryDate}. Souhaitez-vous le renouveler pour 7€ ?`;
}

function statusBadgeClass(status: string): string {
  if (status === 'active') return 'dash-badge dash-badge-success';
  if (status === 'expired') return 'dash-badge dash-badge-danger';
  return 'dash-badge dash-badge-warning';
}

function statusBadgeLabel(status: string): string {
  if (status === 'active') return 'Actif';
  if (status === 'expired') return 'Expiré';
  return 'En attente';
}

/* ══════════════════════════════════════════════
   Main Page Component
   ══════════════════════════════════════════════ */
export default function MarketingPage() {
  const { loading: authLoading } = useRequireAuth(['superadmin']);
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Detail modal
  const [selectedTraveler, setSelectedTraveler] = useState<Traveler | null>(null);

  /* ─── Fetch Data ─── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        filter,
        search,
        page: String(page),
        limit: String(limit),
      });
      const result = await fetchWithAuth<MarketingData>(`/api/admin/marketing?${params}`);
      if (!result.ok || !result.data) {
        setError(result.error || 'Erreur lors du chargement');
        return;
      }
      setData(result.data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page on filter/search change
  useEffect(() => { setPage(1); }, [filter, search]);

  /* ─── Export CSV ─── */
  const statusLabel = (status: string) =>
    status === 'active' ? 'Actif' : status === 'expired' ? 'Expiré' : 'En attente';

  const exportCSV = useCallback(() => {
    if (!data) return;
    const rows = data.travelers.map((t) => [
      t.name,
      t.email || '',
      t.whatsapp || '',
      formatDate(t.registeredAt),
      statusLabel(t.status),
      t.expirationDate ? formatDate(t.expirationDate) : 'N/A',
      t.totalBaggages,
      t.baggages.map((b) => b.reference).join('; '),
      t.baggages.map((b) => b.agencyName || '').filter(Boolean).join('; '),
    ]);

    const header = ['Nom', 'Email', 'WhatsApp', 'Date inscription', 'Statut', 'Date expiration', 'Nb colis', 'Références', 'Agences'];
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrtrans-marketing-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  /* ─── Search Submit ─── */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  /* ══════════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[var(--dash-emerald)]" />
            Marketing &amp; Relances
          </h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">
            Gérez les utilisateurs et relances de renouvellement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={exportCSV}
            className="btn-emerald btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            disabled={!data || data.pagination.total === 0}
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* ─── Error Banner ─── */}
      {error && (
        <div className="mb-6 bg-[var(--dash-bg-3)] border border-[var(--dash-badge-danger)] text-[var(--dash-ink-2)] px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total utilisateurs"
          value={data?.stats.totalUsers ?? '—'}
          subtitle="Tous statuts confondus"
          icon={Users}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Colis actifs"
          value={data?.stats.activeBaggages ?? '—'}
          subtitle="En service"
          icon={ShieldCheck}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="Colis expirés"
          value={data?.stats.expiredBaggages ?? '—'}
          subtitle="À relancer"
          icon={ShieldX}
          color="rose"
          loading={loading}
        />
        <KpiCard
          label="Taux de renouvellement"
          value={`${data?.stats.renewalRate ?? '—'}%`}
          subtitle="Conversion"
          icon={TrendingUp}
          color="amber"
          loading={loading}
        />
      </div>

      {/* ─── Filters Bar ─── */}
      <div className="dash-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[var(--dash-muted-2)] hidden sm:block" />
            {(['all', 'active', 'expired', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-[var(--dash-brand)] text-white'
                    : 'bg-[var(--dash-bg-3)] text-[var(--dash-muted)] hover:bg-[var(--dash-border)]'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : f === 'expired' ? 'Expirés' : 'En attente'}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dash-muted-2)]" />
              <Input
                placeholder="Rechercher par nom, email, réf..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-[var(--dash-bg-3)] border-[var(--dash-border)] text-[var(--dash-ink)] rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] transition-colors"
            >
              Rechercher
            </button>
          </form>
        </div>
      </div>

      {/* ─── Loading ─── */}
      {authLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
          <span className="ml-3 text-[var(--dash-muted)]">Vérification des permissions...</span>
        </div>
      )}

      {!authLoading && loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--dash-emerald)]/30 border-t-[var(--dash-emerald)] rounded-full animate-spin" />
        </div>
      )}

      {/* ─── Empty State ─── */}
      {!loading && data && data.pagination.total === 0 && (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <Users className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
          <p className="text-[var(--dash-ink)] font-medium">Aucun utilisateur trouvé</p>
          <p className="text-sm text-[var(--dash-muted-2)] mt-2">
            {search ? 'Essayez un autre terme de recherche' : 'Les données apparaîtront une fois les colis activés'}
          </p>
        </div>
      )}

      {/* ─── Desktop Table ─── */}
      {!loading && data && data.pagination.total > 0 && (
        <>
          {/* Desktop (hidden on mobile) */}
          <div className="hidden md:block dash-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>WhatsApp</th>
                    <th>Inscription</th>
                    <th>Statut</th>
                    <th>Expiration</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.travelers.map((traveler) => (
                    <TravelerRow
                      key={`${traveler.name}-${traveler.whatsapp}`}
                      traveler={traveler}
                      onView={() => setSelectedTraveler(traveler)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards (shown only on mobile) */}
          <div className="md:hidden space-y-3">
            {data.travelers.map((traveler) => (
              <TravelerCard
                key={`${traveler.name}-${traveler.whatsapp}`}
                traveler={traveler}
                onView={() => setSelectedTraveler(traveler)}
              />
            ))}
          </div>

          {/* ─── Pagination ─── */}
          {data.pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
              <p className="text-sm text-[var(--dash-muted)]">
                Page {data.pagination.page} sur {data.pagination.totalPages} — {data.pagination.total} résultat{data.pagination.total > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Précédent</span>
                </button>
                <span className="px-3 py-1 text-sm font-medium bg-[var(--dash-bg-3)] text-[var(--dash-ink)] rounded-lg">
                  {page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page >= data.pagination.totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] disabled:opacity-50 transition-colors"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Detail Modal ─── */}
      <Dialog open={!!selectedTraveler} onOpenChange={(open) => !open && setSelectedTraveler(null)}>
        <DialogContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--dash-ink)] text-lg">Détails du voyageur</DialogTitle>
          </DialogHeader>
          {selectedTraveler && (
            <DetailModalContent traveler={selectedTraveler} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Table Row Component (Desktop)
   ══════════════════════════════════════════════ */
function TravelerRow({ traveler, onView }: { traveler: Traveler; onView: () => void }) {
  const expiryStr = traveler.expirationDate ? formatDate(traveler.expirationDate) : '—';
  const whatsappMsg = buildRenewalMessage(
    traveler.name.split(' ')[0] || 'voyageur',
    traveler.baggages[0]?.reference || '',
    expiryStr
  );

  const emailBody = buildRenewalMessage(
    traveler.name.split(' ')[0] || 'voyageur',
    traveler.baggages[0]?.reference || '',
    expiryStr
  );
  const mailtoUrl = traveler.email
    ? getMailtoUrl(traveler.email, 'Renouvellement QRTrans', emailBody)
    : null;

  return (
    <tr>
      <td>
        <div>
          <p className="font-medium text-[var(--dash-ink)]">{traveler.name}</p>
          <p className="text-xs text-[var(--dash-muted-2)] mt-0.5">{traveler.totalBaggages} colis</p>
        </div>
      </td>
      <td>
        {traveler.email ? (
          <a href={mailtoUrl!} className="text-sm text-[var(--dash-brand)] hover:underline">
            {traveler.email}
          </a>
        ) : (
          <span className="text-sm text-[var(--dash-muted-2)]">—</span>
        )}
      </td>
      <td>
        <span className="text-sm text-[var(--dash-ink-2)] font-mono">
          {traveler.whatsapp || '—'}
        </span>
      </td>
      <td className="text-sm text-[var(--dash-ink-2)]">
        {formatDate(traveler.registeredAt)}
      </td>
      <td>
        <span className={statusBadgeClass(traveler.status)}>
          {statusBadgeLabel(traveler.status)}
        </span>
      </td>
      <td className="text-sm text-[var(--dash-ink-2)]">
        {expiryStr}
      </td>
      <td>
        <div className="flex items-center justify-end gap-1.5">
          {traveler.whatsapp && (
            <a
              href={getWhatsAppUrl(traveler.whatsapp, whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[var(--dash-emerald)] hover:opacity-90 text-white transition-opacity"
              title="Envoyer un WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
          {mailtoUrl && (
            <a
              href={mailtoUrl}
              className="p-2 rounded-lg bg-[var(--dash-brand)] hover:opacity-90 text-white transition-opacity"
              title="Envoyer un Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onView}
            className="p-2 rounded-lg bg-[var(--dash-bg-3)] hover:bg-[var(--dash-border)] text-[var(--dash-ink-2)] transition-colors"
            title="Voir détails"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════════
   Card Component (Mobile)
   ══════════════════════════════════════════════ */
function TravelerCard({ traveler, onView }: { traveler: Traveler; onView: () => void }) {
  const expiryStr = traveler.expirationDate ? formatDate(traveler.expirationDate) : '—';
  const whatsappMsg = buildRenewalMessage(
    traveler.name.split(' ')[0] || 'voyageur',
    traveler.baggages[0]?.reference || '',
    expiryStr
  );
  const emailBody = buildRenewalMessage(
    traveler.name.split(' ')[0] || 'voyageur',
    traveler.baggages[0]?.reference || '',
    expiryStr
  );
  const mailtoUrl = traveler.email
    ? getMailtoUrl(traveler.email, 'Renouvellement QRTrans', emailBody)
    : null;

  return (
    <div className="dash-card p-4">
      {/* Top: Name + Status */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-[var(--dash-ink)]">{traveler.name}</p>
          <p className="text-xs text-[var(--dash-muted-2)] mt-0.5">{traveler.totalBaggages} colis</p>
        </div>
        <span className={statusBadgeClass(traveler.status)}>
          {statusBadgeLabel(traveler.status)}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1.5 mb-4 text-sm">
        {traveler.email && (
          <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
            <Mail className="w-3.5 h-3.5 text-[var(--dash-muted-2)]" />
            <span>{traveler.email}</span>
          </div>
        )}
        {traveler.whatsapp && (
          <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
            <Phone className="w-3.5 h-3.5 text-[var(--dash-muted-2)]" />
            <span className="font-mono">{traveler.whatsapp}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[var(--dash-muted)]">
          <CalendarDays className="w-3.5 h-3.5" />
          Inscription : {formatDate(traveler.registeredAt)}
        </div>
        <div className="flex items-center gap-2 text-[var(--dash-muted)]">
          <Clock className="w-3.5 h-3.5" />
          Expiration : {expiryStr}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--dash-border)]">
        {traveler.whatsapp && (
          <a
            href={getWhatsAppUrl(traveler.whatsapp, whatsappMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--dash-emerald)] hover:opacity-90 text-white rounded-lg text-sm font-medium transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        )}
        {mailtoUrl && (
          <a
            href={mailtoUrl}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--dash-brand)] hover:opacity-90 text-white rounded-lg text-sm font-medium transition-opacity"
          >
            <Mail className="w-4 h-4" />
            Email
          </a>
        )}
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--dash-bg-3)] hover:bg-[var(--dash-border)] text-[var(--dash-ink-2)] rounded-lg text-sm font-medium transition-colors"
        >
          <Eye className="w-4 h-4" />
          Détails
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Detail Modal Content
   ══════════════════════════════════════════════ */
function DetailModalContent({ traveler }: { traveler: Traveler }) {
  const expiryStr = traveler.expirationDate ? formatDate(traveler.expirationDate) : '—';
  const whatsappMsg = buildRenewalMessage(
    traveler.name.split(' ')[0] || 'voyageur',
    traveler.baggages[0]?.reference || '',
    expiryStr
  );
  const emailBody = buildRenewalMessage(
    traveler.name.split(' ')[0] || 'voyageur',
    traveler.baggages[0]?.reference || '',
    expiryStr
  );
  const mailtoUrl = traveler.email
    ? getMailtoUrl(traveler.email, 'Renouvellement QRTrans', emailBody)
    : null;

  return (
    <div className="space-y-5 mt-2">
      {/* Traveler Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-[var(--dash-muted-2)] uppercase tracking-wider mb-1">Nom</p>
          <p className="font-medium text-[var(--dash-ink)]">{traveler.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--dash-muted-2)] uppercase tracking-wider mb-1">Email</p>
          {traveler.email ? (
            <a href={mailtoUrl!} className="font-medium text-[var(--dash-brand)] hover:underline">{traveler.email}</a>
          ) : (
            <p className="font-medium text-[var(--dash-muted-2)]">—</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--dash-muted-2)] uppercase tracking-wider mb-1">WhatsApp</p>
          <p className="font-medium text-[var(--dash-ink)] font-mono">{traveler.whatsapp || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--dash-muted-2)] uppercase tracking-wider mb-1">Inscription</p>
          <p className="font-medium text-[var(--dash-ink)]">{formatDate(traveler.registeredAt)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--dash-muted-2)] uppercase tracking-wider mb-1">Statut</p>
          <span className={statusBadgeClass(traveler.status)}>
            {statusBadgeLabel(traveler.status)}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--dash-muted-2)] uppercase tracking-wider mb-1">Expiration</p>
          <p className="font-medium text-[var(--dash-ink)]">{expiryStr}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--dash-muted-2)] uppercase tracking-wider mb-1">Nb colis</p>
          <p className="font-medium text-[var(--dash-ink)]">{traveler.totalBaggages}</p>
        </div>
      </div>

      {/* Baggages List */}
      <div>
        <p className="text-xs font-semibold text-[var(--dash-muted-2)] uppercase tracking-wider mb-3">Colis</p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {traveler.baggages.map((b) => (
            <div key={b.reference} className="bg-[var(--dash-bg-3)] rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-sm font-semibold text-[var(--dash-ink)]">{b.reference}</span>
                <span className="dash-badge dash-badge-neutral text-[10px]">
                  {b.type === 'hajj' ? 'Hajj' : 'Voyageur'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--dash-muted)]">
                {/* TRANSPORT-FEATURE: Dynamic transport info */}
                {b.transportMode === 'flight' && b.flightNumber && (
                  <span className="flex items-center gap-1"><Plane className="w-3 h-3" />{b.flightNumber}</span>
                )}
                {b.transportMode === 'train' && b.trainNumber && (
                  <span className="flex items-center gap-1"><Train className="w-3 h-3" />{b.trainNumber}</span>
                )}
                {b.transportMode === 'boat' && b.shipName && (
                  <span className="flex items-center gap-1"><Ship className="w-3 h-3" />{b.shipName}</span>
                )}
                {b.transportMode === 'bus' && b.busLineNumber && (
                  <span className="flex items-center gap-1"><Bus className="w-3 h-3" />{b.busLineNumber}</span>
                )}
                {!b.transportMode && b.flightNumber && (
                  <span className="flex items-center gap-1"><Plane className="w-3 h-3" />{b.flightNumber}</span>
                )}
                {b.destination && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.destination}</span>
                )}
                <span className="flex items-center gap-1"><Luggage className="w-3 h-3" />{b.baggageType}</span>
                {b.agencyName && (
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{b.agencyName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {traveler.whatsapp && (
          <a
            href={getWhatsAppUrl(traveler.whatsapp, whatsappMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--dash-emerald)] hover:opacity-90 text-white rounded-lg font-medium transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        )}
        {mailtoUrl ? (
          <a
            href={mailtoUrl}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--dash-brand)] hover:opacity-90 text-white rounded-lg font-medium transition-opacity"
          >
            <Mail className="w-5 h-5" />
            Email
          </a>
        ) : (
          <button
            onClick={() => {
              window.location.href = getMailtoUrl('contact@qrtrans.com', 'Renouvellement QRTrans', emailBody);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--dash-bg-3)] hover:bg-[var(--dash-border)] text-[var(--dash-ink-2)] rounded-lg font-medium transition-colors"
          >
            <Mail className="w-5 h-5" />
            Email
          </button>
        )}
      </div>
    </div>
  );
}
