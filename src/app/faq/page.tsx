'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  MessageCircleQuestion,
  ArrowRight,
} from 'lucide-react';
import SiteLayout from '@/components/site/SiteLayout';
import AuroraBackground from '@/components/site/AuroraBackground';

/* ---------------------------------------------------------------
   Static content
---------------------------------------------------------------- */

interface FAQ {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ElementType;
  description: string;
  questions: FAQ[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    title: 'Général',
    icon: HelpCircle,
    description: 'Les bases de QRTrans et de notre offre.',
    questions: [
      {
        question: "Qu'est-ce que QRTrans ?",
        answer:
          "QRTrans est une plateforme de traçabilité et de sécurité logistique pour le transport inter-villes au Sénégal. Elle permet d'activer, tracer et sécuriser les colis grâce à des QR codes, des notifications WhatsApp automatiques et des codes PIN de retrait.",
      },
      {
        question: 'Comment fonctionne QRTrans ?',
        answer:
          "Le chauffeur scanne le QR code du colis, active l'expédition via un formulaire digital, un code PIN est généré et envoyé au destinataire par WhatsApp. À l'arrivée, le destinataire saisit le PIN pour récupérer son colis.",
      },
      {
        question: 'QRTrans est-il gratuit ?',
        answer:
          "L'inscription est gratuite pour les agences. Les tarifs dépendent du volume de colis et du forfait choisi. Contactez-nous pour un devis personnalisé.",
      },
    ],
  },
  {
    title: 'Utilisation',
    icon: Smartphone,
    description: 'Tout ce qu’il faut savoir pour activer et suivre vos colis.',
    questions: [
      {
        question: 'Comment activer un colis ?',
        answer:
          "Scannez le QR code avec votre smartphone ou saisissez la référence sur le site QRTrans. Remplissez le formulaire d'activation (expéditeur, destinataire, itinéraire) et validez.",
      },
      {
        question: "Que faire si je n'ai pas de réseau ?",
        answer:
          "QRTrans dispose d'un mode hors-ligne. Activez et scannez vos colis sans connexion internet. La synchronisation se fait automatiquement dès que le réseau revient.",
      },
      {
        question: 'Comment suivre mon colis ?',
        answer:
          "Entrez votre référence colis (ex: VOL26-WRQZNE) dans la barre de recherche de la page d'accueil. Vous verrez le statut en temps réel et l'historique des scans.",
      },
    ],
  },
  {
    title: 'Sécurité',
    icon: ShieldCheck,
    description: 'Comment nous protégeons vos colis et vos données.',
    questions: [
      {
        question: 'Comment fonctionne le code PIN ?',
        answer:
          "Un code PIN à 6 chiffres est automatiquement généré lors de l'activation. Il est envoyé au destinataire par WhatsApp. Ce code est obligatoire pour la remise du colis.",
      },
      {
        question: 'Mes données sont-elles protégées ?',
        answer:
          'Oui, toutes les données sont chiffrées de bout en bout et hébergées de manière sécurisée en France. QRTrans est entièrement conforme au RGPD.',
      },
    ],
  },
];

/* ---------------------------------------------------------------
   Accordion item
---------------------------------------------------------------- */

function FAQItem({ question, answer }: FAQ) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`glass-card-light overflow-hidden transition-all ${
        isOpen ? 'border-[#1E4B7A]/40' : ''
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-base sm:text-lg text-[#0F1B2E] leading-snug">
          {question}
        </span>
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            isOpen
              ? 'bg-[#1E4B7A]/15 border border-[#1E4B7A]/40 rotate-180'
              : 'bg-[#1E4B7A]/5 border border-[#1E4B7A]/15'
          }`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-colors ${
              isOpen ? 'text-[#1E4B7A]' : 'text-[#5B7088]'
            }`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="border-t border-[#1E4B7A]/10 pt-4">
            <p className="text-[#5B7088] leading-relaxed text-sm sm:text-base">
              {answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Page
---------------------------------------------------------------- */

export default function FAQPage() {
  const totalQuestions = FAQ_CATEGORIES.reduce(
    (acc, c) => acc + c.questions.length,
    0,
  );

  return (
    <SiteLayout theme="light" hasDarkHero>
      {/* =====================================================
          1. HERO
         ===================================================== */}
      <section className="relative overflow-hidden bg-light-hero pt-36 pb-20 lg:pt-44 lg:pb-24">
        <AuroraBackground theme="light" />
        <div className="absolute inset-0 bg-grid-light bg-grid-fade-light opacity-60 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full glass-light">
              <MessageCircleQuestion className="w-4 h-4 text-[#1E4B7A]" />
              <span className="text-xs sm:text-sm font-medium text-[#1E4B7A] tracking-wide">
                FAQ
              </span>
            </div>

            <h1 className="reveal-up font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#0F1B2E]">
              Questions{' '}
              <span className="text-gradient-blue">fréquentes</span>
            </h1>

            <p className="reveal-up mt-6 text-lg sm:text-xl text-[#5B7088] max-w-2xl mx-auto leading-relaxed">
              Trouvez rapidement les réponses à vos questions sur QRTrans, son
              fonctionnement, son utilisation et sa sécurité.
            </p>

            <div className="reveal-up mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-[#1E4B7A]">
                <HelpCircle className="w-4 h-4 text-[#1E4B7A]" />
                <span>
                  <strong className="text-[#0F1B2E]">{totalQuestions}</strong> questions
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-[#1E4B7A]">
                <MessageCircleQuestion className="w-4 h-4 text-[#1E4B7A]" />
                <span>
                  <strong className="text-[#0F1B2E]">{FAQ_CATEGORIES.length}</strong> catégories
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. FAQ CATEGORIES
         ===================================================== */}
      <section className="relative py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {FAQ_CATEGORIES.map((category, catIdx) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.title} className="reveal-up" style={{ transitionDelay: `${catIdx * 60}ms` }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E4B7A]/15 to-[#487AA8]/5 border border-[#1E4B7A]/25 flex items-center justify-center">
                    <CategoryIcon className="w-6 h-6 text-[#1E4B7A]" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0F1B2E]">
                      {category.title}
                    </h2>
                    <p className="text-sm text-[#5B7088]">{category.description}</p>
                  </div>
                  <span className="ml-auto hidden sm:inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold text-[#1E4B7A] bg-[#1E4B7A]/10 border border-[#1E4B7A]/25">
                    {category.questions.length} Q
                  </span>
                </div>

                <div className="space-y-3">
                  {category.questions.map((faq) => (
                    <FAQItem
                      key={faq.question}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          3. CTA BANNER
         ===================================================== */}
      <section className="relative py-16 lg:py-24 section-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-light-strong rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-50 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(30, 75, 122, 0.20), transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E4B7A]/10 border border-[#1E4B7A]/25 mb-5">
                <HelpCircle className="w-7 h-7 text-[#1E4B7A]" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0F1B2E] mb-4 leading-tight">
                Vous n&apos;avez pas trouvé votre{' '}
                <span className="text-gradient-blue">réponse</span> ?
              </h3>
              <p className="text-[#5B7088] mb-8 max-w-xl mx-auto leading-relaxed">
                Notre équipe est disponible pour répondre à toutes vos questions et vous
                accompagner dans l&apos;utilisation de QRTrans.
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
