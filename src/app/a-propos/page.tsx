'use client';

import Link from 'next/link';
import {
  Target,
  Zap,
  Shield,
  HeartHandshake,
  Users,
  Lightbulb,
  Eye,
  Infinity as InfinityIcon,
  MapPin,
  Phone,
  Mail,
  Building2,
  PackageCheck,
  Star,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import SiteLayout from '@/components/site/SiteLayout';
import AuroraBackground from '@/components/site/AuroraBackground';
import ParticleBackground from '@/components/site/ParticleBackground';
import AnimatedCounter from '@/components/site/AnimatedCounter';

/* ---------------------------------------------------------------
   Static content
---------------------------------------------------------------- */

type ValueCard = {
  icon: typeof Zap;
  title: string;
  description: string;
};

const VALUE_CARDS: ValueCard[] = [
  {
    icon: Zap,
    title: 'Simplicité',
    description:
      'Activation en 30 secondes. Aucune application à télécharger, aucune batterie à charger, aucun GPS à configurer. Un simple scan suffit.',
  },
  {
    icon: Shield,
    title: 'Sécurité',
    description:
      "Vos données personnelles sont protégées et chiffrées de bout en bout. Aucune information sensible n'est jamais exposée publiquement.",
  },
  {
    icon: HeartHandshake,
    title: 'Confiance',
    description:
      'Plus de 10 000 colis protégés à travers le Sénégal et l’Afrique de l’Ouest, avec un taux de récupération de 98 %. La preuve par le résultat.',
  },
];

type Belief = {
  icon: typeof Users;
  title: string;
  description: string;
};

const BELIEFS: Belief[] = [
  {
    icon: Users,
    title: "L'humain d'abord",
    description:
      "Nous concevons nos solutions pour les personnes, pas pour les systèmes. Chaque pèlerin, chaque voyageur, chaque famille mérite une expérience fluide et rassurante. Nous plaçons l'empathie au cœur de chaque décision produit.",
  },
  {
    icon: Lightbulb,
    title: "L'innovation au service de l'utilité",
    description:
      "Pas de technologie pour la technologie — nous ne développons que ce qui résout un vrai problème. Si une fonctionnalité n'apporte pas de valeur concrète à nos utilisateurs, nous ne la construisons pas.",
  },
  {
    icon: Eye,
    title: 'La transparence totale',
    description:
      "Prix clairs affichés dès le départ, pas de frais cachés, pas de verrouillage. Vous savez exactement ce que vous payez et ce que vous recevez. La confiance se construit sur l'honnêteté.",
  },
  {
    icon: InfinityIcon,
    title: "L'engagement durable",
    description:
      "Nous investissons dans la fiabilité, la sécurité et le support client sur le long terme. Notre objectif n'est pas de maximiser les profits à court terme, mais de construire une relation de confiance qui dure des années.",
  },
];

type Stat = {
  value: number;
  suffix?: string;
  label: string;
  icon: typeof PackageCheck;
};

const STATS: Stat[] = [
  { value: 10000, suffix: '+', label: 'Colis protégés', icon: PackageCheck },
  { value: 98, suffix: '%', label: 'Taux de récupération', icon: Star },
  { value: 500, suffix: '+', label: 'Agences partenaires', icon: TrendingUp },
  { value: 24, suffix: '/7', label: 'Support disponible', icon: Clock },
];

/* ---------------------------------------------------------------
   Inline section heading (light-themed)
---------------------------------------------------------------- */
function SectionHeadingLight({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`${alignClass} max-w-3xl ${className}`}>
      {eyebrow && (
        <p className="font-display text-xs sm:text-sm uppercase tracking-[0.3em] text-[#1E4B7A] mb-4 reveal-up">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F1B2E] tracking-tight leading-[1.1] reveal-up">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base sm:text-lg text-[#5B7088] leading-relaxed reveal-up">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Page
---------------------------------------------------------------- */

export default function AProposPage() {
  return (
    <SiteLayout theme="light" hasDarkHero>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative overflow-hidden bg-light-hero pt-36 pb-24 lg:pt-44 lg:pb-32">
        <AuroraBackground theme="light" />
        <ParticleBackground density={60} theme="light" />
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass-light">
              <Sparkles className="w-4 h-4 text-[#1E4B7A]" />
              <span className="text-xs sm:text-sm font-medium text-[#1E4B7A] tracking-wide">
                À propos de QRTrans
              </span>
            </div>

            <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#0F1B2E]">
              Un voyageur ne devrait jamais{' '}
              <span className="text-gradient-blue">perdre son colis</span>
            </h1>

            <p className="reveal-up mt-6 text-lg sm:text-xl text-[#5B7088] max-w-2xl mx-auto leading-relaxed">
              QRTrans est né d&apos;une conviction simple : la sécurité logistique doit
              être universelle, intelligente et sans friction — pour les transporteurs
              comme pour les voyageurs.
            </p>

            <div className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/devenir-partenaire"
                className="btn-brand btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all"
              >
                Rejoindre l&apos;aventure
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass-light text-[#0F1B2E] font-semibold hover:border-[#1E4B7A]/40 transition-all"
              >
                Nous rencontrer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. MISSION
         ===================================================== */}
      <section className="relative py-24 lg:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-up flex items-center justify-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E4B7A]/10 border border-[#1E4B7A]/25">
              <Target className="w-7 h-7 text-[#1E4B7A]" />
            </div>
          </div>
          <SectionHeadingLight
            eyebrow="Notre mission"
            title={
              <>
                Une protection intelligente,{' '}
                <span className="text-gradient-blue">universelle et sans friction</span>
              </>
            }
            subtitle="Pour tous les colis — que vous soyez pèlerin, voyageur d'affaires ou touriste. Notre objectif est de transformer l'angoisse de la perte en une simple formalité résolue en quelques clics."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUE_CARDS.map((card, idx) => (
              <div
                key={card.title}
                className="reveal-up glass-card-light p-7 sm:p-8"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E4B7A]/15 to-[#487AA8]/5 border border-[#1E4B7A]/25 flex items-center justify-center mb-5">
                  <card.icon className="w-6 h-6 text-[#1E4B7A]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#0F1B2E] mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-[#5B7088] leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          3. BELIEFS — numbered values
         ===================================================== */}
      <section className="relative py-24 lg:py-32 bg-light-mesh">
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-50 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeadingLight
            eyebrow="Nos valeurs"
            title={
              <>
                Ce en quoi nous{' '}
                <span className="text-gradient-blue">croyons</span>
              </>
            }
            subtitle="Quatre principes qui guident chaque décision produit, chaque ligne de code et chaque interaction client."
          />

          <div className="mt-16 space-y-5">
            {BELIEFS.map((belief, idx) => (
              <div
                key={belief.title}
                className="reveal-up glass-card-light p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-7 items-start"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-3 sm:w-24 shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] flex items-center justify-center shadow-lg shadow-[#1E4B7A]/30">
                    <belief.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-display text-3xl font-bold text-[#1E4B7A]/30">
                    0{idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#0F1B2E] mb-2">
                    {belief.title}
                  </h3>
                  <p className="text-sm text-[#5B7088] leading-relaxed">
                    {belief.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          4. QUI SOMMES-NOUS ? — MMASOLUTION
         ===================================================== */}
      <section className="relative py-24 lg:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-light-strong rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-50 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(30, 75, 122, 0.20), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="relative">
              <SectionHeadingLight
                eyebrow="Qui sommes-nous ?"
                title={
                  <>
                    QRTrans, une solution{' '}
                    <span className="text-gradient-blue">MMASOLUTION</span>
                  </>
                }
                align="center"
                className="mb-8"
              />
              <p className="text-[#5B7088] leading-relaxed text-center max-w-2xl mx-auto">
                QRTrans est développé par{' '}
                <strong className="text-[#1E4B7A]">MMASOLUTION</strong>, une
                entreprise spécialisée dans les solutions digitales pour le tourisme
                religieux et les voyages internationaux. Notre équipe combine des
                expertises en technologie, logistique et expérience client pour créer
                des solutions qui font la différence.
              </p>

              <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="glass-card-light p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#1E4B7A]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#5B7088] font-semibold mb-0.5">
                      Adresse
                    </p>
                    <p className="text-xs sm:text-sm text-[#0F1B2E] leading-snug">
                      Cité Alia Diène, Ouest Foire, Yoff, Dakar
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+221784858226"
                  className="glass-card-light p-5 flex items-center gap-3 hover:border-[#1E4B7A]/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#1E4B7A]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#5B7088] font-semibold mb-0.5">
                      Téléphone
                    </p>
                    <p className="text-xs sm:text-sm text-[#0F1B2E] leading-snug">
                      +221 78 485 82 26
                    </p>
                  </div>
                </a>
                <a
                  href="mailto:contact@qrtrans.com"
                  className="glass-card-light p-5 flex items-center gap-3 hover:border-[#1E4B7A]/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#1E4B7A]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#5B7088] font-semibold mb-0.5">
                      Email
                    </p>
                    <p className="text-xs sm:text-sm text-[#0F1B2E] leading-snug truncate">
                      contact@qrtrans.com
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          5. KEY NUMBERS
         ===================================================== */}
      <section className="relative py-24 lg:py-32 section-light">
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeadingLight
            eyebrow="QRTrans en chiffres"
            title={
              <>
                Des chiffres qui{' '}
                <span className="text-gradient-blue">témoignent</span>
              </>
            }
          />

          <div className="mt-16 relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[2.5rem] opacity-60 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(30, 75, 122, 0.15), transparent 60%)',
                filter: 'blur(50px)',
              }}
            />
            <div className="relative glass-light-strong rounded-3xl p-8 sm:p-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                {STATS.map((stat) => (
                  <div key={stat.label} className="reveal-up text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 mb-4">
                      <stat.icon className="w-5 h-5 text-[#1E4B7A]" />
                    </div>
                    <p className="font-display text-4xl sm:text-5xl font-bold text-gradient-blue leading-none">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ''} />
                    </p>
                    <p className="mt-3 text-xs sm:text-sm text-[#5B7088] leading-relaxed">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          6. CTA
         ===================================================== */}
      <section className="relative py-16 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-light-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-50 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(30, 75, 122, 0.20), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 mb-5">
                <Building2 className="w-7 h-7 text-[#1E4B7A]" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0F1B2E] mb-4 leading-tight">
                Construisons ensemble la{' '}
                <span className="text-gradient-blue">logistique de demain</span>
              </h3>
              <p className="text-[#5B7088] mb-8 max-w-xl mx-auto leading-relaxed">
                Que vous soyez transporteur, agence de voyage ou simplement curieux de
                notre approche — parlons-en.
              </p>
              <Link
                href="/contact"
                className="btn-brand btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all"
              >
                Contactez-nous
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
