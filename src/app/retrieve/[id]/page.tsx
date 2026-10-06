'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  QrCode,
  Loader2,
  CheckCircle,
  Copy,
  ExternalLink,
  Home,
  ShieldAlert,
  Globe,
  Package,
  MapPin,
  Truck,
  User,
  Clock,
  Lock,
  Phone,
  MessageCircle,
  Navigation,
  Info,
  AlertTriangle,
  Banknote,
  MapPinned,
  ChevronRight,
  Plane,
  Train,
  Ship,
  Bus,
} from 'lucide-react';
import Link from 'next/link';
import { notificationSound } from '@/lib/notification-sound';
import PinKeypad from '@/components/retrieve/PinKeypad';

// ═══════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════

interface ColisData {
  id: string;
  reference: string;
  status: string;
  transportType: string;
  company: string;
  arrivalCity: string;
  departureCity: string;
  departureDate: string | null;
  departureTime: string | null;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pin_masked: string | null;
  pinAttempts: number;
  pickupAddress?: string | null;
  estimatedArrival?: string | null;
  paymentStatus?: string | null;
  colisType?: string | null;
  colisTypeOther?: string | null;
  colisWeight?: number | null;
  isFragile?: boolean | null;
  driverPhone?: string | null;
  shareDriverPhone?: boolean | null;
  deliveredAt?: string | null;
  deliveryLocation?: string | null;
  deliveryNotes?: string | null;
  arrivedAt?: string | null;
}

interface TimelineEntry {
  id: string;
  type: 'event' | 'scan';
  title: string;
  description: string;
  timestamp: string;
  location: string | null;
}

// ═══════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════

const TRANSPORT_ICONS: Record<string, string> = {
  flight: '✈️', train: '🚆', boat: '🚢', bus: '🚌',
};

const BAGGAGE_TYPE_LABELS: Record<string, string> = {
  VALISE: 'Valise', SAC: 'Sac', CARTON: 'Carton',
  BACKPACK: 'Sac à dos', CABIN: 'Cabine', OTHER: 'Autre',
};

const GEO_WARNING_KM = 2;
const PREMATURE_HOURS = 2;

// ═══════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════

const formatDate = (dateStr: string | null, lang = 'fr') => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return dateStr; }
};

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }) + ' à ' + new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
};

function getTimelineLineIcon(title: string): { icon: React.ReactNode; bg: string } {
  const t = title.toLowerCase();
  if (t.includes('activ')) return { icon: <CheckCircle className="w-3 h-3 text-emerald-300" />, bg: 'bg-emerald-500/15' };
  if (t.includes('départ') || t.includes('partance')) return { icon: <Truck className="w-3 h-3 text-sky-300" />, bg: 'bg-sky-500/15' };
  if (t.includes('arriv') || t.includes('livr')) return { icon: <MapPin className="w-3 h-3 text-emerald-300" />, bg: 'bg-emerald-500/15' };
  if (t.includes('pin') || t.includes('retrait')) return { icon: <Lock className="w-3 h-3 text-amber-300" />, bg: 'bg-amber-500/15' };
  if (t.includes('scan')) return { icon: <QrCode className="w-3 h-3 text-indigo-300" />, bg: 'bg-indigo-500/15' };
  if (t.includes('avert') || t.includes('warning') || t.includes('⚠')) return { icon: <AlertTriangle className="w-3 h-3 text-orange-300" />, bg: 'bg-orange-500/15' };
  return { icon: <Clock className="w-3 h-3 text-white/60" />, bg: 'bg-white/5' };
}

// ═══════════════════════════════════════════════════
//  HEADER COMPONENT
// ═══════════════════════════════════════════════════

function TransportGlyph({ mode }: { mode: string }) {
  const cls = 'w-4 h-4';
  switch ((mode || '').toLowerCase()) {
    case 'flight':
    case 'avion':
      return <Plane className={cls} />;
    case 'train':
      return <Train className={cls} />;
    case 'boat':
    case 'bateau':
      return <Ship className={cls} />;
    case 'bus':
      return <Bus className={cls} />;
    default:
      return <Truck className={cls} />;
  }
}

