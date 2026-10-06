'use client';

import { useEffect } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import WhatsAppFloat from './WhatsAppFloat';
import useScrollReveal from './useScrollReveal';

interface SiteLayoutProps {
  children: React.ReactNode;
  /** Set to true if the page renders its own hero — adds top padding so content doesn't collide with the fixed header. */
  hasDarkHero?: boolean;
  /** Hide the WhatsApp float button (rare, e.g. on contact page). */
  hideWhatsApp?: boolean;
  /** Theme variant: 'light' (default, premium white + brand blue) or 'dark' (deep navy + emerald). */
  theme?: 'light' | 'dark';
}

/**
 * Unified marketing layout.
 * - theme='light' (default): premium white background, brand blue accents.
 * - theme='dark': deep navy + emerald (premium dark variant).
 */
export default function SiteLayout({
  children,
  hasDarkHero = true,
  hideWhatsApp = false,
  theme = 'light',
}: SiteLayoutProps) {
  useScrollReveal();

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
  }, [theme]);

  const containerClass =
    theme === 'dark'
      ? 'min-h-screen bg-[#060B1F] text-white selection:bg-emerald-500/30 selection:text-white'
      : 'min-h-screen bg-[#F4F7FB] text-[#0F1B2E] selection:bg-[#1E4B7A]/20 selection:text-[#0F1B2E]';

  return (
    <div className={containerClass}>
      <SiteHeader theme={theme} />
      <main className={hasDarkHero ? '' : 'pt-24'}>{children}</main>
      <SiteFooter theme={theme} />
      {!hideWhatsApp && <WhatsAppFloat />}
    </div>
  );
}
