'use client';

import { useRef } from 'react';
import { QrCode, Smartphone, MessageCircle, Lock, Truck, MapPin, CheckCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import FadeIn from './FadeIn';

const steps = [
  {
    number: '01',
    title: 'Scan & Activation',
    icons: [QrCode, Smartphone],
    description:
      'Le chauffeur scanne le QR dormant, saisit itinéraire, expéditeur & destinataire.',
  },
  {
    number: '02',
    title: 'Notifications & PIN',
    icons: [MessageCircle, Lock],
    description:
      'Messages wa.me envoyés. Code PIN à 6 chiffres généré et transmis au destinataire.',
  },
  {
    number: '03',
    title: 'Transit & Suivi',
    icons: [Truck, MapPin],
    description:
      'Traçabilité en temps réel. Dashboard agence mis à jour automatiquement.',
  },
  {
    number: '04',
    title: 'Livraison Sécurisée',
    icons: [CheckCircle],
    description:
      'Validation par PIN, preuve de remise, clôture du trajet. Archivage conforme.',
  },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="process"
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
      style={{ background: '#0A2540' }}
    >
      <div className="max-w-6xl mx-auto" ref={sectionRef}>
        {/* Section title */}
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Un processus logistique éprouvé,
            <br className="hidden sm:block" />
            de l&apos;activation à la livraison
          </h2>
        </FadeIn>

        {/* Desktop horizontal timeline */}
        <div className="hidden lg:block relative">
          {/* Animated connecting line */}
          <div className="absolute top-[2.5rem] left-[12.5%] right-[12.5%] h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF6B35] to-[#10B981] rounded-full"
              initial={{ width: '0%' }}
              animate={isInView ? { width: '100%' } : { width: '0%' }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </div>

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.1}>
                <div className="relative text-center">
                  {/* Circle */}
                  <motion.div
                    className="w-20 h-20 bg-[#1A3A52] border-2 border-[#FF6B35]/40 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3 + i * 0.15,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    {step.icons.map((Icon, idx) => (
                      <Icon key={idx} className="w-6 h-6 text-white" />
                    ))}
                  </motion.div>

                  <span className="inline-block px-3 py-1 bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-bold rounded-full mb-3">
                    {step.number}
                  </span>

                  <h3 className="text-lg font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed max-w-[220px] mx-auto">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="lg:hidden relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="w-full bg-gradient-to-b from-[#FF6B35] to-[#10B981] rounded-full"
              initial={{ height: '0%' }}
              animate={isInView ? { height: '100%' } : { height: '0%' }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </div>

          <div className="space-y-10">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.1}>
                <div className="relative flex gap-6">
                  <motion.div
                    className="w-12 h-12 bg-[#1A3A52] border-2 border-[#FF6B35]/40 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.3 + i * 0.15,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    {step.icons.map((Icon, idx) => (
                      <Icon key={idx} className="w-5 h-5 text-white" />
                    ))}
                  </motion.div>

                  <div className="pt-1">
                    <span className="inline-block px-3 py-1 bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-bold rounded-full mb-2">
                      {step.number}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">
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
