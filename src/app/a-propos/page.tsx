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
import SectionHeading from '@/components/site/SectionHeading';
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
   Page
---------------------------------------------------------------- */

export default function AProposPage() {
  return (
    <SiteLayout hasDarkHero>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative overflow-hidden bg-hero pt-36 pb-24 lg:pt-44 lg:pb-32">
        <AuroraBackground />
        <ParticleBackground density={60} />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-xs sm:text-sm font-medium text-emerald-200 tracking-wide">
                À propos de QRTrans
              </span>
            </div>

            <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Un voyageur ne devrait jamais{' '}
              <span className="text-gradient-emerald">perdre son colis</span>
            </h1>

            <p className="reveal-up mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              QRTrans est né d&apos;une conviction simple : la sécurité logistique doit
              être universelle, intelligente et sans friction — pour les transporteurs
              comme pour les voyageurs.
            </p>

            <div className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/devenir-partenaire"
                className="btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                Rejoindre l&apos;aventure
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass text-white font-semibold hover:border-emerald-400/40 transition-all"
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
      <section className="relative py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-up flex items-center justify-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-400/15 border border-emerald-400/30">
              <Target className="w-7 h-7 text-emerald-300" />
            </div>
          </div>
          <SectionHeading
            eyebrow="Notre mission"
            title={
              <>
                Une protection intelligente,{' '}
                <span className="text-gradient-emerald">universelle et sans friction</span>
              </>
            }
            subtitle="Pour tous les colis — que vous soyez pèlerin, voyageur d'affaires ou touriste. Notre objectif est de transformer l'angoisse de la perte en une simple formalité résolue en quelques clics."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUE_CARDS.map((card, idx) => (
              <div
                key={card.title}
                className="reveal-up glass-card p-7 sm:p-8"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 border border-emerald-400/30 flex items-center justify-center mb-5">
                  <card.icon className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
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
      <section className="relative py-24 lg:py-32 bg-mesh">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Nos valeurs"
            title={
              <>
                Ce en quoi nous{' '}
                <span className="text-gradient-emerald">croyons</span>
              </>
            }
            subtitle="Quatre principes qui guident chaque décision produit, chaque ligne de code et chaque interaction client."
          />

          <div className="mt-16 space-y-5">
            {BELIEFS.map((belief, idx) => (
              <div
                key={belief.title}
                className="reveal-up glass-card p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-7 items-start"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-3 sm:w-24 shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <belief.icon className="w-6 h-6 text-[#060B1F]" />
                  </div>
                  <span className="font-display text-3xl font-bold text-emerald-300/40">
                    0{idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-2">
                    {belief.title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">
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
      <section className="relative py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-strong rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="relative">
              <SectionHeading
                eyebrow="Qui sommes-nous ?"
                title={
                  <>
                    QRTrans, une solution{' '}
                    <span className="text-gradient-emerald">MMASOLUTION</span>
                  </>
                }
                align="center"
                className="mb-8"
              />
              <p className="text-white/70 leading-relaxed text-center max-w-2xl mx-auto">
                QRTrans est développé par{' '}
                <strong className="text-emerald-300">MMASOLUTION</strong>, une
                entreprise spécialisée dans les solutions digitales pour le tourisme
                religieux et les voyages internationaux. Notre équipe combine des
                expertises en technologie, logistique et expérience client pour créer
                des solutions qui font la différence.
              </p>

              <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="glass-card p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-0.5">
                      Adresse
                    </p>
                    <p className="text-xs sm:text-sm text-white leading-snug">
                      Cité Alia Diène, Ouest Foire, Yoff, Dakar
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+221784858226"
                  className="glass-card p-5 flex items-center gap-3 hover:border-emerald-400/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-0.5">
                      Téléphone
                    </p>
                    <p className="text-xs sm:text-sm text-white leading-snug">
                      +221 78 485 82 26
                    </p>
                  </div>
                </a>
                <a
                  href="mailto:contact@qrtrans.com"
                  className="glass-card p-5 flex items-center gap-3 hover:border-emerald-400/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-0.5">
                      Email
                    </p>
                    <p className="text-xs sm:text-sm text-white leading-snug truncate">
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
      <section className="relative py-24 lg:py-32 bg-mesh">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="QRTrans en chiffres"
            title={
              <>
                Des chiffres qui{' '}
                <span className="text-gradient-emerald">témoignent</span>
              </>
            }
          />

          <div className="mt-16 relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[2.5rem] opacity-60 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.18), transparent 60%)',
                filter: 'blur(50px)',
              }}
            />
            <div className="relative glass-strong rounded-3xl p-8 sm:p-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                {STATS.map((stat) => (
                  <div key={stat.label} className="reveal-up text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/30 mb-4">
                      <stat.icon className="w-5 h-5 text-emerald-300" />
                    </div>
                    <p className="font-display text-4xl sm:text-5xl font-bold text-gradient-emerald leading-none">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ''} />
                    </p>
                    <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed">
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
      <section className="relative py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-40 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 mb-5">
                <Building2 className="w-7 h-7 text-emerald-300" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                Construisons ensemble la{' '}
                <span className="text-gradient-emerald">logistique de demain</span>
              </h3>
              <p className="text-white/70 mb-8 max-w-xl mx-auto leading-relaxed">
                Que vous soyez transporteur, agence de voyage ou simplement curieux de
                notre approche — parlons-en.
              </p>
              <Link
                href="/contact"
                className="btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
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
