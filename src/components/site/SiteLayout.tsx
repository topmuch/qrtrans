'use client';

import { useEffect } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import WhatsAppFloat from './WhatsAppFloat';
import useScrollReveal from './useScrollReveal';

interface SiteLayoutProps {
  children: React.ReactNode;
  /** Set to true if the page renders its own dark hero — adds top padding so content doesn't collide with the fixed header. */
  hasDarkHero?: boolean;
  /** Hide the WhatsApp float button (rare, e.g. on contact page). */
  hideWhatsApp?: boolean;
}

/**
 * Unified marketing layout — Deep Navy + Emerald premium theme.
 * Replaces the old `SecondaryPageLayout` / `PublicLayout` / inline chrome.
 */
export default function SiteLayout({
  children,
  hasDarkHero = true,
  hideWhatsApp = false,
}: SiteLayoutProps) {
  useScrollReveal();

  useEffect(() => {
    // Ensure the page is dark-themed (marketing pages are always dark-premium)
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  return (
    <div className="min-h-screen bg-[#060B1F] text-white selection:bg-emerald-500/30 selection:text-white">
      <SiteHeader />
      <main className={hasDarkHero ? '' : 'pt-24'}>{children}</main>
      <SiteFooter />
      {!hideWhatsApp && <WhatsAppFloat />}
    </div>
  );
}
