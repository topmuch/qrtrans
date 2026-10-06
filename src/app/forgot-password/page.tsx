'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Always show success to prevent email enumeration
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Réinitialisation"
      title={sent ? 'Email envoyé' : 'Mot de passe oublié ?'}
      subtitle={sent ? 'Vérifiez votre boîte de réception' : 'Recevez un lien sécurisé pour réinitialiser votre mot de passe'}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {!sent ? (
          <>
            <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] flex items-center justify-center shadow-lg shadow-[#1E4B7A]/20">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.p variants={fadeUp} custom={1} className="text-sm text-[#5B7088] mb-6 text-center leading-relaxed">
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe en toute sécurité.
            </motion.p>

            <motion.form variants={stagger} onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={fadeUp} custom={2}>
                <label className="block text-sm font-semibold text-[#0F1B2E] mb-2">
                  Adresse email
                </label>
                <div className="relative rounded-2xl border-2 border-[#1E4B7A]/15 hover:border-[#1E4B7A]/30 focus-within:border-[#1E4B7A] focus-within:shadow-lg focus-within:shadow-[#1E4B7A]/10 transition-all bg-white/50">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5B7088]">
                    <Mail className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent text-[#0F1B2E] placeholder-[#5B7088]/60 focus:outline-none text-sm font-medium rounded-2xl"
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} custom={3}>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-brand btn-magnetic w-full text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-[15px]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le lien
                      <Send className="w-5 h-5" />
                    </>
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
              Email envoyé !
            </h3>
            <p className="text-sm text-[#5B7088] mb-8 leading-relaxed">
              Si un compte existe avec l&apos;adresse{' '}
              <span className="font-semibold text-[#1E4B7A]">{email}</span>,
              vous recevrez un email avec les instructions pour réinitialiser
              votre mot de passe.
            </p>
            <button
              onClick={() => setSent(false)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1E4B7A]/20 hover:border-[#1E4B7A]/40 hover:bg-[#1E4B7A]/5 text-[#1E4B7A] font-semibold text-sm transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              Renvoyer un autre email
            </button>
          </motion.div>
        )}
      </motion.div>
    </AuthShell>
  );
}
