'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  MousePointer,
  Image as ImageIcon,
  RefreshCw,
  X,
  Save,
  Play,
  Pause,
  AlertCircle,
  TrendingUp,
  Users,
  Building2,
  Globe,
  Megaphone,
  Target,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkTarget: string;
  position: string;
  targetScope: string;
  agencyId: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  priority: number;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  _count?: { adImpressions: number };
}

interface Agency {
  id: string;
  name: string;
}

interface ApiResponse {
  advertisements: Advertisement[];
  agencies: Agency[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface StatsSummary {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: string;
}

interface TopAd {
  id: string;
  title: string;
  impressions: number;
  clicks: number;
  ctr: string;
}

export default function PublicitesPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [agencyFilter, setAgencyFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    linkTarget: '_blank',
    position: 'footer',
    targetScope: 'all',
    agencyId: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    priority: 0
  });

  // Stats
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [topAds, setTopAds] = useState<TopAd[]>([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchAdvertisements();
    fetchStats();
  }, [statusFilter, agencyFilter, page]);

  const fetchAdvertisements = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (agencyFilter !== 'all') params.append('agencyId', agencyFilter);
      params.append('page', String(page));
      params.append('limit', '10');

      const response = await fetch(`/api/admin/advertisements?${params}`, { credentials: 'same-origin' });

      if (response.status === 401) {
        setAuthError('Session expirée — Veuillez vous reconnecter');
        return;
      }
      if (response.status === 403) {
        setAuthError('Accès non autorisé — Permissions insuffisantes');
        return;
      }

      const result = await response.json();

      if (result.advertisements) {
        setData(result);
        setAgencies(result.agencies || []);
      }
      if (result.error) {
        setAuthError(result.error);
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      setAuthError('Erreur de connexion — Vérifiez votre réseau');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/advertisements/stats', { credentials: 'same-origin' });

      if (response.status === 401 || response.status === 403) {
        return; // Stats are non-critical, don't show auth error
      }

      const result = await response.json();
      if (result.summary) {
        setStats(result.summary);
        setTopAds(result.topAds || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedAd(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      linkTarget: '_blank',
      position: 'footer',
      targetScope: 'all',
      agencyId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'draft',
      priority: 0
    });
    setShowModal(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setModalMode('edit');
    setSelectedAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || '',
      linkTarget: ad.linkTarget,
      position: ad.position || 'footer',
      targetScope: ad.targetScope,
      agencyId: ad.agencyId || '',
      startDate: new Date(ad.startDate).toISOString().split('T')[0],
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
      status: ad.status,
      priority: ad.priority
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl || !formData.startDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/advertisements';
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const body = modalMode === 'create'
        ? formData
        : { id: selectedAd?.id, ...formData };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowModal(false);
        fetchAdvertisements();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving advertisement:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/advertisements?id=${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (response.ok) {
        fetchAdvertisements();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting advertisement:', error);
    }
  };

  const toggleStatus = async (ad: Advertisement) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';

    try {
      const response = await fetch('/api/admin/advertisements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          id: ad.id,
          ...ad,
          status: newStatus
        })
      });

      if (response.ok) {
        fetchAdvertisements();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'dash-badge dash-badge-success',
      paused: 'dash-badge dash-badge-warning',
      draft: 'dash-badge dash-badge-neutral',
      expired: 'dash-badge dash-badge-danger'
    };
    const icons: Record<string, React.ElementType> = {
      active: Play,
      paused: Pause,
      draft: Edit,
      expired: AlertCircle
    };

    const cls = styles[status] || styles.draft;
    const Icon = icons[status] || icons.draft;
    const labels: Record<string, string> = {
      active: 'Active',
      paused: 'En pause',
      draft: 'Brouillon',
      expired: 'Expirée'
    };

    return (
      <span className={cls}>
        <Icon className="w-3 h-3" />
        {labels[status] || status}
      </span>
    );
  };

