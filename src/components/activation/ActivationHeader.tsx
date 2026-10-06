'use client';

import { QrCode, Truck, Globe, PackageOpen } from 'lucide-react';

interface ActivationHeaderProps {
  qrCode: string;
  onLangChange: (lang: 'fr' | 'en') => void;
  currentLang: 'fr' | 'en';
}

export default function ActivationHeader({ qrCode, onLangChange, currentLang }: ActivationHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#060B1F]/80 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
      {/* Top row */}
      <div className="max-w-[600px] mx-auto px-3 sm:px-4 flex items-center justify-between gap-2 h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#10B981] to-[#3B6BD9] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight block leading-tight text-white">
              QR<span className="text-gradient-emerald">Trans</span>
            </span>
            {qrCode && (
              <span className="text-[10px] sm:text-xs font-mono text-white/50 leading-tight">{qrCode}</span>
            )}
          </div>
        </div>

        {/* Badge Chauffeur — responsive text */}
        <div className="hidden xs:flex items-center gap-1.5 sm:gap-2 border border-dashed border-emerald-500/40 bg-emerald-500/10 rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2">
          <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-300 shrink-0" />
          <span className="text-[10px] sm:text-lg font-bold text-emerald-200 uppercase leading-tight">
            {currentLang === 'fr' ? 'Chauffeur' : 'Driver'}
          </span>
        </div>

        {/* Lang */}
        <button
          onClick={() => onLangChange(currentLang === 'fr' ? 'en' : 'fr')}
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-white/70 hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 shrink-0"
          aria-label="Switch language"
        >
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">{currentLang === 'fr' ? 'EN' : 'FR'}</span>
        </button>
      </div>

      {/* Title bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[600px] mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <h1 className="font-display text-base sm:text-2xl font-extrabold text-white uppercase leading-tight flex items-center gap-2">
            <PackageOpen className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400" />
            {currentLang === 'fr' ? 'Activation du Colis' : 'Package Activation'}
          </h1>
        </div>
      </div>
    </header>
  );
}
