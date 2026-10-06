'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Copy, Home, Package, MapPin, Send } from 'lucide-react';
import { createArrivalLinks, formatDateFR, formatTime } from '@/lib/wame';

// ═══════════════════════════════════════════════════
//  WHATSAPP SVG PATH (reused)
// ═══════════════════════════════════════════════════

const WA_SVG = (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ═══════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════

interface ArrivalSuccessProps {
  reference: string;
  arrivalCity: string;
  deliveryLocation: string;
  arrivalDate: string;
  arrivalTime: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  companyName: string;
  lang: 'fr' | 'en';
  /** 'none' = both buttons active, 'sender' = sender done, 'receiver' = receiver done */
  notified?: 'none' | 'sender' | 'receiver';
}

// ═══════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════

export default function ArrivalSuccess({
  reference, arrivalCity, deliveryLocation, arrivalDate, arrivalTime,
  senderName, senderPhone, receiverName, receiverPhone, companyName, lang,
  notified = 'none',
}: ArrivalSuccessProps) {
  const router = useRouter();
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;
  const [copied, setCopied] = useState(false);

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/activate/${reference}`
    : `/activate/${reference}`;

  const feedbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/feedback/${reference}`
    : `/feedback/${reference}`;

  const suiviUrl = `/suivi/${reference}`;

  // Build vars for wame.ts
  const vars = {
    reference,
    sender_name: senderName,
    sender_whatsapp: senderPhone,
    receiver_name: receiverName,
    receiver_whatsapp: receiverPhone,
    company_name: companyName,
    departure_city: '',
    arrival_city: arrivalCity,
    departure_date: '',
    departure_time: '',
    arrived_date: formatDateFR(arrivalDate),
    arrived_time: formatTime(arrivalTime),
    delivery_location: deliveryLocation,
    tracking_url: trackingUrl,
    feedback_url: feedbackUrl,
  };

  const links = createArrivalLinks(vars);

  // ─── Navigate to /sending page ───
  const handleNotify = useCallback(
    (waLink: string, name: string, type: 'sender' | 'receiver') => {
      // Determine callback: if one is already notified, go to suivi; otherwise go back
      const otherNotified = notified !== 'none' && notified !== type;
      const callback = otherNotified
        ? suiviUrl
        : `/arrivee/${reference}?notified=${type}`;

      const params = new URLSearchParams({
        waLink,
        to: name,
        type,
        callback,
        suivi: suiviUrl,
      });
      router.push(`/sending?${params.toString()}`);
    },
    [notified, reference, router, suiviUrl],
  );

  // ─── Copy link ───
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${suiviUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = `${window.location.origin}${suiviUrl}`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Success banner ── */}
      <div className="glass-strong rounded-xl p-6 text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#25D366]/15 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#34D399] rounded-full mb-3 shadow-lg shadow-emerald-500/30">
            <CheckCircle className="w-8 h-8 text-[#060B1F]" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">
            {t('LIVRAISON CONFIRMÉE !', 'DELIVERY CONFIRMED!')}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-3 text-sm text-white/70">
            <span>{formatDateFR(arrivalDate)} {t('à', 'at')} {formatTime(arrivalTime)}</span>
          </div>
          <div className="mt-1 text-sm text-white/60 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {deliveryLocation}
          </div>
        </div>
      </div>

      {/* ── Section: Notifier ── */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="font-display text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
          <Send className="w-3.5 h-3.5 text-emerald-400" />
          {t('Notifier les contacts', 'Notify contacts')}
        </h3>
        <p className="text-xs text-white/60">
          {t(
            'Informez l\'expéditeur et le destinataire de la livraison du colis.',
            'Inform the sender and receiver about the package delivery.'
          )}
        </p>
      </div>

      {/* ── WhatsApp Buttons ── */}
      <div className="space-y-3">
        {/* Sender button */}
        {notified === 'sender' ? (
          /* Already notified — disabled state */
          <div className="flex items-center justify-center gap-3 w-full h-16 bg-white/5 border border-white/10 rounded-2xl text-white/50">
            <span className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </span>
            <span className="font-bold text-base">
              {t('EXPÉDITEUR NOTIFIÉ', 'SENDER NOTIFIED')}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleNotify(links.sender, senderName, 'sender')}
            className="flex items-center justify-center gap-3 w-full h-16 bg-[#FF6B35] hover:bg-[#e55a28] active:bg-[#d04e1f] text-white rounded-2xl font-bold text-base shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">{WA_SVG}</span>
            {t("NOTIFIER L'EXPÉDITEUR", 'NOTIFY SENDER')}
          </button>
        )}

        {/* Receiver button */}
        {notified === 'receiver' ? (
          <div className="flex items-center justify-center gap-3 w-full h-16 bg-white/5 border border-white/10 rounded-2xl text-white/50">
            <span className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </span>
            <span className="font-bold text-base">
              {t('DESTINATAIRE NOTIFIÉ', 'RECEIVER NOTIFIED')}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleNotify(links.receiver, receiverName, 'receiver')}
            className="flex items-center justify-center gap-3 w-full h-16 bg-[#25D366] hover:bg-[#1fb855] active:bg-[#1a9e49] text-white rounded-2xl font-bold text-base shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">{WA_SVG}</span>
            {t('NOTIFIER LE DESTINATAIRE', 'NOTIFY RECEIVER')}
          </button>
        )}
      </div>

      {/* ── Extra options ── */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-2 w-full h-12 text-sm font-semibold text-white/70 hover:text-emerald-300 transition-colors"
        >
          <Copy className="w-4 h-4" />
          {copied ? t('Copié !', 'Copied!') : t('Copier le lien de suivi', 'Copy tracking link')}
        </button>

        <button
          type="button"
          onClick={() => router.push(suiviUrl)}
          className="flex items-center gap-2 w-full h-12 text-sm font-semibold text-white/70 hover:text-emerald-300 transition-colors"
        >
          <Package className="w-4 h-4" />
          {t('Voir le suivi du colis', 'View package tracking')}
        </button>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 w-full h-12 text-sm font-semibold text-white/50 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          {t("Retour à l'accueil", 'Back to home')}
        </button>
      </div>
    </div>
  );
}
