'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Luggage,
  Search,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  MapPin,
  QrCode,
  X,
  Plus,
  Filter,
  AlertOctagon,
  PackageCheck,
  Truck,
} from "lucide-react";
import { useAgency } from '../layout';
import { isActive, isPending, isLost, isInTransit, isDelivered } from '@/lib/status';
import KpiCard from '@/components/dashboard/KpiCard';

interface Baggage {
  id: string;
  reference: string;
  type: string;
  travelerFirstName: string | null;
  travelerLastName: string | null;
  whatsappOwner: string | null;
  receiverName: string | null;
  receiverWhatsapp: string | null;
  baggageIndex: number;
  baggageType: string;
  colisType: string | null;
  status: string;
  transportMode: string;
  busCompany: string | null;
  airlineName: string | null;
  departureCity: string | null;
  destination: string | null;
  departureDate: string | null;
  departureTime: string | null;
  deliveryLocation: string | null;
  arrivedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  lastScanDate: string | null;
  lastLocation: string | null;
}

export default function BaggagesPage() {
  const { agencyId, agencyName } = useAgency();
  const [baggages, setBaggages] = useState<Baggage[]>([]);
  const [filteredBaggages, setFilteredBaggages] = useState<Baggage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBaggage, setSelectedBaggage] = useState<Baggage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBaggages();
  }, [agencyId]);

  useEffect(() => {
    filterBaggages();
  }, [baggages, search, statusFilter]);

  const fetchBaggages = async () => {
    try {
      const params = new URLSearchParams({
        agencyId: agencyId,
      });

      const response = await fetch(`/api/agency/baggages?${params}`);
      const data = await response.json();
      setBaggages(data.baggages || []);
    } catch (error) {
      console.error('Error fetching baggages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBaggages = () => {
    let filtered = [...baggages];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(b =>
        b.reference.toLowerCase().includes(searchLower) ||
        `${b.travelerFirstName || ''} ${b.travelerLastName || ''}`.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBaggages(filtered);
  };

  const transitBaggages = filteredBaggages.filter(b =>
    isInTransit(b.status) || isDelivered(b.status)
  );
  const activatedBaggages = filteredBaggages.filter(b =>
    (isActive(b.status) || b.travelerFirstName !== null || b.status === 'lost' || b.status === 'found' || b.status === 'blocked')
    && !isInTransit(b.status) && !isDelivered(b.status)
  );
  const pendingBaggages = filteredBaggages.filter(b =>
    isPending(b.status) && b.travelerFirstName === null && b.travelerLastName === null
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' à ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeclareLost = async (baggageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir déclarer ce colis comme perdu ? Une alerte sera envoyée au SuperAdmin.')) return;

    setActionLoading(baggageId);
    try {
      const response = await fetch(`/api/baggage/${baggageId}/declare-lost`, {
        method: 'PUT',
      });
      const data = await response.json();

      if (response.ok) {
        setBaggages(prev => prev.map(b =>
          b.id === baggageId ? { ...b, status: 'lost' } : b
        ));
        setShowDetailModal(false);
        setSelectedBaggage(null);
      } else {
        alert(data.error || 'Erreur lors de la déclaration');
      }
    } catch (error) {
      console.error('Declare lost error:', error);
      alert('Erreur lors de la déclaration');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkFound = async (baggageId: string) => {
    if (!confirm('Marquer ce colis comme retrouvé ?')) return;

    setActionLoading(baggageId);
    try {
      const response = await fetch(`/api/baggage/${baggageId}/mark-found`, {
        method: 'PUT',
      });
      const data = await response.json();

      if (response.ok) {
        setBaggages(prev => prev.map(b =>
          b.id === baggageId ? { ...b, status: 'found' } : b
        ));
        setShowDetailModal(false);
        setSelectedBaggage(null);
      } else {
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Mark found error:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      pending_activation: 'dash-badge dash-badge-warning',
      active: 'dash-badge dash-badge-success',
      scanned: 'dash-badge dash-badge-info',
      in_transit: 'dash-badge dash-badge-warning',
      delivered: 'dash-badge dash-badge-success',
      lost: 'dash-badge dash-badge-danger',
      found: 'dash-badge dash-badge-success',
      blocked: 'dash-badge dash-badge-neutral',
    };

    const labels: Record<string, string> = {
      pending_activation: 'En attente',
      active: 'Actif',
      scanned: 'Scanné',
      in_transit: 'En transit',
      delivered: 'Livré',
      lost: 'Perdu',
      found: 'Retrouvé',
      blocked: 'Bloqué',
    };

    const cls = statusConfig[status] || 'dash-badge dash-badge-neutral';
    const label = labels[status] || status;

    return <span className={cls}>{label}</span>;
  };

  const filterButtons = [
    { id: 'all', label: 'Tous' },
    { id: 'in_transit', label: 'En transit' },
    { id: 'delivered', label: 'Livrés' },
    { id: 'pending_activation', label: 'En attente' },
    { id: 'lost', label: 'Perdus' },
    { id: 'found', label: 'Retrouvés' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
          <Luggage className="w-6 h-6 text-[var(--dash-brand)]" />
          Gestion des colis
        </h1>
        <p className="text-sm text-[var(--dash-muted)] mt-1">Liste complète des colis de votre agence</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          label="Total colis"
          value={baggages.length}
          subtitle="Tous statuts"
          icon={Luggage}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="En transit"
          value={baggages.filter(b => isInTransit(b.status)).length}
          subtitle="En cours d'acheminement"
          icon={Truck}
          color="amber"
          loading={loading}
        />
        <KpiCard
          label="Livrés"
          value={baggages.filter(b => isDelivered(b.status)).length}
          subtitle="Reçus par destinataire"
          icon={PackageCheck}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="En attente"
          value={baggages.filter(b => isPending(b.status)).length}
          subtitle="Non assignés"
          icon={Clock}
          color="violet"
          loading={loading}
        />
        <KpiCard
          label="Perdus"
          value={baggages.filter(b => isLost(b.status)).length}
          subtitle="À retrouver"
          icon={AlertTriangle}
          color="rose"
          loading={loading}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--dash-muted-2)]" />
          <input
            type="text"
            placeholder="Rechercher par nom ou référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 pl-12 pr-4 text-[var(--dash-ink)] placeholder-[var(--dash-muted-2)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setStatusFilter(btn.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              statusFilter === btn.id
                ? 'bg-[var(--dash-brand)] text-white'
                : 'bg-[var(--dash-card)] text-[var(--dash-muted)] hover:bg-[var(--dash-bg-3)] border border-[var(--dash-border)]'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="dash-card p-12 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
            <span className="text-[var(--dash-muted)]">Chargement...</span>
          </div>
        </div>
      ) : filteredBaggages.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <Luggage className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
          <p className="text-[var(--dash-muted)]">Aucun colis trouvé</p>
        </div>
      ) : (
        <>
          {/* Section 1 — Colis en transit / livrés */}
          {transitBaggages.length > 0 && (
            <div className="dash-card overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-[var(--dash-border)] bg-[var(--dash-bg-3)]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[var(--dash-brand)]" />
                  <h2 className="text-sm font-semibold text-[var(--dash-ink)]">
                    Colis en transit / livrés ({transitBaggages.length})
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Expéditeur</th>
                      <th className="hidden md:table-cell">Trajet</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transitBaggages.map((baggage) => (
                      <tr key={baggage.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDelivered(baggage.status) ? 'bg-[var(--dash-emerald-soft)]' : 'bg-[var(--dash-brand-soft)]'}`}>
                              <QrCode className={`w-4 h-4 ${isDelivered(baggage.status) ? 'text-[var(--dash-emerald)]' : 'text-[var(--dash-brand)]'}`} />
                            </div>
                            <span className="text-[var(--dash-ink)] font-mono font-medium">
                              {baggage.reference}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-[var(--dash-ink)] font-medium">
                            {baggage.travelerFirstName || '—'}
                          </span>
                          {baggage.receiverName && (
                            <p className="text-[var(--dash-muted-2)] text-xs mt-0.5">
                              → {baggage.receiverName}
                            </p>
                          )}
                        </td>
                        <td className="hidden md:table-cell">
                          <span className="text-[var(--dash-ink-2)] text-sm">
                            {baggage.departureCity || '—'} → {baggage.destination || '—'}
                          </span>
                        </td>
                        <td>
                          {getStatusBadge(baggage.status)}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedBaggage(baggage);
                              setShowDetailModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors group"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[var(--dash-brand)]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-[var(--dash-border)] bg-[var(--dash-bg-3)]">
                <span className="text-[var(--dash-muted)] text-sm">
                  {transitBaggages.length} colis en transit / livré(s)
                </span>
              </div>
            </div>
          )}

          {/* Section 2 — Bagages activés */}
          {activatedBaggages.length > 0 && (
            <div className="dash-card overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-[var(--dash-border)] bg-[var(--dash-bg-3)]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--dash-emerald)]" />
                  <h2 className="text-sm font-semibold text-[var(--dash-ink)]">
                    Colis activés ({activatedBaggages.length})
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Pèlerin</th>
                      <th className="hidden md:table-cell">Dernier scan</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activatedBaggages.map((baggage) => (
                      <tr key={baggage.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[var(--dash-emerald-soft)] flex items-center justify-center">
                              <QrCode className="w-4 h-4 text-[var(--dash-emerald)]" />
                            </div>
                            <span className="text-[var(--dash-ink)] font-mono font-medium">
                              {baggage.reference}
                            </span>
                          </div>
                        </td>
                        <td>
                          {baggage.travelerFirstName || baggage.travelerLastName ? (
                            <span className="text-[var(--dash-ink)] font-medium">
                              {baggage.travelerFirstName} {baggage.travelerLastName}
                            </span>
                          ) : (
                            <span className="dash-badge dash-badge-warning">
                              Non assigné
                            </span>
                          )}
                        </td>
                        <td className="hidden md:table-cell">
                          {baggage.lastScanDate ? (
                            <span className="text-[var(--dash-ink-2)]">{formatDateTime(baggage.lastScanDate)}</span>
                          ) : (
                            <span className="text-[var(--dash-muted-2)]">Jamais</span>
                          )}
                        </td>
                        <td>
                          {getStatusBadge(baggage.status)}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {isActive(baggage.status) && (
                              <button
                                onClick={() => handleDeclareLost(baggage.id)}
                                disabled={actionLoading === baggage.id}
                                className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors group"
                                title="Déclarer perdu"
                              >
                                {actionLoading === baggage.id ? (
                                  <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                ) : (
                                  <AlertOctagon className="w-4 h-4 text-red-500" />
                                )}
                              </button>
                            )}
                            {baggage.status === 'lost' && (
                              <button
                                onClick={() => handleMarkFound(baggage.id)}
                                disabled={actionLoading === baggage.id}
                                className="p-2 rounded-lg bg-[var(--dash-emerald-soft)] hover:opacity-80 transition-opacity group"
                                title="Marquer retrouvé"
                              >
                                {actionLoading === baggage.id ? (
                                  <div className="w-4 h-4 border-2 border-[var(--dash-emerald)]/30 border-t-[var(--dash-emerald)] rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-[var(--dash-emerald)]" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedBaggage(baggage);
                                setShowDetailModal(true);
                              }}
                              className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors group"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[var(--dash-brand)]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-[var(--dash-border)] bg-[var(--dash-bg-3)]">
                <span className="text-[var(--dash-muted)] text-sm">
                  {activatedBaggages.length} colis activé(s)
                </span>
              </div>
            </div>
          )}

          {/* Section 3 — QR en attente d'activation */}
          {pendingBaggages.length > 0 && (
            <div className="dash-card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--dash-border)] bg-[var(--dash-bg-3)]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-[var(--dash-ink)]">
                    QR en attente d&apos;activation ({pendingBaggages.length})
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Pèlerin</th>
                      <th className="hidden md:table-cell">Type</th>
                      <th className="hidden md:table-cell">Créé le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBaggages.map((baggage) => (
                      <tr key={baggage.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                              <QrCode className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-[var(--dash-ink)] font-mono font-medium">
                              {baggage.reference}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="dash-badge dash-badge-warning">
                            Non assigné
                          </span>
                        </td>
                        <td className="hidden md:table-cell">
                          <span className="text-[var(--dash-ink-2)] text-sm capitalize">
                            {baggage.baggageType === 'cabine' ? 'Cabine' : 'Soute'}
                          </span>
                        </td>
                        <td className="hidden md:table-cell">
                          <span className="text-[var(--dash-muted)] text-sm">
                            {formatDate(baggage.createdAt)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedBaggage(baggage);
                                setShowDetailModal(true);
                              }}
                              className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors group"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[var(--dash-brand)]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-[var(--dash-border)] bg-[var(--dash-bg-3)]">
                <span className="text-[var(--dash-muted)] text-sm">
                  {pendingBaggages.length} QR en attente d&apos;activation
                </span>
              </div>
            </div>
          )}

          {/* Footer global */}
          <div className="text-center mt-4">
            <span className="text-[var(--dash-muted-2)] text-xs">
              {filteredBaggages.length} colis affiché(s) sur {baggages.length}
            </span>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBaggage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--dash-card)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[var(--dash-border)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--dash-border)]">
              <h2 className="font-display text-lg font-bold text-[var(--dash-ink)]">Détails du colis</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBaggage(null);
                }}
                className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--dash-muted)]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isInTransit(selectedBaggage.status) ? 'bg-[var(--dash-brand-soft)]' :
                  isDelivered(selectedBaggage.status) ? 'bg-[var(--dash-emerald-soft)]' :
                  'bg-amber-100 dark:bg-amber-500/15'
                }`}>
                  <QrCode className={`w-6 h-6 ${
                    isInTransit(selectedBaggage.status) ? 'text-[var(--dash-brand)]' :
                    isDelivered(selectedBaggage.status) ? 'text-[var(--dash-emerald)]' :
                    'text-amber-500'
                  }`} />
                </div>
                <div>
                  <p className="text-[var(--dash-ink)] font-mono font-bold">{selectedBaggage.reference}</p>
                  <p className="text-[var(--dash-muted)] text-sm">{selectedBaggage.type === 'hajj' ? 'Hajj 2026' : 'Voyageur'}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedBaggage.status)}
              </div>

              {/* Expéditeur / Destinataire — colis info */}
              {isInTransit(selectedBaggage.status) || isDelivered(selectedBaggage.status) ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[var(--dash-muted)] text-xs mb-1">Expéditeur</p>
                      <p className="text-[var(--dash-ink)] font-medium text-sm">{selectedBaggage.travelerFirstName || '—'}</p>
                      {selectedBaggage.whatsappOwner && (
                        <p className="text-[var(--dash-muted)] text-xs">{selectedBaggage.whatsappOwner}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[var(--dash-muted)] text-xs mb-1">Destinataire</p>
                      <p className="text-[var(--dash-ink)] font-medium text-sm">{selectedBaggage.receiverName || '—'}</p>
                      {selectedBaggage.receiverWhatsapp && (
                        <p className="text-[var(--dash-muted)] text-xs">{selectedBaggage.receiverWhatsapp}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[var(--dash-muted)] text-xs mb-1">Trajet</p>
                      <p className="text-[var(--dash-ink)] font-medium text-sm">{selectedBaggage.departureCity || '—'} → {selectedBaggage.destination || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--dash-muted)] text-xs mb-1">Compagnie</p>
                      <p className="text-[var(--dash-ink)] font-medium text-sm">{selectedBaggage.busCompany || selectedBaggage.airlineName || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[var(--dash-muted)] text-xs mb-1">Départ</p>
                      <p className="text-[var(--dash-ink)] text-sm">
                        {selectedBaggage.departureDate ? formatDate(selectedBaggage.departureDate) : '—'}
                        {selectedBaggage.departureTime ? ` à ${selectedBaggage.departureTime}` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--dash-muted)] text-xs mb-1">Lieu de livraison</p>
                      <p className="text-[var(--dash-ink)] text-sm">{selectedBaggage.deliveryLocation || '—'}</p>
                    </div>
                  </div>
                  {isDelivered(selectedBaggage.status) && (
                    <div>
                      <p className="text-[var(--dash-muted)] text-xs mb-1">Livré le</p>
                      <p className="text-[var(--dash-emerald)] font-medium text-sm">{formatDateTime(selectedBaggage.deliveredAt || selectedBaggage.arrivedAt)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[var(--dash-muted)] text-sm">Pèlerin</p>
                    {selectedBaggage.travelerFirstName || selectedBaggage.travelerLastName ? (
                      <p className="text-[var(--dash-ink)] font-medium">{selectedBaggage.travelerFirstName} {selectedBaggage.travelerLastName}</p>
                    ) : (
                      <span className="dash-badge dash-badge-warning">
                        À attribuer
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[var(--dash-muted)] text-sm">Type</p>
                    <p className="text-[var(--dash-ink)]">{selectedBaggage.baggageType} #{selectedBaggage.baggageIndex}</p>
                  </div>
                </div>
              )}

              {/* Créé le / Dernier scan */}
              {!isInTransit(selectedBaggage.status) && !isDelivered(selectedBaggage.status) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[var(--dash-muted)] text-sm">Créé le</p>
                    <p className="text-[var(--dash-ink)]">{formatDate(selectedBaggage.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--dash-muted)] text-sm">Dernier scan</p>
                    <p className="text-[var(--dash-ink)]">{formatDateTime(selectedBaggage.lastScanDate)}</p>
                    {selectedBaggage.lastLocation && (
                      <p className="text-[var(--dash-muted)] text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {selectedBaggage.lastLocation}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Attribuer edit form for unassigned non-transit baggages */}
              {(!selectedBaggage.travelerFirstName && !selectedBaggage.travelerLastName) && !isInTransit(selectedBaggage.status) && !isDelivered(selectedBaggage.status) && (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <h4 className="text-amber-700 dark:text-amber-400 font-medium mb-3">Attribuer ce colis</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Prénom"
                        className="w-full px-3 py-2 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-lg text-sm text-[var(--dash-ink)]"
                        onChange={(e) => setSelectedBaggage({ ...selectedBaggage, travelerFirstName: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Nom"
                        className="w-full px-3 py-2 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-lg text-sm text-[var(--dash-ink)]"
                        onChange={(e) => setSelectedBaggage({ ...selectedBaggage, travelerLastName: e.target.value })}
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="WhatsApp (ex: +33612345678)"
                      className="w-full px-3 py-2 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-lg text-sm text-[var(--dash-ink)]"
                      onChange={(e) => setSelectedBaggage({ ...selectedBaggage, whatsappOwner: e.target.value })}
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
                              status: 'active'
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
                      className="btn-brand btn-magnetic w-full py-2 rounded-lg text-sm font-medium"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[var(--dash-border)] space-y-3">
                {isActive(selectedBaggage.status) && !isInTransit(selectedBaggage.status) && !isDelivered(selectedBaggage.status) && (
                  <button
                    onClick={() => handleDeclareLost(selectedBaggage.id)}
                    disabled={actionLoading === selectedBaggage.id}
                    className="w-full py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === selectedBaggage.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <AlertOctagon className="w-4 h-4" />
                        Déclarer comme perdu
                      </>
                    )}
                  </button>
                )}

                {isLost(selectedBaggage.status) && (
                  <button
                    onClick={() => handleMarkFound(selectedBaggage.id)}
                    disabled={actionLoading === selectedBaggage.id}
                    className="btn-emerald btn-magnetic w-full py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === selectedBaggage.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Marquer comme retrouvé
                      </>
                    )}
                  </button>
                )}

                <Link
                  href={`/scan/${selectedBaggage.reference}`}
                  className="block w-full text-center py-3 bg-[var(--dash-brand)] text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
                >
                  Tester le scan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
