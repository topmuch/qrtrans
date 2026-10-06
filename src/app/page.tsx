'use client';

/* ═══════════════════════════════════════════════════════════════════
   QRTrans — Home Page  ·  Editorial Premium Design
   "Apple-meets-Linear" editorial narrative with asymmetric layouts,
   sticky scroll sections, ghost section numbers, marquee ticker,
   faux-app delivery card mockup, full-bleed dark stats band, and
   horizontal testimonials scroller.
   ═══════════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  QrCode,
  MessageCircle,
  Lock,
  MapPin,
  LayoutDashboard,
  WifiOff,
  ScanLine,
  Bell,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  ArrowUpRight,
  Star,
  Quote,
  Plane,
  Clock,
  CheckCircle2,
  Smartphone,
  Globe,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SiteLayout from '@/components/site/SiteLayout';
import AuroraBackground from '@/components/site/AuroraBackground';
import AnimatedCounter from '@/components/site/AnimatedCounter';

/* ─── Static content ──────────────────────────────────────────── */

const MARQUEE_ITEMS = [
  'Activation en 30s',
  'Notifications WhatsApp',
  'Code PIN sécurisé',
  'Suivi temps réel',
  'Mode hors-ligne',
  'Multi-langues FR/EN/AR',
  'Dashboard agence',
  'API ouverte',
];

const WHY_CARDS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: QrCode,
    title: 'QR code unique par colis',
    desc: "Chaque colis reçoit un QR code généré automatiquement, impossible à dupliquer ou à réutiliser.",
  },
  {
    icon: Lock,
    title: 'Code PIN à 6 chiffres',
    desc: "Le destinataire reçoit un code PIN confidentiel, requis pour récupérer son colis à l'arrivée.",
  },
  {
    icon: MessageCircle,
    title: 'Notifications WhatsApp automatiques',
    desc: "Le destinataire est prévenu à chaque étape via WhatsApp, sans application tierce à installer.",
  },
  {
    icon: MapPin,
    title: 'Suivi GPS en temps réel',
    desc: "La position du colis est actualisée à chaque scan intermédiaire, du départ jusqu'à l'arrivée.",
  },
];

const STEPS: { num: string; icon: LucideIcon; title: string; desc: string; gradient: string }[] = [
  {
    num: '01',
    icon: ScanLine,
    title: 'Scan du QR',
    desc: "L'agent scanne le QR code du colis pour démarrer l'activation en moins de 30 secondes.",
    gradient: 'from-[#0D9488] to-[#10B981]',
  },
  {
    num: '02',
    icon: Smartphone,
    title: 'Saisie des infos',
    desc: 'Expéditeur, destinataire, téléphone, itinéraire : le formulaire est guidé et pré-rempli.',
    gradient: 'from-[#1E4B7A] to-[#3B82F6]',
  },
  {
    num: '03',
    icon: Bell,
    title: 'Notifications auto',
    desc: "Le destinataire reçoit un message WhatsApp avec son code PIN à chaque étape du trajet.",
    gradient: 'from-[#F97316] to-[#FBBF24]',
  },
  {
    num: '04',
    icon: ShieldCheck,
    title: 'Récupération par PIN',
    desc: "Le destinataire présente son code PIN à l'arrivée : le colis est remis en toute sécurité.",
    gradient: 'from-[#6D28D9] to-[#A78BFA]',
  },
];

const BENTO_CARDS: {
  icon: LucideIcon;
  title: string;
  desc: string;
  featured?: boolean;
}[] = [
  {
    icon: QrCode,
    title: 'Activation par QR code',
    desc: "Un scan, et le colis est actif. Plus besoin de papier, de registre ou de formulaire manuel. L'agent devient opérateur en 30 secondes, et chaque colis est immédiatement traçable du départ à l'arrivée.",
    featured: true,
  },
  {
    icon: MessageCircle,
    title: 'Notifications WhatsApp',
    desc: 'Alertes automatiques via wa.me à chaque étape du trajet.',
  },
  {
    icon: Lock,
    title: 'Code PIN de retrait',
    desc: 'Sécurité de bout en bout, sans remise par erreur.',
  },
  {
    icon: MapPin,
    title: 'Suivi GPS temps réel',
    desc: 'Position actualisée à chaque scan intermédiaire.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard agence',
    desc: "Vue d'ensemble de la flotte, des colis et des statistiques.",
  },
  {
    icon: WifiOff,
    title: 'Mode hors-ligne',
    desc: 'Continuez à travailler sans réseau, synchro auto au retour.',
  },
];

