'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Eye,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  MapPin,
  QrCode,
  X,
  ShoppingCart,
  Send,
  XCircle,
  RefreshCw,
  Sparkles,
  Lightbulb,
  Package,
} from "lucide-react";
import { useAgency } from '../layout';
import {
  isActive,
  isPending,
  isLost,
  isFound,
  isInTransit,
  isDelivered,
  normalizeStatus,
} from '@/lib/status';
import LatestNewsWidget from '@/components/LatestNewsWidget';
import KpiCard from '@/components/dashboard/KpiCard';
import DataTable from '@/components/dashboard/DataTable';

// ─── Types ────────────────────────────────────────────────────────────────

interface Baggage {
  id: string;
  reference: string;
  type: string;
  travelerFirstName: string | null;
  travelerLastName: string | null;
  whatsappOwner: string | null;
  baggageIndex: number;
  baggageType: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  lastScanDate: string | null;
  lastLocation: string | null;
  founderName: string | null;
  founderPhone: string | null;
  founderAt: string | null;
  deliveredAt: string | null;
  receiverName: string | null;
  receiverWhatsapp: string | null;
  transportMode: string | null;
  departureCity: string | null;
  departureDate: string | null;
  [key: string]: unknown;
}

interface Stats {
  total: number;
  pending: number;
  active: number;
  scanned: number;
  lost: number;
  found: number;
}

// Internal column type matching the DataTable's expected shape.
type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
};

// Inline WhatsApp glyph (lucide doesn't ship one).
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── AI Suggestions Component ──────────────────────────────────────────────

