'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, RefreshCw, Mail, AlertCircle, Send } from 'lucide-react';
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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (token) {
      verifyWithToken(token);
    } else {
      setStatus('error');
      setMessage('Aucun token de vérification fourni. Utilisez le formulaire ci-dessous.');
    }
  }, [token]);

  const verifyWithToken = async (token: string) => {
    setStatus('loading');
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Votre email a été vérifié avec succès !');
      } else {
        setStatus('error');
        setMessage(data.error || 'Erreur lors de la vérification');
      }
    } catch {
      setStatus('error');
      setMessage('Erreur de connexion');
    }
  };

  const verifyWithCode = async () => {
    if (!code || !email) return;

    setVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Votre email a été vérifié avec succès !');
      } else {
        setMessage(data.error || 'Code invalide');
      }
    } catch {
      setMessage('Erreur de connexion');
    } finally {
      setVerifying(false);
    }
  };

  const resendVerification = async () => {
    if (!email) return;

    setVerifying(true);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setMessage('Si un compte existe, un nouveau code a été envoyé');
    } catch {
      setMessage('Erreur lors de l\'envoi');
    } finally {
      setVerifying(false);
    }
  };

  // Determine the card content based on status
  let cardTitle = 'Vérification de l\'email';
  let cardSubtitle = 'Confirmez votre adresse email pour activer votre compte';

  if (status === 'success') {
    cardTitle = 'Email vérifié';
    cardSubtitle = 'Votre compte est maintenant actif';
  } else if (status === 'error' && token) {
    cardTitle = 'Lien invalide';
    cardSubtitle = 'Le lien de vérification a expiré ou est invalide';
  } else if (status === 'loading') {
    cardSubtitle = 'Vérification en cours...';
  }

  return (
    <AuthShell
      eyebrow="Vérification"
      title={cardTitle}
      subtitle={cardSubtitle}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Loading state */}
        {status === 'loading' && token && (
          <motion.div variants={fadeUp} custom={0} className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E4B7A]/10 to-[#487AA8]/10 border border-[#1E4B7A]/20 flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-[#1E4B7A] animate-spin" />
              </div>
            </div>
            <p className="text-sm text-[#5B7088]">Vérification de votre email...</p>
          </motion.div>
        )}

        {/* Success state */}
        {status === 'success' && (
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
            <p className="text-sm text-[#5B7088] mb-8 leading-relaxed">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="btn-brand btn-magnetic w-full text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2.5 text-[15px]"
            >
              Se connecter
              <Send className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Code verification form (when no token OR token failed) */}
        {status !== 'success' && (!token || status === 'error') && (
          <>
            {status === 'error' && token && (
              <motion.div
                variants={fadeUp}
                custom={0}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{message}</span>
              </motion.div>
            )}

            <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E4B7A] to-[#487AA8] flex items-center justify-center shadow-lg shadow-[#1E4B7A]/20">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.p variants={fadeUp} custom={1} className="text-sm text-[#5B7088] mb-6 text-center leading-relaxed">
              Entrez votre email et le code à 6 chiffres reçu par email.
            </motion.p>

            <motion.div variants={stagger} className="space-y-5">
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
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent text-[#0F1B2E] placeholder-[#5B7088]/60 focus:outline-none text-sm font-medium rounded-2xl"
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} custom={3}>
                <label className="block text-sm font-semibold text-[#0F1B2E] mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3.5 border-2 border-[#1E4B7A]/15 hover:border-[#1E4B7A]/30 focus:border-[#1E4B7A] focus:shadow-lg focus:shadow-[#1E4B7A]/10 bg-white/50 rounded-2xl text-center text-2xl tracking-[0.5em] font-mono font-bold text-[#1E4B7A] focus:outline-none transition-all"
                  maxLength={6}
                />
              </motion.div>

              <motion.div variants={fadeUp} custom={4}>
                <button
                  onClick={verifyWithCode}
                  disabled={verifying || code.length !== 6 || !email}
                  className="btn-brand btn-magnetic w-full text-white font-bold py-4 px-4 rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-[15px]"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    'Vérifier'
                  )}
                </button>
              </motion.div>

              {message && (
                <motion.p variants={fadeUp} custom={5} className="text-center text-red-500 text-sm">
                  {message}
                </motion.p>
              )}

              <motion.button
                variants={fadeUp}
                custom={6}
                onClick={resendVerification}
                disabled={verifying || !email}
                className="w-full py-3 text-[#1E4B7A] font-semibold hover:underline transition-colors disabled:opacity-50"
              >
                Renvoyer le code
              </motion.button>
            </motion.div>
          </>
        )}
      </motion.div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFCFE] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[#1E4B7A] animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