const BIG_STATS: {
  value: number;
  suffix: string;
  label: string;
  animated: boolean;
}[] = [
  { value: 10000, suffix: '+', label: 'Colis sécurisés', animated: true },
  { value: 500, suffix: '+', label: 'Agences partenaires', animated: true },
  { value: 98, suffix: '%', label: 'Taux de livraison', animated: true },
  { value: 4.9, suffix: '/5', label: 'Satisfaction client', animated: false },
];

const TESTIMONIALS: {
  quote: string;
  name: string;
  agency: string;
  role: string;
  avatar: string;
}[] = [
  {
    quote:
      "Depuis QRTrans, nous n'avons plus aucune contestation de livraison. Le code PIN a réglé 100% de nos litiges clients.",
    name: 'Awa Diop',
    agency: 'Wari Dakar',
    role: 'Responsable agence',
    avatar: '/images/testimonial-awa.jpg',
  },
  {
    quote:
      "Les notifications WhatsApp ont transformé notre relation client. Les destinataires adorent savoir où est leur colis, à la minute près.",
    name: 'Mamadou Sow',
    agency: 'Cash Express',
    role: 'Directeur logistique',
    avatar: '/images/testimonial-mamadou.jpg',
  },
  {
    quote:
      "Le mode hors-ligne est un vrai game-changer pour nos tournées en zone rurale. La synchronisation au retour est parfaite.",
    name: 'Fatou Ndiaye',
    agency: 'Senbus Voyages',
    role: 'Cheffe de gare',
    avatar: '/images/testimonial-fatou.jpg',
  },
  {
    quote:
      "Activation en 30 secondes, ce n'est pas une promesse marketing, c'est la réalité. Notre productivité a doublé.",
    name: 'Cheikh Fall',
    agency: 'Téra Voyages',
    role: 'Gérant',
    avatar: '/images/testimonial-cheikh.jpg',
  },
];

