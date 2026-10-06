'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  MessageCircle,
  Lock,
  MapPin,
  LayoutDashboard,
  WifiOff,
  ArrowRight,
  ScanLine,
  Bell,
  ShieldCheck,
  PackageCheck,
  Star,
  Quote,
  CheckCircle2,
  Clock,
  TrendingUp,
  Smartphone,
} from 'lucide-react';
import SiteLayout from '@/components/site/SiteLayout';
import ParticleBackground from '@/components/site/ParticleBackground';
import AuroraBackground from '@/components/site/AuroraBackground';
import AnimatedCounter from '@/components/site/AnimatedCounter';
import TiltCard from '@/components/site/TiltCard';

/* ---------------------------------------------------------------
   Static content
---------------------------------------------------------------- */

const TRUST_BADGES = [
  { icon: CheckCircle2, label: '500+ agences' },
  { icon: PackageCheck, label: '10 000+ colis sécurisés' },
  { icon: Star, label: '98% satisfaction' },
  { icon: Clock, label: '24/7 support' },
] as const;

const AGENCIES = ['Wari', 'Cash Express', 'Dakar Dem Dikk', 'Téra Voyages', 'Senbus'];

const STATS = [
  { value: 10000, suffix: '+', label: 'Colis sécurisés', icon: PackageCheck },
  { value: 500, suffix: '+', label: 'Agences partenaires', icon: TrendingUp },
  { value: 98, suffix: '%', label: 'Taux de satisfaction', icon: Star },
  { value: 24, suffix: '/7', label: 'Support client', icon: Clock },
] as const;

type Service = {
  icon: typeof QrCode;
  title: string;
  description: string;
  span: string;
  accent: string;
};

const SERVICES: Service[] = [
  {
    icon: QrCode,
    title: 'Activation par QR code en 30 secondes',
    description:
      "Scannez le QR code d'un colis, renseignez expéditeur et destinataire, c'est prêt à suivre. Plus besoin de paperasse, tout est numérique et instantané.",
    span: 'md:col-span-2 lg:col-span-2',
    accent: 'from-[#1E4B7A]/15 via-[#487AA8]/5 to-transparent',
  },
  {
    icon: MessageCircle,
    title: 'Notifications WhatsApp automatiques',
    description:
      'Le destinataire reçoit chaque étape du trajet directement sur WhatsApp, sans installer aucune application.',
    span: '',
    accent: 'from-[#6BA3D6]/20 via-[#6BA3D6]/5 to-transparent',
  },
  {
    icon: Lock,
    title: 'Code PIN de retrait sécurisé',
    description:
      "Aucune remise sans code PIN à 6 chiffres. La sécurité garantie jusqu'au destinataire final.",
    span: '',
    accent: 'from-[#10B981]/15 via-[#10B981]/5 to-transparent',
  },
  {
    icon: MapPin,
    title: 'Suivi GPS temps réel',
    description:
      'Suivez chaque colis en direct sur une carte, avec horodatage et historique complet du trajet, du dépôt à la livraison.',
    span: 'md:col-span-2 lg:col-span-2',
    accent: 'from-[#1E4B7A]/15 via-[#487AA8]/5 to-transparent',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard agence',
    description:
      'Pilotez votre flotte, vos chauffeurs et vos colis depuis une interface unique, claire et multilingue.',
    span: '',
    accent: 'from-[#487AA8]/20 via-[#487AA8]/5 to-transparent',
  },
  {
    icon: WifiOff,
    title: 'Mode hors-ligne',
    description:
      "Continuez à activer et tracer même sans réseau. Les données se synchronisent automatiquement au retour de la connexion.",
    span: 'lg:col-span-2',
    accent: 'from-[#6BA3D6]/20 via-[#6BA3D6]/5 to-transparent',
  },
];

type Step = {
  icon: typeof ScanLine;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    icon: ScanLine,
    title: 'Scan du QR code',
    description: 'Le chauffeur scanne le QR code du colis avec son smartphone, depuis l\'application QRTrans.',
  },
  {
    icon: Smartphone,
    title: 'Saisie des infos voyage',
    description: "Renseignez expéditeur, destinataire et trajet en moins d'une minute grâce au formulaire guidé.",
  },
  {
    icon: Bell,
    title: 'Notifications automatiques',
    description: "Le destinataire reçoit chaque étape du trajet sur WhatsApp, en temps réel, sans aucune action de votre part.",
  },
  {
    icon: ShieldCheck,
    title: 'Récupération par code PIN',
    description: "Remise du colis uniquement après vérification du code PIN secret envoyé au destinataire.",
  },
];