function AISuggestions({ agencyId, stats }: { agencyId: string; stats: Stats }) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());

  const fetchSuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ai/suggestions?agencyId=${agencyId}`);
      const data = await response.json();
      if (data.success && data.suggestion) {
        if (typeof data.suggestion === 'object') {
          const s = data.suggestion as { recommended: number; basedOn: string };
          setSuggestion(
            `Nous vous recommandons ${s.recommended} QR codes pour votre prochaine campagne. Basé sur: ${s.basedOn}`,
          );
        } else {
          setSuggestion(data.suggestion as string);
        }
      } else {
        setError('Impossible de charger les suggestions');
      }
    } catch (err) {
      console.error('Error fetching AI suggestion:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestion();
  }, [agencyId]);

  const handleDismiss = (index: number) => {
    setDismissedSuggestions((prev) => new Set([...prev, index]));
  };

  // Contextual suggestions based on live stats.
  const getContextualSuggestions = (): {
    icon: 'warning' | 'clock' | 'scan' | 'ok';
    title: string;
    text: string;
    variant: 'danger' | 'warning' | 'info' | 'success';
  }[] => {
    const suggestions: {
      icon: 'warning' | 'clock' | 'scan' | 'ok';
      title: string;
      text: string;
      variant: 'danger' | 'warning' | 'info' | 'success';
    }[] = [];

    if (stats.lost > 0) {
      suggestions.push({
        icon: 'warning',
        title: 'Colis perdus',
        text: `Vous avez ${stats.lost} colis signalé(s) comme perdu(s). Contactez rapidement les voyageurs concernés.`,
        variant: 'danger',
      });
    }

    if (stats.pending > 5) {
      suggestions.push({
        icon: 'clock',
        title: 'Activation en attente',
        text: `${stats.pending} colis sont en attente d'activation. Envoyez un rappel aux voyageurs.`,
        variant: 'warning',
      });
    }

    if (stats.scanned > 0) {
      suggestions.push({
        icon: 'scan',
        title: 'Scans récents',
        text: `${stats.scanned} colis ont été scanné(s) récemment. Vérifiez les localisations.`,
        variant: 'info',
      });
    }

    if (stats.total > 0 && stats.pending === 0 && stats.lost === 0) {
      suggestions.push({
        icon: 'ok',
        title: 'Excellent !',
        text: 'Tous vos colis sont actifs et bien suivis. Continuez comme ça !',
        variant: 'success',
      });
    }

    return suggestions;
  };

  const contextualSuggestions = getContextualSuggestions();

  const iconFor = (kind: 'warning' | 'clock' | 'scan' | 'ok') => {
    switch (kind) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'clock':
        return <Clock className="w-4 h-4" />;
      case 'scan':
        return <QrCode className="w-4 h-4" />;
      case 'ok':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const variantClass = (v: 'danger' | 'warning' | 'info' | 'success') => {
    switch (v) {
      case 'danger':
        return 'dash-badge-danger';
      case 'warning':
        return 'dash-badge-warning';
      case 'info':
        return 'dash-badge-info';
      case 'success':
        return 'dash-badge-success';
    }
  };

  return (
    <div className="dash-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--dash-ink)]">Suggestions IA</h3>
            <p className="text-sm text-[var(--dash-muted)]">Recommandations personnalisées</p>
          </div>
        </div>
        <button
          onClick={fetchSuggestion}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors"
          title="Actualiser"
          aria-label="Actualiser les suggestions"
        >
          <RefreshCw
            className={`w-4 h-4 text-[var(--dash-muted)] ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Contextual suggestions */}
      <div className="space-y-3 mb-4">
        {contextualSuggestions.map((sugg, index) =>
          dismissedSuggestions.has(index) ? null : (
            <div
              key={index}
              className="group relative p-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg-3)] flex items-start gap-3"
            >
              <span
                className={`dash-badge ${variantClass(sugg.variant)} w-8 h-8 justify-center p-0 shrink-0`}
              >
                {iconFor(sugg.icon)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--dash-ink)] text-sm">{sugg.title}</p>
                <p className="text-sm text-[var(--dash-muted)] mt-0.5">{sugg.text}</p>
              </div>
              <button
                onClick={() => handleDismiss(index)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[var(--dash-bg-2)] transition-all"
                title="Masquer cette notification"
                aria-label="Masquer"
              >
                <X className="w-4 h-4 text-[var(--dash-muted)]" />
              </button>
            </div>
          ),
        )}
      </div>

      {/* AI-generated suggestion */}
      {loading && (
        <div className="p-4 rounded-xl bg-[var(--dash-bg-3)] border border-[var(--dash-border)] animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--dash-brand)]" />
            <span className="text-[var(--dash-muted)] text-sm">Analyse en cours...</span>
          </div>
        </div>
      )}

      {suggestion && !loading && (
        <div className="p-4 rounded-xl bg-[var(--dash-brand-soft)] border border-[var(--dash-brand)]/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[var(--dash-brand)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-[var(--dash-ink)] font-medium mb-1">Conseil IA</p>
              <p className="text-sm text-[var(--dash-muted)]">{suggestion}</p>
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-[#FEE2E2] dark:bg-rose-500/10 border border-[#DC2626]/30 dark:border-rose-500/30">
          <p className="text-sm text-[#DC2626] dark:text-rose-400">{error}</p>
        </div>
      )}
    </div>
  );
}

// ─── Advertisement Banner Component ────────────────────────────────────────

function AdBanner() {
  const [ads, setAds] = useState<
    Array<{
      id: string;
      title: string;
      imageUrl: string;
      linkUrl: string | null;
      targetScope: string;
    }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/advertisements');
        const data = await res.json();
        if (data.advertisements && data.advertisements.length > 0) {
          setAds(data.advertisements);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (loading || ads.length === 0) return null;

  const ad = ads[currentIndex];

  return (
    <div className="dash-card relative overflow-hidden p-0">
      {ad.imageUrl ? (
        <a
          href={ad.linkUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative"
        >
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-40 object-cover"
          />
          {ad.title && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-sm font-medium">{ad.title}</p>
            </div>
          )}
        </a>
      ) : (
        <a
          href={ad.linkUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-6 bg-gradient-to-r from-[var(--dash-brand-soft)] to-[var(--dash-emerald-soft)] text-center"
        >
          <p className="text-[var(--dash-ink)] font-semibold">{ad.title}</p>
        </a>
      )}
      {ads.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1 z-10">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Voir l'annonce ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────

export default function AgencyDashboardPage() {
  const { agencyId, agencyName } = useAgency();
  const [baggages, setBaggages] = useState<Baggage[]>([]);
  const [filteredBaggages, setFilteredBaggages] = useState<Baggage[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    active: 0,
    scanned: 0,
    lost: 0,
    found: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBaggage, setSelectedBaggage] = useState<Baggage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [baggageToDelete, setBaggageToDelete] = useState<Baggage | null>(null);

  // Command Modal State
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [commandForm, setCommandForm] = useState({
    type: 'hajj',
    count: 10,
    notes: '',
  });
  const [commandSubmitting, setCommandSubmitting] = useState(false);
  const [commandSuccess, setCommandSuccess] = useState(false);

  useEffect(() => {
    if (agencyId) fetchBaggages();
  }, [agencyId]);

  // Listen for openCommandModal event from header
  useEffect(() => {
    const handleOpenCommandModal = () => {
      setShowCommandModal(true);
    };
    window.addEventListener('openCommandModal', handleOpenCommandModal);
    return () => window.removeEventListener('openCommandModal', handleOpenCommandModal);
  }, []);

  useEffect(() => {
    filterBaggages();
  }, [baggages, search, statusFilter]);

  const fetchBaggages = async () => {
    if (!agencyId) {
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams({
        agencyId: agencyId,
      });

      const response = await fetch(`/api/agency/baggages?${params}`);
      const data = await response.json();

      if (response.ok && data.baggages) {
        setBaggages(Array.isArray(data.baggages) ? data.baggages : []);
        setStats(
          data.stats || { total: 0, pending: 0, active: 0, scanned: 0, lost: 0, found: 0 },
        );
      } else {
        console.error('API error:', data.error || 'Unknown error');
        setBaggages([]);
        setStats({ total: 0, pending: 0, active: 0, scanned: 0, lost: 0, found: 0 });
      }
    } catch (error) {
      console.error('Error fetching baggages:', error);
      setBaggages([]);
      setStats({ total: 0, pending: 0, active: 0, scanned: 0, lost: 0, found: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filterBaggages = () => {
    let filtered = Array.isArray(baggages) ? [...baggages] : [];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.reference.toLowerCase().includes(searchLower) ||
          `${b.travelerFirstName || ''} ${b.travelerLastName || ''}`
            .toLowerCase()
            .includes(searchLower),
      );
    }

    setFilteredBaggages(filtered);
  };

  // AGENCY-FIX: Split filtered baggages into activated and pending sections.
  // TEST: pending_activation baggages appear in "En attente" section.
  // TEST: activated baggages appear in "Activés" section.
  // FIX: Include lost/found/blocked in activated so NO baggage vanishes from UI.
  const activatedBaggages = filteredBaggages.filter(
    (b) =>
      isActive(b.status) ||
      isInTransit(b.status) ||
      isDelivered(b.status) ||
      b.travelerFirstName !== null ||
      isLost(b.status) ||
      isFound(b.status) ||
      normalizeStatus(b.status) === 'blocked',
  );
  // FIX: Check BOTH travelerFirstName AND travelerLastName for null
  const pendingBaggages = filteredBaggages.filter(
    (b) => isPending(b.status) && b.travelerFirstName === null && b.travelerLastName === null,
  );

  const handleDeleteBaggage = async () => {
    if (!baggageToDelete) return;

    try {
      await fetch(`/api/baggage/${baggageToDelete.id}`, {
        method: 'DELETE',
      });

      setBaggages(baggages.filter((b) => b.id !== baggageToDelete.id));
      setShowDeleteModal(false);
      setBaggageToDelete(null);
    } catch (error) {
      console.error('Error deleting baggage:', error);
    }
  };

  const handleCommandSubmit = async () => {
    setCommandSubmitting(true);

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'commande_agence',
          agencyId: agencyId,
          senderName: agencyName,
          content: {
            type: commandForm.type,
            count: commandForm.count,
            notes: commandForm.notes,
          },
        }),
      });
      setCommandSuccess(true);
      setTimeout(() => {
        setShowCommandModal(false);
        setCommandSuccess(false);
        setCommandForm({ type: 'hajj', count: 10, notes: '' });
      }, 2000);
    } catch (error) {
      console.error('Error sending command:', error);
    } finally {
      setCommandSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return (
      date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' à ' +
      date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string }
    > = {
      pending_activation: { label: 'En attente', className: 'dash-badge dash-badge-warning' },
      active: { label: 'Actif', className: 'dash-badge dash-badge-success' },
      scanned: { label: 'Scanné', className: 'dash-badge dash-badge-info' },
      lost: { label: 'Perdu', className: 'dash-badge dash-badge-danger' },
      found: { label: 'Retrouvé', className: 'dash-badge dash-badge-success' },
      blocked: { label: 'Bloqué', className: 'dash-badge dash-badge-neutral' },
      in_transit: { label: 'En transit', className: 'dash-badge dash-badge-info' },
      delivered: { label: 'Livré', className: 'dash-badge dash-badge-success' },
      EN_ATTENTE: { label: 'En attente', className: 'dash-badge dash-badge-warning' },
      ACTIF: { label: 'Actif', className: 'dash-badge dash-badge-success' },
      SCANNÉ: { label: 'Scanné', className: 'dash-badge dash-badge-info' },
      PERDU: { label: 'Perdu', className: 'dash-badge dash-badge-danger' },
      TROUVÉ: { label: 'Retrouvé', className: 'dash-badge dash-badge-success' },
      BLOQUÉ: { label: 'Bloqué', className: 'dash-badge dash-badge-neutral' },
    };

    const config =
      statusConfig[status] || {
        label: status,
        className: 'dash-badge dash-badge-neutral',
      };

    return <span className={config.className}>{config.label}</span>;
  };

  const filterButtons = [
    { id: 'all', label: 'Tous' },
    { id: 'active', label: 'Activés' },
    { id: 'in_transit', label: 'En transit' },
    { id: 'delivered', label: 'Livrés' },
    { id: 'pending_activation', label: 'En attente' },
    { id: 'scanned', label: 'Scannés' },
    { id: 'lost', label: 'Perdus' },
    { id: 'found', label: 'Retrouvés' },
  ];

  // KPI cards — data sources preserved, mock deltas + sparklines added.
  const kpiConfigs = [
    {
      label: 'Total colis',
      value: stats.total,
      subtitle: 'Tous les colis',
      icon: Package,
      color: 'violet' as const,
      delta: 12.5,
      sparkline: [8, 10, 9, 12, 11, 14, 13, 15, 14, 16, 17, 18],
    },
    {
      label: 'Scannés',
      value: stats.scanned + stats.active,
      subtitle: 'Colis actifs',
      icon: QrCode,
      color: 'cyan' as const,
      delta: 8.3,
      sparkline: [3, 4, 6, 5, 7, 8, 6, 9, 10, 9, 11, 12],
    },
    {
      label: 'En attente',
      value: stats.pending,
      subtitle: 'À activer',
      icon: Clock,
      color: 'amber' as const,
      delta: -2.1,
      sparkline: [6, 5, 7, 4, 5, 3, 4, 3, 5, 4, 3, 3],
    },
    {
      label: 'Perdus',
      value: stats.lost,
      subtitle: 'Signalés perdus',
      icon: AlertTriangle,
      color: 'rose' as const,
      delta: 0.7,
      sparkline: [0, 1, 0, 1, 1, 0, 1, 1, 2, 1, 1, 1],
    },
  ];

  // ─── Activated table columns ──────────────────────────────────────────

  const activatedColumns: Column<Baggage>[] = [
    {
      key: 'reference',
      header: 'Référence',
      render: (b) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--dash-emerald-soft)] flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4 text-[var(--dash-emerald)]" />
          </div>
          <span className="text-[var(--dash-ink)] font-mono font-medium text-sm">
            {b.reference}
          </span>
        </div>
      ),
    },
    {
      key: 'traveler',
      header: 'Pèlerin',
      render: (b) =>
        b.travelerFirstName || b.travelerLastName ? (
          <div>
            <span className="text-[var(--dash-ink)] font-medium text-sm">
              {b.travelerFirstName} {b.travelerLastName}
            </span>
            {b.whatsappOwner && (
              <p className="text-[var(--dash-muted)] text-xs mt-0.5">{b.whatsappOwner}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="dash-badge dash-badge-warning">Non assigné</span>
            <button
              onClick={() => {
                setSelectedBaggage(b);
                setShowDetailModal(true);
              }}
              className="text-xs font-medium text-[var(--dash-brand)] hover:underline"
            >
              Attribuer
            </button>
          </div>
        ),
    },
    {
      key: 'lastScanDate',
      header: 'Dernier scan',
      className: 'hidden md:table-cell',
      render: (b) =>
        b.lastScanDate ? (
          <div>
            <span className="text-[var(--dash-ink-2)] text-sm">
              {formatDateTime(b.lastScanDate)}
            </span>
            {b.lastLocation && (
              <p className="text-[var(--dash-muted)] text-xs flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {b.lastLocation}
              </p>
            )}
          </div>
        ) : (
          <span className="text-[var(--dash-muted)] text-sm">Jamais</span>
        ),
    },
    {
      key: 'founder',
      header: 'Trouveur',
      className: 'hidden lg:table-cell',
      render: (b) =>
        b.founderName ? (
          <div>
            <p className="text-[var(--dash-ink)] font-medium text-sm">{b.founderName}</p>
            {b.founderPhone && (
              <a
                href={`https://wa.me/${b.founderPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--dash-emerald)] hover:opacity-80 text-xs flex items-center gap-1 mt-0.5"
              >
                <WhatsAppIcon className="w-3 h-3" />
                {b.founderPhone}
              </a>
            )}
          </div>
        ) : (
          <span className="text-[var(--dash-muted)] text-sm">-</span>
        ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (b) => getStatusBadge(b.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (b) => (
        <div className="flex items-center justify-end gap-1">
          {isActive(b.status) && (
            <button
              onClick={async () => {
                if (confirm('Déclarer ce colis comme perdu ?')) {
                  try {
                    const res = await fetch(`/api/baggage/${b.id}/declare-lost`, {
                      method: 'PUT',
                    });
                    if (res.ok) fetchBaggages();
                  } catch (error) {
                    console.error('Error declaring lost:', error);
                  }
                }
              }}
              className="p-2 rounded-lg hover:bg-[#FEE2E2] dark:hover:bg-rose-500/10 transition-colors group"
              title="Déclarer perdu"
              aria-label="Déclarer perdu"
            >
              <AlertTriangle className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[#DC2626] dark:group-hover:text-rose-400" />
            </button>
          )}
          {isLost(b.status) && (
            <button
              onClick={async () => {
                if (confirm('Marquer ce colis comme retrouvé ?')) {
                  try {
                    const res = await fetch(`/api/baggage/${b.id}/mark-found`, {
                      method: 'PUT',
                    });
                    if (res.ok) fetchBaggages();
                  } catch (error) {
                    console.error('Error marking found:', error);
                  }
                }
              }}
              className="p-2 rounded-lg hover:bg-[var(--dash-emerald-soft)] transition-colors group"
              title="Marquer comme retrouvé"
              aria-label="Marquer comme retrouvé"
            >
              <CheckCircle className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[var(--dash-emerald)]" />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedBaggage(b);
              setShowDetailModal(true);
            }}
            className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors group"
            title="Voir détails"
            aria-label="Voir détails"
          >
            <Eye className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[var(--dash-brand)]" />
          </button>
          <button
            onClick={() => {
              setBaggageToDelete(b);
              setShowDeleteModal(true);
            }}
            className="p-2 rounded-lg hover:bg-[#FEE2E2] dark:hover:bg-rose-500/10 transition-colors group"
            title="Supprimer"
            aria-label="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[#DC2626] dark:group-hover:text-rose-400" />
          </button>
        </div>
      ),
    },
  ];

  // ─── Pending table columns ────────────────────────────────────────────

  const pendingColumns: Column<Baggage>[] = [
    {
      key: 'reference',
      header: 'Référence',
      render: (b) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] dark:bg-amber-500/10 flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4 text-[#D97706] dark:text-amber-400" />
          </div>
          <span className="text-[var(--dash-ink)] font-mono font-medium text-sm">
            {b.reference}
          </span>
        </div>
      ),
    },
    {
      key: 'traveler',
      header: 'Pèlerin',
      render: () => <span className="dash-badge dash-badge-warning">Non assigné</span>,
    },
    {
      key: 'baggageType',
      header: 'Type',
      className: 'hidden md:table-cell',
      render: (b) => (
        <span className="text-[var(--dash-ink-2)] text-sm capitalize">
          {b.baggageType === 'cabine' ? 'Cabine' : 'Soute'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Créé le',
      className: 'hidden md:table-cell',
      render: (b) => (
        <span className="text-[var(--dash-muted)] text-sm">{formatDate(b.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (b) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setSelectedBaggage(b);
              setShowDetailModal(true);
            }}
            className="px-3 py-1.5 bg-[var(--dash-brand)] hover:bg-[var(--dash-brand-2)] text-white rounded-lg text-xs font-medium transition-colors"
            title="Attribuer à un pèlerin"
          >
            Attribuer
          </button>
          <button
            onClick={() => {
              setSelectedBaggage(b);
              setShowDetailModal(true);
            }}
            className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors group"
            title="Voir détails"
            aria-label="Voir détails"
          >
            <Eye className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[var(--dash-brand)]" />
          </button>
          <button
            onClick={() => {
              setBaggageToDelete(b);
              setShowDeleteModal(true);
            }}
            className="p-2 rounded-lg hover:bg-[#FEE2E2] dark:hover:bg-rose-500/10 transition-colors group"
            title="Supprimer"
            aria-label="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[#DC2626] dark:group-hover:text-rose-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--dash-ink)]">
          Bienvenue,{' '}
          <span className="text-[var(--dash-brand)]">{agencyName}</span>
        </h1>
        <p className="text-[var(--dash-muted)] mt-1">
          Suivi en temps réel de vos colis Hajj 2026
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiConfigs.map((kpi, i) => (
          <KpiCard key={i} loading={loading} {...kpi} />
        ))}
      </div>

      {/* AI Suggestions */}
      <div className="mb-8">
        <AISuggestions agencyId={agencyId} stats={stats} />
      </div>

      {/* Latest News Widget */}
      <div className="mb-8">
        <LatestNewsWidget />
      </div>

      {/* Advertisement Banner */}
      <div className="mb-8">
        <AdBanner />
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="dash-search">
          <Search className="w-5 h-5 text-[var(--dash-muted)] shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par nom ou référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setStatusFilter(btn.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
              statusFilter === btn.id
                ? 'bg-[var(--dash-brand)] text-white border-[var(--dash-brand)] shadow-sm'
                : 'bg-[var(--dash-card)] text-[var(--dash-muted)] hover:text-[var(--dash-ink)] border-[var(--dash-border)] hover:border-[var(--dash-border-strong)]'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Tables */}
      {loading ? (
        <DataTable columns={activatedColumns} data={[]} loading emptyMessage="" />
      ) : filteredBaggages.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <Clock className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
          <p className="text-[var(--dash-muted)]">Aucun colis trouvé</p>
          <p className="text-sm text-[var(--dash-muted-2)] mt-2">
            {search || statusFilter !== 'all'
              ? 'Essayez de modifier vos filtres.'
              : 'Vos colis apparaîtront ici une fois générés.'}
          </p>
        </div>
      ) : (
        <>
          {/* Section 1 — Activated baggages */}
          {activatedBaggages.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--dash-emerald)]" />
                  <h2 className="text-sm font-semibold text-[var(--dash-ink)]">
                    Colis activés ({activatedBaggages.length})
                  </h2>
                </div>
                <span className="text-xs text-[var(--dash-muted)]">
                  {activatedBaggages.length} colis activé(s)
                </span>
              </div>
              <DataTable
                columns={activatedColumns}
                data={activatedBaggages}
                emptyMessage="Aucun colis activé"
              />
            </div>
          )}

          {/* Section 2 — Pending baggages */}
          {pendingBaggages.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <h2 className="text-sm font-semibold text-[var(--dash-ink)]">
                    QR en attente d&apos;activation ({pendingBaggages.length})
                  </h2>
                </div>
                <span className="text-xs text-[var(--dash-muted)]">
                  {pendingBaggages.length} QR en attente
                </span>
              </div>
              <DataTable
                columns={pendingColumns}
                data={pendingBaggages}
                emptyMessage="Aucun QR en attente"
              />
            </div>
          )}

          {/* Footer global */}
          <div className="text-center mt-6">
            <span className="text-[var(--dash-muted-2)] text-xs">
              {filteredBaggages.length} colis affiché(s) sur {baggages.length}
            </span>
          </div>
        </>
      )}

      {/* Command Modal */}
      {showCommandModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="dash-card max-w-md w-full shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[var(--dash-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--dash-brand-soft)] flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-[var(--dash-brand)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--dash-ink)]">
                  Commander vos QR codes
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCommandModal(false);
                  setCommandSuccess(false);
                }}
                className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors"
                aria-label="Fermer"
              >
                <XCircle className="w-5 h-5 text-[var(--dash-muted)]" />
              </button>
            </div>

            {commandSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--dash-emerald-soft)] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[var(--dash-emerald)]" />
                </div>
                <h4 className="text-xl font-bold text-[var(--dash-ink)] mb-2">
                  Demande envoyée !
                </h4>
                <p className="text-[var(--dash-muted)]">
                  Notre équipe vous contactera sous 24h.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--dash-ink-2)]">
                    Type de QR codes
                  </label>
                  <select
                    value={commandForm.type}
                    onChange={(e) =>
                      setCommandForm({ ...commandForm, type: e.target.value })
                    }
                    className="w-full p-3 bg-[var(--dash-bg-3)] border border-[var(--dash-border)] rounded-xl text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand)]/30 focus:border-[var(--dash-brand)] outline-none transition"
                  >
                    <option value="hajj">Hajj 2026 (3 QR/pèlerin)</option>
                    <option value="voyageur">Voyageurs Standard (1 ou 3 QR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--dash-ink-2)]">
                    Nombre de {commandForm.type === 'hajj' ? 'pèlerins' : 'voyageurs'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={commandForm.count}
                    onChange={(e) =>
                      setCommandForm({
                        ...commandForm,
                        count: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full p-3 bg-[var(--dash-bg-3)] border border-[var(--dash-border)] rounded-xl text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand)]/30 focus:border-[var(--dash-brand)] outline-none transition"
                    placeholder="Ex: 50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--dash-ink-2)]">
                    Remarques (optionnel)
                  </label>
                  <textarea
                    rows={3}
                    value={commandForm.notes}
                    onChange={(e) =>
                      setCommandForm({ ...commandForm, notes: e.target.value })
                    }
                    className="w-full p-3 bg-[var(--dash-bg-3)] border border-[var(--dash-border)] rounded-xl text-[var(--dash-ink)] placeholder-[var(--dash-muted)] focus:ring-2 focus:ring-[var(--dash-brand)]/30 focus:border-[var(--dash-brand)] outline-none resize-none transition"
                    placeholder="Ex: livraison urgente, dates de départ..."
                  />
                </div>

                <div className="bg-[var(--dash-bg-3)] border border-[var(--dash-border)] rounded-xl p-4">
                  <p className="text-[var(--dash-ink-2)] text-sm">
                    <strong className="text-[var(--dash-ink)]">Estimation :</strong>{' '}
                    {commandForm.type === 'hajj'
                      ? `${commandForm.count * 3} QR codes (${commandForm.count} pèlerins × 3)`
                      : `${commandForm.count} QR codes voyageur`}
                  </p>
                </div>

                <button
                  onClick={handleCommandSubmit}
                  disabled={commandSubmitting}
                  className="w-full bg-[var(--dash-brand)] text-white py-3 rounded-xl font-bold hover:bg-[var(--dash-brand-2)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {commandSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer la demande
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBaggage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="dash-card max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-[var(--dash-border)] sticky top-0 bg-[var(--dash-card)] z-10">
              <h2 className="text-lg font-bold text-[var(--dash-ink)]">Détails du colis</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBaggage(null);
                }}
                className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-[var(--dash-muted)]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--dash-brand-soft)] rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-[var(--dash-brand)]" />
                </div>
                <div>
                  <p className="text-[var(--dash-ink)] font-mono font-bold">
                    {selectedBaggage.reference}
                  </p>
                  <p className="text-[var(--dash-muted)] text-sm">
                    {selectedBaggage.type === 'hajj' ? 'Hajj 2026' : 'Voyageur'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Pèlerin</p>
                  {selectedBaggage.travelerFirstName || selectedBaggage.travelerLastName ? (
                    <p className="text-[var(--dash-ink)] font-medium">
                      {selectedBaggage.travelerFirstName} {selectedBaggage.travelerLastName}
                    </p>
                  ) : (
                    <span className="dash-badge dash-badge-warning mt-1">À attribuer</span>
                  )}
                </div>
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Type</p>
                  <p className="text-[var(--dash-ink)]">
                    {selectedBaggage.baggageType} #{selectedBaggage.baggageIndex}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[var(--dash-muted)] text-sm">WhatsApp</p>
                {selectedBaggage.whatsappOwner ? (
                  <p className="text-[var(--dash-ink)]">{selectedBaggage.whatsappOwner}</p>
                ) : (
                  <span className="text-[#D97706] dark:text-amber-400 text-sm">
                    Non renseigné
                  </span>
                )}
              </div>

              {/* Edit Form for unassigned baggages */}
              {!selectedBaggage.travelerFirstName && !selectedBaggage.travelerLastName && (
                <div className="p-4 bg-[#FEF3C7]/60 dark:bg-amber-500/10 border border-[#F59E0B]/30 dark:border-amber-500/30 rounded-xl">
                  <h4 className="text-[#D97706] dark:text-amber-400 font-medium mb-3">
                    Attribuer ce colis
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Prénom"
                        className="w-full px-3 py-2 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-lg text-sm text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand)]/30 focus:border-[var(--dash-brand)] outline-none"
                        onChange={(e) =>
                          setSelectedBaggage({
                            ...selectedBaggage,
                            travelerFirstName: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Nom"
                        className="w-full px-3 py-2 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-lg text-sm text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand)]/30 focus:border-[var(--dash-brand)] outline-none"
                        onChange={(e) =>
                          setSelectedBaggage({
                            ...selectedBaggage,
                            travelerLastName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="WhatsApp (ex: +33612345678)"
                      className="w-full px-3 py-2 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-lg text-sm text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand)]/30 focus:border-[var(--dash-brand)] outline-none"
                      onChange={(e) =>
                        setSelectedBaggage({
                          ...selectedBaggage,
                          whatsappOwner: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/baggage/${selectedBaggage.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              travelerFirstName: selectedBaggage.travelerFirstName,
                              travelerLastName: selectedBaggage.travelerLastName,
                              whatsappOwner: selectedBaggage.whatsappOwner,
                              status: 'active',
                            }),
                          });
                          if (res.ok) {
                            fetchBaggages();
                            setShowDetailModal(false);
                          }
                        } catch (error) {
                          console.error('Error updating baggage:', error);
                        }
                      }}
                      className="w-full py-2 bg-[var(--dash-brand)] hover:bg-[var(--dash-brand-2)] text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Statut</p>
                  <div className="mt-1">{getStatusBadge(selectedBaggage.status)}</div>
                </div>
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Créé le</p>
                  <p className="text-[var(--dash-ink)]">{formatDate(selectedBaggage.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-[var(--dash-muted)] text-sm">Dernier scan</p>
                <p className="text-[var(--dash-ink)]">
                  {formatDateTime(selectedBaggage.lastScanDate)}
                </p>
                {selectedBaggage.lastLocation && (
                  <p className="text-[var(--dash-muted)] text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {selectedBaggage.lastLocation}
                  </p>
                )}
              </div>

              {/* Founder Information */}
              {selectedBaggage.founderName && (
                <div className="p-4 bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)]/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-[var(--dash-emerald)]" />
                    <p className="text-[var(--dash-emerald)] font-medium">Trouvé par</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--dash-ink)] font-medium">
                        {selectedBaggage.founderName}
                      </span>
                      {selectedBaggage.founderAt && (
                        <span className="text-xs text-[var(--dash-muted)]">
                          le {formatDate(selectedBaggage.founderAt)}
                        </span>
                      )}
                    </div>
                    {selectedBaggage.founderPhone && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${selectedBaggage.founderPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--dash-emerald)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          Contacter sur WhatsApp
                        </a>
                        <span className="text-[var(--dash-muted)] text-sm">
                          {selectedBaggage.founderPhone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[var(--dash-muted)] text-sm">Expire le</p>
                <p className="text-[var(--dash-ink)]">{formatDate(selectedBaggage.expiresAt)}</p>
              </div>

              {/* Colis Logistics Information */}
              {selectedBaggage.receiverName ||
              selectedBaggage.deliveredAt ||
              selectedBaggage.transportMode ||
              selectedBaggage.departureCity ? (
                <div className="bg-[var(--dash-brand-soft)] border border-[var(--dash-brand)]/20 rounded-xl p-4">
                  <p className="text-[var(--dash-brand)] font-medium text-sm mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Informations logistique
                  </p>
                  <div className="space-y-2">
                    {selectedBaggage.receiverName && (
                      <div className="flex justify-between">
                        <p className="text-[var(--dash-muted)] text-sm">Destinataire</p>
                        <p className="text-[var(--dash-ink)] font-medium">
                          {String(selectedBaggage.receiverName)}
                        </p>
                      </div>
                    )}
                    {selectedBaggage.receiverWhatsapp && (
                      <div className="flex justify-between">
                        <p className="text-[var(--dash-muted)] text-sm">WhatsApp destinataire</p>
                        <p className="text-[var(--dash-ink)] font-medium">
                          {String(selectedBaggage.receiverWhatsapp)}
                        </p>
                      </div>
                    )}
                    {selectedBaggage.transportMode && (
                      <div className="flex justify-between">
                        <p className="text-[var(--dash-muted)] text-sm">Mode de transport</p>
                        <p className="text-[var(--dash-ink)] font-medium">
                          {String(selectedBaggage.transportMode)}
                        </p>
                      </div>
                    )}
                    {selectedBaggage.departureCity && (
                      <div className="flex justify-between">
                        <p className="text-[var(--dash-muted)] text-sm">Ville de départ</p>
                        <p className="text-[var(--dash-ink)] font-medium">
                          {String(selectedBaggage.departureCity)}
                        </p>
                      </div>
                    )}
                    {selectedBaggage.departureDate && (
                      <div className="flex justify-between">
                        <p className="text-[var(--dash-muted)] text-sm">Date de départ</p>
                        <p className="text-[var(--dash-ink)] font-medium">
                          {formatDate(String(selectedBaggage.departureDate))}
                        </p>
                      </div>
                    )}
                    {selectedBaggage.deliveredAt && (
                      <div className="flex justify-between">
                        <p className="text-[var(--dash-muted)] text-sm">Date de livraison</p>
                        <p className="text-[var(--dash-emerald)] font-medium">
                          {formatDateTime(String(selectedBaggage.deliveredAt))}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="pt-4 border-t border-[var(--dash-border)]">
                <Link
                  href={`/scan/${selectedBaggage.reference}`}
                  className="block w-full text-center py-3 bg-[var(--dash-brand)] text-white rounded-xl hover:bg-[var(--dash-brand-2)] transition-colors font-medium"
                >
                  Tester le scan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && baggageToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="dash-card max-w-sm w-full shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FEE2E2] dark:bg-rose-500/10 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-[#DC2626] dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-[var(--dash-ink)] font-bold">Supprimer ce colis ?</h3>
                <p className="text-[var(--dash-muted)] text-sm">{baggageToDelete.reference}</p>
              </div>
            </div>
            <p className="text-[var(--dash-muted)] text-sm mb-6">
              Cette action est irréversible. Le colis de{' '}
              <strong className="text-[var(--dash-ink-2)]">
                {baggageToDelete.travelerFirstName || 'Non renseigné'}{' '}
                {baggageToDelete.travelerLastName || ''}
              </strong>{' '}
              sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setBaggageToDelete(null);
                }}
                className="flex-1 py-2 px-4 bg-[var(--dash-bg-3)] text-[var(--dash-ink-2)] rounded-xl hover:bg-[var(--dash-bg-2)] transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteBaggage}
                className="flex-1 py-2 px-4 bg-[#DC2626] text-white rounded-xl hover:bg-[#B91C1C] transition-colors font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