function RetrieveHeader({
  qrCode,
  status,
  lang,
  onLangChange,
}: {
  qrCode: string;
  status: string;
  lang: 'fr' | 'en';
  onLangChange: (lang: 'fr' | 'en') => void;
}) {
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const isInTransit = status === 'in_transit';
  const isDelivered = status === 'delivered';
  const isPending = status === 'pending_activation';

  const badgeClass = isInTransit
    ? 'bg-sky-500/15 border border-sky-500/30 text-sky-300'
    : isDelivered
      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
      : isPending
        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
        : 'bg-white/5 border border-white/10 text-white/60';

  const badgeIcon = isInTransit ? <Truck className="w-3 h-3" /> : isDelivered ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />;
  const badgeText = isInTransit
    ? t('En transit', 'In transit')
    : isDelivered
      ? t('Livré', 'Delivered')
      : t('En attente', 'Pending');

  return (
    <header className="sticky top-0 z-40 bg-[#060B1F]/80 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
      <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#3B6BD9] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight block leading-tight text-white">
              QR<span className="text-gradient-emerald">Trans</span>
            </span>
            {qrCode && (
              <span className="text-[10px] font-mono text-white/50 leading-tight">{qrCode}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${badgeClass}`}>
            {badgeIcon}
            {badgeText}
          </div>
          <button
            onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1 text-xs font-medium text-white/70 hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-white/5"
            aria-label="Switch language"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════
//  CARD 1: TRAJET & PROGRESSION
// ═══════════════════════════════════════════════════

function TrajetCard({ colis, lang }: { colis: ColisData; lang: 'fr' | 'en' }) {
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const isDelivered = colis.status === 'delivered';

  const steps = [
    { label: t('Activé', 'Activated'), done: true },
    { label: t('En transit', 'In transit'), done: colis.status === 'in_transit' || isDelivered },
    { label: t('À livrer', 'To deliver'), done: isDelivered },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      {/* Route header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white/50 font-medium">{t('Trajet', 'Route')}</p>
            <p className="font-bold text-white text-sm truncate">
              {colis.departureCity || '—'} <span className="text-emerald-400">→</span> {colis.arrivalCity || '—'}
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white/70">
          <TransportGlyph mode={colis.transportType} />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.04] border border-white/5 rounded-xl p-3">
          <p className="text-xs text-white/50">{t('Départ', 'Departure')}</p>
          <p className="font-bold text-white text-sm mt-0.5">
            {formatDate(colis.departureDate, lang)}
          </p>
          {colis.departureTime && (
            <p className="text-xs text-white/50 mt-0.5">
              <Clock className="w-3 h-3 inline mr-0.5" />{colis.departureTime}
            </p>
          )}
        </div>
        <div className="bg-white/[0.04] border border-white/5 rounded-xl p-3">
          <p className="text-xs text-white/50">{t('Arrivée prévue', 'Est. arrival')}</p>
          <p className="font-bold text-white text-sm mt-0.5">
            {colis.estimatedArrival || formatDate(colis.departureDate, lang)}
          </p>
          {colis.company && (
            <p className="text-xs text-white/50 mt-0.5">
              <Truck className="w-3 h-3 inline mr-0.5" />{colis.company}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-gradient-to-br from-[#10B981] to-[#34D399] text-[#060B1F]' : 'bg-white/10 text-white/40'}`}>
                {step.done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step.done ? 'text-emerald-300' : 'text-white/40'}`}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-1 rounded-full mx-1 ${step.done ? 'bg-emerald-400/60' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  CARD 2: CONTACTS
// ═══════════════════════════════════════════════════

function ContactRow({ name, phone, label, t }: { name: string; phone: string; label: string; t: (fr: string, en: string) => string }) {
  const tel = phone.replace(/[^0-9+]/g, '');
  if (!name && !phone) return null;
  return (
    <div className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl p-3">
      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-white/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/50 font-medium">{label}</p>
        <p className="font-bold text-white text-sm truncate">{name || '—'}</p>
        {phone && <p className="text-xs text-white/50 font-mono">{phone}</p>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {tel && (
          <a
            href={`https://wa.me/${tel.replace(/^\+/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
            aria-label={`${t('Contacter', 'Contact')} ${name} WhatsApp`}
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
          </a>
        )}
        {tel && (
          <a
            href={`tel:${tel}`}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label={`${t('Appeler', 'Call')} ${name}`}
          >
            <Phone className="w-4 h-4 text-white/60" />
          </a>
        )}
      </div>
    </div>
  );
}

