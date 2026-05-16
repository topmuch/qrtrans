'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  QrCode, Smartphone, MapPin, MessageCircle, Star, Menu, X,
  ArrowRight, Search, Zap, Users, Shield, Globe, CheckCircle,
  ChevronRight, Truck, Clock, Lock, BarChart3, Package,
  Wifi, WifiOff, Languages, MapPinned, Server, Bell, Phone,
  Mail, Linkedin, Facebook, Instagram, Play,
} from "lucide-react";

/* Keep import for potential future use */
import TrackingWidget from '@/components/home/TrackingWidget';

/* ──────────────────────────────────────────────
   Fade-in wrapper (Framer Motion)
   ────────────────────────────────────────────── */
function FadeIn({ children, className, delay = 0, direction = 'up' }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directions[direction] }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   1. STICKY SEARCH BAR
   ══════════════════════════════════════════════ */
function StickySearchBar() {
  const router = useRouter();
  const [refValue, setRefValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pattern = useMemo(() => /^[A-Z]{2,4}\d{2}-[A-Z0-9]{4,8}$/, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setRefValue(val);
    if (val.length === 0) {
      setIsValid(false);
      setError('');
    } else if (pattern.test(val)) {
      setIsValid(true);
      setError('');
    } else {
      setIsValid(false);
      if (val.length >= 7) {
        setError('Format : AB12-XXXX');
      } else {
        setError('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      router.push(`/activate/${refValue}`);
    }
  };

  return (
    <div
      className={`fixed top-16 lg:top-20 left-0 right-0 z-40 transition-all duration-500 ${
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={refValue}
                onChange={handleChange}
                placeholder="Suivre un colis — ex: AB12-CDEF"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 ${
                  isValid
                    ? 'border-emerald-400 focus:ring-emerald-500/20 text-slate-900'
                    : error
                    ? 'border-red-300 focus:ring-red-500/20 text-slate-900'
                    : 'border-slate-200 focus:ring-[#FF6B35]/20 text-slate-900 placeholder:text-slate-400'
                }`}
                maxLength={13}
              />
              {error && (
                <p className="absolute -bottom-5 left-3.5 text-xs text-red-500 font-medium">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={!isValid}
              className={`rounded-xl px-5 py-3 font-semibold text-sm transition-all gap-2 ${
                isValid
                  ? 'bg-[#FF6B35] hover:bg-[#e65a28] text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Suivre</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   2. NAVIGATION
   ══════════════════════════════════════════════ */
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Solutions', href: '#solutions' },
    { label: 'Comment ça marche', href: '#comment' },
    { label: 'Tarifs', href: '#tarifs' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-200'
        : 'bg-white/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B35] to-[#D4AF37] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">QRTrans</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#FF6B35] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/agence/connexion">
              <Button variant="ghost" className="text-slate-500 hover:text-slate-900 text-sm font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50">
                Espace Agence
              </Button>
            </Link>
            <Link href="/devenir-partenaire">
              <Button className="bg-[#FF6B35] hover:bg-[#e65a28] text-white font-medium text-sm rounded-full px-5 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-[1.02]">
                Devenir Partenaire
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-900 p-1"
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
              className="md:hidden py-4 border-t border-slate-200 bg-white/98 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-slate-700 hover:text-slate-900 font-medium py-2 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <hr className="border-slate-200" />
                <Link href="/agence/connexion" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full text-slate-500 border border-slate-200 justify-start">
                    Espace Agence
                  </Button>
                </Link>
                <Link href="/devenir-partenaire" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#FF6B35] hover:bg-[#e65a28] text-white font-medium rounded-full">
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

/* ══════════════════════════════════════════════
   3. HERO SECTION — "Effet Wahoo"
   ══════════════════════════════════════════════ */
function HeroSection() {
  const router = useRouter();
  const [refValue, setRefValue] = useState('');
  const [isValid, setIsValid] = useState(false);

  const pattern = useMemo(() => /^[A-Z]{2,4}\d{2}-[A-Z0-9]{4,8}$/, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setRefValue(val);
    setIsValid(pattern.test(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      router.push(`/activate/${refValue}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 100%)' }}
    >
      {/* Organic blurred circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-[#FF6B35]/8 blur-3xl" />
        <div className="absolute top-[30%] right-[5%] w-[300px] h-[300px] rounded-full bg-[#25D366]/6 blur-3xl" />
        <div className="absolute bottom-[15%] left-[30%] w-[350px] h-[350px] rounded-full bg-[#FFD23F]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-20">
        {/* Badge */}
        <FadeIn>
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
            <span className="text-sm font-medium text-emerald-700 tracking-wide">
              🇸🇳 Solution de traçabilité N°1 au Sénégal
            </span>
          </div>
        </FadeIn>

        {/* H1 */}
        <FadeIn delay={0.15}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight">
            Transportez vos colis
            <br />
            en toute confiance,
            <br />
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#D4AF37] bg-clip-text text-transparent">
              de ville en ville
            </span>
          </h1>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn delay={0.3}>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
            QRTrans : activez un QR code, notifiez par WhatsApp,
            <br className="hidden sm:block" />
            suivez l&apos;acheminement en temps réel. Simple pour les chauffeurs,
            <br className="hidden sm:block" />
            puissant pour les agences.
          </p>
        </FadeIn>

        {/* Tracking bar */}
        <FadeIn delay={0.45}>
          <form onSubmit={handleSubmit} className="mt-10 max-w-xl mx-auto">
            <div className="flex items-center bg-white rounded-2xl border-2 border-slate-200 shadow-lg shadow-slate-200/50 focus-within:border-[#FF6B35]/40 focus-within:shadow-orange-500/10 transition-all duration-300 overflow-hidden">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={refValue}
                  onChange={handleChange}
                  placeholder="Entrez votre référence colis (ex: TRSP-2026-0042)"
                  className="w-full pl-12 pr-4 py-4 text-sm font-medium bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  maxLength={16}
                />
              </div>
              <button
                type="submit"
                disabled={!isValid}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all duration-300 ${
                  isValid
                    ? 'bg-[#FF6B35] hover:bg-[#e65a28] text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Suivre
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </FadeIn>

        {/* Two CTA buttons */}
        <FadeIn delay={0.6}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/inscrire">
              <Button className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1fb855] text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-[1.03] gap-2">
                🚚 Je suis chauffeur → Activer un colis
              </Button>
            </Link>
            <Link href="/agence/connexion">
              <Button className="w-full sm:w-auto bg-transparent border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/5 px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-[1.03] gap-2">
                🏢 Je suis agence → Voir le dashboard
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* Trust badges */}
        <FadeIn delay={0.75}>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {[
              '✅ Notifications WhatsApp gratuites',
              '✅ Suivi en temps réel',
              '✅ 100% mobile & PWA',
            ].map((badge, idx) => (
              <motion.div
                key={badge}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/80 border border-slate-200 rounded-full shadow-sm text-xs font-medium text-slate-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + idx * 0.1, duration: 0.5 }}
              >
                {badge}
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

/* ══════════════════════════════════════════════
   4. POURQUOI QRTRANS (Glassmorphism cards)
   ══════════════════════════════════════════════ */
function WhyQRTransSection() {
  const cards = [
    {
      icon: Smartphone,
      iconSecondary: QrCode,
      title: 'Simple comme un scan',
      description: 'Activez un colis en 30 secondes avec un QR code pré-imprimé. Pas d\'application à installer, pas de formation nécessaire.',
      accent: 'bg-emerald-500',
      accentLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-600',
    },
    {
      icon: MapPin,
      iconSecondary: null,
      title: 'Traçabilité totale',
      description: 'Expéditeur et destinataire reçoivent des notifications WhatsApp à chaque étape : départ, transit, arrivée.',
      accent: 'bg-[#FF6B35]',
      accentLight: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-[#FF6B35]',
    },
    {
      icon: BarChart3,
      iconSecondary: null,
      title: 'Gestion pro',
      description: 'Agences : assignez des QR codes par lot, suivez vos chauffeurs en temps réel, exportez vos rapports comptables.',
      accent: 'bg-[#0077B6]',
      accentLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-[#0077B6]',
    },
  ];

  return (
    <section id="solutions" className="relative py-20 lg:py-28 px-4" style={{ background: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 tracking-tight leading-tight">
            La solution logistique conçue pour
            <br className="hidden sm:block" />
            le transport inter-villes au Sénégal
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, i) => (
            <FadeIn key={card.title} delay={i * 0.12}>
              <div className="group h-full bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-7 lg:p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-2">
                <div className={`w-14 h-14 ${card.accentLight} ${card.borderColor} border rounded-2xl flex items-center justify-center mb-6 relative`}>
                  <card.icon className={`w-7 h-7 ${card.textColor}`} />
                  {card.iconSecondary && (
                    <card.iconSecondary className={`w-5 h-5 ${card.textColor} absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border ${card.borderColor}`} />
                  )}
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-3 leading-snug">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   5. COMMENT ÇA MARCHE (3-step timeline)
   ══════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Activation',
      description: 'Le chauffeur scanne un QR code pré-imprimé et entre les infos du colis (destinataire, destination, numéro WhatsApp).',
      badge: '30 secondes',
      color: 'bg-[#FF6B35]',
      colorLight: 'bg-orange-50',
      colorBorder: 'border-orange-200',
      colorText: 'text-[#FF6B35]',
      colorBadge: 'bg-orange-100 text-orange-700',
    },
    {
      number: '02',
      title: 'Notifications',
      description: 'Expéditeur et destinataire reçoivent instantanément un message WhatsApp avec le lien de suivi du colis.',
      badge: 'Instantané',
      color: 'bg-[#25D366]',
      colorLight: 'bg-emerald-50',
      colorBorder: 'border-emerald-200',
      colorText: 'text-[#25D366]',
      colorBadge: 'bg-emerald-100 text-emerald-700',
    },
    {
      number: '03',
      title: 'Livraison',
      description: 'Scan final à l\'arrivée — confirmation de livraison automatique. Tout est traçable, de bout en bout.',
      badge: 'Traçable',
      color: 'bg-[#0077B6]',
      colorLight: 'bg-blue-50',
      colorBorder: 'border-blue-200',
      colorText: 'text-[#0077B6]',
      colorBadge: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <section id="comment" className="py-20 lg:py-28 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 tracking-tight">
            3 étapes pour un colis tracé,
            <br className="hidden sm:block" />
            du départ à l&apos;arrivée
          </h2>
        </FadeIn>

        {/* Desktop horizontal timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting line */}
          <div className="absolute top-[2.5rem] left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-[#FF6B35]/30 via-[#25D366]/30 to-[#0077B6]/30" />

          <div className="grid grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.15}>
                <div className="relative text-center">
                  {/* Circle */}
                  <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10`}>
                    <span className="text-white font-bold text-2xl">{step.number}</span>
                  </div>

                  {/* Badge */}
                  <span className={`inline-block px-3 py-1 ${step.colorBadge} text-xs font-bold rounded-full mb-3`}>
                    {step.badge}
                  </span>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="lg:hidden relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FF6B35]/30 via-[#25D366]/30 to-[#0077B6]/30" />

          <div className="space-y-10">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.15}>
                <div className="relative flex gap-6">
                  {/* Circle */}
                  <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg relative z-10`}>
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <span className={`inline-block px-3 py-1 ${step.colorBadge} text-xs font-bold rounded-full mb-2`}>
                      {step.badge}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   6. ESPACE CHAUFFEUR (Split 50/50)
   ══════════════════════════════════════════════ */
function ChauffeurSection() {
  const checklistItems = [
    'Activez vos colis en moins d\'une minute',
    'Notifications WhatsApp automatiques (gratuit)',
    'Interface mobile simple, même sans connexion',
    'Historique de vos trajets accessible partout',
  ];

  return (
    <section className="py-20 lg:py-28 px-4" style={{ background: '#FFF5F0' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <FadeIn direction="right">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-bold tracking-[0.15em] uppercase rounded-full mb-6">
                ESPACE CHAUFFEUR
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                Chauffeur ? Gagnez du temps
                <br className="hidden sm:block" />
                et rassurez vos clients
              </h2>

              {/* Checklist */}
              <div className="space-y-4 mb-8">
                {checklistItems.map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-[#25D366]" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Link href="/inscrire">
                <Button className="bg-[#FF6B35] hover:bg-[#e65a28] text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-[1.03] gap-2 mb-4">
                  🚀 Accéder à l&apos;espace chauffeur
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-xs text-slate-500 mt-3">
                Pas encore de compte ? Contactez votre agence partenaire pour recevoir vos QR codes.
              </p>
            </div>
          </FadeIn>

          {/* Right illustration */}
          <FadeIn direction="left" delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#FF6B35]/15 to-[#FFD23F]/15 rounded-3xl blur-2xl" />
              <div className="relative bg-white/80 backdrop-blur-lg border border-white/60 rounded-3xl p-8 lg:p-10 shadow-xl">
                {/* SVG Illustration: truck + QR + phone + WhatsApp */}
                <svg viewBox="0 0 400 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background circle */}
                  <circle cx="200" cy="150" r="120" fill="#FFF5F0" />
                  
                  {/* Truck */}
                  <rect x="60" y="140" width="160" height="80" rx="8" fill="#FF6B35" opacity="0.9" />
                  <rect x="220" y="160" width="80" height="60" rx="8" fill="#e65a28" />
                  <circle cx="120" cy="225" r="18" fill="#334155" />
                  <circle cx="120" cy="225" r="8" fill="#94A3B8" />
                  <circle cx="260" cy="225" r="18" fill="#334155" />
                  <circle cx="260" cy="225" r="8" fill="#94A3B8" />
                  <rect x="80" y="150" width="100" height="40" rx="4" fill="white" opacity="0.3" />
                  
                  {/* QR Code on truck */}
                  <rect x="95" y="155" width="30" height="30" rx="4" fill="white" stroke="#334155" strokeWidth="1.5" />
                  <rect x="100" y="160" width="6" height="6" fill="#334155" />
                  <rect x="110" y="160" width="6" height="6" fill="#334155" />
                  <rect x="100" y="170" width="6" height="6" fill="#334155" />
                  <rect x="114" y="170" width="6" height="6" fill="#334155" />
                  
                  {/* Phone */}
                  <rect x="290" y="80" width="50" height="90" rx="10" fill="#334155" />
                  <rect x="296" y="92" width="38" height="66" rx="4" fill="white" />
                  <rect x="296" y="92" width="38" height="20" rx="4" fill="#25D366" opacity="0.15" />
                  <text x="315" y="106" textAnchor="middle" fontSize="7" fill="#25D366" fontWeight="bold">WA</text>
                  <circle cx="315" cy="100" r="2" fill="#25D366" />
                  
                  {/* WhatsApp bubbles */}
                  <rect x="255" y="60" width="60" height="25" rx="12" fill="#25D366" opacity="0.9" />
                  <text x="285" y="77" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">✅ Livré!</text>
                  <rect x="300" y="40" width="55" height="22" rx="11" fill="#25D366" opacity="0.7" />
                  <text x="327" y="55" textAnchor="middle" fontSize="7" fill="white">En route...</text>
                  
                  {/* Package on truck */}
                  <rect x="140" y="130" width="30" height="25" rx="3" fill="#FFD23F" stroke="#D4AF37" strokeWidth="1" />
                  <rect x="148" y="130" width="14" height="8" rx="2" fill="#D4AF37" opacity="0.5" />
                </svg>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   7. ESPACE AGENCE (Split reverse 50/50)
   ══════════════════════════════════════════════ */
function AgenceSection() {
  const features = [
    { emoji: '📦', text: 'Génération de lots de QR codes' },
    { emoji: '👥', text: 'Assignation aux chauffeurs' },
    { emoji: '🗺️', text: 'Suivi en temps réel' },
    { emoji: '📊', text: 'Statistiques & rapports' },
    { emoji: '📤', text: 'Export CSV comptabilité' },
    { emoji: '🔐', text: 'Gestion des permissions' },
  ];

  return (
    <section className="py-20 lg:py-28 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left illustration */}
          <FadeIn direction="right" className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#0077B6]/10 to-[#25D366]/10 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-50/80 backdrop-blur-lg border border-slate-200/60 rounded-3xl p-8 lg:p-10 shadow-xl">
                {/* Dashboard SVG */}
                <svg viewBox="0 0 400 280" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Dashboard frame */}
                  <rect x="40" y="20" width="320" height="240" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="2" />
                  <rect x="40" y="20" width="320" height="40" rx="12" fill="#0F172A" />
                  <rect x="40" y="48" width="320" height="12" fill="#0F172A" />
                  
                  {/* Dots */}
                  <circle cx="60" cy="40" r="5" fill="#EF4444" />
                  <circle cx="78" cy="40" r="5" fill="#F59E0B" />
                  <circle cx="96" cy="40" r="5" fill="#22C55E" />
                  
                  {/* Title bar */}
                  <text x="200" y="44" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">QRTrans — Dashboard</text>
                  
                  {/* Sidebar */}
                  <rect x="40" y="60" width="70" height="200" fill="#F1F5F9" />
                  <rect x="50" y="75" width="50" height="6" rx="3" fill="#CBD5E1" />
                  <rect x="50" y="90" width="40" height="6" rx="3" fill="#FF6B35" />
                  <rect x="50" y="105" width="45" height="6" rx="3" fill="#CBD5E1" />
                  <rect x="50" y="120" width="35" height="6" rx="3" fill="#CBD5E1" />
                  
                  {/* Chart area */}
                  <rect x="125" y="75" width="100" height="70" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                  <text x="175" y="92" textAnchor="middle" fontSize="7" fill="#64748B" fontWeight="bold">Colis / jour</text>
                  
                  {/* Bar chart */}
                  <rect x="135" y="115" width="12" height="20" rx="2" fill="#FF6B35" opacity="0.7" />
                  <rect x="153" y="108" width="12" height="27" rx="2" fill="#FF6B35" opacity="0.85" />
                  <rect x="171" y="100" width="12" height="35" rx="2" fill="#FF6B35" />
                  <rect x="189" y="105" width="12" height="30" rx="2" fill="#FF6B35" opacity="0.9" />
                  <rect x="207" y="95" width="12" height="40" rx="2" fill="#25D366" />
                  
                  {/* Stats cards */}
                  <rect x="240" y="75" width="100" height="32" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                  <text x="255" y="90" fontSize="6" fill="#64748B">Total colis</text>
                  <text x="255" y="100" fontSize="9" fill="#0F172A" fontWeight="bold">1,247</text>
                  <text x="315" y="97" fontSize="7" fill="#25D366" fontWeight="bold">↑ 12%</text>
                  
                  <rect x="240" y="113" width="100" height="32" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                  <text x="255" y="128" fontSize="6" fill="#64748B">En transit</text>
                  <text x="255" y="138" fontSize="9" fill="#FF6B35" fontWeight="bold">89</text>
                  <text x="315" y="135" fontSize="7" fill="#FF6B35" fontWeight="bold">● Live</text>
                  
                  {/* Map placeholder */}
                  <rect x="125" y="155" width="215" height="90" rx="6" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
                  <text x="232" y="195" textAnchor="middle" fontSize="8" fill="#25D366" fontWeight="bold">📍 Suivi GPS en temps réel</text>
                  <text x="232" y="210" textAnchor="middle" fontSize="7" fill="#64748B">12 chauffeurs actifs</text>
                  
                  {/* Truck icons on map */}
                  <circle cx="160" cy="220" r="4" fill="#FF6B35" />
                  <circle cx="200" cy="200" r="4" fill="#25D366" />
                  <circle cx="280" cy="215" r="4" fill="#FF6B35" />
                  <circle cx="310" cy="195" r="4" fill="#25D366" />
                </svg>
              </div>
            </div>
          </FadeIn>

          {/* Right content */}
          <FadeIn direction="left" delay={0.2} className="order-1 lg:order-2">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#0077B6]/10 text-[#0077B6] text-xs font-bold tracking-[0.15em] uppercase rounded-full mb-6">
                ESPACE AGENCE
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                Agence de transport ? Pilotez toute
                <br className="hidden sm:block" />
                votre flotte depuis un seul dashboard
              </h2>

              {/* Feature grid 2x3 */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.text}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                  >
                    <span className="text-lg">{feature.emoji}</span>
                    <span className="text-sm font-medium text-slate-700">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Link href="/devenir-partenaire">
                <Button className="bg-white border-2 border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6]/5 px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-[1.03] gap-2 mb-4">
                  🏢 Demander un compte agence
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-xs text-slate-500 mt-3">
                Besoin d&apos;une démo ?{' '}
                <a
                  href="https://wa.me/221784858226"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] font-semibold hover:underline"
                >
                  WhatsApp-nous au +221 78 485 82 26
                </a>
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   8. FONCTIONNALITÉS TECHNIQUES (8-card grid)
   ══════════════════════════════════════════════ */
function TechFeaturesSection() {
  const features = [
    {
      icon: QrCode,
      title: 'QR Codes pré-imprimés',
      description: 'Assignables par lot aux chauffeurs',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp via wa.me',
      description: '0€ de coût API, notifications gratuites',
    },
    {
      icon: WifiOff,
      title: 'Mode hors-ligne',
      description: 'Activation sans réseau, sync auto',
    },
    {
      icon: Smartphone,
      title: 'Dashboard PWA',
      description: 'Installable sur mobile, notifications push',
    },
    {
      icon: Languages,
      title: 'Multilingue',
      description: 'Français / Anglais / Wolof',
    },
    {
      icon: MapPinned,
      title: 'Géolocalisation GPS',
      description: 'Suivi précis de la position des colis',
    },
    {
      icon: Lock,
      title: 'Sécurité',
      description: 'Chaque QR lié à un chauffeur',
    },
    {
      icon: Server,
      title: 'API-ready',
      description: 'Intégration systèmes existants',
    },
  ];

  return (
    <section className="py-20 lg:py-28 px-4" style={{ background: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 tracking-tight">
            Une technologie robuste,
            <br className="hidden sm:block" />
            pensée pour le terrain
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.08}>
              <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35]/10 to-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-4 group-hover:from-[#FF6B35]/20 group-hover:to-[#D4AF37]/20 transition-all duration-300">
                  <feature.icon
                    className="w-6 h-6 text-[#FF6B35] transition-transform duration-300 group-hover:rotate-[5deg] group-hover:scale-110"
                  />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   9. TÉMOIGNAGES
   ══════════════════════════════════════════════ */
function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Moussa D.',
      role: 'Chauffeur indépendant Dakar-Ziguinchor',
      content: 'Depuis que j\'utilise QRTrans, mes clients ne m\'appellent plus tous les 2 heures pour savoir où est leur colis. Le WhatsApp automatique change tout. Mon agence me donne les QR codes le matin, et je les active en route. Simple, efficace.',
      initials: 'MD',
      borderColor: 'border-l-[#FF6B35]',
    },
    {
      name: 'Fatou K.',
      role: 'Agence Salam Transport',
      content: 'On gérait 200 colis par jour avec des fichiers Excel. Maintenant, tout est sur le dashboard QRTrans : on sait exactement où est chaque colis, qui l\'a livré, et à quelle heure. L\'export CSV nous fait gagner des heures en comptabilité.',
      initials: 'FK',
      borderColor: 'border-l-[#0077B6]',
    },
  ];

  return (
    <section className="py-20 lg:py-28 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 tracking-tight">
            Ils transportent avec QRTrans
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.15} direction={i === 0 ? 'right' : 'left'}>
              <div className={`group bg-white rounded-2xl p-7 lg:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 border-l-4 ${t.borderColor}`}>
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-[#FFD23F] fill-[#FFD23F]" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-6">
                  <span className="absolute -top-1 -left-1 text-5xl font-serif text-slate-200 leading-none select-none">&ldquo;</span>
                  <p className="text-slate-700 leading-relaxed text-sm pl-6 italic">
                    {t.content}
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pl-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#D4AF37] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   10. CTA FINALE
   ══════════════════════════════════════════════ */
function CtaSection() {
  return (
    <section className="py-20 lg:py-28 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FFD23F 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Prêt à moderniser votre logistique ?
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="text-lg text-white/90 max-w-xl mx-auto mb-10 leading-relaxed">
            Rejoignez les transporteurs qui utilisent QRTrans pour tracer leurs colis.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/devenir-partenaire">
              <Button className="w-full sm:w-auto bg-white text-[#FF6B35] hover:bg-slate-50 px-8 py-4 rounded-full font-bold text-sm shadow-lg transition-all hover:scale-[1.03] gap-2">
                🚀 Commencer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a
              href="https://wa.me/221784858226"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-[1.03] gap-2">
                📞 Parler à un expert
              </Button>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   11. FOOTER
   ══════════════════════════════════════════════ */
function Footer() {
  const footerLinks = {
    produit: [
      { label: 'Comment ça marche', href: '#comment' },
      { label: 'Tarifs', href: '#tarifs' },
      { label: 'Démo', href: '/demo' },
      { label: 'Fonctionnalités', href: '#solutions' },
    ],
    ressources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Support', href: '/contact' },
    ],
    entreprise: [
      { label: 'Contact', href: '/contact' },
      { label: 'Partenariats', href: '/devenir-partenaire' },
      { label: 'À propos', href: '/a-propos' },
    ],
    legal: [
      { label: 'CGU', href: '/cgu' },
      { label: 'Confidentialité', href: '/confidentialite' },
      { label: 'Mentions légales', href: '/mentions-legales' },
    ],
  };

  return (
    <footer style={{ background: '#0F172A' }} className="text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Logo + description + social */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B35] to-[#D4AF37] rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">QRTrans</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Solution de traçabilité de colis pour le transport inter-villes au Sénégal. Simple, fiable, gratuit pour les chauffeurs.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/221784858226"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-[#25D366] flex items-center justify-center transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-700 flex items-center justify-center transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Produit */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Produit</h4>
            <ul className="space-y-2.5">
              {footerLinks.produit.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Ressources */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Ressources</h4>
            <ul className="space-y-2.5">
              {footerLinks.ressources.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Entreprise */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Entreprise</h4>
            <ul className="space-y-2.5">
              {footerLinks.entreprise.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Légal */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Légal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-sm text-slate-500">
            © 2026 QRTrans. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════
   12. FLOATING WHATSAPP BUTTON
   ══════════════════════════════════════════════ */
function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/221784858226"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
      aria-label="Contacter sur WhatsApp"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      <MessageCircle className="w-7 h-7 text-white relative z-10" />
    </a>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <StickySearchBar />
      <Navigation />
      <HeroSection />
      <WhyQRTransSection />
      <HowItWorksSection />
      <ChauffeurSection />
      <AgenceSection />
      <TechFeaturesSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
