'use client';

import { Truck, Globe, PackageOpen } from 'lucide-react';
import Image from 'next/image';

interface ActivationHeaderProps {
  qrCode: string;
  onLangChange: (lang: 'fr' | 'en') => void;
  currentLang: 'fr' | 'en';
}

export default function ActivationHeader({ qrCode, onLangChange, currentLang }: ActivationHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-light-strong border-b border-[#00256D]/10 safe-area-inset-top">
      {/* Top row */}
      <div className="max-w-[600px] mx-auto px-3 sm:px-4 flex items-center justify-between gap-2 h-16">
        {/* Logo — full brand logo, no text label */}
        <div className="flex flex-col shrink-0">
          <Image
            src="/brand/logo.png"
            width={150}
            height={44}
            alt="Mov"
            className="h-8 sm:h-10 w-auto object-contain"
            priority
          />
          {qrCode && (
            <span className="text-[10px] sm:text-xs font-mono text-[#5B7088] leading-tight mt-0.5">{qrCode}</span>
          )}
        </div>

        {/* Badge Chauffeur — responsive text */}
        <div className="hidden xs:flex items-center gap-1.5 sm:gap-2 border border-dashed border-[#00256D]/40 bg-[#00256D]/10 rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2">
          <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#00256D] shrink-0" />
          <span className="text-[10px] sm:text-lg font-bold text-[#00256D] uppercase leading-tight">
            {currentLang === 'fr' ? 'Chauffeur' : 'Driver'}
          </span>
        </div>

        {/* Lang */}
        <button
          onClick={() => onLangChange(currentLang === 'fr' ? 'en' : 'fr')}
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[#5B7088] hover:text-[#00256D] transition-colors px-2 sm:px-3 py-1.5 rounded-lg bg-[#00256D]/5 hover:bg-[#00256D]/10 shrink-0"
          aria-label="Switch language"
        >
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">{currentLang === 'fr' ? 'EN' : 'FR'}</span>
        </button>
      </div>

      {/* Title bar */}
      <div className="border-t border-[#00256D]/10">
        <div className="max-w-[600px] mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <h1 className="font-display text-base sm:text-2xl font-extrabold text-[#00256D] uppercase leading-tight flex items-center gap-2">
            <PackageOpen className="w-4 h-4 sm:w-6 sm:h-6 text-[#00256D]" />
            {currentLang === 'fr' ? 'Activation du Colis' : 'Package Activation'}
          </h1>
        </div>
      </div>
    </header>
  );
}