const DIFFERENTIATORS = [
  'Conçu pour les transporteurs africains, pas pour des logistiques européennes.',
  "Notifications WhatsApp via wa.me — aucun compte requis côté destinataire.",
  'Mode hors-ligne pensé pour les zones à faible connectivité.',
  'Code PIN à 6 chiffres vérifié à la remise — zéro colis livré par erreur.',
  'Dashboard agence multilingue (FR, EN, AR) avec export comptable CSV.',
  'Support client humain 24/7 basé à Dakar, pas un chatbot.',
];

type Testimonial = {
  name: string;
  agency: string;
  quote: string;
  initials: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Awa Ndiaye',
    agency: 'Wari Transit',
    quote:
      "Depuis QRTrans, nous n'avons plus aucune réclamation de colis perdu. Le code PIN a transformé notre relation client.",
    initials: 'AN',
  },
  {
    name: 'Mamadou Sow',
    agency: 'Dakar Dem Dikk Cargo',
    quote:
      "Le dashboard agence nous fait gagner 2 heures par jour. Nos chauffeurs adorent le mode hors-ligne sur les longues routes.",
    initials: 'MS',
  },
  {
    name: 'Fatou Diallo',
    agency: 'Senbus Voyages',
    quote:
      "Les notifications WhatsApp ont réduit nos appels de suivi de 80%. Nos clients adorent être informés en temps réel.",
    initials: 'FD',
  },
];

type Article = {
  category: string;
  title: string;
  excerpt: string;
};

const ARTICLES: Article[] = [
  {
    category: 'Sécurité',
    title: 'Sécuriser vos colis : 5 bonnes pratiques pour le transport inter-villes',
    excerpt:
      'Découvrez comment les codes QR et la traçabilité numérique réduisent les pertes et les litiges lors du transport de marchandises entre villes au Sénégal.',
  },
  {
    category: 'Productivité',
    title: 'Optimiser vos tournées de livraison avec la technologie',
    excerpt:
      "La bonne gestion des itinéraires et le suivi en temps réel permettent aux chauffeurs et agences de gagner du temps et d'améliorer leur rentabilité.",
  },
  {
    category: 'Conformité',
    title: 'Réglementation du transport de marchandises au Sénégal',
    excerpt:
      'Un guide complet sur les obligations légales, les documents requis et les normes à respecter pour le transport inter-villes de marchandises.',
  },
];

/* ---------------------------------------------------------------
   Inline section heading (light-themed)
---------------------------------------------------------------- */

