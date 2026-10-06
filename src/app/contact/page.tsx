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
import SectionHeading from '@/components/site/SectionHeading';

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
    'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15 text-sm transition-colors';
  const labelClass =
    'block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2';

  return (
    <SiteLayout hasDarkHero hideWhatsApp>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative overflow-hidden bg-hero pt-36 pb-20 lg:pt-44 lg:pb-24">
        <AuroraBackground />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass">
              <Headset className="w-4 h-4 text-emerald-300" />
              <span className="text-xs sm:text-sm font-medium text-emerald-200 tracking-wide">
                Nous sommes à votre écoute
              </span>
            </div>

            <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Contactez-<span className="text-gradient-emerald">nous</span>
            </h1>

            <p className="reveal-up mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Une question sur nos solutions, un projet de partenariat ou besoin de
              support ? Notre équipe vous répond sous 24h.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. INFO CARDS
         ===================================================== */}
      <section className="relative py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INFO_CARDS.map((card, idx) => {
              const inner = (
                <>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 border border-emerald-400/30 flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1">
                    {card.label}
                  </p>
                  <p className="text-sm font-medium text-white leading-snug">
                    {card.value}
                  </p>
                </>
              );
              const className = `reveal-up glass-card p-5 h-full block hover:border-emerald-400/40 transition-colors ${
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
      <section className="relative pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* FORM */}
            <div className="reveal-up">
              <SectionHeading
                eyebrow="Formulaire"
                title={
                  <>
                    Envoyez-nous un{' '}
                    <span className="text-gradient-emerald">message</span>
                  </>
                }
                align="left"
                className="mb-6"
              />
              <p className="text-sm text-white/70 mb-6 -mt-4">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les
                plus brefs délais.
              </p>

              <div className="glass-strong rounded-3xl p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">
                      Message envoyé !
                    </h3>
                    <p className="text-sm text-white/70 mb-6 max-w-sm mx-auto">
                      Nous avons bien reçu votre message et vous répondrons dans les
                      plus brefs délais.
                    </p>
                    <button
                      onClick={reset}
                      className="btn-magnetic inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          Nom complet <span className="text-emerald-400">*</span>
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
                          Email <span className="text-emerald-400">*</span>
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
                          Sujet <span className="text-emerald-400">*</span>
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                          className={`${inputClass} cursor-pointer`}
                          required
                        >
                          <option value="" className="bg-[#0B1437]">
                            Sélectionnez un sujet
                          </option>
                          {SUBJECTS.map((s) => (
                            <option key={s.value} value={s.value} className="bg-[#0B1437]">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Message <span className="text-emerald-400">*</span>
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
                      <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg p-3">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-magnetic w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

                    <p className="text-xs text-white/50 text-center">
                      En envoyant ce formulaire, vous acceptez notre{' '}
                      <Link
                        href="/confidentialite"
                        className="text-emerald-300 hover:text-emerald-200 link-underline"
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
              <div className="relative glass-strong rounded-3xl p-6 sm:p-8 overflow-hidden min-h-[280px] flex items-center">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-grid opacity-30 pointer-events-none"
                />
                {/* Glow blobs */}
                <div
                  aria-hidden="true"
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-50 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(16,185,129,0.3), transparent 70%)',
                    filter: 'blur(50px)',
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-40 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(59,107,217,0.3), transparent 70%)',
                    filter: 'blur(50px)',
                  }}
                />
                <div className="relative w-full text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 mb-4 animate-float-slow">
                    <MapPinned className="w-7 h-7 text-emerald-300" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80 font-semibold mb-2">
                    Nous situer
                  </p>
                  <p className="font-display text-lg font-bold text-white mb-1">
                    Cité Alia Diène, Ouest Foire
                  </p>
                  <p className="text-sm text-white/70">
                    Yoff, Dakar — Sénégal
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Cité+Alia+Diène+Ouest+Foire+Yoff+Dakar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg glass text-sm font-semibold text-white hover:border-emerald-400/40 transition-colors"
                  >
                    Ouvrir dans Google Maps
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Schedule */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white">
                      Horaires d&apos;ouverture
                    </h3>
                    <p className="text-xs text-white/60">Support disponible 7j/7</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Lundi — Vendredi</span>
                    <span className="font-semibold text-white">08h00 — 18h00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Samedi</span>
                    <span className="font-semibold text-white">09h00 — 14h00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Dimanche &amp; fériés</span>
                    <span className="font-semibold text-emerald-300">
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
                className="group flex items-center gap-4 bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] rounded-2xl p-5 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 bg-[#060B1F]/15 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-base">
                    Préférez le chat WhatsApp ?
                  </h3>
                  <p className="text-[#060B1F]/80 text-sm">
                    Réponse instantanée, 7j/7
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
