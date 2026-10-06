'use client';

import { Package } from 'lucide-react';

interface ColisInfoCardProps {
  reference: string;
  company: string;
  arrivalCity: string;
  departureDate: string | null;
  departureTime: string | null;
  transportType: string;
  lang: 'fr' | 'en';
}

export default function ColisInfoCard({
  reference, company, arrivalCity, departureDate, departureTime, transportType, lang,
}: ColisInfoCardProps) {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const typeLabel = transportType === 'bus' ? 'BUS' : 'GP';

  return (
    <div className="glass-card-light rounded-xl p-5 border-l-4 border-l-[#1E4B7A]">
      <h2 className="font-display text-base font-bold text-[#0F1B2E] mb-4 flex items-center gap-2">
        <Package className="w-4 h-4 text-[#1E4B7A]" />
        {t('Détails du Colis', 'Package Details')}
      </h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5B7088]">{t('Référence', 'Reference')}</span>
          <span className="font-mono font-bold text-[#0F1B2E] text-sm">#{reference}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5B7088]">{t('Statut', 'Status')}</span>
          <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-200">
            {t('En Transit', 'In Transit')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5B7088]">{t('Transport', 'Transport')}</span>
          <span className="font-semibold text-[#0F1B2E] text-sm">{typeLabel} — {company}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5B7088]">{t('Trajet', 'Route')}</span>
          <span className="font-semibold text-[#0F1B2E] text-sm">{arrivalCity}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5B7088]">{t('Départ', 'Departure')}</span>
          <span className="font-medium text-[#1E4B7A] text-sm">
            {formatDate(departureDate)} {departureTime || ''}
          </span>
        </div>
      </div>
    </div>
  );
}
