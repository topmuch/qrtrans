'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';

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

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!token) {
      setError('Token manquant — utilisez le lien reçu par email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error || 'Erreur lors de la réinitialisation');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Réinitialisation"
      title={success ? 'Mot de passe réinitialisé' : 'Nouveau mot de passe'}
      subtitle={success ? 'Redirection en cours...' : 'Définissez un nouveau mot de passe sécurisé'}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {!success ? (
          <>
            <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] flex items-center justify-center shadow-lg shadow-[#1E4B7A]/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.p variants={fadeUp} custom={1} className="text-sm text-[#5B7088] mb-6 text-center leading-relaxed">
              Choisissez un mot de passe d&apos;au moins 6 caractères pour sécuriser votre compte.
            </motion.p>

            <motion.form variants={stagger} onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={fadeUp} custom={2}>
                <label className="block text-sm font-semibold text-[#0F1B2E] mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative rounded-2xl border-2 border-[#1E4B7A]/15 hover:border-[#1E4B7A]/30 focus-within:border-[#1E4B7A] focus-within:shadow-lg focus-within:shadow-[#1E4B7A]/10 transition-all bg-white/50">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B7088]">
                    <Lock className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3.5 bg-transparent text-[#0F1B2E] placeholder-[#5B7088]/60 focus:outline-none text-sm font-medium rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B7088] hover:text-[#1E4B7A] transition-colors p-1"
                    tabIndex={-1}
                    aria-label="Afficher/masquer le mot de passe"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} custom={3}>
                <label className="block text-sm font-semibold text-[#0F1B2E] mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative rounded-2xl border-2 border-[#1E4B7A]/15 hover:border-[#1E4B7A]/30 focus-within:border-[#1E4B7A] focus-within:shadow-lg focus-within:shadow-[#1E4B7A]/10 transition-all bg-white/50">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B7088]">
                    <Shield className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent text-[#0F1B2E] placeholder-[#5B7088]/60 focus:outline-none text-sm font-medium rounded-2xl"
                  />
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}

              <motion.div variants={fadeUp} custom={4}>
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="btn-brand btn-magnetic w-full text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-[15px]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    'Réinitialiser le mot de passe'
                  )}
                </button>
              </motion.div>
            </motion.form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center py-4"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
            <h3 className="font-display text-2xl font-bold text-[#0F1B2E] mb-3 tracking-tight">
              Succès !
            </h3>
            <p className="text-sm text-[#5B7088] mb-8 leading-relaxed">
              Votre mot de passe a été modifié avec succès. Vous allez être
              redirigé vers la page de connexion dans un instant.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#5B7088]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Redirection en cours...
            </div>
          </motion.div>
        )}
      </motion.div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFCFE] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[#1E4B7A] animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
