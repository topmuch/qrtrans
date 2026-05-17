'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QrCode, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Solutions', href: '#services' },
  { label: 'Processus', href: '#process' },
  { label: 'Chauffeur / Agence', href: '#spaces' },
  { label: 'Contact', href: '#footer' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(10,37,64,0.08)] border-b border-[#E2E8F0]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FF6B35] shadow-[0_4px_12px_rgba(255,107,53,0.25)] group-hover:shadow-[0_4px_16px_rgba(255,107,53,0.35)] transition-shadow">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0A2540] tracking-tight">
              QRTrans
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-sm font-medium text-[#475569] hover:text-[#0A2540] transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#FF6B35] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/agence/connexion">
              <Button
                variant="ghost"
                className="text-[#475569] hover:text-[#0A2540] text-sm font-medium border border-[#E2E8F0] hover:border-[#0A2540]/20 hover:bg-white rounded-lg"
              >
                Espace Agence
              </Button>
            </Link>
            <Link href="/devenir-partenaire">
              <Button className="bg-[#FF6B35] hover:bg-[#e65a28] text-white font-medium text-sm rounded-lg px-5 shadow-[0_4px_12px_rgba(255,107,53,0.25)] hover:shadow-[0_4px_16px_rgba(255,107,53,0.35)] transition-all hover:scale-[1.02]">
                Devenir Partenaire
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#0A2540] p-1"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden py-4 border-t border-[#E2E8F0] bg-white/98 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[#0A2540] hover:text-[#FF6B35] font-medium py-2 text-lg"
                    onClick={() => handleNavClick(link.href)}
                  >
                    {link.label}
                  </a>
                ))}
                <hr className="border-[#E2E8F0]" />
                <Link href="/agence/connexion" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full text-[#475569] border border-[#E2E8F0] justify-start rounded-lg"
                  >
                    Espace Agence
                  </Button>
                </Link>
                <Link href="/devenir-partenaire" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#e65a28] text-white font-medium rounded-lg">
                    Devenir Partenaire
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
