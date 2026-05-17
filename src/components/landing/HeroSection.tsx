'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, Truck, Building2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeIn from './FadeIn';

export default function HeroSection() {
  const router = useRouter();
  const [refValue, setRefValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  const pattern = useMemo(() => /^[A-Z]{2,4}\d{2}-[A-Z0-9]{4,8}$/, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setRefValue(val);
    setIsValid(pattern.test(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) router.push(`/activate/${refValue}`);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}
    >
      {/* Subtle decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-[#FF6B35]/[0.03] blur-3xl" />
        <div className="absolute bottom-[15%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#10B981]/[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — Text content */}
          <motion.div
            className="text-center lg:text-left"
            style={{ opacity: heroOpacity, y: heroY }}
          >
            {/* Badge */}
            <FadeIn>
              <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-full shadow-[0_4px_24px_rgba(10,37,64,0.06)]">
                <span className="text-sm font-medium text-[#475569] tracking-wide">
                  🇸🇳 Solution de traçabilité certifiée pour le transport inter-villes
                </span>
              </div>
            </FadeIn>

            {/* H1 */}
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0A2540] mb-6 leading-[1.08] tracking-tight">
                La fiabilité logistique,
                <br />
                augmentée par la technologie{' '}
                <span className="text-[#FF6B35]">QR</span>
              </h1>
            </FadeIn>

            {/* Subtitle */}
            <FadeIn delay={0.2}>
              <p className="text-lg sm:text-xl text-[#475569] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Activez, tracez et sécurisez vos colis entre villes. Notifications
                WhatsApp automatiques, code PIN de retrait, suivi GPS en temps réel.
              </p>
            </FadeIn>

            {/* Tracking bar */}
            <FadeIn delay={0.3}>
              <form onSubmit={handleSubmit} className="mt-10 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center bg-white rounded-xl border-2 border-[#E2E8F0] shadow-[0_4px_24px_rgba(10,37,64,0.06)] focus-within:border-[#FF6B35]/40 focus-within:shadow-[0_4px_24px_rgba(10,37,64,0.1)] transition-all duration-300 overflow-hidden">
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-4 w-5 h-5 text-[#475569]/50" />
                    <input
                      type="text"
                      value={refValue}
                      onChange={handleChange}
                      placeholder="Entrez votre référence colis (ex: TRSP-2026-0042)"
                      className="w-full pl-12 pr-4 py-4 text-sm font-medium bg-transparent text-[#0A2540] placeholder:text-[#475569]/50 focus:outline-none"
                      maxLength={16}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isValid}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all duration-300 ${
                      isValid
                        ? 'bg-[#FF6B35] hover:bg-[#e65a28] text-white'
                        : 'bg-[#F8FAFC] text-[#475569]/40 cursor-not-allowed'
                    }`}
                  >
                    Suivre le trajet
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </FadeIn>

            {/* Dual CTA */}
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/inscrire">
                    <Button className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#e65a28] text-white px-7 py-3.5 rounded-lg font-semibold text-sm shadow-[0_4px_12px_rgba(255,107,53,0.25)] hover:shadow-[0_4px_16px_rgba(255,107,53,0.35)] transition-all gap-2">
                      <Truck className="w-4 h-4" />
                      Espace Chauffeur
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/agence/connexion">
                    <Button className="w-full sm:w-auto bg-transparent border-2 border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540]/5 px-7 py-3.5 rounded-lg font-semibold text-sm transition-all gap-2">
                      <Building2 className="w-4 h-4" />
                      Espace Agence
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </FadeIn>

            {/* Trust row */}
            <FadeIn delay={0.5}>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 mt-12">
                {[
                  '✅ 10 000+ colis tracés',
                  '✅ 500+ chauffeurs certifiés',
                  '✅ 98% de livraisons sans incident',
                ].map((badge) => (
                  <span
                    key={badge}
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#475569]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </FadeIn>
          </motion.div>

          {/* Right — Hero image */}
          <FadeIn direction="right" delay={0.2} className="relative">
            <div className="relative">
              {/* Decorative glow behind image */}
              <div className="absolute -inset-4 bg-gradient-to-br from-[#FF6B35]/10 via-[#10B981]/10 to-[#3B82F6]/10 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(10,37,64,0.12)] border border-[#E2E8F0]/50">
                <Image
                  src="/images/hero-qrcode.png"
                  alt="Chauffeur QRTrans scannant un QR code sur une valise avant remise au destinataire"
                  width={1344}
                  height={768}
                  priority
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
