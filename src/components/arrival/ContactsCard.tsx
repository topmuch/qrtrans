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
    <div className="glass-card-light rounded-xl p-5 border-l-4 border-l-[#1E4B7A]">
      <h2 className="font-display text-base font-bold text-[#0F1B2E] mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-[#1E4B7A]" />
        {t('Contacts', 'Contacts')}
      </h2>

      <div className="space-y-4">
        {/* ENVOYEUR */}
        <div className="bg-[#1E4B7A]/5 border border-[#1E4B7A]/10 rounded-lg p-4">
          <p className="text-xs font-bold text-[#1E4B7A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            {t('Envoyeur', 'Sender')}
          </p>
          <p className="font-semibold text-[#0F1B2E] text-sm">{senderName || '—'}</p>
          <p className="text-sm text-[#5B7088] font-mono mt-0.5">{senderPhone || '—'}</p>

          {senderPhone && (
            <div className="flex gap-2 mt-3">
              <a
                href={`tel:${senderPhone}`}
                className="inline-flex items-center gap-1.5 px-3 h-10 bg-[#1E4B7A]/5 hover:bg-[#1E4B7A]/10 border border-[#1E4B7A]/10 text-[#1E4B7A] rounded-lg text-xs font-semibold transition-colors no-underline"
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
        <div className="bg-[#1E4B7A]/5 border border-[#1E4B7A]/10 rounded-lg p-4">
          <p className="text-xs font-bold text-[#1E4B7A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            {t('Receveur', 'Receiver')}
          </p>
          <p className="font-semibold text-[#0F1B2E] text-sm">{receiverName || '—'}</p>
          <p className="text-sm text-[#5B7088] font-mono mt-0.5">{receiverPhone || '—'}</p>

          {receiverPhone && (
            <div className="flex gap-2 mt-3">
              <a
                href={`tel:${receiverPhone}`}
                className="inline-flex items-center gap-1.5 px-3 h-10 bg-[#1E4B7A]/5 hover:bg-[#1E4B7A]/10 border border-[#1E4B7A]/10 text-[#1E4B7A] rounded-lg text-xs font-semibold transition-colors no-underline"
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
