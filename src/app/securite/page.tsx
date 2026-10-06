'use client';

import Link from 'next/link';
import {
  Shield,
  Lock,
  KeyRound,
  FileCheck,
  Server,
  Globe,
  BadgeCheck,
  CheckCircle2,
  PackageCheck,
  Star,
  Building2,
  ArrowRight,
} from 'lucide-react';
import SiteLayout from '@/components/site/SiteLayout';
import AuroraBackground from '@/components/site/AuroraBackground';
import SectionHeading from '@/components/site/SectionHeading';
import AnimatedCounter from '@/components/site/AnimatedCounter';

/* ---------------------------------------------------------------
   Static content
---------------------------------------------------------------- */

type Pillar = {
  icon: typeof Lock;
  title: string;
  description: string;
  bullets: string[];
};

const PILLARS: Pillar[] = [
  {
    icon: Lock,
    title: 'Chiffrement bout-en-bout',
    description:
      'Toutes les données de colis sont chiffrées en transit et au repos. Les codes PIN ne sont jamais stockés en clair.',
    bullets: [
      'Chiffrement AES-256 au repos',
      'TLS 1.3 en transit',
      'PIN jamais persisté en clair',
    ],
  },
  {
    icon: KeyRound,
    title: 'Code PIN à 6 chiffres',
    description:
      'Chaque colis reçoit un PIN unique, envoyé au destinataire par WhatsApp. Aucune remise sans validation du PIN.',
    bullets: [
      'Génération aléatoire cryptographique',
      'Envoi via WhatsApp chiffré',
      'PIN invalidé après remise',
    ],
  },
  {
    icon: FileCheck,
    title: 'Conformité RGPD',
    description:
      'QRTrans respecte intégralement le RGPD et la loi sénégalaise sur la protection des données personnelles.',
    bullets: [
      'Droit à l’effacement garanti',
      'Hébergement Union Européenne',
      'Registre des traitements tenu à jour',
    ],
  },
];

type Cert = {
  icon: typeof Shield;
  label: string;
  sublabel: string;
};

const CERTIFICATIONS: Cert[] = [
  { icon: FileCheck, label: 'RGPD Conforme', sublabel: 'Règlement UE 2016/679' },
  { icon: Server, label: 'Hébergement France', sublabel: 'Datacenter tiers de confiance' },
  { icon: Lock, label: 'SSL 256 bits', sublabel: 'Chiffrement TLS 1.3' },
  { icon: BadgeCheck, label: 'Audit annuel', sublabel: 'Pentest indépendant' },
];

type Stat = {
  value: number;
  suffix?: string;
  label: string;
  icon: typeof PackageCheck;
};

const STATS: Stat[] = [
  { value: 0, label: 'colis perdu avec PIN validé', icon: Shield },
  { value: 98, suffix: '%', label: 'taux de satisfaction client', icon: Star },
  { value: 10000, suffix: '+', label: 'colis protégés', icon: PackageCheck },
  { value: 500, suffix: '+', label: 'agences partenaires', icon: Building2 },
];

/* ---------------------------------------------------------------
   Page
---------------------------------------------------------------- */

export default function SecuritePage() {
  return (
    <SiteLayout hasDarkHero>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative overflow-hidden bg-hero pt-36 pb-24 lg:pt-44 lg:pb-32">
        <AuroraBackground />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span className="text-xs sm:text-sm font-medium text-emerald-200 tracking-wide">
                Sécurité & Protection
              </span>
            </div>

            <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Votre colis, protégé{' '}
              <span className="text-gradient-emerald">à chaque étape</span>
            </h1>

            <p className="reveal-up mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              QRTrans applique un système de sécurité multi-couches : chiffrement
              bout-en-bout, code PIN anti-fraude et conformité RGPD totale. Zéro colis
              perdu depuis notre lancement.
            </p>

            <div className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                Demander un audit
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/fonctionnalites"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass text-white font-semibold hover:border-emerald-400/40 transition-all"
              >
                Voir les fonctionnalités
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. THREE PILLARS
         ===================================================== */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Piliers de sécurité"
            title={
              <>
                3 piliers pour{' '}
                <span className="text-gradient-emerald">zéro colis perdu</span>
              </>
            }
            subtitle="Chaque colis est protégé par un dispositif de sécurité multi-couches qui intervient à chaque étape du transport inter-villes."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((pillar, idx) => (
              <div
                key={pillar.title}
                className="reveal-up gradient-border rounded-3xl p-7 sm:p-8 relative overflow-hidden"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-50 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(16,185,129,0.25), transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 border border-emerald-400/30 flex items-center justify-center mb-5">
                    <pillar.icon className="w-6 h-6 text-emerald-300" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-5">
                    {pillar.description}
                  </p>
                  <ul className="space-y-2.5">
                    {pillar.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          3. CERTIFICATIONS
         ===================================================== */}
      <section className="relative py-24 lg:py-32 bg-mesh">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Certifications"
            title={
              <>
                Conforme aux normes{' '}
                <span className="text-gradient-emerald">les plus strictes</span>
              </>
            }
            subtitle="QRTrans respecte intégralement les standards européens et internationaux en matière de protection des données et de sécurité applicative."
          />

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {CERTIFICATIONS.map((cert, idx) => (
              <div
                key={cert.label}
                className="reveal-up glass-card p-6 flex flex-col items-center text-center"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 border border-emerald-400/30 flex items-center justify-center mb-4">
                  <cert.icon className="w-7 h-7 text-emerald-300" />
                </div>
                <p className="font-display text-base font-bold text-white leading-snug">
                  {cert.label}
                </p>
                <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                  {cert.sublabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          4. STATS PANEL
         ===================================================== */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="La confiance en chiffres"
            title={
              <>
                Des résultats{' '}
                <span className="text-gradient-emerald">qui parlent d&apos;eux-mêmes</span>
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
                  <div
                    key={stat.label}
                    className="reveal-up text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/30 mb-4">
                      <stat.icon className="w-5 h-5 text-emerald-300" />
                    </div>
                    <p className="font-display text-4xl sm:text-5xl font-bold text-gradient-emerald leading-none">
                      <AnimatedCounter
                        value={stat.value}
                        suffix={stat.suffix ?? ''}
                      />
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
          5. CTA
         ===================================================== */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 mb-5">
                <Globe className="w-7 h-7 text-emerald-300" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                Une question sur notre{' '}
                <span className="text-gradient-emerald">politique de sécurité</span> ?
              </h3>
              <p className="text-white/70 mb-8 max-w-xl mx-auto leading-relaxed">
                Notre équipe est disponible pour répondre à toute demande technique,
                audit de conformité ou question RGPD.
              </p>
              <Link
                href="/contact"
                className="btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                Contacter l&apos;équipe sécurité
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
