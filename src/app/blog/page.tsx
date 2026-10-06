'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowRight,
  Mail,
  Send,
  BookOpen,
  Newspaper,
  CheckCircle2,
} from 'lucide-react';
import SiteLayout from '@/components/site/SiteLayout';
import AuroraBackground from '@/components/site/AuroraBackground';
import SectionHeading from '@/components/site/SectionHeading';
import TiltCard from '@/components/site/TiltCard';

/* ---------------------------------------------------------------
   Static content
---------------------------------------------------------------- */

type Article = {
  title: string;
  category: string;
  date: string;
  excerpt: string;
  href: string;
  accent: string;
  badgeClass: string;
};

const ARTICLES: Article[] = [
  {
    title: 'Sécuriser vos colis : 5 bonnes pratiques',
    category: 'Sécurité',
    date: '15 Mai 2026',
    excerpt:
      'Découvrez comment les codes QR et la traçabilité numérique réduisent les pertes et les litiges lors du transport inter-villes au Sénégal.',
    href: '/blog/securiser-colis',
    accent: 'from-emerald-500/30 via-emerald-500/5 to-transparent',
    badgeClass: 'bg-emerald-400/15 border-emerald-400/30 text-emerald-200',
  },
  {
    title: "Optimiser vos tournées de livraison avec la technologie",
    category: 'Productivité',
    date: '10 Mai 2026',
    excerpt:
      "La bonne gestion des itinéraires et le suivi en temps réel permettent aux chauffeurs et agences de gagner du temps et d'améliorer leur rentabilité.",
    href: '/blog/optimiser-tournees',
    accent: 'from-orange-500/30 via-orange-500/5 to-transparent',
    badgeClass: 'bg-orange-400/15 border-orange-400/30 text-orange-200',
  },
  {
    title: 'Réglementation du transport de marchandises au Sénégal',
    category: 'Conformité',
    date: '5 Mai 2026',
    excerpt:
      "Un guide complet sur les obligations légales, les documents requis et les normes à respecter pour le transport inter-villes.",
    href: '/blog/reglementation-transport',
    accent: 'from-blue-500/30 via-blue-500/5 to-transparent',
    badgeClass: 'bg-blue-400/15 border-blue-400/30 text-blue-200',
  },
  {
    title: 'Comment QRTrans réduit les pertes de colis de 90 %',
    category: 'Actu',
    date: '28 Avril 2026',
    excerpt:
      "Étude de cas sur l'impact de la traçabilité QR code sur les pertes de colis dans le réseau de transport Dakar-Saint-Louis.",
    href: '/blog/qrtrans-reduit-pertes',
    accent: 'from-purple-500/30 via-purple-500/5 to-transparent',
    badgeClass: 'bg-purple-400/15 border-purple-400/30 text-purple-200',
  },
  {
    title: 'Guide complet : première activation de colis',
    category: 'Tutoriel',
    date: '20 Avril 2026',
    excerpt:
      "Pas à pas pour activer votre premier colis sur QRTrans, du scan du QR code à la notification WhatsApp.",
    href: '/blog/premiere-activation',
    accent: 'from-cyan-500/30 via-cyan-500/5 to-transparent',
    badgeClass: 'bg-cyan-400/15 border-cyan-400/30 text-cyan-200',
  },
  {
    title: 'Le futur de la logistique au Sénégal',
    category: 'Actu',
    date: '15 Avril 2026',
    excerpt:
      "Comment la digitalisation transforme le secteur du transport inter-villes au Sénégal et en Afrique de l'Ouest.",
    href: '/blog/futur-logistique',
    accent: 'from-amber-500/30 via-amber-500/5 to-transparent',
    badgeClass: 'bg-amber-400/15 border-amber-400/30 text-amber-200',
  },
];

/* ---------------------------------------------------------------
   Page
---------------------------------------------------------------- */

export default function BlogPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <SiteLayout hasDarkHero>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative overflow-hidden bg-hero pt-36 pb-20 lg:pt-44 lg:pb-24">
        <AuroraBackground />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass">
              <Newspaper className="w-4 h-4 text-emerald-300" />
              <span className="text-xs sm:text-sm font-medium text-emerald-200 tracking-wide">
                Blog & Ressources
              </span>
            </div>

            <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Bonnes pratiques &{' '}
              <span className="text-gradient-emerald">actualités logistiques</span>
            </h1>

            <p className="reveal-up mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Conseils, études de cas et réglementation pour les transporteurs
              inter-villes au Sénégal et en Afrique de l&apos;Ouest.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. ARTICLES GRID
         ===================================================== */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Articles"
            title={
              <>
                Nos derniers{' '}
                <span className="text-gradient-emerald">articles</span>
              </>
            }
            subtitle="Plongez dans nos analyses du secteur logistique africain, nos guides pratiques et nos retours d'expérience terrain."
            align="left"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTICLES.map((article, idx) => (
              <TiltCard
                key={article.title}
                glow
                className={`reveal-up h-full flex flex-col ${idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                <div className="relative h-full flex flex-col">
                  {/* Accent gradient blob */}
                  <div
                    aria-hidden="true"
                    className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${article.accent} blur-2xl pointer-events-none`}
                  />
                  <div className="relative flex flex-col h-full">
                    {/* Badge + Date */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${article.badgeClass}`}
                      >
                        {article.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-white/50">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`font-display font-bold text-white mb-3 leading-snug group-hover:text-emerald-200 transition-colors ${
                        idx === 0 ? 'text-2xl sm:text-3xl' : 'text-lg'
                      }`}
                    >
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p
                      className={`text-white/70 leading-relaxed mb-5 flex-1 ${
                        idx === 0 ? 'text-base' : 'text-sm'
                      }`}
                    >
                      {article.excerpt}
                    </p>

                    {/* Read more */}
                    <Link
                      href={article.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 hover:text-emerald-200 group/link"
                    >
                      Lire la suite
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          3. NEWSLETTER CTA — glass card
         ===================================================== */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-strong rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            {/* Decorative blobs */}
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-30 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(59,107,217,0.35), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />

            <div className="relative max-w-xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 mb-5">
                <Mail className="w-7 h-7 text-emerald-300" />
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                Abonnez-vous à la{' '}
                <span className="text-gradient-emerald">newsletter</span>
              </h2>
              <p className="text-white/70 text-sm sm:text-base mb-8 leading-relaxed">
                Recevez nos derniers articles, conseils et études de cas directement
                dans votre boîte mail. Pas de spam, désabonnement en un clic.
              </p>

              {subscribed ? (
                <div className="flex items-center justify-center gap-3 bg-emerald-400/10 border border-emerald-400/30 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span className="text-emerald-200 font-semibold text-sm">
                    Merci ! Vous êtes maintenant abonné à notre newsletter.
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15 text-sm transition-colors"
                  />
                  <button
                    type="submit"
                    className="btn-magnetic inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    S&apos;abonner
                  </button>
                </form>
              )}

              <div className="mt-6 inline-flex items-center gap-2 text-xs text-white/50">
                <BookOpen className="w-3.5 h-3.5 text-emerald-300/80" />
                <span>1 à 2 emails par mois, jamais plus.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