function ContactsCard({ colis, lang }: { colis: ColisData; lang: 'fr' | 'en' }) {
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-emerald-400" />
        <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
          {t('Contacts', 'Contacts')}
        </h3>
      </div>
      <ContactRow
        name={colis.senderName}
        phone={colis.senderPhone}
        label={t('Expéditeur', 'Sender')}
        t={t}
      />
      <ContactRow
        name={colis.receiverName}
        phone={colis.receiverPhone}
        label={t('Destinataire', 'Receiver')}
        t={t}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  CARD 3: LOGISTIQUE & RETRAIT
// ═══════════════════════════════════════════════════

function LogisticsCard({ colis, lang }: { colis: ColisData; lang: 'fr' | 'en' }) {
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const baggageLabel = colis.colisType === 'OTHER'
    ? (colis.colisTypeOther || 'Autre')
    : (BAGGAGE_TYPE_LABELS[colis.colisType || ''] || colis.colisType || '');
  const baggageDesc = `${baggageLabel}${colis.colisWeight ? ` — ${colis.colisWeight}kg` : ''}${colis.isFragile ? ' — Fragile' : ''}`;

  const isPaid = colis.paymentStatus === 'SENDER_PAID';

  const mapsUrl = colis.pickupAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(colis.pickupAddress)}`
    : null;

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-emerald-400" />
        <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
          {t('Logistique & Retrait', 'Logistics & Pickup')}
        </h3>
      </div>

      {/* Payment */}
      <div className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl p-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isPaid ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)' }}>
          <Banknote className="w-4 h-4" style={{ color: isPaid ? '#34D399' : '#FBBF24' }} />
        </div>
        <div>
          <p className="text-xs text-white/50">{t('Paiement', 'Payment')}</p>
          <p className={`text-sm font-bold ${isPaid ? 'text-emerald-300' : 'text-amber-300'}`}>
            {isPaid
              ? t('Payé par l\'expéditeur', 'Paid by sender')
              : t('À payer par le destinataire', 'Pay on delivery')}
          </p>
        </div>
      </div>

      {/* Pickup address */}
      {colis.pickupAddress && (
        <div className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl p-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
            <MapPinned className="w-4 h-4 text-sky-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50">{t('Point de retrait', 'Pickup point')}</p>
            <p className="text-sm font-bold text-white truncate">{colis.pickupAddress}</p>
          </div>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center hover:bg-sky-500/25 transition-colors flex-shrink-0"
              aria-label={t('Ouvrir dans Maps', 'Open in Maps')}
            >
              <ExternalLink className="w-4 h-4 text-sky-300" />
            </a>
          )}
        </div>
      )}

      {/* Driver phone */}
      {colis.driverPhone && colis.shareDriverPhone && (
        <div className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl p-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Truck className="w-4 h-4 text-orange-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50">{t('Transporteur', 'Driver')}</p>
            <p className="text-sm font-mono font-bold text-white">{colis.driverPhone}</p>
          </div>
          <a
            href={`tel:${colis.driverPhone.replace(/[^0-9+]/g, '')}`}
            className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center hover:bg-orange-500/25 transition-colors flex-shrink-0"
            aria-label={t('Appeler le transporteur', 'Call driver')}
          >
            <Phone className="w-4 h-4 text-orange-300" />
          </a>
        </div>
      )}

      {/* Baggage info */}
      {baggageLabel && (
        <div className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl p-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-white/60" />
          </div>
          <div>
            <p className="text-xs text-white/50">{t('Colis', 'Package')}</p>
            <p className="text-sm font-bold text-white">{baggageDesc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  CARD 4: TIMELINE
// ═══════════════════════════════════════════════════

function TimelineCard({ timeline, lang }: { timeline: TimelineEntry[]; lang: 'fr' | 'en' }) {
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_COUNT = 4;
  const visibleItems = expanded ? timeline : timeline.slice(0, VISIBLE_COUNT);
  const hasMore = timeline.length > VISIBLE_COUNT;

  if (timeline.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
            {t('Historique', 'History')}
          </h3>
        </div>
        <p className="text-sm text-white/40 text-center py-4">
          {t('Aucun événement enregistré', 'No events recorded')}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-emerald-400" />
        <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
          {t('Historique', 'History')}
        </h3>
        <span className="ml-auto text-xs text-white/40">{timeline.length} événements</span>
      </div>

      <div className="space-y-0 max-h-80 overflow-y-auto custom-scrollbar">
        {visibleItems.map((entry, i) => {
          const lineIcon = getTimelineLineIcon(entry.title);
          const isLast = i === visibleItems.length - 1;

          return (
            <div key={entry.id} className="flex gap-3">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full ${lineIcon.bg} border border-white/10 flex items-center justify-center flex-shrink-0 z-10`}>
                  {lineIcon.icon}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-white/10 my-0.5" />
                )}
              </div>

              {/* Content */}
              <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                <p className="text-sm font-semibold text-white">{entry.title}</p>
                <p className="text-xs text-white/50 mt-0.5">
                  {formatDateTime(entry.timestamp)}
                </p>
                {entry.location && (
                  <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{entry.location}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand/Collapse */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1 w-full pt-3 mt-2 border-t border-white/5 text-sm font-medium text-white/60 hover:text-emerald-300 transition-colors"
        >
          {expanded
            ? t('Voir moins', 'Show less')
            : t(`Voir les ${timeline.length - VISIBLE_COUNT} événements suivants`, `Show ${timeline.length - VISIBLE_COUNT} more events`)}
          <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  GEO WARNING
// ═══════════════════════════════════════════════════

function GeoWarning({ distance }: { distance: number }) {
  return (
    <div className="bg-orange-500/10 border-l-4 border-orange-500/60 p-4 rounded-r-xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-display font-medium text-orange-200 text-sm">Position détectée éloignée</p>
          <p className="text-sm text-orange-300 mt-0.5">
            Vous semblez être à <strong>{distance.toFixed(1)} km</strong> du point de retrait.
            Assurez-vous d&apos;être sur place avant de valider.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  PREMATURE WARNING
// ═══════════════════════════════════════════════════

function PrematureWarning({ estimatedTime }: { estimatedTime: string }) {
  return (
    <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-display font-medium text-sky-200 text-sm">Arrivée prévue plus tard</p>
          <p className="text-sm text-sky-300 mt-0.5">
            Le colis est prévu à <strong>{estimatedTime}</strong>.
            Le destinataire doit être présent pour fournir le code PIN.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  SUCCESS SCREEN (post-delivery)
// ═══════════════════════════════════════════════════

function DeliverySuccess({
  colis,
  waSender,
  waReceiver,
  lang,
  senderDone,
  receiverDone,
  onNotify,
}: {
  colis: ColisData;
  waSender: string;
  waReceiver: string;
  lang: 'fr' | 'en';
  senderDone: boolean;
  receiverDone: boolean;
  onNotify: (waLink: string, name: string, type: 'sender' | 'receiver') => void;
}) {
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/suivi/${colis.reference}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const allNotified = senderDone && receiverDone;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Success banner */}
      <div className="glass-strong rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-full shadow-lg shadow-emerald-500/30 mb-2">
            <CheckCircle className="w-8 h-8 text-[#060B1F]" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">
            {t('LIVRAISON CONFIRMÉE !', 'DELIVERY CONFIRMED!')}
          </h2>
          <p className="text-sm text-white/70">
            {t(
              `Le colis ${colis.reference} a été remis avec succès.`,
              `Package ${colis.reference} has been successfully delivered.`
            )}
          </p>
          {colis.deliveredAt && (
            <p className="text-xs text-emerald-300 font-mono">
              {formatDateTime(colis.deliveredAt)}
            </p>
          )}
        </div>
      </div>

      {/* Delivery receipt */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="font-display text-sm font-semibold text-white mb-2">
          {t('Reçu de livraison', 'Delivery receipt')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-white/50">{t('Référence', 'Reference')}</p>
            <p className="text-sm font-mono font-bold text-white">{colis.reference}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">{t('Destinataire', 'Receiver')}</p>
            <p className="text-sm font-semibold text-white truncate">{colis.receiverName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">{t('Expéditeur', 'Sender')}</p>
            <p className="text-sm font-semibold text-white truncate">{colis.senderName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">{t('Destination', 'Destination')}</p>
            <p className="text-sm font-semibold text-white truncate">{colis.arrivalCity || '—'}</p>
          </div>
          {colis.deliveryLocation && (
            <div className="col-span-2">
              <p className="text-xs text-white/50">{t('Lieu de livraison', 'Delivery location')}</p>
              <p className="text-sm font-semibold text-white">{colis.deliveryLocation}</p>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp notification buttons */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-white flex items-center gap-2">
          {allNotified ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {t('Notifications envoyées', 'Notifications sent')}
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              {t('Notifier par WhatsApp', 'Notify via WhatsApp')}
            </>
          )}
        </h3>

        {allNotified && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-emerald-200">
              {t('Expéditeur et destinataire notifiés. Redirection en cours...', 'Sender and receiver notified. Redirecting...')}
            </p>
          </div>
        )}

        {!allNotified && colis.senderPhone && waSender && (
          senderDone ? (
            <div className="flex items-center justify-center gap-3 w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-white/50">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">{t('EXPÉDITEUR NOTIFIÉ', 'SENDER NOTIFIED')}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNotify(waSender, colis.senderName, 'sender')}
              className="flex items-center justify-center gap-3 w-full h-14 bg-[#FF6B35] hover:bg-[#e55a28] active:bg-[#d04e1f] text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              {t("NOTIFIER L'EXPÉDITEUR", 'NOTIFY SENDER')}
            </button>
          )
        )}

        {!allNotified && colis.receiverPhone && waReceiver && (
          receiverDone ? (
            <div className="flex items-center justify-center gap-3 w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-white/50">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">{t('DESTINATAIRE NOTIFIÉ', 'RECEIVER NOTIFIED')}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNotify(waReceiver, colis.receiverName, 'receiver')}
              className="flex items-center justify-center gap-3 w-full h-14 bg-[#25D366] hover:bg-[#1fb855] active:bg-[#1a9e49] text-white rounded-2xl font-bold text-base shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              {t('NOTIFIER LE DESTINATAIRE', 'NOTIFY RECEIVER')}
            </button>
          )
        )}
      </div>

      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="flex items-center justify-center gap-2 w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition-colors"
      >
        <Copy className="w-4 h-4" />
        {copied ? t('Lien copié !', 'Link copied!') : t('Copier le lien de suivi', 'Copy tracking link')}
      </button>

      {/* Home */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-emerald-300 transition-colors no-underline"
        >
          <Home className="w-4 h-4" />
          {t("Retour à l'accueil", 'Back to home')}
        </Link>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════

function RetrieveContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = ((params?.id as string) || '').toUpperCase().trim();

  const notifiedParam = searchParams.get('notified');

  // ─── States ───
  const [currentLang, setCurrentLang] = useState<'fr' | 'en'>('fr');
  const [loadingData, setLoadingData] = useState(true);
  const [colis, setColis] = useState<ColisData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [successData, setSuccessData] = useState<{ wa_sender: string; wa_receiver: string } | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [geoDistance, setGeoDistance] = useState<number | null>(null);
  const [showPrematureWarning, setShowPrematureWarning] = useState(false);
  const [notifiedSet, setNotifiedSet] = useState<{ sender: boolean; receiver: boolean }>({ sender: false, receiver: false });

  const tFn = (fr: string, en: string) => currentLang === 'fr' ? fr : en;

  // ─── Fetch colis data on mount ───
  useEffect(() => {
    if (!reference) {
      setLoadingData(false);
      setFetchError(tFn('Référence invalide.', 'Invalid reference.'));
      return;
    }

    const fetchColis = async () => {
      try {
        setLoadingData(true);
        const res = await fetch(`/api/arrivee/${encodeURIComponent(reference)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          const c = data.colis as ColisData;
          c.pin_masked = data.pin_masked || null;
          c.pinAttempts = data.pinAttempts ?? 0;
          setColis(c);
          setTimeline(data.timeline || []);

          // Check if already confirmed (returning from /sending)
          const stored = sessionStorage.getItem(`wa_${reference}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            setSuccessData(parsed);
            if (notifiedParam) {
              setConfirmed(true);
            }
          }
          // Restore notified set from sessionStorage (so reload doesn't lose state)
          try {
            const rawSet = sessionStorage.getItem(`wa_notified_${reference}`);
            if (rawSet) {
              const parsedSet = JSON.parse(rawSet);
              setNotifiedSet({
                sender: !!parsedSet.sender,
                receiver: !!parsedSet.receiver,
              });
            }
          } catch { /* noop */ }
        } else {
          setFetchError(data.message || tFn('Colis introuvable.', 'Package not found.'));
        }
      } catch {
        setFetchError(tFn('Erreur de connexion.', 'Connection error.'));
      } finally {
        setLoadingData(false);
      }
    };

    fetchColis();
  }, [reference]);

  // ─── Geolocation check (soft, non-blocking) ───
  useEffect(() => {
    if (!colis?.pickupAddress || colis.status !== 'in_transit') return;

    // Only check if geolocation is available
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // We don't have pickup coordinates in DB, so we can't calculate distance
        // This is a placeholder for when geocoding is added
        // For now, we skip geo check silently
      },
      () => {
        // Geolocation denied or unavailable — no warning
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, [colis]);

  // ─── Premature scan check ───
  useEffect(() => {
    if (!colis?.departureDate || colis.status !== 'in_transit') return;

    const now = new Date();
    const depDate = new Date(colis.departureDate);

    // Add estimated arrival time if available
    if (colis.estimatedArrival) {
      const [hours, minutes] = colis.estimatedArrival.split(':').map(Number);
      depDate.setHours(hours, minutes, 0, 0);
    }

    const diffMs = depDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs > 0 && diffHours > PREMATURE_HOURS) {
      setShowPrematureWarning(true);
    }
  }, [colis]);

  // ─── PIN Submit Handler ───
  const handlePinSubmit = useCallback(async (pin: string) => {
    try {
      const res = await fetch('/api/validate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, pin }),
      });
      const data = await res.json();

      if (data.success) {
        setConfirmed(true);
        setShowPinModal(false);
        setSuccessData({ wa_sender: data.wa_sender, wa_receiver: data.wa_receiver });
        // Store for returning from /sending
        try {
          sessionStorage.setItem(`wa_${reference}`, JSON.stringify({ wa_sender: data.wa_sender, wa_receiver: data.wa_receiver }));
        } catch { /* noop */ }
        // Play success sound
        notificationSound.play();
        try { navigator.vibrate?.([200, 100, 200]); } catch { /* noop */ }
        return { success: true };
      }

      if (data.blocked) {
        return { success: false, blocked: true, error: data.message };
      }

      return { success: false, error: data.message, attemptsLeft: data.attemptsLeft };
    } catch {
      return { success: false, error: tFn('Erreur serveur. Réessayez.', 'Server error.') };
    }
  }, [reference, tFn]);

  // ─── WhatsApp Notify Handler ───
  const handleNotify = useCallback(
    (waLink: string, name: string, type: 'sender' | 'receiver') => {
      notificationSound.unlock();

      const callback = `/retrieve/${reference}?notified=${type}`;

      const p = new URLSearchParams({
        waLink,
        to: name,
        type,
        callback,
        suivi: `/suivi/${reference}`,
      });
      router.push(`/sending?${p.toString()}`);
    },
    [reference, router],
  );

  // ─── Restore success on return from /sending ───
  // Also fold the latest notifiedParam into our persistent notifiedSet.
  useEffect(() => {
    if (notifiedParam && (notifiedParam === 'sender' || notifiedParam === 'receiver')) {
      try {
        const stored = sessionStorage.getItem(`wa_${reference}`);
        if (stored && !successData) {
          setSuccessData(JSON.parse(stored));
        }
        if (!confirmed) setConfirmed(true);

        // Persist the latest notified type into the set so that the other
        // notification's "done" state survives a second trip through /sending.
        const rawSet = sessionStorage.getItem(`wa_notified_${reference}`);
        const parsedSet = rawSet ? JSON.parse(rawSet) : { sender: false, receiver: false };
        parsedSet[notifiedParam] = true;
        sessionStorage.setItem(`wa_notified_${reference}`, JSON.stringify(parsedSet));
        setNotifiedSet({ sender: !!parsedSet.sender, receiver: !!parsedSet.receiver });
      } catch { /* noop */ }
    }
  }, [notifiedParam, reference, successData, confirmed]);

  // ─── Redirect to home when BOTH notifications are done ───
  useEffect(() => {
    if (confirmed && notifiedSet.sender && notifiedSet.receiver) {
      // Brief delay so the user sees the confirmation message before redirect
      const timer = setTimeout(() => {
        // Clean up sessionStorage for this reference
        try {
          sessionStorage.removeItem(`wa_${reference}`);
          sessionStorage.removeItem(`wa_notified_${reference}`);
        } catch { /* noop */ }
        router.replace('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [confirmed, notifiedSet, reference, router]);

  // ─── Status helpers ───
  const isAlreadyDelivered = colis?.status === 'delivered';
  const isInTransit = colis?.status === 'in_transit';
  const isNormal = colis && isInTransit && !confirmed;

  // ═══════════════════════════════════════════════════
  //  RENDER — Loading
  // ═══════════════════════════════════════════════════
  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#060B1F]">
        <RetrieveHeader qrCode={reference} status="loading" lang={currentLang} onLangChange={setCurrentLang} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-white/60">{tFn('Vérification du colis...', 'Verifying package...')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  //  RENDER — Error
  // ═══════════════════════════════════════════════════
  if (fetchError && !colis) {
    return (
      <div className="min-h-screen bg-[#060B1F]">
        <RetrieveHeader qrCode={reference} status="error" lang={currentLang} onLangChange={setCurrentLang} />
        <main className="max-w-[600px] mx-auto px-4 py-6 pb-20">
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{fetchError}</h2>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 h-12 bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#34D399] hover:to-[#6EE7B7] text-[#060B1F] rounded-xl font-semibold text-sm transition-colors no-underline shadow-lg shadow-emerald-500/20"
            >
              <Home className="w-4 h-4" />
              {tFn("Retour à l'accueil", 'Back to home')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  //  RENDER — Already Delivered (no notification context)
  // ═══════════════════════════════════════════════════
  if (colis && isAlreadyDelivered && !confirmed) {
    return (
      <div className="min-h-screen bg-[#060B1F]">
        <RetrieveHeader qrCode={reference} status="delivered" lang={currentLang} onLangChange={setCurrentLang} />
        <main className="max-w-[600px] mx-auto px-4 py-6 pb-20">
          <div className="space-y-4">
            <div className="glass-strong border border-emerald-500/30 rounded-2xl p-6 text-center animate-in fade-in relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-full mb-3 shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="w-7 h-7 text-[#060B1F]" />
                </div>
                <p className="text-sm font-semibold text-white">
                  {tFn('Ce colis a déjà été livré.', 'This package has already been delivered.')}
                </p>
                {colis.deliveredAt && (
                  <p className="text-xs text-emerald-300 mt-1 font-mono">{formatDateTime(colis.deliveredAt)}</p>
                )}
              </div>
            </div>

            {/* Show the 4 cards as history */}
            {colis && <TrajetCard colis={colis} lang={currentLang} />}
            {colis && <ContactsCard colis={colis} lang={currentLang} />}
            {colis && <LogisticsCard colis={colis} lang={currentLang} />}
            {timeline.length > 0 && <TimelineCard timeline={timeline} lang={currentLang} />}

            <Link
              href={`/suivi/${reference}`}
              className="flex items-center justify-center gap-2 w-full h-14 bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#34D399] hover:to-[#6EE7B7] text-[#060B1F] rounded-xl text-base font-bold transition-all no-underline shadow-lg shadow-emerald-500/30"
            >
              <ExternalLink className="w-5 h-5" />
              {tFn('Voir le suivi', 'View tracking')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  //  RENDER — Not in transit (pending_activation etc.)
  // ═══════════════════════════════════════════════════
  if (colis && !isInTransit && !isAlreadyDelivered && !confirmed) {
    return (
      <div className="min-h-screen bg-[#060B1F]">
        <RetrieveHeader qrCode={reference} status="pending" lang={currentLang} onLangChange={setCurrentLang} />
        <main className="max-w-[600px] mx-auto px-4 py-6 pb-20">
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <ShieldAlert className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {tFn('Colis pas encore en transit.', 'Package not yet in transit.')}
            </h2>
            <p className="text-sm text-white/60">
              {tFn('La livraison nécessite que le colis soit en transit.', 'Delivery requires the package to be in transit.')}
            </p>
            <Link
              href={`/suivi/${reference}`}
              className="inline-flex items-center justify-center gap-2 px-6 h-14 bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#34D399] hover:to-[#6EE7B7] text-[#060B1F] rounded-xl text-base font-bold transition-all no-underline shadow-lg shadow-emerald-500/30"
            >
              <ExternalLink className="w-5 h-5" />
              {tFn('Voir le suivi', 'View tracking')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  //  RENDER — MAIN: IN_TRANSIT (preparation page)
  // ═══════════════════════════════════════════════════
  const displayTimeline = confirmed ? timeline : timeline;

  return (
    <div className="min-h-screen bg-[#060B1F]">
      <RetrieveHeader qrCode={reference} status={colis?.status || ''} lang={currentLang} onLangChange={setCurrentLang} />

      <main className="max-w-[600px] mx-auto px-4 py-6 pb-32">
        {/* ─── Title ─── */}
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-white">
            {confirmed
              ? tFn('Livraison confirmée', 'Delivery confirmed')
              : tFn('Préparation à la livraison', 'Delivery preparation')}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono bg-white/[0.06] border border-white/10 px-2.5 py-1 rounded-lg text-sm font-bold text-white">
              #{reference}
            </span>
            {colis?.pin_masked && !confirmed && (
              <span className="font-mono bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                PIN: {colis.pin_masked}
              </span>
            )}
          </div>
        </div>

        {/* ─── Confirmed: Show success + notifications ─── */}
        {confirmed && colis && successData && (
          <DeliverySuccess
            colis={colis}
            waSender={successData.wa_sender}
            waReceiver={successData.wa_receiver}
            lang={currentLang}
            senderDone={notifiedSet.sender}
            receiverDone={notifiedSet.receiver}
            onNotify={handleNotify}
          />
        )}

        {/* ─── Normal: Show preparation cards ─── */}
        {isNormal && colis && (
          <div className="space-y-4">
            {/* Warnings */}
            {geoDistance !== null && geoDistance > GEO_WARNING_KM && (
              <GeoWarning distance={geoDistance} />
            )}
            {showPrematureWarning && colis.estimatedArrival && (
              <PrematureWarning estimatedTime={colis.estimatedArrival} />
            )}

            {/* 4 Cards */}
            <TrajetCard colis={colis} lang={currentLang} />
            <ContactsCard colis={colis} lang={currentLang} />
            <LogisticsCard colis={colis} lang={currentLang} />
            <TimelineCard timeline={displayTimeline} lang={currentLang} />
          </div>
        )}

        {/* ─── PIN Blocked Warning ─── */}
        {colis && isInTransit && !confirmed && colis.pinAttempts >= 3 && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center">
            <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-200">
              {tFn('Code PIN bloqué', 'PIN code blocked')}
            </p>
            <p className="text-sm text-red-300 mt-1">
              {tFn(
                '3 tentatives échouées. Contactez l\'agence pour réinitialiser.',
                '3 failed attempts. Contact the agency to reset.'
              )}
            </p>
          </div>
        )}
      </main>

      {/* ─── Sticky Bottom Action ─── */}
      {isNormal && colis && colis.pinAttempts < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#060B1F]/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] z-30">
          <div className="max-w-[600px] mx-auto px-4 py-4 safe-area-inset-bottom">
            <button
              type="button"
              onClick={() => setShowPinModal(true)}
              className="w-full h-16 bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#34D399] hover:to-[#6EE7B7] active:scale-[0.98] text-[#060B1F] font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 text-base"
            >
              <Lock className="w-5 h-5" />
              {tFn('Confirmer la livraison & saisir le code PIN', 'Confirm delivery & enter PIN code')}
            </button>
            <p className="text-xs text-center text-white/40 mt-2">
              {tFn(
                'Le destinataire doit vous fournir le code à 6 chiffres',
                'The receiver must provide the 6-digit code'
              )}
            </p>
          </div>
        </div>
      )}

      {/* ─── PIN Keypad Modal ─── */}
      {showPinModal && colis && (
        <PinKeypad
          onSubmit={handlePinSubmit}
          onCancel={() => setShowPinModal(false)}
          receiverName={colis.receiverName}
          onContactAgency={() => {
            setShowPinModal(false);
            window.open(`https://wa.me/?text=${encodeURIComponent(`Bonjour, j'ai un problème avec le colis ${reference}. Code PIN bloqué.`)}`, '_blank');
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  PAGE EXPORT
// ═══════════════════════════════════════════════════

export default function RetrievePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060B1F]">
          <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        </div>
      }
    >
      <RetrieveContent />
    </Suspense>
  );
}
