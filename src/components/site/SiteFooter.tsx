'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, MessageCircle, Linkedin, Facebook, Instagram, ArrowRight } from 'lucide-react';

const NAV_COLUMNS = [
  {
    title: 'Produit',
    links: [
      { href: '/fonctionnalites', label: 'Fonctionnalités' },
      { href: '/securite', label: 'Sécurité' },
      { href: '/demo', label: 'Démo live' },
      { href: '/devenir-partenaire', label: 'Devenir partenaire' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/faq', label: 'FAQ' },
      { href: '/documentation', label: 'Documentation' },
      { href: '/contact', label: 'Support' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { href: '/a-propos', label: 'À propos' },
      { href: '/contact', label: 'Contact' },
      { href: '/mentions-legales', label: 'Mentions légales' },
      { href: '/cgu', label: 'CGU' },
    ],
  },
];

const SOCIALS = [
  { href: '#', label: 'LinkedIn', icon: Linkedin },
  { href: '#', label: 'Facebook', icon: Facebook },
  { href: '#', label: 'Instagram', icon: Instagram },
];

export default function SiteFooter({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const isDark = theme === 'dark';

  const containerClass = isDark
    ? 'relative bg-[#060B1F] text-white overflow-hidden'
    : 'relative bg-gradient-to-b from-[#F4F7FB] to-[#EDF2F8] text-[#0F1B2E] overflow-hidden';

  const cardClass = isDark ? 'glass-card' : 'glass-card-light';
  const textMuted = isDark ? 'text-white/70' : 'text-[#5B7088]';
  const textHeading = isDark ? 'text-white/60' : 'text-[#1E4B7A]/70';
  const textLink = isDark ? 'text-white/80 hover:text-emerald-300' : 'text-[#1E4B7A]/80 hover:text-[#1E4B7A]';
  const dividerClass = isDark ? 'border-white/10' : 'border-[#1E4B7A]/10';
  const socialBtn = isDark
    ? 'bg-white/5 hover:bg-emerald-500/20 border-white/10 hover:border-emerald-400/40'
    : 'bg-white hover:bg-[#1E4B7A]/10 border-[#1E4B7A]/10 hover:border-[#1E4B7A]/40';
  const socialIcon = isDark ? 'text-white/70 hover:text-emerald-300' : 'text-[#1E4B7A]/70 hover:text-[#1E4B7A]';

  return (
    <footer className={containerClass}>
      {/* Aurora glow at the top */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px ${isDark ? 'bg-gradient-to-r from-transparent via-[#10B981]/40 to-transparent' : 'bg-gradient-to-r from-transparent via-[#1E4B7A]/40 to-transparent'}`} />
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-30"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent 60%)'
            : 'radial-gradient(circle, rgba(72, 122, 168, 0.4), transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Big CTA */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className={`${cardClass} p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden`}>
          {/* Decorative gradient */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-50"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(16, 185, 129, 0.15), transparent 70%)'
                : 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(72, 122, 168, 0.15), transparent 70%)',
            }}
          />
          <div className="relative">
            <p className={`font-display text-xs sm:text-sm uppercase tracking-[0.3em] mb-4 ${isDark ? 'text-emerald-300' : 'text-[#1E4B7A]'}`}>
              Prêt à sécuriser vos colis ?
            </p>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05]">
              Lancez-vous en{' '}
              <span className={isDark ? 'text-gradient-emerald' : 'text-gradient-blue'}>
                30 secondes
              </span>
              <br />
              sans engagement.
            </h2>
            <p className={`mt-6 text-base sm:text-lg max-w-2xl mx-auto ${textMuted}`}>
              Rejoignez les 500+ agences qui sécurisent leurs colis avec QRTrans.
              Aucune carte requise, configuration immédiate.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/devenir-partenaire"
                className={`btn-magnetic group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base shadow-xl transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-[#1E4B7A] to-[#487AA8] text-white shadow-[#1E4B7A]/30'
                }`}
              >
                Démarrer maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl border font-semibold text-base transition-all ${
                  isDark
                    ? 'border-white/20 hover:border-white/40 hover:bg-white/5 text-white'
                    : 'border-[#1E4B7A]/20 hover:border-[#1E4B7A]/40 hover:bg-[#1E4B7A]/5 text-[#1E4B7A]'
                }`}
              >
                Parler à un expert
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div className={`relative border-t ${dividerClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand block */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center group">
                <Image
                  src="/brand/logo.png"
                  alt="QRTrans"
                  width={200}
                  height={59}
                  className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
              </Link>
              <p className={`text-sm max-w-sm leading-relaxed ${textMuted}`}>
                La plateforme de traçabilité de colis par QR code pensée pour
                les transporteurs africains. Sécurité, simplicité, transparence.
              </p>

              {/* Contact details */}
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="https://wa.me/221784858226"
                    className={`flex items-center gap-3 transition-colors link-underline w-fit ${isDark ? 'text-white/80 hover:text-emerald-300' : 'text-[#1E4B7A]/80 hover:text-[#1E4B7A]'}`}
                  >
                    <MessageCircle className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-[#1E4B7A]'}`} />
                    +221 78 485 82 26
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@qrtrans.com"
                    className={`flex items-center gap-3 transition-colors link-underline w-fit ${isDark ? 'text-white/80 hover:text-emerald-300' : 'text-[#1E4B7A]/80 hover:text-[#1E4B7A]'}`}
                  >
                    <Mail className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-[#1E4B7A]'}`} />
                    contact@qrtrans.com
                  </a>
                </li>
                <li className={`flex items-center gap-3 ${isDark ? 'text-white/60' : 'text-[#5B7088]'}`}>
                  <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-[#1E4B7A]'}`} />
                  Cité Alia Diène, Ouest Foire, Yoff, Dakar
                </li>
              </ul>
            </div>

            {/* Nav columns */}
            {NAV_COLUMNS.map((col) => (
              <div key={col.title} className="space-y-4">
                <h3 className={`font-display text-sm font-semibold uppercase tracking-wider ${textHeading}`}>
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={`text-sm transition-colors link-underline ${textLink}`}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className={`mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-6 ${dividerClass}`}>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-[#5B7088]'}`}>
              © {new Date().getFullYear()} QRTrans. Tous droits réservés.
            </p>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-[#5B7088]'}`}>
              Conçu avec <span className={isDark ? 'text-emerald-400' : 'text-[#1E4B7A]'}>❤</span> à Dakar, Sénégal
            </p>
            <div className="flex items-center gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${socialBtn} ${socialIcon}`}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
