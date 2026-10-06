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
  /** Special accent — emerald reserved for the "0 colis perdu" positive security stat. */
  emeraldAccent?: boolean;
};

const STATS: Stat[] = [
  { value: 0, label: 'colis perdu avec PIN validé', icon: Shield, emeraldAccent: true },
  { value: 98, suffix: '%', label: 'taux de satisfaction client', icon: Star },
  { value: 10000, suffix: '+', label: 'colis protégés', icon: PackageCheck },
  { value: 500, suffix: '+', label: 'agences partenaires', icon: Building2 },
];

/* ---------------------------------------------------------------
   Inline section heading (light-themed)
---------------------------------------------------------------- */
function SectionHeadingLight({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
}) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`${alignClass} max-w-3xl`}>
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

export default function SecuritePage() {
  return (
    <SiteLayout theme="light" hasDarkHero>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative overflow-hidden bg-light-hero pt-36 pb-24 lg:pt-44 lg:pb-32">
        <AuroraBackground theme="light" />
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass-light">
              <Shield className="w-4 h-4 text-[#1E4B7A]" />
              <span className="text-xs sm:text-sm font-medium text-[#1E4B7A] tracking-wide">
                Sécurité & Protection
              </span>
            </div>

            <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#0F1B2E]">
              Votre colis, protégé{' '}
              <span className="text-gradient-blue">à chaque étape</span>
            </h1>

            <p className="reveal-up mt-6 text-lg sm:text-xl text-[#5B7088] max-w-2xl mx-auto leading-relaxed">
              QRTrans applique un système de sécurité multi-couches : chiffrement
              bout-en-bout, code PIN anti-fraude et conformité RGPD totale. Zéro colis
              perdu depuis notre lancement.
            </p>

            <div className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="btn-brand btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all"
              >
                Demander un audit
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/fonctionnalites"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass-light text-[#0F1B2E] font-semibold hover:border-[#1E4B7A]/40 transition-all"
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
      <section className="relative py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeadingLight
            eyebrow="Piliers de sécurité"
            title={
              <>
                3 piliers pour{' '}
                <span className="text-gradient-blue">zéro colis perdu</span>
              </>
            }
            subtitle="Chaque colis est protégé par un dispositif de sécurité multi-couches qui intervient à chaque étape du transport inter-villes."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((pillar, idx) => (
              <div
                key={pillar.title}
                className="reveal-up gradient-border-light rounded-3xl p-7 sm:p-8 relative overflow-hidden"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-50 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(30, 75, 122, 0.18), transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E4B7A]/15 to-[#487AA8]/5 border border-[#1E4B7A]/25 flex items-center justify-center mb-5">
                    <pillar.icon className="w-6 h-6 text-[#1E4B7A]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#0F1B2E] mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#5B7088] leading-relaxed mb-5">
                    {pillar.description}
                  </p>
                  <ul className="space-y-2.5">
                    {pillar.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-[#1E4B7A]">
                        <CheckCircle2 className="w-4 h-4 text-[#1E4B7A] flex-shrink-0 mt-0.5" />
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
      <section className="relative py-24 lg:py-32 bg-light-mesh">
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeadingLight
            eyebrow="Certifications"
            title={
              <>
                Conforme aux normes{' '}
                <span className="text-gradient-blue">les plus strictes</span>
              </>
            }
            subtitle="QRTrans respecte intégralement les standards européens et internationaux en matière de protection des données et de sécurité applicative."
          />

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {CERTIFICATIONS.map((cert, idx) => (
              <div
                key={cert.label}
                className="reveal-up glass-card-light p-6 flex flex-col items-center text-center"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E4B7A]/15 to-[#487AA8]/5 border border-[#1E4B7A]/25 flex items-center justify-center mb-4">
                  <cert.icon className="w-7 h-7 text-[#1E4B7A]" />
                </div>
                <p className="font-display text-base font-bold text-[#0F1B2E] leading-snug">
                  {cert.label}
                </p>
                <p className="text-xs text-[#5B7088] mt-1.5 leading-relaxed">
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
      <section className="relative py-24 lg:py-32 section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeadingLight
            eyebrow="La confiance en chiffres"
            title={
              <>
                Des résultats{' '}
                <span className="text-gradient-blue">qui parlent d&apos;eux-mêmes</span>
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
                  <div
                    key={stat.label}
                    className="reveal-up text-center"
                  >
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border mb-4 ${
                        stat.emeraldAccent
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-[#1E4B7A]/10 border-[#1E4B7A]/25'
                      }`}
                    >
                      <stat.icon
                        className={`w-5 h-5 ${
                          stat.emeraldAccent ? 'text-emerald-600' : 'text-[#1E4B7A]'
                        }`}
                      />
                    </div>
                    <p
                      className={`font-display text-4xl sm:text-5xl font-bold leading-none ${
                        stat.emeraldAccent ? 'text-emerald-600' : 'text-gradient-blue'
                      }`}
                    >
                      <AnimatedCounter
                        value={stat.value}
                        suffix={stat.suffix ?? ''}
                      />
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
          5. CTA
         ===================================================== */}
      <section className="relative py-16 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-light-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-50 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(30, 75, 122, 0.20), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 mb-5">
                <Globe className="w-7 h-7 text-[#1E4B7A]" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0F1B2E] mb-4 leading-tight">
                Une question sur notre{' '}
                <span className="text-gradient-blue">politique de sécurité</span> ?
              </h3>
              <p className="text-[#5B7088] mb-8 max-w-xl mx-auto leading-relaxed">
                Notre équipe est disponible pour répondre à toute demande technique,
                audit de conformité ou question RGPD.
              </p>
              <Link
                href="/contact"
                className="btn-brand btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all"
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
