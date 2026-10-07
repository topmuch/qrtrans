'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  QrCode,
  MapPin,
  Eye,
  X,
  Search,
  Bell,
  XCircle,
  Package,
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
  founderName: string | null;
  founderPhone: string | null;
  foundAt: string | null;
  deliveredAt: string | null;
  receiverName: string | null;
  receiverWhatsapp: string | null;
  transportMode: string | null;
}

export default function TrouvaillesPage() {
  const { agencyId } = useAgency();
  const [baggages, setBaggages] = useState<Baggage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBaggage, setSelectedBaggage] = useState<Baggage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);

  useEffect(() => {
    const savedCount = localStorage.getItem(`trouvailles-count-${agencyId}`);
    if (savedCount) {
      setPreviousCount(parseInt(savedCount, 10));
    }
    fetchBaggages();
  }, [agencyId]);

  const fetchBaggages = async () => {
    try {
      const params = new URLSearchParams({
        agencyId: agencyId,
      });

      const response = await fetch(`/api/agency/baggages?${params}`);
      const data = await response.json();
      const foundBaggages = (data.baggages || []).filter((b: Baggage) => b.status === 'delivered' || b.status === 'found');
      setBaggages(foundBaggages);

      const savedCount = localStorage.getItem(`trouvailles-count-${agencyId}`);
      const prevCount = savedCount ? parseInt(savedCount, 10) : 0;

      if (foundBaggages.length > prevCount && prevCount > 0) {
        setShowNotification(true);
      }

      localStorage.setItem(`trouvailles-count-${agencyId}`, foundBaggages.length.toString());

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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-[var(--dash-emerald)]" />
          Colis Livrés
        </h1>
        <p className="text-sm text-[var(--dash-muted)] mt-1">Liste des colis livrés</p>
      </div>

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-[var(--dash-emerald)] text-white rounded-xl p-4 shadow-lg flex items-center gap-3 max-w-sm">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Nouveau colis livré !</p>
              <p className="text-white/80 text-xs">Un colis a été marqué comme livré.</p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Card */}
      <div className="mb-6">
        <KpiCard
          label="Colis livrés"
          value={baggages.length}
          subtitle="Total livraisons"
          icon={CheckCircle}
          color="emerald"
          loading={loading}
        />
      </div>

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
                <th className="hidden md:table-cell">Date</th>
                <th className="hidden lg:table-cell">Localisation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-[var(--dash-emerald)]/30 border-t-[var(--dash-emerald)] rounded-full animate-spin" />
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
                      <p className="text-[var(--dash-muted)]">Aucun colis livré</p>
                      <p className="text-sm text-[var(--dash-muted-2)] mt-1">Les colis livrés apparaîtront ici</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBaggages.map((baggage) => (
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
                        <span className="text-[var(--dash-muted-2)] text-sm italic">Non assigné</span>
                      )}
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={
                          baggage.status === 'delivered'
                            ? 'dash-badge dash-badge-success'
                            : 'dash-badge dash-badge-info'
                        }>
                          {baggage.status === 'delivered' ? 'Livré' : 'Retrouvé'}
                        </span>
                        <span className="text-[var(--dash-ink-2)] text-sm">
                          {formatDate(baggage.status === 'delivered' ? baggage.deliveredAt : baggage.foundAt)}
                        </span>
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
                      <button
                        onClick={() => {
                          setSelectedBaggage(baggage);
                          setShowDetailModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] transition-colors group"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4 text-[var(--dash-muted)] group-hover:text-[var(--dash-emerald)]" />
                      </button>
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
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedBaggage.status === 'delivered'
                    ? 'bg-[var(--dash-emerald-soft)]'
                    : 'bg-[var(--dash-brand-soft)]'
                }`}>
                  {selectedBaggage.status === 'delivered'
                    ? <CheckCircle className="w-6 h-6 text-[var(--dash-emerald)]" />
                    : <Package className="w-6 h-6 text-[var(--dash-brand)]" />
                  }
                </div>
                <div>
                  <p className="text-[var(--dash-ink)] font-mono font-bold">{selectedBaggage.reference}</p>
                  <span className={`text-sm font-medium ${
                    selectedBaggage.status === 'delivered'
                      ? 'text-[var(--dash-emerald)]'
                      : 'text-[var(--dash-brand)]'
                  }`}>
                    {selectedBaggage.status === 'delivered' ? 'Colis livré' : 'Colis retrouvé'}
                  </span>
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
                <p className="text-[var(--dash-muted)] text-sm">
                  {selectedBaggage.status === 'delivered' ? 'Livré le' : 'Retrouvé le'}
                </p>
                <p className="text-[var(--dash-ink)]">
                  {formatDate(selectedBaggage.status === 'delivered' ? selectedBaggage.deliveredAt : selectedBaggage.foundAt)}
                </p>
                {selectedBaggage.lastLocation && (
                  <p className="text-[var(--dash-muted)] text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {selectedBaggage.lastLocation}
                  </p>
                )}
              </div>

              {/* Receiver information (for delivered packages) */}
              {selectedBaggage.status === 'delivered' && selectedBaggage.receiverName && (
                <div className="bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)]/20 rounded-xl p-4">
                  <p className="text-[var(--dash-emerald)] font-medium text-sm mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Informations livraison
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <p className="text-[var(--dash-muted)] text-sm">Destinataire</p>
                      <p className="text-[var(--dash-ink)] font-medium">{selectedBaggage.receiverName}</p>
                    </div>
                    {selectedBaggage.receiverWhatsapp && (
                      <div className="flex justify-between items-center">
                        <p className="text-[var(--dash-muted)] text-sm">WhatsApp</p>
                        <a
                          href={`https://wa.me/${selectedBaggage.receiverWhatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--dash-emerald)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <Phone className="w-4 h-4" />
                          {selectedBaggage.receiverWhatsapp}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Founder Information */}
              {selectedBaggage.founderName && (
                <div className="bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)]/20 rounded-xl p-4">
                  <p className="text-[var(--dash-emerald)] font-medium text-sm mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Trouvé par
                  </p>
                  <div className="space-y-1">
                    <p className="text-[var(--dash-ink)] font-medium">{selectedBaggage.founderName}</p>
                    {selectedBaggage.founderPhone && (
                      <a
                        href={`https://wa.me/${selectedBaggage.founderPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--dash-emerald)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity mt-2"
                      >
                        <Phone className="w-4 h-4" />
                        Contacter sur WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
