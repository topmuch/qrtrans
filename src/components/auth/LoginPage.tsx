'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Loader2, Shield, Building2, ArrowRight,
  Lock, Mail, Zap, CheckCircle, QrCode, Globe, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthShell from './AuthShell';

/* ══════════════════════════════════════════════
   CONFIG PER VARIANT
   ══════════════════════════════════════════════ */
type LoginVariant = 'agence' | 'superadmin';

interface LoginConfig {
  type: LoginVariant;
  title: string;
  subtitle: string;
  demoEmail: string;
  demoPassword: string;
  demoLabel: string;
  role: string;
  redirectPath: string;
  badgeLabel: string;
  badgeIcon: typeof Building2;
  leftTitle: string;
  leftSubtitle: string;
  leftTagline: string;
  switchText: string;
  switchLink: string;
  switchHref: string;
  features: { icon: typeof QrCode; title: string; desc: string }[];
}

const CONFIGS: Record<LoginVariant, LoginConfig> = {
  agence: {
    type: 'agence',
    title: 'Espace Agence',
    subtitle: 'Connectez-vous à votre espace professionnel',
    demoEmail: 'agence@qrtrans.com',
    demoPassword: 'agence123',
    demoLabel: 'Agence',
    role: 'agency',
    redirectPath: '/agence/tableau-de-bord',
    badgeLabel: 'Espace Agence',
    badgeIcon: Building2,
    leftTitle: 'QRTrans pour les professionnels du voyage',
    leftSubtitle: 'Gérez vos colis, vos clients, vos QR codes — depuis un seul tableau de bord premium.',
    leftTagline: 'Conçu pour la performance',
    switchText: 'Vous êtes administrateur ?',
    switchLink: 'Connexion Admin',
    switchHref: '/admin/connexion',
    features: [
      { icon: CheckCircle, title: 'Scan temps réel', desc: 'Suivez chaque colis instantanément' },
      { icon: QrCode, title: 'QR en 1 clic', desc: 'Générez des lots en 30 secondes' },
      { icon: Building2, title: 'Dashboard pro', desc: 'Statuts, trouvailles, rapports' },
      { icon: Shield, title: 'Support 24/7', desc: 'Assistance dédiée aux agences' },
    ],
  },
  superadmin: {
    type: 'superadmin',
    title: 'Espace Administrateur',
    subtitle: 'Accès réservé aux administrateurs système',
    demoEmail: 'admin@qrtrans.com',
    demoPassword: 'admin123',
    demoLabel: 'SuperAdmin',
    role: 'superadmin',
    redirectPath: '/admin/tableau-de-bord',
    badgeLabel: 'Espace Administrateur',
    badgeIcon: Shield,
    leftTitle: 'QRTrans — Contrôle centralisé',
    leftSubtitle: 'Gérez agences, QR codes, utilisateurs et API — tout depuis un seul panneau.',
    leftTagline: 'Sécurité & Performance',
    switchText: 'Vous êtes une agence ?',
    switchLink: 'Connexion Agence',
    switchHref: '/agence/connexion',
    features: [
      { icon: Shield, title: 'Sécurité renforcée', desc: 'Authentification stricte, logs complets' },
      { icon: Globe, title: 'Panneau centralisé', desc: 'Suivi en temps réel global' },
      { icon: Zap, title: 'API intégrées', desc: 'Green API, géoloc, PDF à la demande' },
      { icon: CheckCircle, title: 'Rôles avancés', desc: 'Agences, admins, agents — contrôlés' },
    ],
  },
};

/* ══════════════════════════════════════════════
   ANIMATION VARIANTS
   ══════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ══════════════════════════════════════════════
   LOGIN PAGE COMPONENT
   ══════════════════════════════════════════════ */