function SectionHeading({
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
  const alignClasses = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`${alignClasses} max-w-3xl ${className}`}>
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

export default function HomePage() {
  const router = useRouter();
  const [refValue, setRefValue] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = refValue.trim().toUpperCase();
    if (v) {
      router.push('/activate/' + v);
    }
  };

  // Auto-rotate testimonials every 5s
  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <SiteLayout theme="light" hasDarkHero>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-light-hero">
        <AuroraBackground theme="light" />
        <ParticleBackground density={90} theme="light" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-24 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left: copy + tracking input */}
            <div className="lg:col-span-7">
              {/* Eyebrow */}
              <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass-light">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#1E4B7A] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E4B7A]" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#1E4B7A] tracking-wide">
                  Plateforme de traçabilité n°1 au Sénégal
                </span>
              </div>

              {/* H1 */}
              <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#0F1B2E] tracking-tight leading-[1.05]">
                <span className="text-gradient-blue">Sécurisez</span> chaque colis, de l&rsquo;envoi à la livraison.
              </h1>

              {/* Subtitle */}
              <p className="reveal-up mt-6 text-lg sm:text-xl text-[#5B7088] max-w-xl leading-relaxed">
                Activez, tracez et livrez vos colis par QR code. Notifications WhatsApp automatiques, code PIN de
                retrait et suivi GPS temps réel — pensé pour les transporteurs africains.
              </p>

              {/* Tracking input */}
              <form onSubmit={handleSubmit} className="reveal-up mt-10 max-w-xl">
                <label
                  htmlFor="track-ref"
                  className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#5B7088] mb-3"
                >
                  Suivre un colis
                </label>
                <div className="glass-light-strong rounded-2xl p-2 flex flex-col sm:flex-row gap-2 transition-all focus-within:border-[#1E4B7A]/60 border border-[#1E4B7A]/15">
                  <div className="relative flex-1">
                    <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E4B7A]/80 pointer-events-none" />
                    <input
                      id="track-ref"
                      type="text"
                      value={refValue}
                      onChange={(e) => setRefValue(e.target.value)}
                      placeholder="Ex : VOL26-WRQZNE"
                      className="w-full pl-12 pr-4 py-4 bg-transparent text-[#0F1B2E] placeholder:text-[#5B7088]/60 text-base font-medium focus:outline-none"
                      maxLength={20}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-brand shimmer inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base transition-all"
                  >
                    Suivre mon colis
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-3 text-xs text-[#5B7088]">
                  Saisissez la référence à 8&ndash;12 caractères imprimée sur votre étiquette QRTrans.
                </p>
              </form>

              {/* Trust badges */}
              <div className="reveal-up mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                {TRUST_BADGES.map((b) => (
                  <div key={b.label} className="flex items-center gap-2 text-sm text-[#0F1B2E]">
                    <b.icon className="w-4 h-4 text-[#1E4B7A]" />
                    <span className="font-medium">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating glass receipt card */}
            <div className="lg:col-span-5 relative">
              <div className="reveal-scale animate-float-slow relative mx-auto max-w-sm">
                {/* Glow */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-4 rounded-3xl opacity-60"
                  style={{
                    background: 'radial-gradient(circle at 50% 30%, rgba(30,75,122,0.30), transparent 60%)',
                    filter: 'blur(40px)',
                  }}
                />
                {/* Card */}
                <div className="relative glass-light-strong rounded-3xl p-7 sm:p-8 shadow-2xl border border-[#1E4B7A]/15">
                  {/* Receipt header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#1E4B7A]/80 font-semibold">
                        Reçu de suivi
                      </p>
                      <p className="font-display text-2xl font-bold text-[#0F1B2E] mt-1">VOL26-WRQZNE</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] flex items-center justify-center shadow-lg shadow-[#1E4B7A]/30 animate-spin-slow">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E4B7A]/10 border border-[#1E4B7A]/30 mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#1E4B7A] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E4B7A]" />
                    </span>
                    <span className="text-xs font-semibold text-[#1E4B7A]">En transit</span>
                  </div>

                  {/* Cities */}
                  <div className="space-y-1 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#1E4B7A]/50 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-[#5B7088] uppercase tracking-wider">Départ</p>
                        <p className="text-[#0F1B2E] font-semibold">Dakar</p>
                        <p className="text-xs text-[#5B7088] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 07:42 — 14 oct.
                        </p>
                      </div>
                    </div>
                    <div className="ml-[3px] h-6 w-px bg-gradient-to-b from-[#1E4B7A]/60 to-[#1E4B7A]/20" />
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#1E4B7A] mt-2 flex-shrink-0 pulse-glow" />
                      <div>
                        <p className="text-[10px] text-[#1E4B7A]/70 uppercase tracking-wider">Arrivée estimée</p>
                        <p className="text-[#0F1B2E] font-semibold">Touba</p>
                        <p className="text-xs text-[#5B7088] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 13:15 — 14 oct.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-5 border-t border-[#1E4B7A]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#5B7088]">
                      <Lock className="w-3.5 h-3.5 text-[#1E4B7A]" />
                      <span>Protégé par code PIN</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#1E4B7A]">
                      <PackageCheck className="w-4 h-4" />
                      <span className="text-xs font-medium">Sécurisé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F4F7FB] to-transparent pointer-events-none" />
      </section>

      {/* =====================================================
          2. TRUST STRIP — logos
         ===================================================== */}
      <section className="relative py-14 lg:py-16 border-y border-[#1E4B7A]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm uppercase tracking-[0.3em] text-[#5B7088] mb-8 reveal-up">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-12 lg:gap-x-16">
            {AGENCIES.map((a) => (
              <span
                key={a}
                className="reveal-up font-display text-lg sm:text-xl lg:text-2xl font-semibold text-[#1E4B7A]/40 hover:text-[#1E4B7A] transition-colors duration-300 cursor-default"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          3. STATS
         ===================================================== */}
      <section className="relative py-24 lg:py-32 overflow-hidden section-light">
        <div className="absolute inset-0 bg-light-mesh opacity-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Impact mesurable"
            title={
              <>
                Des chiffres qui parlent <span className="text-gradient-blue">d&rsquo;eux-mêmes</span>
              </>
            }
            subtitle="QRTrans accompagne chaque jour des dizaines de milliers de colis à travers le Sénégal et l&rsquo;Afrique de l&rsquo;Ouest."
          />

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="reveal-up glass-card-light p-6 lg:p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 mb-5">
                  <s.icon className="w-6 h-6 text-[#1E4B7A]" />
                </div>
                <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-gradient-blue">
                    <AnimatedCounter value={s.value} suffix={s.suffix} duration={2000} />
                  </span>
                </div>
                <p className="mt-3 text-sm sm:text-base text-[#5B7088] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          4. SERVICES BENTO GRID
         ===================================================== */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Fonctionnalités"
            title={
              <>
                Une suite complète, <span className="text-gradient-blue">pensée pour le terrain</span>
              </>
            }
            subtitle="Du scan du QR code à la livraison par code PIN, QRTrans couvre toute la chaîne de traçabilité."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {SERVICES.map((s) => (
              <TiltCard key={s.title} glow className={`relative overflow-hidden ${s.span}`}>
                {/* Hover gradient hint */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-0 transition-opacity duration-500 pointer-events-none group-hover:opacity-100`}
                />
                <div className="relative">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E4B7A]/15 to-[#487AA8]/5 border border-[#1E4B7A]/25 flex items-center justify-center mb-5">
                    <s.icon className="w-6 h-6 text-[#1E4B7A]" />
                  </div>
                  {/* Title */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#0F1B2E] mb-2 leading-snug">
                    {s.title}
                  </h3>
                  {/* Description */}
                  <p className="text-sm text-[#5B7088] leading-relaxed">{s.description}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          5. PROCESS TIMELINE
         ===================================================== */}
      <section className="relative py-24 lg:py-32 overflow-hidden section-light">
        <AuroraBackground theme="light" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Comment ça marche"
            title={
              <>
                Quatre étapes, <span className="text-gradient-blue">zéro friction</span>
              </>
            }
            subtitle="Du scan à la livraison sécurisée, le parcours le plus simple du marché."
          />

          <div className="mt-20 relative">
            {/* Horizontal connecting line — desktop */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-7 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#1E4B7A]/60 to-transparent"
            />
            {/* Vertical connecting line — mobile */}
            <div
              aria-hidden="true"
              className="lg:hidden absolute top-6 bottom-6 left-6 w-px bg-gradient-to-b from-[#1E4B7A]/60 via-[#1E4B7A]/30 to-transparent"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6">
              {STEPS.map((step, idx) => (
                <div
                  key={step.title}
                  className="reveal-up relative flex lg:flex-col items-start lg:items-center gap-4 lg:gap-0 lg:text-center pl-16 lg:pl-0"
                >
                  {/* Step circle */}
                  <div className="absolute lg:relative left-0 lg:left-auto lg:mb-6 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] text-white font-bold shadow-lg shadow-[#1E4B7A]/30 z-10">
                    <step.icon className="w-6 h-6" />
                  </div>
                  {/* Step number */}
                  <div className="lg:mb-3">
                    <span className="font-display text-xs uppercase tracking-[0.3em] text-[#1E4B7A]/80 font-semibold">
                      Étape {idx + 1}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="lg:px-2">
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#0F1B2E] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#5B7088] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          6. WHY QRTRANS
         ===================================================== */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: checklist */}
            <div>
              <SectionHeading
                align="left"
                eyebrow="Pourquoi QRTrans"
                title={
                  <>
                    Construit pour <span className="text-gradient-blue">l&rsquo;Afrique</span>, pas pour l&rsquo;Europe.
                  </>
                }
                subtitle="Une plateforme pensée pour les réalités du transport inter-villes africain : réseau intermittent, multiplicité des acteurs, importance du WhatsApp."
              />
              <ul className="mt-10 space-y-4">
                {DIFFERENTIATORS.map((d) => (
                  <li key={d} className="reveal-up flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#1E4B7A]/10 border border-[#1E4B7A]/30 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#1E4B7A]" />
                    </div>
                    <p className="text-base text-[#0F1B2E] leading-relaxed">{d}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: stat panel */}
            <div className="reveal-scale relative">
              {/* Glow */}
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-3xl opacity-50"
                style={{
                  background: 'radial-gradient(circle at 70% 30%, rgba(30,75,122,0.30), transparent 60%)',
                  filter: 'blur(60px)',
                }}
              />
              <div className="relative glass-light-strong rounded-3xl p-8 lg:p-10 border border-[#1E4B7A]/15">
                {/* Top stat */}
                <div className="text-center pb-8 border-b border-[#1E4B7A]/10">
                  <div className="font-display text-6xl lg:text-7xl font-bold tracking-tight">
                    <span className="text-gradient-blue">
                      <AnimatedCounter value={0} duration={1200} />
                    </span>
                  </div>
                  <p className="mt-3 text-lg text-[#0F1B2E] font-semibold">colis perdu</p>
                  <p className="mt-1 text-sm text-[#5B7088]">depuis le lancement en 2024</p>
                </div>

                {/* Two stats below */}
                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="text-center">
                    <div className="font-display text-4xl font-bold text-[#0F1B2E]">
                      <AnimatedCounter value={98} suffix="%" duration={1800} />
                    </div>
                    <p className="mt-2 text-xs text-[#5B7088] uppercase tracking-wider">Satisfaction client</p>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-4xl font-bold text-[#0F1B2E]">
                      <AnimatedCounter value={30} suffix="s" duration={1500} />
                    </div>
                    <p className="mt-2 text-xs text-[#5B7088] uppercase tracking-wider">Temps d&rsquo;activation</p>
                  </div>
                </div>

                {/* Bottom strip */}
                <div className="mt-8 pt-8 border-t border-[#1E4B7A]/10 flex items-center justify-center gap-2 text-sm text-[#1E4B7A]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-medium">Garantie zéro colis perdu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          7. TESTIMONIALS CAROUSEL
         ===================================================== */}
      <section className="relative py-24 lg:py-32 overflow-hidden section-light">
        <div className="absolute inset-0 bg-light-mesh opacity-50 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Témoignages"
            title={
              <>
                Ce que disent <span className="text-gradient-blue">nos agences partenaires</span>
              </>
            }
            subtitle="Plus de 500 agences font confiance à QRTrans chaque jour."
          />

          <div className="mt-16 relative">
            {/* Quote mark */}
            <Quote className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 text-[#1E4B7A]/25" />

            {/* Carousel card */}
            <div className="reveal-scale glass-card-light p-8 sm:p-12 lg:p-16 text-center min-h-[320px] flex flex-col justify-center relative">
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={t.name}
                  className={`transition-all duration-700 ${
                    idx === activeTestimonial
                      ? 'opacity-100 translate-y-0 relative'
                      : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                  }`}
                >
                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#1E4B7A] text-[#1E4B7A]" />
                    ))}
                  </div>

                  <p className="font-display text-xl sm:text-2xl lg:text-3xl text-[#0F1B2E] leading-relaxed font-medium max-w-3xl mx-auto">
                    « {t.quote} »
                  </p>

                  <div className="mt-8 flex items-center justify-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] flex items-center justify-center text-white font-bold shadow-lg"
                    >
                      {t.initials}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#0F1B2E]">{t.name}</p>
                      <p className="text-sm text-[#1E4B7A]">{t.agency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTestimonial(idx)}
                  aria-label={`Témoignage ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeTestimonial ? 'w-8 bg-[#1E4B7A]' : 'w-2 bg-[#1E4B7A]/20 hover:bg-[#1E4B7A]/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          8. BLOG PREVIEW
         ===================================================== */}
      <section className="relative py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Blog & Ressources"
            title={
              <>
                Conseils, normes et <span className="text-gradient-blue">bonnes pratiques</span>
              </>
            }
            subtitle="Tout ce qu&rsquo;il faut savoir pour sécuriser et optimiser votre activité de transport."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {ARTICLES.map((article) => (
              <article
                key={article.title}
                className="reveal-up group glass-card-light p-7 lg:p-8 flex flex-col"
              >
                {/* Category badge */}
                <span className="self-start inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 text-[#1E4B7A] mb-5">
                  {article.category}
                </span>

                {/* Title */}
                <h3 className="font-display text-lg lg:text-xl font-bold text-[#0F1B2E] mb-3 leading-snug group-hover:text-[#1E4B7A] transition-colors">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-[#5B7088] leading-relaxed mb-6 flex-1">{article.excerpt}</p>

                {/* Link */}
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E4B7A] group-hover:gap-3 transition-all link-underline w-fit"
                >
                  Lire la suite
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>

          {/* See all */}
          <div className="mt-12 text-center reveal-up">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1E4B7A]/20 hover:border-[#1E4B7A]/40 hover:bg-[#1E4B7A]/5 text-[#1E4B7A] font-semibold text-sm transition-all"
            >
              Voir tous les articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
