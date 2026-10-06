'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/fonctionnalites', label: 'Fonctionnalités' },
  { href: '/securite', label: 'Sécurité' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Theme-driven styles
  const isDark = theme === 'dark';
  const headerBg = scrolled
    ? isDark
      ? 'bg-[#060B1F]/80 backdrop-blur-xl border-b border-white/10 py-3'
      : 'bg-white/80 backdrop-blur-xl border-b border-[#1E4B7A]/10 py-3'
    : 'bg-transparent py-5';
  const logoTextClass = isDark ? 'text-white' : 'text-[#0F1B2E]';
  const linkClass = (active: boolean) =>
    active
      ? isDark
        ? 'text-emerald-300 bg-white/5'
        : 'text-[#1E4B7A] bg-[#1E4B7A]/5'
      : isDark
      ? 'text-white/80 hover:text-white hover:bg-white/5'
      : 'text-[#1E4B7A]/80 hover:text-[#0F1B2E] hover:bg-[#1E4B7A]/5';
  const loginLinkClass = isDark
    ? 'text-white/80 hover:text-white'
    : 'text-[#1E4B7A] hover:text-[#0F1B2E]';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo — uses the brand logo PNG */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden ${
            isDark ? 'bg-white/10 border border-white/10' : 'bg-white border border-[#1E4B7A]/15'
          } shadow-lg group-hover:shadow-lg transition-shadow`}>
            <Image
              src="/brand/logo.png"
              alt="QRTrans"
              width={32}
              height={32}
              className="w-full h-full object-contain p-1"
              priority
            />
          </div>
          <span className={`font-display text-xl font-bold tracking-tight hidden sm:inline ${logoTextClass}`}>
            QRTrans
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${linkClass(isActive)}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className={`px-4 py-2 text-sm font-medium transition-colors ${loginLinkClass}`}>
            Connexion
          </Link>
          <Link
            href="/devenir-partenaire"
            className={`btn-magnetic relative overflow-hidden px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all ${
              isDark
                ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] shadow-emerald-500/30 hover:shadow-emerald-500/50'
                : 'bg-gradient-to-r from-[#1E4B7A] to-[#487AA8] text-white shadow-[#1E4B7A]/30 hover:shadow-[#1E4B7A]/50'
            }`}
          >
            Devenir partenaire
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`lg:hidden p-2 ${isDark ? 'text-white' : 'text-[#0F1B2E]'}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className={`lg:hidden absolute top-full left-0 right-0 backdrop-blur-xl border-b animate-in fade-in slide-in-from-top-2 duration-200 ${
          isDark ? 'bg-[#060B1F]/95 border-white/10' : 'bg-white/95 border-[#1E4B7A]/10'
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${linkClass(pathname === link.href)}`}
              >
                {link.label}
              </Link>
            ))}
            <div className={`pt-3 mt-3 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-[#1E4B7A]/10'}`}>
              <Link
                href="/login"
                className={`block px-4 py-3 rounded-lg text-base font-medium ${loginLinkClass} hover:bg-[#1E4B7A]/5`}
              >
                Connexion
              </Link>
              <Link
                href="/devenir-partenaire"
                className={`block px-4 py-3 rounded-lg text-base font-bold text-center ${
                  isDark
                    ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F]'
                    : 'bg-gradient-to-r from-[#1E4B7A] to-[#487AA8] text-white'
                }`}
              >
                Devenir partenaire
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
