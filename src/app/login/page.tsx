'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Building2, Shield, ArrowRight, Loader2, Sparkles } from 'lucide-react';

/* ══════════════════════════════════════════════
   REDIRECT — preserves the old behavior (?role=admin redirects to /admin/connexion)
   ══════════════════════════════════════════════ */
function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'agency';

  useEffect(() => {
    if (role === 'admin') {
      router.replace('/admin/connexion');
    } else {
      router.replace('/agence/connexion');
    }
  }, [router, role]);

  return (
    <div className="min-h-screen bg-[#FBFCFE] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-[#1E4B7A] animate-spin" />
        <span className="text-[#5B7088]">Redirection...</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CHOICE PAGE — beautiful role selector
   ══════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const ROLES = [
  {
    id: 'agence' as const,
    href: '/agence/connexion',
    icon: Building2,
    title: 'Espace Agence',
    description: 'Pour les transporteurs et agences de voyage',
    features: ['Gestion des colis', 'QR codes en 1 clic', 'Dashboard temps réel', 'Notifications WhatsApp'],
    accent: 'from-[#1E4B7A] to-[#487AA8]',
  },
  {
    id: 'superadmin' as const,
    href: '/admin/connexion',
    icon: Shield,
    title: 'Espace Administrateur',
    description: 'Pour les administrateurs système QRTrans',
    features: ['Contrôle centralisé', 'Gestion des agences', 'Logs & sécurité', 'API & intégrations'],
    accent: 'from-[#0F2D52] to-[#1E4B7A]',
  },
];

function LoginChoice() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FBFCFE] flex items-center justify-center px-4 py-12">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-light opacity-[0.5]" />
      {/* Aurora blobs */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(72, 122, 168, 0.4), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent 70%)' }}
      />

      <motion.div
        className="relative z-10 w-full max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Logo */}
        <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/brand/logo.png"
              alt="QRTrans"
              width={240}
              height={71}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
        </motion.div>

        {/* Heading */}
        <motion.div variants={fadeUp} custom={1} className="text-center mb-12">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-[#1E4B7A] mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Bienvenue sur QRTrans
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F1B2E] tracking-tight leading-[1.05]">
            Choisissez votre espace.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#5B7088] max-w-2xl mx-auto leading-relaxed">
            Sélectionnez le type de connexion adapté à votre profil pour accéder
            à votre tableau de bord.
          </p>
        </motion.div>

        {/* Role cards */}
        <motion.div variants={fadeUp} custom={2} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {ROLES.map((role) => (
            <motion.div key={role.id} variants={fadeUp} custom={3}>
              <Link
                href={role.href}
                className="group block glass-light-strong rounded-3xl p-8 border border-[#1E4B7A]/15 hover:border-[#1E4B7A]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#1E4B7A]/15 hover:-translate-y-1"
              >
                {/* Icon tile */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.accent} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl font-bold text-[#0F1B2E] mb-2 tracking-tight">
                  {role.title}
                </h3>
                <p className="text-sm text-[#5B7088] mb-6 leading-relaxed">
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 mb-8">
                  {role.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-[#0F1B2E]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#1E4B7A] to-[#487AA8]" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1E4B7A]/10">
                  <span className="text-sm font-bold text-[#1E4B7A] group-hover:text-[#0F2D52] transition-colors">
                    Se connecter
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#1E4B7A]/10 group-hover:bg-[#1E4B7A] flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-[#1E4B7A] group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div variants={fadeUp} custom={4} className="mt-12 text-center">
          <p className="text-xs text-[#5B7088]">
            © {new Date().getFullYear()} QRTrans — Tous droits réservés
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  // Use Suspense for useSearchParams compatibility
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FBFCFE] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1E4B7A] animate-spin" />
      </div>
    );
  }

  return (
    <Suspense fallback={<LoginRedirect />}>
      <LoginChoice />
    </Suspense>
  );
}
