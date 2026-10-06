'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, QrCode } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/fonctionnalites', label: 'Fonctionnalités' },
  { href: '/securite', label: 'Sécurité' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#060B1F]/80 backdrop-blur-xl border-b border-white/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#3B6BD9] flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            QR<span className="text-gradient-emerald">Trans</span>
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
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'text-emerald-300 bg-white/5'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/devenir-partenaire"
            className="btn-magnetic relative overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
          >
            <span className="relative z-10">Devenir partenaire</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 text-white"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#060B1F]/95 backdrop-blur-xl border-b border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-emerald-300 bg-white/5'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
              <Link
                href="/login"
                className="block px-4 py-3 rounded-lg text-base font-medium text-white/80 hover:text-white hover:bg-white/5"
              >
                Connexion
              </Link>
              <Link
                href="/devenir-partenaire"
                className="block px-4 py-3 rounded-lg text-base font-bold text-center bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F]"
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
