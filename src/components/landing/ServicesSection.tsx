'use client';

import FadeIn from './FadeIn';

const services = [
  {
    emoji: '📱',
    title: 'Activation QR Express',
    description:
      'Scan, formulaire digital, mise en route en 30s. Zéro papier.',
  },
  {
    emoji: '💬',
    title: 'Notifications WhatsApp Automatisées',
    description:
      "Expéditeur & destinataire informés à chaque étape via wa.me.",
  },
  {
    emoji: '🔐',
    title: 'Code PIN de Retrait Sécurisé',
    description:
      'Validation à 6 chiffres exigée à la livraison. Anti-fraude intégrée.',
  },
  {
    emoji: '📍',
    title: 'Suivi GPS & Géolocalisation',
    description:
      'Position du colis en temps réel. Historique des scans horodatés.',
  },
  {
    emoji: '📊',
    title: 'Dashboard Agence Temps Réel',
    description:
      'Flotte, chauffeurs, statuts, export CSV. Pilotage complet.',
  },
  {
    emoji: '📴',
    title: 'Mode Hors-Ligne Intelligent',
    description:
      'Activation & scan possibles sans réseau. Synchronisation automatique.',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="bg-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section title */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A2540] mb-5 tracking-tight leading-tight">
            Solutions de traçabilité &amp; sécurité logistique
          </h2>
        </FadeIn>

        {/* 3x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, i) => (
            <FadeIn key={service.title} delay={i * 0.08}>
              <div className="group h-full bg-white border border-[#E2E8F0] rounded-xl p-7 lg:p-8 shadow-[0_4px_24px_rgba(10,37,64,0.04)] hover:translate-y-[-4px] hover:shadow-[0_8px_32px_rgba(10,37,64,0.1)] transition-all duration-300">
                <span className="text-3xl mb-5 block">{service.emoji}</span>
                <h3 className="text-lg font-bold text-[#0A2540] mb-3 leading-snug">
                  {service.title}
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  {service.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
