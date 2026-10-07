'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  QrCode,
  MapPin,
  Clock,
  Eye,
  X,
  Search,
  CheckCircle,
  Phone,
} from "lucide-react";
import { useAgency } from '../layout';
import KpiCard from '@/components/dashboard/KpiCard';

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
  lastScanDate: string | null;
  lastLocation: string | null;
}

export default function PerdusPage() {
  const { agencyId } = useAgency();
  const [baggages, setBaggages] = useState<Baggage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBaggage, setSelectedBaggage] = useState<Baggage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchBaggages();
  }, [agencyId]);

  const fetchBaggages = async () => {
    try {
      const params = new URLSearchParams({
        agencyId: agencyId,
      });

      const response = await fetch(`/api/agency/baggages?${params}`);
      const data = await response.json();
      setBaggages((data.baggages || []).filter((b: Baggage) => b.status === 'lost'));
    } catch (error) {
      console.error('Error fetching baggages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBaggages = baggages.filter(b =>
    b.reference.toLowerCase().includes(search.toLowerCase()) ||
    `${b.travelerFirstName || ''} ${b.travelerLastName || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
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

  const handleMarkFound = async (baggageId: string) => {
    if (!confirm('Marquer ce colis comme retrouvé ?')) return;

    try {
      const res = await fetch(`/api/baggage/${baggageId}/mark-found`, { method: 'PUT' });
      if (res.ok) {
        fetchBaggages();
      }
    } catch (error) {
      console.error('Error marking found:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Colis perdus
        </h1>
        <p className="text-sm text-[var(--dash-muted)] mt-1">Liste des colis déclarés perdus — Priorité haute</p>
      </div>

      {/* Stats Card */}
      <div className="mb-6">
        <KpiCard
          label="Colis perdus"
          value={baggages.length}
          subtitle="À retrouver"
          icon={AlertTriangle}
          color="rose"
          loading={loading}
        />
      </div>

      {/* Alert Banner */}
      {baggages.length > 0 && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium">Attention !</p>
            <p className="text-red-600 dark:text-red-300 text-sm">Vous avez {baggages.length} colis signalé(s) comme perdu(s). Contactez rapidement les voyageurs concernés.</p>
          </div>
        </div>
      )}

      {/* Search */}
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

      {/* Table */}
      <div className="dash-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Pèlerin</th>
                <th className="hidden md:table-cell">Dernier scan</th>
                <th className="hidden lg:table-cell">Localisation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                      <span className="text-[var(--dash-muted)]">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBaggages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[var(--dash-emerald-soft)] rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-[var(--dash-emerald)]" />
                      </div>
                      <p className="text-[var(--dash-muted)]">Aucun colis perdu</p>
                      <p className="text-sm text-[var(--dash-muted-2)] mt-1">Excellent ! Tous vos colis sont bien suivis.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBaggages.map((baggage) => (
                  <tr key={baggage.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center">
                          <QrCode className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="text-[var(--dash-ink)] font-mono font-medium">
                          {baggage.reference}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        {baggage.travelerFirstName || baggage.travelerLastName ? (
                          <span className="text-[var(--dash-ink)] font-medium">
                            {baggage.travelerFirstName} {baggage.travelerLastName}
                          </span>
                        ) : (
                          <span className="text-[var(--dash-muted-2)] text-sm italic">Non assigné</span>
                        )}
                        {baggage.whatsappOwner && (
                          <p className="text-[var(--dash-muted)] text-sm flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {baggage.whatsappOwner}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
                        <Clock className="w-4 h-4 text-[var(--dash-muted-2)]" />
                        {formatDate(baggage.lastScanDate)}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell">
                      {baggage.lastLocation ? (
                        <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
                          <MapPin className="w-4 h-4 text-[var(--dash-muted-2)]" />
                          {baggage.lastLocation}
                        </div>
                      ) : (
                        <span className="text-[var(--dash-muted-2)]">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkFound(baggage.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--dash-emerald-soft)] text-[var(--dash-emerald)] rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                          title="Marquer comme retrouvé"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Retrouvé
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBaggage(baggage);
                            setShowDetailModal(true);
                          }}
                          className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors group"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBaggage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--dash-card)] rounded-2xl max-w-md w-full shadow-xl border border-[var(--dash-border)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--dash-border)]">
              <h2 className="font-display text-lg font-bold text-[var(--dash-ink)]">Détails</h2>
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
                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/15 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-[var(--dash-ink)] font-mono font-bold">{selectedBaggage.reference}</p>
                  <p className="text-red-500 text-sm font-medium">Colis perdu</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Pèlerin</p>
                  <p className="text-[var(--dash-ink)] font-medium">{selectedBaggage.travelerFirstName} {selectedBaggage.travelerLastName}</p>
                </div>
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Type</p>
                  <p className="text-[var(--dash-ink)]">{selectedBaggage.baggageType} #{selectedBaggage.baggageIndex}</p>
                </div>
              </div>

              <div>
                <p className="text-[var(--dash-muted)] text-sm">WhatsApp</p>
                <p className="text-[var(--dash-ink)]">{selectedBaggage.whatsappOwner || 'Non renseigné'}</p>
              </div>

              <div>
                <p className="text-[var(--dash-muted)] text-sm">Dernier scan</p>
                <p className="text-[var(--dash-ink)]">{formatDate(selectedBaggage.lastScanDate)}</p>
                {selectedBaggage.lastLocation && (
                  <p className="text-[var(--dash-muted)] text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {selectedBaggage.lastLocation}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--dash-border)]">
                <button
                  onClick={() => {
                    handleMarkFound(selectedBaggage.id);
                    setShowDetailModal(false);
                    setSelectedBaggage(null);
                  }}
                  className="btn-emerald btn-magnetic w-full py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marquer comme retrouvé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
