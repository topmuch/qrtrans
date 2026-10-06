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
    <header className="sticky top-0 z-50 glass-light-strong border-b border-[#1E4B7A]/10 safe-area-inset-top">
      {/* Top row */}
      <div className="max-w-[600px] mx-auto px-3 sm:px-4 flex items-center justify-between gap-2 h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#1E4B7A]/15 flex items-center justify-center overflow-hidden">
            <Image
              src="/brand/logo.png"
              width={32}
              height={32}
              alt="QRTrans"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight block leading-tight text-[#0F1B2E]">
              QR<span className="text-gradient-blue">Trans</span>
            </span>
            {qrCode && (
              <span className="text-[10px] sm:text-xs font-mono text-[#5B7088] leading-tight">{qrCode}</span>
            )}
          </div>
        </div>

        {/* Badge Chauffeur — responsive text */}
        <div className="hidden xs:flex items-center gap-1.5 sm:gap-2 border border-dashed border-[#1E4B7A]/40 bg-[#1E4B7A]/10 rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2">
          <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#1E4B7A] shrink-0" />
          <span className="text-[10px] sm:text-lg font-bold text-[#1E4B7A] uppercase leading-tight">
            {currentLang === 'fr' ? 'Chauffeur' : 'Driver'}
          </span>
        </div>

        {/* Lang */}
        <button
          onClick={() => onLangChange(currentLang === 'fr' ? 'en' : 'fr')}
          className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[#5B7088] hover:text-[#1E4B7A] transition-colors px-2 sm:px-3 py-1.5 rounded-lg bg-[#1E4B7A]/5 hover:bg-[#1E4B7A]/10 shrink-0"
          aria-label="Switch language"
        >
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">{currentLang === 'fr' ? 'EN' : 'FR'}</span>
        </button>
      </div>

      {/* Title bar */}
      <div className="border-t border-[#1E4B7A]/10">
        <div className="max-w-[600px] mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <h1 className="font-display text-base sm:text-2xl font-extrabold text-[#1E4B7A] uppercase leading-tight flex items-center gap-2">
            <PackageOpen className="w-4 h-4 sm:w-6 sm:h-6 text-[#1E4B7A]" />
            {currentLang === 'fr' ? 'Activation du Colis' : 'Package Activation'}
          </h1>
        </div>
      </div>
    </header>
  );
}
