'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  X,
  Download,
  RefreshCw,
  QrCode,
  CheckCircle,
  Package,
  MapPin,
  Copy,
  Luggage,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

interface Baggage {
  id: string;
  reference: string;
  type: string;
  travelerFirstName: string | null;
  travelerLastName: string | null;
  whatsappOwner: string | null;
  baggageType: string;
  status: string;
  createdAt: string;
  deliveredAt: string | null;
  foundAt: string | null;
  receiverName: string | null;
  receiverWhatsapp: string | null;
  transportMode: string | null;
  founderName: string | null;
  founderPhone: string | null;
  agency: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function AdminTrouvaillesPage() {
  const [baggages, setBaggages] = useState<Baggage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBaggage, setSelectedBaggage] = useState<Baggage | null>(null);

  useEffect(() => {
    fetchBaggages();
  }, [statusFilter]);

  const fetchBaggages = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter === 'delivered') params.set('status', 'delivered');
      else if (statusFilter === 'found') params.set('status', 'found');
      else params.set('status', 'delivered,found');
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/baggages?${params}`);
      const data = await response.json();
      setBaggages(data.baggages || []);
    } catch (error) {
      console.error('Error fetching baggages:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Référence', 'Expéditeur', 'Destinataire', 'Agence', 'Date livraison', 'Statut'];
    const rows = baggages.map(b => [
      b.reference,
      `${b.travelerFirstName || ''} ${b.travelerLastName || ''}`.trim() || 'Non renseigné',
      b.receiverName || '-',
      b.agency?.name || '-',
      formatDateTime(b.status === 'delivered' ? b.deliveredAt : b.foundAt),
      b.status === 'delivered' ? 'Livré' : 'Retrouvé',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trouvailles-admin-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'delivered') {
      return (
        <span className="dash-badge dash-badge-success flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Livré
        </span>
      );
    }
    return (
      <span className="dash-badge dash-badge-info flex items-center gap-1">
        <Package className="w-3 h-3" />
        Retrouvé
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papiers !');
  };

  // Calculate stats
  const stats = {
    total: baggages.length,
    delivered: baggages.filter(b => b.status === 'delivered').length,
    found: baggages.filter(b => b.status === 'found').length,
  };

  const statusButtons = [
    { id: 'all', label: 'Tous' },
    { id: 'delivered', label: 'Livré' },
    { id: 'found', label: 'Retrouvé' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">Colis Livrés & Retrouvés</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Suivi des colis livrés et retrouvés</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setLoading(true); fetchBaggages(); }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={exportCSV}
            className="btn-emerald btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Total colis"
          value={stats.total === 0 ? '—' : stats.total}
          subtitle="Livrés et retrouvés"
          icon={Luggage}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Colis livrés"
          value={stats.delivered === 0 ? '—' : stats.delivered}
          subtitle="À destinataire"
          icon={CheckCircle}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="Colis retrouvés"
          value={stats.found === 0 ? '—' : stats.found}
          subtitle="Précédemment perdus"
          icon={Package}
          color="cyan"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="dash-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="dash-search flex-1">
            <Search className="w-4 h-4 text-[var(--dash-muted)]" />
            <input
              type="text"
              placeholder="Rechercher par référence, expéditeur, destinataire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBaggages()}
            />
          </div>
          <div className="flex gap-2">
            {statusButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setStatusFilter(btn.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === btn.id
                    ? 'bg-[var(--dash-emerald)] text-white'
                    : 'bg-[var(--dash-bg-3)] border border-[var(--dash-border)] text-[var(--dash-muted)] hover:bg-[var(--dash-emerald-soft)] hover:text-[var(--dash-emerald)]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="dash-card p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
        </div>
      ) : baggages.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <MapPin className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
          <p className="text-[var(--dash-muted)]">Aucun colis livré ou retrouvé</p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Expéditeur</th>
                  <th className="hidden md:table-cell">Destinataire</th>
                  <th className="hidden lg:table-cell">Agence</th>
                  <th className="hidden md:table-cell">Date livraison</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {baggages.map((baggage) => (
                  <tr key={baggage.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--dash-emerald-soft)] flex items-center justify-center">
                          <QrCode className="w-4 h-4 text-[var(--dash-emerald)]" />
                        </div>
                        <span className="text-[var(--dash-ink)] font-mono font-medium text-sm">
                          {baggage.reference}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-[var(--dash-ink)] text-sm">
                        {baggage.travelerFirstName || baggage.travelerLastName
                          ? `${baggage.travelerFirstName || ''} ${baggage.travelerLastName || ''}`.trim()
                          : 'Non renseigné'}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-[var(--dash-ink-2)] text-sm">
                        {baggage.receiverName || '-'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className="text-[var(--dash-ink-2)] text-sm">
                        {baggage.agency?.name || '-'}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-[var(--dash-ink-2)] text-sm">
                        {formatDateTime(baggage.status === 'delivered' ? baggage.deliveredAt : baggage.foundAt)}
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
          <div className="px-6 py-3 border-t border-[var(--dash-border)] bg-[var(--dash-bg-3)]">
            <span className="text-[var(--dash-muted)] text-sm">
              {baggages.length} colis affiché(s)
            </span>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBaggage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--dash-border)]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedBaggage.status === 'delivered'
                    ? 'bg-[var(--dash-emerald-soft)]'
                    : 'bg-[var(--dash-brand-soft)]'
                }`}>
                  {selectedBaggage.status === 'delivered'
                    ? <CheckCircle className="w-5 h-5 text-[var(--dash-emerald)]" />
                    : <Package className="w-5 h-5 text-[var(--dash-brand)]" />
                  }
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--dash-ink)]">Détails du colis</h2>
                  <p className="text-[var(--dash-muted)] text-sm">{selectedBaggage.reference}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBaggage(null);
                }}
                className="p-2 rounded-xl hover:bg-[var(--dash-bg-3)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--dash-muted)]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedBaggage.status)}
                <span className="text-[var(--dash-muted)] text-sm">
                  {selectedBaggage.status === 'delivered' ? `Livré le ${formatDate(selectedBaggage.deliveredAt)}` : `Retrouvé le ${formatDate(selectedBaggage.foundAt)}`}
                </span>
              </div>

              {/* Sender Info */}
              <div className="bg-[var(--dash-bg-3)] rounded-xl p-4">
                <h3 className="text-[var(--dash-ink)] font-medium text-sm mb-2">Expéditeur</h3>
                <p className="text-[var(--dash-ink-2)] text-sm">
                  {selectedBaggage.travelerFirstName || selectedBaggage.travelerLastName
                    ? `${selectedBaggage.travelerFirstName || ''} ${selectedBaggage.travelerLastName || ''}`.trim()
                    : 'Non renseigné'}
                </p>
                {selectedBaggage.whatsappOwner && (
                  <p className="text-[var(--dash-muted-2)] text-xs mt-1">WhatsApp: {selectedBaggage.whatsappOwner}</p>
                )}
              </div>

              {/* Receiver Info (for delivered) */}
              {selectedBaggage.status === 'delivered' && (
                <div className="bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)] rounded-xl p-4">
                  <h3 className="text-[var(--dash-emerald)] font-medium text-sm mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Destinataire
                  </h3>
                  <p className="text-[var(--dash-ink)] font-medium">{selectedBaggage.receiverName || 'Non renseigné'}</p>
                  {selectedBaggage.receiverWhatsapp && (
                    <a
                      href={`https://wa.me/${selectedBaggage.receiverWhatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--dash-emerald)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity mt-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Contacter sur WhatsApp
                    </a>
                  )}
                </div>
              )}

              {/* Finder Info */}
              {selectedBaggage.founderName && (
                <div className="bg-[var(--dash-brand-soft)] border border-[var(--dash-brand)] rounded-xl p-4">
                  <h3 className="text-[var(--dash-brand)] font-medium text-sm mb-2">Trouvé par</h3>
                  <p className="text-[var(--dash-ink)] font-medium">{selectedBaggage.founderName}</p>
                  {selectedBaggage.founderPhone && (
                    <p className="text-[var(--dash-muted-2)] text-sm mt-1">{selectedBaggage.founderPhone}</p>
                  )}
                </div>
              )}

              {/* Agency */}
              {selectedBaggage.agency && (
                <div className="bg-[var(--dash-bg-3)] rounded-xl p-4">
                  <h3 className="text-[var(--dash-ink)] font-medium text-sm mb-1">Agence</h3>
                  <p className="text-[var(--dash-ink-2)]">{selectedBaggage.agency.name}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    const text = `Colis: ${selectedBaggage.reference}\nExpéditeur: ${selectedBaggage.travelerFirstName || ''} ${selectedBaggage.travelerLastName || ''}\nDestinataire: ${selectedBaggage.receiverName || '-'}\nAgence: ${selectedBaggage.agency?.name || '-'}\nStatut: ${selectedBaggage.status === 'delivered' ? 'Livré' : 'Retrouvé'}`;
                    copyToClipboard(text);
                  }}
                  className="flex-1 py-2 bg-[var(--dash-bg-3)] text-[var(--dash-ink-2)] rounded-xl hover:bg-[var(--dash-border)] transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
