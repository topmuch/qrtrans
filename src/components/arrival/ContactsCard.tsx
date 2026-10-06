'use client';

import { Phone, MessageCircle, Upload, Download } from 'lucide-react';

interface ContactsCardProps {
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  reference: string;
  lang: 'fr' | 'en';
}

export default function ContactsCard({
  senderName, senderPhone, receiverName, receiverPhone, reference, lang,
}: ContactsCardProps) {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  const cleanPhone = (p: string) => p.replace(/[^0-9]/g, '');

  // Generic WhatsApp messages for direct contact
  const senderWaMsg = lang === 'fr'
    ? `Bonjour ${senderName}, concernant votre colis #${reference}.`
    : `Hello ${senderName}, regarding your package #${reference}.`;

  const receiverWaMsg = lang === 'fr'
    ? `Bonjour ${receiverName}, concernant votre colis #${reference}.`
    : `Hello ${receiverName}, regarding your package #${reference}.`;

  return (
    <div className="glass-card rounded-xl p-5 border-l-4 border-l-emerald-500/70">
      <h2 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-emerald-400" />
        {t('Contacts', 'Contacts')}
      </h2>

      <div className="space-y-4">
        {/* ENVOYEUR */}
        <div className="bg-white/[0.04] border border-white/5 rounded-lg p-4">
          <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            {t('Envoyeur', 'Sender')}
          </p>
          <p className="font-semibold text-white text-sm">{senderName || '—'}</p>
          <p className="text-sm text-white/50 font-mono mt-0.5">{senderPhone || '—'}</p>

          {senderPhone && (
            <div className="flex gap-2 mt-3">
              <a
                href={`tel:${senderPhone}`}
                className="inline-flex items-center gap-1.5 px-3 h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg text-xs font-semibold transition-colors no-underline"
              >
                <Phone className="w-3.5 h-3.5" />
                {t('Appeler', 'Call')}
              </a>
              <a
                href={`https://wa.me/${cleanPhone(senderPhone)}?text=${encodeURIComponent(senderWaMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 h-10 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg text-xs font-semibold transition-colors no-underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* RECEVEUR */}
        <div className="bg-white/[0.04] border border-white/5 rounded-lg p-4">
          <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            {t('Receveur', 'Receiver')}
          </p>
          <p className="font-semibold text-white text-sm">{receiverName || '—'}</p>
          <p className="text-sm text-white/50 font-mono mt-0.5">{receiverPhone || '—'}</p>

          {receiverPhone && (
            <div className="flex gap-2 mt-3">
              <a
                href={`tel:${receiverPhone}`}
                className="inline-flex items-center gap-1.5 px-3 h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg text-xs font-semibold transition-colors no-underline"
              >
                <Phone className="w-3.5 h-3.5" />
                {t('Appeler', 'Call')}
              </a>
              <a
                href={`https://wa.me/${cleanPhone(receiverPhone)}?text=${encodeURIComponent(receiverWaMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 h-10 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-lg text-xs font-semibold transition-colors no-underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