  const getTargetBadge = (scope: string, agencyId: string | null) => {
    if (scope === 'all') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-[var(--dash-muted)]">
          <Globe className="w-3 h-3" />
          Toutes les agences
        </span>
      );
    }
    if (scope === 'agents') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-[var(--dash-brand)]">
          <Users className="w-3 h-3" />
          Agents commerciaux
        </span>
      );
    }
    if (scope === 'agency' && agencyId) {
      const agency = agencies.find(a => a.id === agencyId);
      return (
        <span className="inline-flex items-center gap-1 text-xs text-[var(--dash-brand)]">
          <Building2 className="w-3 h-3" />
          {agency?.name || 'Agence spécifique'}
        </span>
      );
    }
    return null;
  };

  const calculateCtr = (ad: Advertisement) => {
    if (ad.impressions === 0) return '0.00';
    return ((ad.clicks / ad.impressions) * 100).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[var(--dash-brand)]" />
            Gestion des Publicités
          </h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Créez et gérez les bannières publicitaires pour les agences</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </button>
          <button
            onClick={openCreateModal}
            className="btn-brand btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouvelle publicité
          </button>
        </div>
      </div>

      {/* Auth Error Banner */}
      {authError && (
        <div className="mb-6 bg-[var(--dash-bg-3)] border border-[var(--dash-border-strong)] rounded-xl p-4">
          <p className="text-[var(--dash-ink-2)] text-sm font-medium">{authError}</p>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className={`grid gap-4 mb-6 ${showStats ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
          <KpiCard
            label="Total"
            value={stats.totalAds}
            subtitle="Publicités"
            icon={Megaphone}
            color="brand"
          />
          <KpiCard
            label="Actives"
            value={stats.activeAds}
            subtitle="En cours"
            icon={Play}
            color="emerald"
          />
          <KpiCard
            label="Impressions"
            value={stats.totalImpressions}
            subtitle="Vues cumulées"
            icon={Eye}
            color="cyan"
          />
          <KpiCard
            label="Clics"
            value={stats.totalClicks}
            subtitle="Interactions"
            icon={MousePointer}
            color="violet"
          />
          {showStats && (
            <KpiCard
              label="CTR Moyen"
              value={`${stats.avgCtr}%`}
              subtitle="Taux de clics"
              icon={Target}
              color="amber"
            />
          )}
        </div>
      )}

      {/* Top Ads */}
      {showStats && topAds.length > 0 && (
        <div className="dash-card p-5 mb-6">
          <h3 className="text-sm font-medium text-[var(--dash-muted)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top 3 Publicités par Clics
          </h3>
          <div className="space-y-3">
            {topAds.map((ad, index) => (
              <div key={ad.id} className="flex items-center justify-between p-3 bg-[var(--dash-bg-3)] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                    index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-[var(--dash-ink)] font-medium">{ad.title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[var(--dash-muted)]">
                    {ad.impressions.toLocaleString()} imp.
                  </span>
                  <span className="text-[var(--dash-brand)] font-medium">
                    {ad.clicks.toLocaleString()} clics
                  </span>
                  <span className="text-[var(--dash-emerald)] font-medium">
                    {ad.ctr}% CTR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] rounded-lg">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="paused">En pause</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="expired">Expirées</SelectItem>
          </SelectContent>
        </Select>

        <Select value={agencyFilter} onValueChange={(v) => { setAgencyFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] rounded-lg">
            <SelectValue placeholder="Agence" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
            <SelectItem value="all">Toutes les agences</SelectItem>
            {agencies.map(agency => (
              <SelectItem key={agency.id} value={agency.id}>{agency.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={() => { fetchAdvertisements(); fetchStats(); }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--dash-muted)] hover:bg-[var(--dash-bg-3)] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Rafraîchir</span>
        </button>
      </div>

      {/* Advertisements Table */}
      <div className="dash-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Publicité</th>
                <th>Cible</th>
                <th>Statut</th>
                <th>Dates</th>
                <th>Stats</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : data?.advertisements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <ImageIcon className="w-12 h-12 text-[var(--dash-muted-2)] mb-3" />
                      <p className="text-[var(--dash-muted)]">Aucune publicité trouvée</p>
                      <button
                        onClick={openCreateModal}
                        className="mt-2 text-[var(--dash-brand)] hover:underline text-sm font-medium"
                      >
                        Créer la première publicité
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.advertisements.map((ad) => (
                  <tr key={ad.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-[var(--dash-bg-3)] flex-shrink-0">
                          {ad.imageUrl ? (
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-[var(--dash-muted-2)]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--dash-ink)]">{ad.title}</p>
                          {ad.description && (
                            <p className="text-xs text-[var(--dash-muted)] truncate max-w-xs">
                              {ad.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {getTargetBadge(ad.targetScope, ad.agencyId)}
                    </td>
                    <td>
                      {getStatusBadge(ad.status)}
                    </td>
                    <td>
                      <div className="text-sm">
                        <p className="text-[var(--dash-ink)]">
                          {new Date(ad.startDate).toLocaleDateString('fr-FR')}
                        </p>
                        {ad.endDate && (
                          <p className="text-[var(--dash-muted)] text-xs">
                            → {new Date(ad.endDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-[var(--dash-ink-2)]">
                          <Eye className="w-3 h-3" />
                          {ad.impressions.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-[var(--dash-brand)]">
                          <MousePointer className="w-3 h-3" />
                          {ad.clicks.toLocaleString()}
                        </span>
                        <span className="text-[var(--dash-emerald)] font-medium">
                          {calculateCtr(ad)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(ad)}
                          className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors"
                          title={ad.status === 'active' ? 'Mettre en pause' : 'Activer'}
                        >
                          {ad.status === 'active' ? (
                            <Pause className="w-4 h-4 text-[var(--dash-ink-2)]" />
                          ) : (
                            <Play className="w-4 h-4 text-[var(--dash-emerald)]" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(ad)}
                          className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-[var(--dash-muted)]" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--dash-border)]">
            <p className="text-sm text-[var(--dash-muted)]">
              Affichage de {((page - 1) * 10) + 1} à {Math.min(page * 10, data.pagination.total)} sur {data.pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] disabled:opacity-50 transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] disabled:opacity-50 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-[var(--dash-ink)]">
                  {modalMode === 'create' ? 'Nouvelle publicité' : 'Modifier la publicité'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-[var(--dash-bg-3)] text-[var(--dash-muted)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">Titre *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Offre spéciale Hajj 2026"
                    className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description courte de l'offre..."
                    rows={2}
                    className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">URL de l&apos;image *</Label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://exemple.com/banniere.jpg"
                    className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden bg-[var(--dash-bg-3)] h-24">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Link URL */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">URL du lien (optionnel)</Label>
                  <Input
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="https://exemple.com/offre"
                    className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                  />
                </div>

                {/* Position - Fixed to footer only */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">Emplacement</Label>
                  <div className="mt-1 p-3 bg-[var(--dash-bg-3)] rounded-xl border border-[var(--dash-border)]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--dash-brand-soft)] flex items-center justify-center">
                        <Target className="w-4 h-4 text-[var(--dash-brand)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--dash-ink)]">Footer (Bas de page)</p>
                        <p className="text-xs text-[var(--dash-muted)]">Affiché en bas du tableau de bord agence</p>
                      </div>
                    </div>
                  </div>
                  <input type="hidden" value="footer" name="position" />
                </div>

                {/* Target Scope */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">Ciblage</Label>
                  <Select
                    value={formData.targetScope}
                    onValueChange={(v) => setFormData({ ...formData, targetScope: v, agencyId: '' })}
                  >
                    <SelectTrigger className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Toutes les agences
                        </div>
                      </SelectItem>
                      <SelectItem value="agents">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Agents commerciaux uniquement
                        </div>
                      </SelectItem>
                      <SelectItem value="agency">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Agence spécifique
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Agency Selection */}
                {formData.targetScope === 'agency' && (
                  <div>
                    <Label className="text-[var(--dash-ink-2)]">Sélectionner l&apos;agence</Label>
                    <Select
                      value={formData.agencyId}
                      onValueChange={(v) => setFormData({ ...formData, agencyId: v })}
                    >
                      <SelectTrigger className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                        <SelectValue placeholder="Choisir une agence" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                        {agencies.map(agency => (
                          <SelectItem key={agency.id} value={agency.id}>{agency.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[var(--dash-ink-2)]">Date de début *</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                    />
                  </div>
                  <div>
                    <Label className="text-[var(--dash-ink-2)]">Date de fin</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                    />
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[var(--dash-ink-2)]">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">En pause</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[var(--dash-ink-2)]">Priorité</Label>
                    <Input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                    />
                    <p className="text-xs text-[var(--dash-muted)] mt-1">
                      Plus élevé = affichage prioritaire
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--dash-border)]">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-brand btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
