'use client';

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
  Smartphone,
  Bell,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import SiteLayout from '@/components/site/SiteLayout';
import ParticleBackground from '@/components/site/ParticleBackground';
import AuroraBackground from '@/components/site/AuroraBackground';
import SectionHeading from '@/components/site/SectionHeading';
import TiltCard from '@/components/site/TiltCard';

/* ---------------------------------------------------------------
   Static content
---------------------------------------------------------------- */

type Feature = {
  icon: typeof QrCode;
  title: string;
  description: string;
  span: string;
  accent: string;
};

const FEATURES: Feature[] = [
  {
    icon: QrCode,
    title: 'Activation QR en 30 secondes',
    description:
      'Scan instantané du QR code, formulaire digital pré-rempli, mise en route immédiate. Zéro papier, zéro friction.',
    span: 'lg:col-span-2',
    accent: 'from-emerald-500/30 via-emerald-500/5 to-transparent',
  },
  {
    icon: MessageCircle,
    title: 'Notifications WhatsApp',
    description:
      'Expéditeur et destinataire informés à chaque étape du trajet via WhatsApp. Aucune application à installer.',
    span: '',
    accent: 'from-blue-500/30 via-blue-500/5 to-transparent',
  },
  {
    icon: Lock,
    title: 'Code PIN de retrait',
    description:
      'Validation à 6 chiffres exigée à la livraison. Anti-fraude intégré, zéro remise par erreur.',
    span: '',
    accent: 'from-amber-500/30 via-amber-500/5 to-transparent',
  },
  {
    icon: MapPin,
    title: 'Suivi GPS temps réel',
    description:
      'Position du colis en direct, historique des scans horodatés et géolocalisés à chaque étape du transport.',
    span: 'lg:col-span-2',
    accent: 'from-emerald-500/30 via-emerald-500/5 to-transparent',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard agence',
    description:
      'Flotte, chauffeurs, statuts, export CSV. Pilotage complet depuis une interface unique et multilingue.',
    span: '',
    accent: 'from-purple-500/30 via-purple-500/5 to-transparent',
  },
  {
    icon: WifiOff,
    title: 'Mode hors-ligne',
    description:
      "Activez et scannez vos colis même sans réseau. Synchronisation automatique au retour de la connexion — pensé pour les zones à faible couverture.",
    span: '',
    accent: 'from-cyan-500/30 via-cyan-500/5 to-transparent',
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
    title: 'Scan',
    description:
      "Le chauffeur scanne le QR code du colis avec son smartphone — depuis l'application QRTrans ou n'importe quel lecteur.",
  },
  {
    icon: Smartphone,
    title: 'Saisie',
    description:
      "Renseignez expéditeur, destinataire et trajet en moins d'une minute grâce au formulaire guidé pré-rempli.",
  },
  {
    icon: Bell,
    title: 'Notifs',
    description:
      "Le destinataire reçoit chaque étape du trajet sur WhatsApp, en temps réel, sans aucune action de votre part.",
  },
  {
    icon: ShieldCheck,
    title: 'Récupération',
    description:
      "Remise du colis uniquement après vérification du code PIN secret envoyé au destinataire — zéro erreur possible.",
  },
];

const HIGHLIGHTS = [
  'Compatible tous smartphones Android & iOS',
  'Aucune installation requise côté destinataire',
  'Données chiffrées et hébergées en France',
  'Multilingue : français, anglais, arabe',
] as const;

/* ---------------------------------------------------------------
   Page
---------------------------------------------------------------- */

export default function FonctionnalitesPage() {
  return (
    <SiteLayout hasDarkHero>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative overflow-hidden bg-hero pt-36 pb-24 lg:pt-44 lg:pb-32">
        <AuroraBackground />
        <ParticleBackground density={70} />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-xs sm:text-sm font-medium text-emerald-200 tracking-wide">
                Fonctionnalités QRTrans
              </span>
            </div>

            <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              <span className="text-gradient">Tout ce dont vous avez besoin</span>
              <br />
              pour sécuriser chaque colis
            </h1>

            <p className="reveal-up mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Une suite complète d&apos;outils pensés pour les transporteurs africains :
              activation QR, notifications WhatsApp, code PIN anti-fraude, suivi GPS et
              mode hors-ligne.
            </p>

            <div className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/devenir-partenaire"
                className="btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                Démarrer maintenant
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/securite"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass text-white font-semibold hover:border-emerald-400/40 transition-all"
              >
                Voir la sécurité
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. FEATURE GRID — bento layout
         ===================================================== */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Fonctionnalités"
            title={
              <>
                Une suite complète,
                <br />
                <span className="text-gradient-emerald">pensée pour le terrain</span>
              </>
            }
            subtitle="De l'activation à la livraison, chaque étape est couverte par un outil dédié, simple à utiliser et robuste face aux conditions réelles du transport inter-villes."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <TiltCard key={feature.title} glow className={`reveal-up ${feature.span}`}>
                <div className={`relative overflow-hidden`}>
                  {/* Accent gradient */}
                  <div
                    aria-hidden="true"
                    className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${feature.accent} blur-2xl pointer-events-none`}
                  />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 border border-emerald-400/30 flex items-center justify-center mb-5">
                      <feature.icon className="w-6 h-6 text-emerald-300" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-2 leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          3. COMMENT ÇA MARCHE — 4-step timeline
         ===================================================== */}
      <section className="relative py-24 lg:py-32 bg-mesh">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Comment ça marche"
            title={
              <>
                Un processus simple en{' '}
                <span className="text-gradient-emerald">4 étapes</span>
              </>
            }
            subtitle="Du scan du QR code à la remise sécurisée au destinataire — moins de 2 minutes par colis."
          />

          <div className="mt-16 relative">
            {/* Horizontal connecting line (desktop) */}
            <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-400/20 via-emerald-400/60 to-emerald-400/20" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="reveal-up relative flex flex-col items-center text-center"
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  {/* Numbered badge */}
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40 mb-5">
                    <step.icon className="w-6 h-6 text-[#060B1F]" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#060B1F] border border-emerald-400/60 flex items-center justify-center text-xs font-bold text-emerald-300">
                      {index + 1}
                    </span>
                  </div>

                  <div className="glass-card p-5 w-full">
                    <h3 className="font-display text-lg font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. HIGHLIGHTS + CTA
         ===================================================== */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-strong rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-40 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                  Prêt à digitaliser votre{' '}
                  <span className="text-gradient-emerald">logistique colis</span> ?
                </h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Rejoignez plus de 500 agences qui ont déjà fait confiance à QRTrans
                  pour sécuriser leurs envois et améliorer leur expérience client.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/devenir-partenaire"
                    className="btn-magnetic inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#060B1F] font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                  >
                    Devenir partenaire
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass text-white font-semibold hover:border-emerald-400/40 transition-all"
                  >
                    Nous contacter
                  </Link>
                </div>
              </div>
              <ul className="space-y-3">
                {HIGHLIGHTS.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
