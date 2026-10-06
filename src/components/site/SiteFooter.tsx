'use client';

import Link from 'next/link';
import { QrCode, Mail, Phone, MapPin, MessageCircle, Linkedin, Facebook, Instagram, ArrowRight } from 'lucide-react';

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

export default function SiteFooter() {
  return (
    <footer className="relative bg-[#060B1F] text-white overflow-hidden">
      {/* Aurora glow at the top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[#10B981]/40 to-transparent" />
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent 60%)', filter: 'blur(80px)' }}
      />

      {/* Big CTA */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="glass-card p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
          {/* Decorative gradient */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(16, 185, 129, 0.15), transparent 70%)',
            }}
          />
          <div className="relative">
            <p className="font-display text-xs sm:text-sm uppercase tracking-[0.3em] text-emerald-300 mb-4">
              Prêt à sécuriser vos colis ?
            </p>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05]">
              Lancez-vous en{' '}
              <span className="text-gradient-emerald">30 secondes</span>
              <br />
              sans engagement.
            </h2>
            <p className="mt-6 text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
              Rejoignez les 500+ agences qui sécurisent leurs colis avec QRTrans.
              Aucune carte requise, configuration immédiate.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/devenir-partenaire"
                className="btn-magnetic group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold text-base shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                Démarrer maintenant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-base transition-all"
              >
                Parler à un expert
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand block */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#3B6BD9] flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="font-display text-xl font-bold tracking-tight">
                  QR<span className="text-gradient-emerald">Trans</span>
                </span>
              </Link>
              <p className="text-sm text-white/70 max-w-sm leading-relaxed">
                La plateforme de traçabilité de colis par QR code pensée pour
                les transporteurs africains. Sécurité, simplicité, transparence.
              </p>

              {/* Contact details */}
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="https://wa.me/221784858226"
                    className="flex items-center gap-3 text-white/80 hover:text-emerald-300 transition-colors link-underline w-fit"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    +221 78 485 82 26
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@qrtrans.com"
                    className="flex items-center gap-3 text-white/80 hover:text-emerald-300 transition-colors link-underline w-fit"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                    contact@qrtrans.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white/60">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Cité Alia Diène, Ouest Foire, Yoff, Dakar
                </li>
              </ul>
            </div>

            {/* Nav columns */}
            {NAV_COLUMNS.map((col) => (
              <div key={col.title} className="space-y-4">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white/60">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/80 hover:text-emerald-300 transition-colors link-underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} QRTrans. Tous droits réservés.
            </p>
            <p className="text-sm text-white/60">
              Conçu avec <span className="text-emerald-400">❤</span> à Dakar, Sénégal
            </p>
            <div className="flex items-center gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 flex items-center justify-center transition-all"
                >
                  <s.icon className="w-4 h-4 text-white/70 hover:text-emerald-300" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
