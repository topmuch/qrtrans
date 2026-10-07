'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Search,
  Eye,
  Download,
  Share2,
  Trash2,
  Plane,
  QrCode,
  X,
  AlertTriangle,
  RefreshCw,
  Building2,
  ChevronDown,
  Archive,
  Image as ImageIcon,
  Loader2,
  CheckSquare,
  Square,
  Layers,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

interface QRSet {
  id: string;
  setId: string;
  type: string;
  agencyId: string | null;
  agencyName: string | null;
  createdAt: Date;
  qrCount: number;
  references: string[];
  status: string;
  travelerName: string | null;
  activationStatus: 'new' | 'partial' | 'activated';
  baggageIds: string[];
}

interface AgencyGroup {
  agencyId: string | null;
  agencyName: string;
  sets: QRSet[];
  totalQr: number;
  isExpanded: boolean;
}

interface Stats {
  totalSets: number;
  totalQr: number;
  hajjSets: number;
  voyageurSets: number;
}

export default function EtiquettesPage() {
  const qrRef = useRef<HTMLDivElement>(null);

  const [sets, setSets] = useState<QRSet[]>([]);
  const [agencyGroups, setAgencyGroups] = useState<AgencyGroup[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSets: 0,
    totalQr: 0,
    hajjSets: 0,
    voyageurSets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab] = useState<'voyageur'>('voyageur');

  // Selection state
  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set());

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedSet, setSelectedSet] = useState<QRSet | null>(null);

  // Download states
  const [downloadingSet, setDownloadingSet] = useState<string | null>(null);
  const [downloadingSingle, setDownloadingSingle] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<string>('');

  // Bulk delete state
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Computed: total QR in selection
  const selectedQrCount = useMemo(() => {
    return sets
      .filter(s => selectedSetIds.has(s.setId))
      .reduce((sum, s) => sum + s.qrCount, 0);
  }, [sets, selectedSetIds]);

  const allSetIds = useMemo(() => sets.map(s => s.setId), [sets]);
  const allSelected = allSetIds.length > 0 && selectedSetIds.size === allSetIds.length;
  const someSelected = selectedSetIds.size > 0 && !allSelected;

  useEffect(() => {
    fetchSets();
  }, [activeTab, search]);

  // ─── Selection helpers ───
  const toggleSelectSet = (setId: string) => {
    setSelectedSetIds(prev => {
      const next = new Set(prev);
      if (next.has(setId)) {
        next.delete(setId);
      } else {
        next.add(setId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSetIds(new Set());
    } else {
      setSelectedSetIds(new Set(allSetIds));
    }
  };

  const clearSelection = () => {
    setSelectedSetIds(new Set());
  };

  const fetchSets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('type', activeTab);
      if (search) params.set('search', search);

      const response = await fetch(`/api/qrcodes?${params}`);
      const data = await response.json();

      // Calculate activation status for each set
      const setsWithStatus = data.sets.map((set: QRSet) => ({
        ...set,
        activationStatus: getActivationStatus(set.status)
      }));

      // Filter to only show sets matching the active tab type
      const filteredSets = setsWithStatus.filter((set: QRSet) => set.type === activeTab);

      setSets(filteredSets);
      setStats(data.stats);

      // Group by agency
      const groupedByAgency = groupByAgency(filteredSets);
      setAgencyGroups(groupedByAgency);
    } catch (error) {
      console.error('Error fetching QR sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByAgency = (sets: QRSet[]): AgencyGroup[] => {
    const groups = new Map<string | null, AgencyGroup>();

    sets.forEach(set => {
      const key = set.agencyId || 'no-agency';
      const agencyName = set.agencyName || 'Sans agence';

      if (!groups.has(key)) {
        groups.set(key, {
          agencyId: set.agencyId,
          agencyName,
          sets: [],
          totalQr: 0,
          isExpanded: true,
        });
      }

      const group = groups.get(key)!;
      group.sets.push(set);
      group.totalQr += set.qrCount;
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (a.agencyId === null) return 1;
      if (b.agencyId === null) return -1;
      return a.agencyName.localeCompare(b.agencyName);
    });
  };

  const getActivationStatus = (status: string): 'new' | 'partial' | 'activated' => {
    if (status === 'active' || status === 'scanned') return 'activated';
    if (status === 'partial') return 'partial';
    return 'new';
  };

  const toggleAgencyGroup = (agencyId: string | null) => {
    setAgencyGroups(prev =>
      prev.map(group =>
        group.agencyId === agencyId
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
  };

  const handleDeleteSet = async () => {
    if (!selectedSet) return;

    try {
      const params = new URLSearchParams({ setId: selectedSet.setId });
      const response = await fetch(`/api/qrcodes?${params}`, { method: 'DELETE' });
      const data = await response.json();

      if (response.ok && data.success) {
        fetchSets();
        setShowDeleteModal(false);
        setSelectedSet(null);
      } else {
        alert(`Erreur: ${data.error || 'Erreur lors de la suppression'}`);
      }
    } catch (error) {
      console.error('Error deleting set:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // ─── Bulk Delete ───
  const handleBulkDelete = async () => {
    if (selectedSetIds.size === 0) return;
    setBulkDeleting(true);

    try {
      const response = await fetch('/api/qrcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setIds: Array.from(selectedSetIds) }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        fetchSets();
        setShowBulkDeleteModal(false);
        setSelectedSetIds(new Set());
      } else {
        alert(`Erreur: ${data.error || 'Erreur lors de la suppression en masse'}`);
      }
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Erreur lors de la suppression en masse');
    } finally {
      setBulkDeleting(false);
    }
  };

  // ─── Bulk Download (ZIP) ───
  const handleBulkDownload = async (set: QRSet) => {
    setDownloadingSet(set.setId);
    setDownloadProgress(`Génération de ${set.qrCount} QR codes...`);

    try {
      const response = await fetch('/api/qrcodes/download-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId: set.setId, format: 'png' }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur lors du téléchargement');
      }

      setDownloadProgress('Création du fichier ZIP...');

      // Download the ZIP file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QRTrans-${set.setId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Bulk download error:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
    } finally {
      setDownloadingSet(null);
      setDownloadProgress('');
    }
  };

  // ─── Single QR Download (PNG) ───
  const handleSingleDownload = async (reference: string) => {
    setDownloadingSingle(reference);

    try {
      const response = await fetch('/api/qrcodes/download-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, format: 'png', size: 600 }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reference}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Single download error:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
    } finally {
      setDownloadingSingle(null);
    }
  };

  const handleShareSet = async (set: QRSet) => {
    const shareUrl = `${window.location.origin}/scan/${set.references[0]}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QRTrans - ${set.setId}`,
          text: `${set.qrCount} QR codes pour ${set.agencyName || 'agence'}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Lien copié !');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Activation status badge
  const activationBadge = (status: QRSet['activationStatus']) => {
    if (status === 'activated') return <span className="dash-badge dash-badge-success">Activé</span>;
    if (status === 'partial') return <span className="dash-badge dash-badge-warning">Partiel</span>;
    return <span className="dash-badge dash-badge-neutral">Nouveau</span>;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">Étiquettes QR</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">
            {stats.totalSets} sets • {stats.totalQr} QR codes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="dash-search w-full sm:w-64">
            <Search className="w-4 h-4 text-[var(--dash-muted)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => fetchSets()}
            className="inline-flex items-center justify-center p-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-muted)] hover:bg-[var(--dash-bg-3)] hover:text-[var(--dash-ink)] transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/generer"
            className="btn-brand inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <QrCode className="w-4 h-4" />
            Générer QR
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total sets"
          value={stats.totalSets}
          subtitle="Sets générés"
          icon={Layers}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Total QR codes"
          value={stats.totalQr}
          subtitle="Étiquettes"
          icon={QrCode}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="Sets Colis"
          value={stats.voyageurSets}
          subtitle="Voyageurs"
          icon={Plane}
          color="violet"
          loading={loading}
        />
        <KpiCard
          label="Sélection"
          value={selectedSetIds.size}
          subtitle={`${selectedQrCount} QR codes`}
          icon={Archive}
          color="amber"
        />
      </div>

      {/* Tabs - Voyageur only */}
      <div className="flex gap-2 mb-6">
        <button
          className="btn-brand inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plane className="w-4 h-4" />
          Colis
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 text-white">
            {stats.voyageurSets}
          </span>
        </button>
      </div>

      {/* Download progress bar */}
      {downloadProgress && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)] text-[var(--dash-emerald)]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p className="text-sm font-medium">{downloadProgress}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="dash-card p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
        </div>
      ) : agencyGroups.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--dash-brand-soft)] mb-4">
            <Plane className="w-8 h-8 text-[var(--dash-brand)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--dash-ink)] mb-2">
            Aucun QR code Colis
          </h3>
          <p className="text-[var(--dash-muted)] mb-4">
            {search ? 'Aucun résultat pour votre recherche' : 'Commencez par générer des QR codes'}
          </p>
          {!search && (
            <Link
              href="/admin/generer"
              className="btn-brand inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <QrCode className="w-4 h-4" />
              Générer des QR codes
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select all bar */}
          <div className="dash-card flex items-center justify-between px-4 py-2.5">
            <button
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--dash-ink)] hover:text-[var(--dash-brand)] transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-[var(--dash-emerald)]" />
              ) : someSelected ? (
                <div className="relative">
                  <Square className="w-4 h-4 text-[var(--dash-emerald)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[var(--dash-emerald)] rounded-sm" />
                  </div>
                </div>
              ) : (
                <Square className="w-4 h-4 text-[var(--dash-muted-2)]" />
              )}
              {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            <span className="text-xs text-[var(--dash-muted)]">
              {allSetIds.length} set{allSetIds.length > 1 ? 's' : ''} au total
            </span>
          </div>

          {agencyGroups.map((group) => (
            <div
              key={group.agencyId || 'no-agency'}
              className="dash-card overflow-hidden"
            >
              {/* Agency Header */}
              <button
                onClick={() => toggleAgencyGroup(group.agencyId)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--dash-bg-3)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--dash-brand-soft)] shrink-0">
                    <Building2 className="w-5 h-5 text-[var(--dash-brand)]" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="font-semibold text-[var(--dash-ink)] truncate">
                      {group.agencyName}
                    </h3>
                    <p className="text-sm text-[var(--dash-muted)]">
                      {group.sets.length} set{group.sets.length > 1 ? 's' : ''} • {group.totalQr} QR codes
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-[var(--dash-muted)] transition-transform ${
                  group.isExpanded ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Sets in this agency */}
              {group.isExpanded && (
                <div className="border-t border-[var(--dash-border)]">
                  <div className="divide-y divide-[var(--dash-border)]">
                    {group.sets.map((set) => {
                      const isSelected = selectedSetIds.has(set.setId);
                      return (
                        <div
                          key={set.id}
                          className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-4 transition-colors ${
                            isSelected
                              ? 'bg-[var(--dash-brand-soft)] border-l-4 border-l-[var(--dash-brand)]'
                              : 'hover:bg-[var(--dash-bg-3)]'
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleSelectSet(set.setId)}
                              className="flex-shrink-0"
                              title={isSelected ? 'Désélectionner' : 'Sélectionner'}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-[var(--dash-brand)]" />
                              ) : (
                                <Square className="w-5 h-5 text-[var(--dash-muted-2)] hover:text-[var(--dash-muted)] transition-colors" />
                              )}
                            </button>

                            {/* QR Icon */}
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--dash-brand-soft)] shrink-0">
                              <QrCode className="w-6 h-6 text-[var(--dash-brand)]" />
                            </div>

                            {/* Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium text-[var(--dash-ink)]">
                                  {set.setId}
                                </h4>
                                {activationBadge(set.activationStatus)}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-[var(--dash-muted)] flex-wrap">
                                <span>{set.qrCount} QR</span>
                                {set.travelerName && (
                                  <span>• {set.travelerName}</span>
                                )}
                                <span>• {formatDate(set.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedSet(set);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-[var(--dash-muted)] hover:text-[var(--dash-brand)] hover:bg-[var(--dash-brand-soft)] rounded-lg transition-colors"
                              title="Voir les QR codes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {/* Bulk download (ZIP) */}
                            <button
                              onClick={() => handleBulkDownload(set)}
                              disabled={downloadingSet === set.setId}
                              className="p-2 text-[var(--dash-muted)] hover:text-[var(--dash-emerald)] hover:bg-[var(--dash-emerald-soft)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Télécharger tout en ZIP"
                            >
                              {downloadingSet === set.setId ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[var(--dash-emerald)]" />
                              ) : (
                                <Archive className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleShareSet(set)}
                              className="p-2 text-[var(--dash-muted)] hover:text-[var(--dash-brand)] hover:bg-[var(--dash-brand-soft)] rounded-lg transition-colors"
                              title="Partager"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSet(set);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-[var(--dash-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Bulk Delete Action Bar (sticky bottom) ─── */}
      {selectedSetIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--dash-card)] border-t border-[var(--dash-border)] shadow-2xl shadow-black/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-[var(--dash-ink)] text-sm">
                  {selectedSetIds.size} set{selectedSetIds.size > 1 ? 's' : ''} sélectionné{selectedSetIds.size > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-[var(--dash-muted)]">
                  {selectedQrCount} QR codes au total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={clearSelection}
                className="px-4 py-2.5 text-sm font-medium text-[var(--dash-ink)] bg-[var(--dash-bg-3)] hover:bg-[var(--dash-border)] rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer en masse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--dash-card)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[var(--dash-border)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--dash-border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--dash-ink)]">{selectedSet.setId}</h2>
                <p className="text-[var(--dash-muted)] text-sm">
                  {selectedSet.type === 'hajj' ? 'Hajj 2026' : 'Voyageur'} • {selectedSet.qrCount} QR codes
                  {selectedSet.agencyName && ` • ${selectedSet.agencyName}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSet(null);
                }}
                className="p-2 rounded-xl hover:bg-[var(--dash-bg-3)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--dash-muted)]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* ─── Bulk Download Section ─── */}
              <div className="rounded-xl p-4 space-y-3 bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)]">
                <div className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-[var(--dash-emerald)]" />
                  <h3 className="font-bold text-[var(--dash-emerald)] text-sm uppercase tracking-wider">
                    Téléchargement en lot
                  </h3>
                </div>
                <p className="text-sm text-[var(--dash-ink-2)]">
                  Téléchargez les <strong>{selectedSet.qrCount}</strong> QR codes en un seul fichier ZIP.
                  Chaque QR code est un fichier PNG individuel (400×400px, haute qualité).
                </p>
                <button
                  onClick={() => handleBulkDownload(selectedSet)}
                  disabled={downloadingSet === selectedSet.setId}
                  className="btn-emerald w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingSet === selectedSet.setId ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Archive className="w-5 h-5" />
                      Télécharger tout ({selectedSet.qrCount} QR) en ZIP
                    </>
                  )}
                </button>
              </div>

              {/* ─── QR Codes Grid (with individual download) ─── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[var(--dash-muted)]" />
                    <h3 className="font-bold text-[var(--dash-ink-2)] text-sm uppercase tracking-wider">
                      QR codes individuels
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--dash-muted-2)]">Cliquez sur un QR pour le télécharger</p>
                </div>

                <div
                  ref={qrRef}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                >
                  {selectedSet.references.map((ref, index) => (
                    <button
                      key={ref}
                      onClick={() => handleSingleDownload(ref)}
                      disabled={downloadingSingle === ref}
                      className="bg-[var(--dash-bg-3)] rounded-xl p-3 text-center hover:bg-[var(--dash-emerald-soft)] border-2 border-transparent hover:border-[var(--dash-emerald)] transition-all group disabled:opacity-50"
                      title={`Télécharger ${ref}`}
                    >
                      <div className="relative inline-block">
                        <QRCodeSVG
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${ref}`}
                          size={90}
                          level="H"
                          includeMargin={true}
                          bgColor="#f8fafc"
                          fgColor="#1E4B7A"
                        />
                        {/* Download overlay on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Download className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-[var(--dash-ink)] font-mono font-bold mt-2 text-xs truncate">
                        {ref}
                      </p>
                      <p className="text-[var(--dash-muted)] text-[10px]">
                        Colis #{index + 1}
                      </p>
                      {downloadingSingle === ref && (
                        <Loader2 className="w-4 h-4 text-[var(--dash-emerald)] animate-spin mx-auto mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--dash-bg-3)] rounded-xl p-4">
                  <p className="text-[var(--dash-muted)] text-sm">Créé le</p>
                  <p className="text-[var(--dash-ink)] font-medium">{formatDate(selectedSet.createdAt)}</p>
                </div>
                <div className="bg-[var(--dash-bg-3)] rounded-xl p-4">
                  <p className="text-[var(--dash-muted)] text-sm">Statut</p>
                  <p className="text-[var(--dash-ink)] font-medium capitalize">
                    {selectedSet.activationStatus === 'activated' ? 'Activé' :
                     selectedSet.activationStatus === 'partial' ? 'Partiel' : 'Nouveau'}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleBulkDownload(selectedSet)}
                  disabled={downloadingSet === selectedSet.setId}
                  className="btn-emerald flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingSet === selectedSet.setId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      Télécharger ZIP ({selectedSet.qrCount})
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleShareSet(selectedSet)}
                  className="flex-1 py-3 bg-[var(--dash-bg-3)] text-[var(--dash-ink)] hover:bg-[var(--dash-border)] rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (single) */}
      {showDeleteModal && selectedSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--dash-card)] rounded-2xl max-w-sm w-full border border-[var(--dash-border)]">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-[var(--dash-ink)] font-bold">Supprimer ce set ?</h3>
                  <p className="text-[var(--dash-muted)] text-sm">{selectedSet.setId}</p>
                </div>
              </div>
              <p className="text-[var(--dash-muted)] text-sm mb-6">
                Cette action supprimera définitivement les {selectedSet.qrCount} QR codes de ce set.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedSet(null);
                  }}
                  className="flex-1 py-2 px-4 bg-[var(--dash-bg-3)] text-[var(--dash-ink)] rounded-lg hover:bg-[var(--dash-border)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteSet}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && selectedSetIds.size > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-[var(--dash-card)] rounded-2xl max-w-md w-full border border-[var(--dash-border)]">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-[var(--dash-ink)] font-bold">Suppression en masse</h3>
                  <p className="text-[var(--dash-muted)] text-sm">
                    {selectedSetIds.size} set{selectedSetIds.size > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
                  Les éléments suivants seront supprimés définitivement :
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {Array.from(selectedSetIds).map((setId) => {
                    const set = sets.find(s => s.setId === setId);
                    return (
                      <p key={setId} className="text-xs text-red-700 dark:text-red-300 font-mono flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                        {setId} {set ? `(${set.qrCount} QR)` : ''}
                      </p>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[var(--dash-bg-3)] rounded-xl p-3 mb-6">
                <p className="text-sm text-[var(--dash-ink-2)] text-center">
                  <strong className="text-red-600 dark:text-red-400">{selectedQrCount}</strong> QR codes seront supprimés au total.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkDeleteModal(false);
                  }}
                  disabled={bulkDeleting}
                  className="flex-1 py-2.5 px-4 bg-[var(--dash-bg-3)] text-[var(--dash-ink)] rounded-lg hover:bg-[var(--dash-border)] transition-colors font-medium disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Confirmer la suppression
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