export default function LoginPage({ variant }: { variant: LoginVariant }) {
  const config = CONFIGS[variant];
  const router = useRouter();
  const { user, login, loading: authLoading, isAgency, isSuperAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user && ((variant === 'agence' && isAgency) || (variant === 'superadmin' && isSuperAdmin))) {
      router.replace(config.redirectPath);
    }
  }, [user, authLoading, isAgency, isSuperAdmin, variant, router, config.redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: config.role }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.user);
        router.push(config.redirectPath);
      } else {
        setError(data.error || 'Identifiants incorrects');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(config.demoEmail);
    setPassword(config.demoPassword);
  };

  const BadgeIcon = config.badgeIcon;

  // Side panel content (left side of split layout)
  const sidePanel = (
    <motion.div
      className="h-full flex flex-col"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Logo */}
      <motion.div variants={fadeUp} custom={0}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 group-hover:bg-white/15 transition-colors shadow-lg shadow-black/20">
            <Image
              src="/brand/logo.png"
              alt="QRTrans"
              width={140}
              height={42}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
        </Link>
      </motion.div>

      <div className="flex-1" />

      {/* Bottom content */}
      <div>
        {/* Badge */}
        <motion.div variants={fadeUp} custom={1} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-xl border border-[#6BA3D6]/30 bg-[#6BA3D6]/10 text-[#B5D3EA]">
            <BadgeIcon className="w-3.5 h-3.5" />
            {config.badgeLabel}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2 variants={fadeUp} custom={2} className="font-display text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight max-w-xl tracking-tight">
          {config.leftTitle}
        </motion.h2>
        <motion.p variants={fadeUp} custom={3} className="text-white/70 text-base xl:text-lg leading-relaxed max-w-md mb-8">
          {config.leftSubtitle}
        </motion.p>

        {/* Features */}
        <motion.div variants={fadeUp} custom={4} className="grid grid-cols-2 gap-3 max-w-lg">
          {config.features.map((feat) => (
            <div
              key={feat.title}
              className="bg-white/[0.06] backdrop-blur-md rounded-2xl px-5 py-4 border border-white/[0.08] hover:bg-white/[0.10] hover:border-[#6BA3D6]/30 transition-all duration-300 group"
            >
              <feat.icon className="w-5 h-5 mb-2 text-[#6BA3D6] group-hover:text-[#89BDE0] transition-colors" />
              <p className="text-white text-sm font-bold leading-tight">{feat.title}</p>
              <p className="text-white/50 text-xs mt-1 leading-snug">{feat.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.div variants={fadeUp} custom={5} className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-white/40 font-semibold tracking-widest uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {config.leftTagline}
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <AuthShell
      sidePanel={sidePanel}
      eyebrow={config.badgeLabel}
      title={config.title}
      subtitle={config.subtitle}
      backHref="/"
      backLabel="Retour à l'accueil"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="space-y-6"
      >
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-red-600" />
            </div>
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <motion.form variants={stagger} onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <motion.div variants={fadeUp} custom={0}>
            <label className="block text-sm font-semibold text-[#0F1B2E] mb-2">
              Adresse email
            </label>
            <div className={`relative rounded-2xl border-2 transition-all duration-300 ${
              focusedField === 'email'
                ? 'border-[#1E4B7A] shadow-lg shadow-[#1E4B7A]/10 bg-white'
                : 'border-[#1E4B7A]/15 hover:border-[#1E4B7A]/30 bg-white/50'
            }`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B7088]">
                <Mail className="w-[18px] h-[18px]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full pl-11 pr-4 py-3.5 bg-transparent text-[#0F1B2E] placeholder-[#5B7088]/60 focus:outline-none text-sm font-medium rounded-2xl"
                placeholder={variant === 'agence' ? 'vous@agence.com' : 'admin@qrtrans.com'}
                required
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={fadeUp} custom={1}>
            <label className="block text-sm font-semibold text-[#0F1B2E] mb-2">
              Mot de passe
            </label>
            <div className={`relative rounded-2xl border-2 transition-all duration-300 ${
              focusedField === 'password'
                ? 'border-[#1E4B7A] shadow-lg shadow-[#1E4B7A]/10 bg-white'
                : 'border-[#1E4B7A]/15 hover:border-[#1E4B7A]/30 bg-white/50'
            }`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B7088]">
                <Lock className="w-[18px] h-[18px]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full pl-11 pr-12 py-3.5 bg-transparent text-[#0F1B2E] placeholder-[#5B7088]/60 focus:outline-none text-sm font-medium rounded-2xl"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B7088] hover:text-[#1E4B7A] transition-colors p-1 rounded-lg hover:bg-[#1E4B7A]/5"
                tabIndex={-1}
                aria-label="Afficher/masquer le mot de passe"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {/* Remember / Forgot */}
          <motion.div variants={fadeUp} custom={2} className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer gap-2.5 group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer h-4 w-4 rounded border-2 border-[#1E4B7A]/30 appearance-none cursor-pointer checked:border-[#1E4B7A] checked:bg-[#1E4B7A] transition-colors"
                />
                <svg className="absolute left-0.5 top-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-[#5B7088] group-hover:text-[#0F1B2E] transition-colors">Se souvenir de moi</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#1E4B7A] hover:underline transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </motion.div>

          {/* Submit */}
          <motion.div variants={fadeUp} custom={3}>
            <button
              type="submit"
              disabled={loading}
              className="btn-brand btn-magnetic w-full text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-[15px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        </motion.form>

        {/* Demo Account */}
        <motion.div
          variants={fadeUp}
          custom={4}
          className="p-4 bg-[#1E4B7A]/[0.04] rounded-2xl border border-[#1E4B7A]/10"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#1E4B7A]/70 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Compte démo
            </h3>
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs font-bold text-[#1E4B7A] hover:underline transition-colors flex items-center gap-1"
            >
              Auto-remplir
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1E4B7A]/10 text-[#1E4B7A] border border-[#1E4B7A]/20">
              {config.demoLabel}
            </span>
            <span className="text-xs text-[#5B7088] font-mono">
              {config.demoEmail} / {config.demoPassword}
            </span>
          </div>
        </motion.div>

        {/* Switch variant */}
        <motion.div variants={fadeUp} custom={5} className="text-center pt-2">
          <p className="text-sm text-[#5B7088]">
            {config.switchText}{' '}
            <Link
              href={config.switchHref}
              className="font-bold text-[#1E4B7A] hover:underline transition-colors"
            >
              {config.switchLink} →
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
}
