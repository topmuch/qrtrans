'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPinned,
  CheckCircle2,
  Clock,
  MessageCircle,
  ArrowRight,
  Send,
  Headset,
} from 'lucide-react';
import SiteLayout from '@/components/site/SiteLayout';
import AuroraBackground from '@/components/site/AuroraBackground';

/* ---------------------------------------------------------------
   Static content
---------------------------------------------------------------- */

const WA_URL =
  'https://wa.me/221784858226?text=Bonjour%20QRTrans%2C%20je%20souhaite%20en%20savoir%20plus';

type InfoCard = {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

const INFO_CARDS: InfoCard[] = [
  {
    icon: MapPinned,
    label: 'Adresse',
    value: 'Cité Alia Diène, Ouest Foire, Yoff, Dakar',
  },
  {
    icon: Phone,
    label: 'Téléphone',
    value: '+221 78 485 82 26',
    href: 'tel:+221784858226',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@qrtrans.com',
    href: 'mailto:contact@qrtrans.com',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Chat en direct — 7j/7',
    href: WA_URL,
    external: true,
  },
];

const SUBJECTS = [
  { value: 'partenariat', label: 'Devenir partenaire' },
  { value: 'support', label: 'Support technique' },
  { value: 'info', label: 'Informations générales' },
  { value: 'tarifs', label: 'Tarifs & abonnements' },
  { value: 'autre', label: 'Autre' },
] as const;

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          senderName: formData.name,
          senderEmail: formData.email,
          senderPhone: formData.phone || null,
          subject: formData.subject,
          content: formData.message,
        }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setSubmitted(true);
    } catch (err) {
      console.error('Error sending message:', err);
      setError("Une erreur est survenue. Réessayez ou écrivez-nous sur WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setError(null);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white border border-[#1E4B7A]/15 text-[#0F1B2E] placeholder:text-[#5B7088]/60 focus:outline-none focus:border-[#1E4B7A]/60 focus:ring-2 focus:ring-[#1E4B7A]/15 text-sm transition-colors';
  const labelClass =
    'block text-xs font-semibold uppercase tracking-wider text-[#5B7088] mb-2';

  return (
    <SiteLayout theme="light" hasDarkHero hideWhatsApp>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative overflow-hidden bg-light-hero pt-36 pb-20 lg:pt-44 lg:pb-24">
        <AuroraBackground theme="light" />
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass-light">
              <Headset className="w-4 h-4 text-[#1E4B7A]" />
              <span className="text-xs sm:text-sm font-medium text-[#1E4B7A] tracking-wide">
                Nous sommes à votre écoute
              </span>
            </div>

            <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#0F1B2E]">
              Contactez-<span className="text-gradient-blue">nous</span>
            </h1>

            <p className="reveal-up mt-6 text-lg sm:text-xl text-[#5B7088] max-w-2xl mx-auto leading-relaxed">
              Une question sur nos solutions, un projet de partenariat ou besoin de
              support ? Notre équipe vous répond sous 24h.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. INFO CARDS
         ===================================================== */}
      <section className="relative py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INFO_CARDS.map((card, idx) => {
              const inner = (
                <>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E4B7A]/15 to-[#487AA8]/5 border border-[#1E4B7A]/25 flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5 text-[#1E4B7A]" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-[#5B7088] font-semibold mb-1">
                    {card.label}
                  </p>
                  <p className="text-sm font-medium text-[#0F1B2E] leading-snug">
                    {card.value}
                  </p>
                </>
              );
              const className = `reveal-up glass-card-light p-5 h-full block hover:border-[#1E4B7A]/40 transition-colors ${
                card.href ? 'cursor-pointer' : ''
              }`;
              if (card.href) {
                return (
                  <a
                    key={card.label}
                    href={card.href}
                    target={card.external ? '_blank' : undefined}
                    rel={card.external ? 'noopener noreferrer' : undefined}
                    className={className}
                    style={{ transitionDelay: `${idx * 60}ms` }}
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <div
                  key={card.label}
                  className={className}
                  style={{ transitionDelay: `${idx * 60}ms` }}
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          3. FORM + MAP PLACEHOLDER
         ===================================================== */}
      <section className="relative pb-24 lg:pb-32 section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* FORM */}
            <div className="reveal-up">
              <SectionHeadingLight
                eyebrow="Formulaire"
                title={
                  <>
                    Envoyez-nous un{' '}
                    <span className="text-gradient-blue">message</span>
                  </>
                }
                align="left"
                className="mb-6"
              />
              <p className="text-sm text-[#5B7088] mb-6 -mt-4">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les
                plus brefs délais.
              </p>

              <div className="glass-light-strong rounded-3xl p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-8 h-8 text-[#1E4B7A]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#0F1B2E] mb-2">
                      Message envoyé !
                    </h3>
                    <p className="text-sm text-[#5B7088] mb-6 max-w-sm mx-auto">
                      Nous avons bien reçu votre message et vous répondrons dans les
                      plus brefs délais.
                    </p>
                    <button
                      onClick={reset}
                      className="btn-brand btn-magnetic inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          Nom complet <span className="text-[#1E4B7A]">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Votre nom"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Email <span className="text-[#1E4B7A]">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="votre@email.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Téléphone</label>
                        <input
                          type="tel"
                          placeholder="+221 7X XXX XX XX"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Sujet <span className="text-[#1E4B7A]">*</span>
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                          className={`${inputClass} cursor-pointer`}
                          required
                        >
                          <option value="" className="bg-white text-[#0F1B2E]">
                            Sélectionnez un sujet
                          </option>
                          {SUBJECTS.map((s) => (
                            <option key={s.value} value={s.value} className="bg-white text-[#0F1B2E]">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Message <span className="text-[#1E4B7A]">*</span>
                      </label>
                      <textarea
                        placeholder="Décrivez votre demande..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        rows={5}
                        className={`${inputClass} resize-none`}
                        required
                      />
                    </div>

                    {error && (
                      <div className="text-sm text-red-700 bg-red-500/10 border border-red-400/40 rounded-lg p-3">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-brand btn-magnetic w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        'Envoi en cours...'
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Envoyer le message
                        </>
                      )}
                    </button>

                    <p className="text-xs text-[#5B7088] text-center">
                      En envoyant ce formulaire, vous acceptez notre{' '}
                      <Link
                        href="/confidentialite"
                        className="text-[#1E4B7A] hover:text-[#0F1B2E] link-underline"
                      >
                        politique de confidentialité
                      </Link>
                      .
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* MAP + SCHEDULE + WHATSAPP CTA */}
            <div className="reveal-up flex flex-col gap-6" style={{ transitionDelay: '120ms' }}>
              {/* Map placeholder glass card */}
              <div className="relative glass-light-strong rounded-3xl p-6 sm:p-8 overflow-hidden min-h-[280px] flex items-center">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none"
                />
                {/* Glow blobs */}
                <div
                  aria-hidden="true"
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-50 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(30, 75, 122, 0.20), transparent 70%)',
                    filter: 'blur(50px)',
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-40 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(72, 122, 168, 0.25), transparent 70%)',
                    filter: 'blur(50px)',
                  }}
                />
                <div className="relative w-full text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 mb-4 animate-float-slow">
                    <MapPinned className="w-7 h-7 text-[#1E4B7A]" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#1E4B7A] font-semibold mb-2">
                    Nous situer
                  </p>
                  <p className="font-display text-lg font-bold text-[#0F1B2E] mb-1">
                    Cité Alia Diène, Ouest Foire
                  </p>
                  <p className="text-sm text-[#5B7088]">
                    Yoff, Dakar — Sénégal
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Cité+Alia+Diène+Ouest+Foire+Yoff+Dakar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg glass-light text-sm font-semibold text-[#0F1B2E] hover:border-[#1E4B7A]/40 transition-colors"
                  >
                    Ouvrir dans Google Maps
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Schedule */}
              <div className="glass-card-light p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#1E4B7A]" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#0F1B2E]">
                      Horaires d&apos;ouverture
                    </h3>
                    <p className="text-xs text-[#5B7088]">Support disponible 7j/7</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5B7088]">Lundi — Vendredi</span>
                    <span className="font-semibold text-[#0F1B2E]">08h00 — 18h00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5B7088]">Samedi</span>
                    <span className="font-semibold text-[#0F1B2E]">09h00 — 14h00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5B7088]">Dimanche &amp; fériés</span>
                    <span className="font-semibold text-[#1E4B7A]">
                      WhatsApp uniquement
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 btn-brand rounded-2xl p-5 transition-all hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-base text-white">
                    Préférez le chat WhatsApp ?
                  </h3>
                  <p className="text-white/80 text-sm">
                    Réponse instantanée, 7j/7
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 flex-shrink-0 text-white group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
