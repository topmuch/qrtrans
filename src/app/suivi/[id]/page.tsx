'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  QrCode,
  Loader2,
  MapPin,
  Clock,
  Truck,
  User,
  Package,
  Globe,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Home,
  ArrowRight,
  Shield,
  Send,
  Copy,
  Phone,
  Plane,
  Train,
  Ship,
  Bus,
  ListChecks,
} from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════

interface TimelineEntry {
  id?: string;
  type: string;
  label: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  recipientName?: string | null;
  recipientPhone?: string | null;
  recipientType?: string;
  messageContent?: string;
  waLink?: string | null;
}

interface ColisInfo {
  reference: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  statusIcon: string;
  transportMode: string;
  transportIcon: string;
  company: string;
  departureCity: string;
  arrivalCity: string;
  departureDate: string | null;
  departureTime: string | null;
  senderName: string;
  receiverName: string;
  createdAt: string;
  arrivedAt: string | null;
  deliveredAt: string | null;
  deliveryLocation: string | null;
  driverPhone: string | null;
  shareDriverPhone: boolean;
}

// ═══════════════════════════════════════════════════
//  HELPER
// ═══════════════════════════════════════════════════

function formatDate(iso: string, lang: 'fr' | 'en') {
  try {
    return new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string, lang: 'fr' | 'en') {
  try {
    return new Date(iso).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function getEventDotColor(type: string): string {
  switch (type) {
    case 'activation': return 'bg-emerald-400';
    case 'pin_generated': return 'bg-amber-400';
    case 'arrival': return 'bg-orange-400';
    case 'delivery': return 'bg-emerald-400';
    case 'created': return 'bg-slate-400';
    default: return 'bg-slate-500';
  }
}

// ═══════════════════════════════════════════════════
//  MESSAGE CARD (expandable)
// ═══════════════════════════════════════════════════

function MessageCard({
  entry,
  lang,
}: {
  entry: TimelineEntry;
  lang: 'fr' | 'en';
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  const isWhatsApp = entry.waLink || entry.type === 'activation' || entry.type === 'delivery';
  const recipientLabel = entry.recipientType === 'sender'
    ? t('Expéditeur', 'Sender')
    : entry.recipientType === 'receiver'
      ? t('Destinataire', 'Receiver')
      : t('Système', 'System');

  const handleCopyMessage = async () => {
    if (!entry.messageContent) return;
    try {
      await navigator.clipboard.writeText(entry.messageContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors text-left"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: entry.color + '22' }}
        >
          {isWhatsApp ? (
            <MessageCircle className="w-4 h-4" style={{ color: entry.color }} />
          ) : (
            <Shield className="w-4 h-4" style={{ color: entry.color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{entry.label}</p>
          <p className="text-xs text-white/60">
            {recipientLabel}{entry.recipientName ? ` — ${entry.recipientName}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-white/40">
            {formatTime(entry.timestamp, lang)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/40" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && entry.messageContent && (
        <div className="px-4 pb-4 space-y-3">
          {/* WhatsApp message preview */}
          <div className="bg-[#0b1437] border border-white/5 rounded-lg p-3 relative">
            {/* WhatsApp header */}
            <div className="flex items-center gap-2 mb-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#25D366]" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs font-medium text-[#25D366]">WhatsApp</span>
            </div>
            {/* Message text (preserve formatting) */}
            <div className="text-[13px] text-white/90 whitespace-pre-wrap leading-relaxed font-sans">
              {entry.messageContent}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {entry.waLink && (
              <a
                href={entry.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-lg text-xs font-semibold text-[#25D366] transition-colors no-underline"
              >
                <Send className="w-3.5 h-3.5" />
                {t('Ouvrir WhatsApp', 'Open WhatsApp')}
              </a>
            )}
            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/80 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? t('Copié !', 'Copied!') : t('Copier', 'Copy')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  TRANSPORT ICON
// ═══════════════════════════════════════════════════

function TransportGlyph({ mode }: { mode: string }) {
  const cls = 'w-5 h-5';
  switch ((mode || '').toLowerCase()) {
    case 'flight':
    case 'avion':
      return <Plane className={cls} />;
    case 'train':
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

// ═══════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════

export default function SuiviPage() {
  const params = useParams();
  const reference = ((params?.id as string) || '').toUpperCase().trim();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [loading, setLoading] = useState(true);
  const [colis, setColis] = useState<ColisInfo | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  useEffect(() => {
    if (!reference) {
      setError(t('Référence manquante.', 'Missing reference.'));
      setLoading(false);
      return;
    }

    const fetchTracking = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/tracking/${encodeURIComponent(reference)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setColis(data.colis);
          setTimeline(data.timeline || []);
        } else {
          setError(data.message || t('Colis introuvable.', 'Package not found.'));
        }
      } catch {
        setError(t('Erreur de connexion.', 'Connection error.'));
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [reference]);

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B1F]">
        <SuiviHeader reference={reference} lang={lang} onLangChange={setLang} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-white/60">{t('Chargement du suivi...', 'Loading tracking...')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (error && !colis) {
    return (
      <div className="min-h-screen bg-[#060B1F]">
        <SuiviHeader reference={reference} lang={lang} onLangChange={setLang} />
        <div className="max-w-[600px] mx-auto px-4 py-16 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-white">{error}</h2>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 h-12 bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#34D399] hover:to-[#6EE7B7] text-[#060B1F] rounded-xl font-semibold text-sm transition-colors no-underline shadow-lg shadow-emerald-500/20"
          >
            <Home className="w-4 h-4" />
            {t("Retour à l'accueil", 'Back to home')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B1F]">
      <SuiviHeader reference={reference} lang={lang} onLangChange={setLang} />

      <main className="max-w-[600px] mx-auto px-4 py-6 pb-20 space-y-5">
        {/* ─── STATUS BANNER ─── */}
        {colis && (
          <div
            className="glass-strong rounded-2xl p-5 relative overflow-hidden"
          >
            {/* Status accent glow */}
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30"
              style={{
                background: colis.status === 'delivered'
                  ? '#10B981'
                  : colis.status === 'in_transit'
                    ? '#3B82F6'
                    : '#F59E0B',
              }}
            />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 blur-xl" />

            <div className="relative space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        colis.status === 'delivered'
                          ? 'rgba(16,185,129,0.18)'
                          : colis.status === 'in_transit'
                            ? 'rgba(59,130,246,0.18)'
                            : 'rgba(245,158,11,0.18)',
                      color:
                        colis.status === 'delivered'
                          ? '#34D399'
                          : colis.status === 'in_transit'
                            ? '#60A5FA'
                            : '#FBBF24',
                    }}
                  >
                    {colis.status === 'delivered' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : colis.status === 'in_transit' ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-display text-base font-bold leading-tight text-white truncate">
                      {colis.statusLabel}
                    </h1>
                    <p className="text-xs text-white/50 font-mono truncate">{colis.reference}</p>
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 bg-white/[0.04] text-white/70"
                  aria-hidden
                >
                  <TransportGlyph mode={colis.transportMode || colis.transportIcon} />
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3">
                <div className="text-center flex-1 min-w-0">
                  <p className="text-lg font-bold text-white truncate">{colis.departureCity}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wide">{t('Départ', 'Departure')}</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 flex-shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="text-center flex-1 min-w-0">
                  <p className="text-lg font-bold text-white truncate">{colis.arrivalCity}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wide">{t('Arrivée', 'Arrival')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── COLIS INFO CARD ─── */}
        {colis && (
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display text-xs font-semibold text-white/60 uppercase tracking-wider">
                {t('Détails du colis', 'Package details')}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem icon={Package} label={t('Référence', 'Reference')} value={colis.reference} mono />
              <InfoItem icon={Truck} label={t('Compagnie', 'Company')} value={colis.company} />
              <InfoItem icon={User} label={t('Expéditeur', 'Sender')} value={colis.senderName} />
              <InfoItem icon={User} label={t('Destinataire', 'Receiver')} value={colis.receiverName} />
              {colis.departureDate && (
                <InfoItem
                  icon={Clock}
                  label={t('Départ', 'Departure')}
                  value={`${formatDate(colis.departureDate, lang)}${colis.departureTime ? ` ${colis.departureTime}` : ''}`}
                />
              )}
              {colis.deliveryLocation && (
                <InfoItem icon={MapPin} label={t('Lieu de dépôt', 'Drop-off')} value={colis.deliveryLocation} />
              )}
              {colis.driverPhone && colis.shareDriverPhone && (
                <InfoItem
                  icon={Phone}
                  label={t('Chauffeur', 'Driver')}
                  value={colis.driverPhone}
                  mono
                  href={`https://wa.me/${colis.driverPhone.replace(/^\+/, '')}`}
                />
              )}
              {colis.deliveredAt && (
                <InfoItem icon={CheckCircle} label={t('Livré le', 'Delivered')} value={formatDate(colis.deliveredAt, lang)} />
              )}
            </div>
          </div>
        )}

        {/* ─── TIMELINE ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-emerald-400" />
              {t('Historique du voyage', 'Journey history')}
            </h2>
            <span className="text-xs font-medium text-emerald-300">
              {timeline.length} {t('événement(s)', 'event(s)')}
            </span>
          </div>

          {timeline.length === 0 ? (
            <div className="glass-card text-center py-12">
              <Clock className="w-8 h-8 text-white/30 mx-auto mb-3" />
              <p className="text-sm text-white/50">
                {t('Aucun événement enregistré.', 'No events recorded.')}
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-400/60 via-white/10 to-white/5" />

              <div className="space-y-3">
                {timeline.map((entry, index) => (
                  <div key={entry.id || index} className="relative flex gap-4">
                    {/* Dot */}
                    <div className="relative z-10 flex-shrink-0 w-[31px] flex items-start justify-center pt-3">
                      <div className={`w-3 h-3 rounded-full ${getEventDotColor(entry.type)} ring-4 ring-[#060B1F] shadow-sm`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Date separator */}
                      {(index === 0 || formatDate(timeline[index - 1].timestamp, lang) !== formatDate(entry.timestamp, lang)) && (
                        <div className="mb-1.5">
                          <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">
                            {formatDate(entry.timestamp, lang)}
                          </span>
                        </div>
                      )}

                      {/* Time */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white/80">
                          {formatTime(entry.timestamp, lang)}
                        </span>
                      </div>

                      {/* Message card */}
                      <MessageCard entry={entry} lang={lang} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Back home ─── */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-emerald-300 transition-colors no-underline"
          >
            <Home className="w-4 h-4" />
            {t("Retour à l'accueil", 'Back to home')}
          </Link>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  HEADER COMPONENT
// ═══════════════════════════════════════════════════

function SuiviHeader({
  reference,
  lang,
  onLangChange,
}: {
  reference: string;
  lang: 'fr' | 'en';
  onLangChange: (lang: 'fr' | 'en') => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#060B1F]/80 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
      <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#3B6BD9] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight block leading-tight text-white">
              QR<span className="text-gradient-emerald">Trans</span>
            </span>
            {reference && (
              <span className="text-[10px] font-mono text-white/50 leading-tight">{reference}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">
              {lang === 'fr' ? 'Suivi' : 'Tracking'}
            </span>
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
      {/* Title bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[600px] mx-auto px-4 py-3">
          <h1 className="font-display text-sm font-semibold text-white/80 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-emerald-400" />
            {lang === 'fr' ? 'Suivi du voyage' : 'Journey tracking'}
          </h1>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════
//  INFO ITEM
// ═══════════════════════════════════════════════════

function InfoItem({
  icon: Icon,
  label,
  value,
  mono,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  href?: string;
}) {
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, target: '_blank' as const, rel: 'noopener noreferrer' as const, className: 'flex items-start gap-2.5 no-underline hover:bg-white/5 rounded-lg p-1 -m-1 transition-colors cursor-pointer' }
    : { className: 'flex items-start gap-2.5' };

  return (
    <Wrapper {...wrapperProps}>
      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-emerald-300" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-white/50 font-medium">{label}</p>
        <p className={`text-sm text-white font-semibold truncate ${mono ? 'font-mono' : ''}`}>
          {value}
        </p>
      </div>
    </Wrapper>
  );
}