/* ═══════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const router = useRouter();
  const [refValue, setRefValue] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const v = refValue.trim();
    if (!v) return;
    router.push('/activate/' + v.toUpperCase());
  };

  return (
    <SiteLayout theme="light" hasDarkHero>
      {/* ─── Inline keyframes (globals.css stays untouched) ─── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              animation: marquee-scroll 40s linear infinite;
              will-change: transform;
            }
            .marquee-pause:hover .marquee-track {
              animation-play-state: paused;
            }
            @keyframes plane-travel {
              0%   { left: 0%; }
              100% { left: calc(100% - 1.75rem); }
            }
            .plane-travel {
              animation: plane-travel 4.5s ease-in-out infinite alternate;
            }
            @keyframes dash-flow {
              to { stroke-dashoffset: -20; }
            }
            .dash-flow {
              stroke-dasharray: 6 4;
              animation: dash-flow 1.4s linear infinite;
            }
            @keyframes pulse-soft {
              0%, 100% { opacity: 1; }
              50%      { opacity: 0.35; }
            }
            .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
            @media (prefers-reduced-motion: reduce) {
              .marquee-track,
              .plane-travel,
              .dash-flow,
              .pulse-soft { animation: none !important; }
            }
          `,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — Editorial Hero (asymmetric 7/5)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-light-hero overflow-hidden">
        {/* subtle grid background */}
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-60 pointer-events-none" />
        {/* aurora glow top-right */}
        <div className="absolute -top-40 -right-32 w-[40rem] h-[40rem] pointer-events-none">
          <AuroraBackground theme="light" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-44 pb-20 lg:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* LEFT — 60% (col-span-7) */}
            <div className="lg:col-span-7">
              {/* eyebrow pill */}
              <div className="reveal-up inline-flex items-center gap-2.5 rounded-full border border-[#1E4B7A]/15 bg-white/70 backdrop-blur-md px-4 py-1.5 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#1E4B7A]">
                  Traçabilité de colis · République du Sénégal
                </span>
              </div>

              {/* massive headline */}
              <h1 className="reveal-up mt-6 sm:mt-8 font-display font-bold tracking-tighter text-7xl leading-[0.9] sm:text-8xl sm:leading-[0.9] lg:text-9xl lg:leading-[0.9] text-[#0A1426]">
                <span className="block">Le colis</span>
                <span className="block">arrive</span>
                <span className="block text-gradient-blue-emerald">intact.</span>
              </h1>

              {/* subtitle */}
              <p className="reveal-up mt-6 sm:mt-8 max-w-md text-base sm:text-lg text-[#5B7088] leading-relaxed">
                La plateforme de traçabilité pensée pour les agences de transport inter-villes au Sénégal.
              </p>

              {/* tracking input + button */}
              <form
                onSubmit={handleTrack}
                className="reveal-up mt-7 flex flex-col sm:flex-row gap-3 max-w-lg"
              >
                <div className="relative flex-1">
                  <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E4B7A]/60 pointer-events-none" />
                  <input
                    type="text"
                    value={refValue}
                    onChange={(e) => setRefValue(e.target.value)}
                    placeholder="Référence colis — ex. VOL26-WRQZNE"
                    aria-label="Référence du colis"
                    className="w-full rounded-xl border border-[#1E4B7A]/20 bg-white/90 backdrop-blur-md py-3.5 pl-12 pr-4 text-sm sm:text-base text-[#0A1426] placeholder:text-[#5B7088]/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E4B7A]/30 focus:border-[#1E4B7A]/40 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-brand inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold"
                >
                  Suivre mon colis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* 3 mini-stats inline */}
              <div className="reveal-up mt-8 flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-2xl sm:text-3xl text-[#0A1426]">10K+</span>
                  <span className="text-xs sm:text-sm text-[#5B7088]">colis</span>
                </div>
                <span className="hidden sm:block h-6 w-px bg-[#1E4B7A]/15" />
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-2xl sm:text-3xl text-[#0A1426]">500+</span>
                  <span className="text-xs sm:text-sm text-[#5B7088]">agences</span>
                </div>
                <span className="hidden sm:block h-6 w-px bg-[#1E4B7A]/15" />
                <div className="flex items-baseline gap-2">
                  <Star className="w-4 h-4 text-[#10B981] fill-[#10B981]" />
                  <span className="font-display font-bold text-2xl sm:text-3xl text-[#0A1426]">4.9</span>
                  <span className="text-xs sm:text-sm text-[#5B7088]">satisfaction</span>
                </div>
              </div>
            </div>

            {/* RIGHT — 40% (col-span-5) — delivery card mockup with hero image backdrop */}
            <div className="lg:col-span-5 mt-2 lg:mt-0 relative">
              {/* Hero image backdrop with mask */}
              <div className="absolute -inset-6 lg:-inset-8 -z-10 pointer-events-none">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/hero-logistics.jpg"
                    alt=""
                    fill
                    priority
                    sizes="40vw"
                    className="object-cover rounded-3xl opacity-25"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FBFCFE] via-transparent to-transparent" />
                </div>
              </div>
              <DeliveryCardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — Marquee Ticker
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="divider-blue" />
        <div className="marquee-pause bg-[#0F2D52] py-4 overflow-hidden">
          <div className="marquee-track flex items-center whitespace-nowrap">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center text-sm sm:text-base font-medium text-white/90 px-6"
              >
                {item}
                <span className="ml-6 inline-block h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              </span>
            ))}
          </div>
        </div>
        <div className="divider-blue" />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — "Pourquoi QRTrans" (asymmetric sticky scroll)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-light-hero py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-40 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            {/* LEFT sticky 40% (col-span-5) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <div className="font-display font-bold text-9xl sm:text-[10rem] leading-none text-[#1E4B7A]/15 select-none">
                  01
                </div>
                <h2 className="reveal-up mt-4 font-display font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-[#0A1426] leading-[1.05]">
                  Une traçabilité
                  <br />
                  <span className="text-gradient-blue">sans faille.</span>
                </h2>
                <p className="reveal-up mt-6 max-w-md text-base sm:text-lg text-[#5B7088] leading-relaxed">
                  Chaque colis raconte une histoire : un QR code à l&apos;expédition, un PIN confidentiel
                  à l&apos;arrivée, une notification WhatsApp à chaque étape. QRTrans rend cette histoire
                  lisible, sécurisée et partagée — par tous les acteurs du voyage.
                </p>
                <Link
                  href="/fonctionnalites"
                  className="reveal-up mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#1E4B7A] link-underline"
                >
                  Explorer les fonctionnalités
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                {/* Companion image — premium logistics photo */}
                <div className="reveal-up mt-10 relative rounded-2xl overflow-hidden shadow-xl shadow-[#1E4B7A]/15 group/img">
                  <Image
                    src="/images/qr-scan-app.jpg"
                    alt="Application QRTrans de scan"
                    width={1024}
                    height={1024}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="w-full h-auto object-cover aspect-square transition-transform duration-700 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2D52]/70 via-[#0F2D52]/10 to-transparent pointer-events-none" />
                  {/* Overlay caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6EE7B7]">
                      Application mobile
                    </p>
                    <p className="font-display font-bold text-white text-lg sm:text-xl mt-1">
                      Scannez. Activez. Suivez.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT scrolling 60% (col-span-7) */}
            <div className="lg:col-span-7 space-y-5">
              {WHY_CARDS.map((card, i) => (
                <div
                  key={card.title}
                  className="reveal-up glass-card-light p-6 sm:p-8 flex items-start gap-5"
                >
                  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] flex items-center justify-center shadow-lg shadow-[#1E4B7A]/20">
                    <card.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xs font-bold text-[#1E4B7A]/40">
                        0{i + 1}
                      </span>
                      <h3 className="font-display font-bold text-lg sm:text-xl text-[#0A1426]">
                        {card.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm sm:text-base text-[#5B7088] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section divider */}
      <SectionDivider icon={Zap} />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — "Comment ça marche" (numbered steps)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative section-light py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="reveal-up inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#1E4B7A]/60">
              Le processus
            </span>
            <h2 className="reveal-up mt-3 font-display font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-[#0A1426] leading-[1.05]">
              Comment ça marche.
            </h2>
            <p className="reveal-up mt-4 text-base sm:text-lg text-[#5B7088] max-w-xl">
              De l&apos;activation à la récupération, un parcours en 4 étapes qui sécurise toute la chaîne.
            </p>
          </div>

          <div className="mt-12 lg:mt-16 grid sm:grid-cols-2 gap-5 lg:gap-6">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className={`reveal-up group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br ${step.gradient}`}
              >
                {/* Decorative top-right glow */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />
                {/* Subtle grid overlay for texture */}
                <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none" />

                <div className="relative p-6 sm:p-8">
                  <div className="flex items-start gap-5">
                    <span className="font-display font-bold text-5xl sm:text-6xl leading-none text-white/30 transition-colors group-hover:text-white/55">
                      {step.num}
                    </span>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-sm">
                          <step.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm sm:text-base text-white/85 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 — Big Numbers (full-bleed dark band)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0F2D52] py-20 lg:py-28 overflow-hidden">
        {/* Background image with dark overlay for premium editorial feel */}
        <Image
          src="/images/africa-transport.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2D52] via-[#0F2D52]/85 to-[#0F2D52]" />
        {/* subtle radial highlight */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] bg-[radial-gradient(ellipse_at_center,rgba(72,122,168,0.25),transparent_60%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {BIG_STATS.map((stat) => (
              <BigStat key={stat.label} stat={stat} />
            ))}
          </div>

          <div className="mt-16 lg:mt-20 max-w-3xl mx-auto text-center">
            <Quote className="w-8 h-8 text-[#10B981] mx-auto opacity-60" />
            <p className="mt-4 font-display italic text-xl sm:text-2xl lg:text-3xl text-white/80 leading-snug">
              « QRTrans a révolutionné notre façon d&apos;envoyer des colis. Nos clients savent où est
              leur paquet, à la minute près. »
            </p>
            <p className="mt-4 text-sm text-white/50">
              — Awa Diop, Responsable agence · Wari Dakar
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6 — Services bento (asymmetric grid)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32 section-light-reverse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="reveal-up inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#1E4B7A]/60">
              La boîte à outils
            </span>
            <h2 className="reveal-up mt-3 font-display font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-[#0A1426] leading-[1.05]">
              Tout ce qu&apos;il faut pour sécuriser un colis.
            </h2>
          </div>

          <div className="mt-12 lg:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {BENTO_CARDS.map((card) => (
              <div
                key={card.title}
                className={`reveal-up glass-card-light p-6 sm:p-7 flex flex-col relative overflow-hidden ${
                  card.featured ? 'lg:col-span-2 lg:row-span-2 lg:p-9' : ''
                }`}
              >
                <div
                  className={`shrink-0 rounded-2xl bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] flex items-center justify-center shadow-lg shadow-[#1E4B7A]/20 ${
                    card.featured ? 'w-16 h-16' : 'w-12 h-12'
                  }`}
                >
                  <card.icon
                    className={card.featured ? 'w-8 h-8 text-white' : 'w-6 h-6 text-white'}
                  />
                </div>
                <h3
                  className={`mt-5 font-display font-bold text-[#0A1426] ${
                    card.featured ? 'text-2xl sm:text-3xl' : 'text-lg'
                  }`}
                >
                  {card.title}
                </h3>
                <p
                  className={`mt-2 text-[#5B7088] leading-relaxed ${
                    card.featured ? 'text-base sm:text-lg max-w-md' : 'text-sm'
                  }`}
                >
                  {card.desc}
                </p>
                {card.featured && (
                  <>
                    {/* Dashboard mockup image */}
                    <div className="relative mt-7 rounded-2xl overflow-hidden border border-[#1E4B7A]/15 shadow-xl shadow-[#1E4B7A]/10 group/img">
                      <Image
                        src="/images/dashboard-mockup.jpg"
                        alt="Aperçu du tableau de bord QRTrans"
                        width={1344}
                        height={768}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F2D52]/40 via-transparent to-transparent pointer-events-none" />
                      {/* Floating badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-[#1E4B7A]/20 rounded-full px-3 py-1.5 shadow-md">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E4B7A] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] pulse-soft" />
                          Live preview
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/devenir-partenaire"
                      className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#1E4B7A] link-underline self-start"
                    >
                      Devenir partenaire
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <SectionDivider icon={CheckCircle2} />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7 — Testimonials (horizontal scroll)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <span className="reveal-up inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#1E4B7A]/60">
                Ils nous font confiance
              </span>
              <h2 className="reveal-up mt-3 font-display font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-[#0A1426] leading-[1.05]">
                La voix des agences.
              </h2>
            </div>
            <Link
              href="/a-propos"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#1E4B7A] link-underline"
            >
              Lire toutes les histoires
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 overflow-x-auto scrollbar-premium pb-6">
          <div className="flex gap-5 lg:gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="reveal-up glass-card-light btn-magnetic shrink-0 w-[20rem] sm:w-[24rem] p-7 sm:p-8 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  {/* Avatar with image */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0A1426] truncate">{t.name}</p>
                    <p className="text-xs text-[#5B7088] truncate">{t.agency}</p>
                  </div>
                  <Quote className="w-6 h-6 text-[#1E4B7A]/30 shrink-0" />
                </div>
                <p className="font-display italic text-base sm:text-lg text-[#0A1426] leading-relaxed flex-1">
                  "{t.quote}"
                </p>
                <div className="my-5 h-px divider-blue" />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-[#5B7088]">{t.role}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-[#10B981] fill-[#10B981]" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section divider */}
      <SectionDivider icon={Globe} />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 8 — Final CTA (centered, big)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 lg:py-36">
        {/* aurora blob at top fading out */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[60rem] h-[40rem] pointer-events-none opacity-70">
          <AuroraBackground theme="light" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FBFCFE]/40 to-[#FBFCFE] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="reveal-up inline-flex items-center gap-2 rounded-full border border-[#1E4B7A]/15 bg-white/70 backdrop-blur-md px-4 py-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-xs sm:text-sm font-medium text-[#1E4B7A]">
              Prêt à sécuriser vos colis ?
            </span>
          </span>

          <h2 className="reveal-up mt-6 font-display font-bold tracking-tighter text-5xl sm:text-6xl lg:text-7xl text-[#0A1426] leading-[0.95]">
            Commencez en
            <br />
            <span className="text-gradient-blue-emerald">30 secondes.</span>
          </h2>

          <p className="reveal-up mt-6 max-w-xl mx-auto text-base sm:text-lg text-[#5B7088]">
            Rejoignez les 500+ agences qui ont digitalisé leur traçabilité. Sans installation, sans
            engagement.
          </p>

          <div className="reveal-up mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/devenir-partenaire"
              className="btn-brand btn-magnetic inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm sm:text-base font-semibold w-full sm:w-auto"
            >
              Devenir partenaire
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm sm:text-base font-semibold text-[#0A1426] border border-[#1E4B7A]/20 bg-white/70 backdrop-blur-md hover:bg-white hover:border-[#1E4B7A]/40 transition-all w-full sm:w-auto"
            >
              Parler à un expert
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* subtle language indicator */}
          <div className="reveal-up mt-8 flex items-center justify-center gap-2 text-xs text-[#5B7088]">
            <Globe className="w-3.5 h-3.5" />
            <span>Disponible en FR · EN · AR</span>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

function DeliveryCardMockup() {
  return (
    <div className="relative reveal-scale">
      {/* glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-br from-[#1E4B7A]/20 via-[#487AA8]/10 to-[#10B981]/10 blur-3xl opacity-60 pointer-events-none" />

      <div className="animate-float-slow relative glass-light-strong rounded-3xl p-5 sm:p-6 shadow-2xl shadow-[#0F2D52]/20">
        {/* TOP — logo + reference + status */}
        <div className="flex items-center justify-between gap-3">
          <Image
            src="/brand/logo.png"
            alt="QRTrans"
            width={180}
            height={53}
            className="h-4 w-auto object-contain"
            priority
          />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 px-2.5 py-1 text-xs font-semibold text-[#059669]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] pulse-soft" />
            En transit
          </span>
        </div>

        {/* Reference line */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#5B7088]">Réf.</span>
          <span className="font-mono text-sm font-bold text-[#0A1426]">VOL26-WRQZNE</span>
        </div>

        {/* MIDDLE — route visualization */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#EEF5FC] to-white border border-[#1E4B7A]/10 p-5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#5B7088] mb-3">
            <span>Itinéraire</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> 3h 30min
            </span>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#1E4B7A] ring-4 ring-[#1E4B7A]/15" />
                <p className="font-display font-bold text-sm text-[#0A1426]">Dakar</p>
              </div>
              <div className="flex-1 mx-3 relative h-6 flex items-center">
                <svg
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 12"
                >
                  <line
                    x1="2"
                    y1="6"
                    x2="98"
                    y2="6"
                    stroke="#487AA8"
                    strokeWidth="1.2"
                    className="dash-flow"
                  />
                </svg>
                <div className="plane-travel absolute top-1/2 -translate-y-1/2">
                  <div className="w-7 h-7 rounded-full bg-white border border-[#1E4B7A]/20 flex items-center justify-center shadow-md">
                    <Plane className="w-3.5 h-3.5 text-[#1E4B7A] rotate-90" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#10B981] ring-4 ring-[#10B981]/15" />
                <p className="font-display font-bold text-sm text-[#0A1426]">Touba</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM — small grid */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <BottomTile icon={Clock} label="Départ" value="14:30" />
          <BottomTile icon={PackageCheck} label="Arrivée" value="~18:00" />
          <BottomTile icon={Lock} label="PIN" value="6 chiffres" />
        </div>

        {/* progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#5B7088] mb-1.5">
            <span>Progression</span>
            <span className="font-semibold text-[#1E4B7A]">62%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#1E4B7A]/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#1E4B7A] to-[#10B981]"
              style={{ width: '62%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1E4B7A]/10 bg-white/70 backdrop-blur-md p-3">
      <Icon className="w-3.5 h-3.5 text-[#1E4B7A]/60" />
      <p className="mt-1.5 text-[10px] uppercase tracking-wider text-[#5B7088]">{label}</p>
      <p className="text-xs font-semibold text-[#0A1426]">{value}</p>
    </div>
  );
}

function BigStat({
  stat,
}: {
  stat: { value: number; suffix: string; label: string; animated: boolean };
}) {
  return (
    <div className="text-center lg:text-left reveal-up">
      <div className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-none text-white">
        {stat.animated ? (
          <AnimatedCounter value={stat.value} suffix={stat.suffix} />
        ) : (
          <>
            {stat.value.toLocaleString('fr-FR')}
            {stat.suffix}
          </>
        )}
      </div>
      <p className="mt-3 text-xs sm:text-sm uppercase tracking-wider text-white/60">{stat.label}</p>
    </div>
  );
}

function SectionDivider({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 py-12 lg:py-16">
      <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent to-[#1E4B7A]/30" />
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#1E4B7A]/15 shadow-sm">
        <Icon className="w-4 h-4 text-[#1E4B7A]" />
      </div>
      <div className="h-px w-16 sm:w-32 bg-gradient-to-l from-transparent to-[#1E4B7A]/30" />
    </div>
  );
}
