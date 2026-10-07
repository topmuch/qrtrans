'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  QrCode,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Building2,
  Luggage,
  Plane,
  Train,
  Ship,
  Bus,
} from 'lucide-react';

interface BaggageData {
  id: string;
  reference: string;
  type: string;
  status: string;
  travelerFirstName: string | null;
  travelerLastName: string | null;
  whatsappOwner: string | null;
  baggageIndex: number;
  baggageType: string;
  agencyId: string | null;
  agency?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  declaredLostAt: string | null;
  foundAt: string | null;
  lastScanDate: string | null;
  lastLocation: string | null;
  createdAt: string;
  // TRANSPORT-FEATURE: Transport mode + conditional fields
  transportMode?: string;
  airlineName?: string | null;
  flightNumber?: string | null;
  trainCompany?: string | null;
  trainNumber?: string | null;
  shipName?: string | null;
  shipCabin?: string | null;
  busCompany?: string | null;
  busLineNumber?: string | null;
  destination?: string | null;
  departureDate?: string | null;
  departureTime?: string | null;
}

export default function AdminBaggageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const baggageId = params.id as string;

  const [baggage, setBaggage] = useState<BaggageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBaggage();
  }, [baggageId]);

  const fetchBaggage = async () => {
    try {
      const response = await fetch(`/api/baggage/${baggageId}`);
      if (response.ok) {
        const data = await response.json();
        setBaggage(data);
      } else {
        console.error('Baggage not found');
        router.push('/admin/qrcodes');
      }
    } catch (error) {
      console.error('Error fetching baggage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFound = async () => {
    if (!confirm('Marquer ce colis comme retrouvé ?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/baggage/${baggageId}/mark-found`, {
        method: 'PUT',
      });
      if (response.ok) {
        fetchBaggage();
      }
    } catch (error) {
      console.error('Error marking found:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending_activation: { label: 'En attente', className: 'dash-badge dash-badge-warning' },
      active: { label: 'Actif', className: 'dash-badge dash-badge-success' },
      scanned: { label: 'Scanné', className: 'dash-badge dash-badge-info' },
      lost: { label: 'Perdu', className: 'dash-badge dash-badge-danger' },
      found: { label: 'Retrouvé', className: 'dash-badge dash-badge-success' },
    };
    const { label, className } = config[status] || { label: status, className: 'dash-badge dash-badge-neutral' };
    return <span className={className}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!baggage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--dash-ink)]">Colis non trouvé</p>
          <Link href="/admin/qrcodes" className="text-[var(--dash-brand)] hover:underline mt-4 block">
            Retour aux QR codes
          </Link>
        </div>
      </div>
    );
  }

  const isLost = baggage.status === 'lost' && baggage.declaredLostAt && !baggage.foundAt;

  const transportIcon = (mode?: string) => {
    switch (mode) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'train': return <Train className="w-4 h-4" />;
      case 'boat': return <Ship className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };
  const transportLabel = (mode?: string) => {
    switch (mode) {
      case 'flight': return 'Avion';
      case 'train': return 'Train';
      case 'boat': return 'Bateau';
      case 'bus': return 'Bus';
      default: return 'Avion';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/qrcodes"
          className="inline-flex items-center gap-2 text-[var(--dash-muted)] hover:text-[var(--dash-ink)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux QR codes
        </Link>
        <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--dash-brand-soft)] rounded-lg flex items-center justify-center">
            <Luggage className="w-5 h-5 text-[var(--dash-brand)]" />
          </div>
          Détails du colis
        </h1>
      </div>

      {/* Lost Alert */}
      {isLost && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-700 dark:text-red-400">Colis déclaré perdu</h3>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
              Déclaré perdu le {formatDate(baggage.declaredLostAt)}
            </p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="dash-card overflow-hidden">
        {/* Reference Header */}
        <div className="p-6 border-b border-[var(--dash-border)] bg-[var(--dash-bg-3)]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[var(--dash-brand)] text-sm font-medium">{baggage.type === 'hajj' ? 'Hajj 2026' : 'Voyageur'}</p>
              <h2 className="text-xl font-bold text-[var(--dash-ink)] font-mono">{baggage.reference}</h2>
            </div>
            {getStatusBadge(baggage.status)}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Traveler Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--dash-ink)] flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--dash-brand)]" />
              Informations du voyageur
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                <p className="text-[var(--dash-muted)] text-sm">Nom complet</p>
                <p className="text-[var(--dash-ink)] font-medium mt-1">
                  {baggage.travelerFirstName} {baggage.travelerLastName}
                </p>
              </div>
              <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                <p className="text-[var(--dash-muted)] text-sm">WhatsApp</p>
                <p className="text-[var(--dash-ink)] font-medium mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--dash-brand)]" />
                  {baggage.whatsappOwner || 'Non renseigné'}
                </p>
              </div>
            </div>
          </div>

          {/* Agency Info */}
          {baggage.agency && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--dash-ink)] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--dash-brand)]" />
                Agence
              </h3>
              <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                <p className="text-[var(--dash-ink)] font-medium">{baggage.agency.name}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--dash-muted)]">
                  {baggage.agency.email && (
                    <span>{baggage.agency.email}</span>
                  )}
                  {baggage.agency.phone && (
                    <span>{baggage.agency.phone}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Baggage Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--dash-ink)] flex items-center gap-2">
              <Luggage className="w-5 h-5 text-[var(--dash-brand)]" />
              Détails du colis
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                <p className="text-[var(--dash-muted)] text-sm">Type</p>
                <p className="text-[var(--dash-ink)] font-medium mt-1">
                  {baggage.baggageType} #{baggage.baggageIndex}
                </p>
              </div>
              <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                <p className="text-[var(--dash-muted)] text-sm">Créé le</p>
                <p className="text-[var(--dash-ink)] font-medium mt-1">{formatDate(baggage.createdAt)}</p>
              </div>
              <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                <p className="text-[var(--dash-muted)] text-sm">Dernier scan</p>
                <p className="text-[var(--dash-ink)] font-medium mt-1">{formatDate(baggage.lastScanDate)}</p>
              </div>
            </div>
          </div>

          {/* TRANSPORT-FEATURE: Transport mode info */}
          {baggage.transportMode && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--dash-ink)] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--dash-brand)]" />
                Informations de transport
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                  <p className="text-[var(--dash-muted)] text-sm">Mode</p>
                  <p className="text-[var(--dash-ink)] font-medium mt-1 flex items-center gap-1.5">
                    {transportIcon(baggage.transportMode)}
                    {transportLabel(baggage.transportMode)}
                  </p>
                </div>
                {baggage.transportMode === 'flight' && (baggage.airlineName || baggage.flightNumber) && (
                  <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                    <p className="text-[var(--dash-muted)] text-sm">Vol</p>
                    <p className="text-[var(--dash-ink)] font-medium mt-1">
                      {baggage.airlineName}{baggage.flightNumber ? ` — ${baggage.flightNumber}` : ''}
                    </p>
                  </div>
                )}
                {baggage.transportMode === 'train' && (baggage.trainCompany || baggage.trainNumber) && (
                  <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                    <p className="text-[var(--dash-muted)] text-sm">Train</p>
                    <p className="text-[var(--dash-ink)] font-medium mt-1">
                      {baggage.trainCompany}{baggage.trainNumber ? ` — ${baggage.trainNumber}` : ''}
                    </p>
                  </div>
                )}
                {baggage.transportMode === 'boat' && (baggage.shipName || baggage.shipCabin) && (
                  <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                    <p className="text-[var(--dash-muted)] text-sm">Navire</p>
                    <p className="text-[var(--dash-ink)] font-medium mt-1">
                      {baggage.shipName}{baggage.shipCabin ? ` — ${baggage.shipCabin}` : ''}
                    </p>
                  </div>
                )}
                {baggage.transportMode === 'bus' && (baggage.busCompany || baggage.busLineNumber) && (
                  <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                    <p className="text-[var(--dash-muted)] text-sm">Bus</p>
                    <p className="text-[var(--dash-ink)] font-medium mt-1">
                      {baggage.busCompany}{baggage.busLineNumber ? ` — ${baggage.busLineNumber}` : ''}
                    </p>
                  </div>
                )}
                {baggage.destination && (
                  <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                    <p className="text-[var(--dash-muted)] text-sm">Destination</p>
                    <p className="text-[var(--dash-ink)] font-medium mt-1">{baggage.destination}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          {baggage.lastLocation && (
            <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
              <p className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Dernière position connue
              </p>
              <p className="text-[var(--dash-ink)] font-medium mt-1">{baggage.lastLocation}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[var(--dash-border)] bg-[var(--dash-bg-3)] flex flex-wrap gap-3">
          {isLost && (
            <button
              onClick={handleMarkFound}
              disabled={actionLoading}
              className="btn-emerald btn-magnetic flex-1 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Marquer comme retrouvé
                </>
              )}
            </button>
          )}
          <Link
            href={`/scan/${baggage.reference}`}
            className="btn-brand btn-magnetic flex-1 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Voir la page de scan
          </Link>
        </div>
      </div>
    </div>
  );
}
