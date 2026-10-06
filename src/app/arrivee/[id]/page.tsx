'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { QrCode, Loader2, CheckCircle, Package, AlertTriangle, Home } from 'lucide-react';
import ColisInfoCard from '@/components/arrival/ColisInfoCard';
import ContactsCard from '@/components/arrival/ContactsCard';
import ConfirmForm from '@/components/arrival/ConfirmForm';
import ArrivalSuccess from '@/components/arrival/ArrivalSuccess';
import Link from 'next/link';

// ═══════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════

interface ColisData {
  reference: string;
  status: string;
  transportType: string;
  company: string;
  arrivalCity: string;
  departureDate: string | null;
  departureTime: string | null;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
}

// ═══════════════════════════════════════════════════
//  MAIN CONTENT (uses useSearchParams → needs Suspense)
// ═══════════════════════════════════════════════════

function ArriveeContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const qrCode = ((params?.id as string) || '').toUpperCase().trim();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [loadingData, setLoadingData] = useState(true);
  const [colis, setColis] = useState<ColisData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [successData, setSuccessData] = useState<{
    deliveryLocation: string;
    arrivalDate: string;
    arrivalTime: string;
  } | null>(null);

  // Check if returning from /sending page with notification status
  const notifiedParam = searchParams.get('notified'); // 'sender' | 'receiver'
  const isReturningFromNotify = notifiedParam === 'sender' || notifiedParam === 'receiver';

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  // Fetch colis data on mount
  useEffect(() => {
    if (!qrCode) return;

    const fetchColis = async () => {
      try {
        setLoadingData(true);
        const res = await fetch(`/api/arrivee/${encodeURIComponent(qrCode)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setColis(data.colis);
        } else {
          setFetchError(data.message || t('Colis introuvable.', 'Package not found.'));
        }
      } catch {
        setFetchError(t('Erreur de connexion.', 'Connection error.'));
      } finally {
        setLoadingData(false);
      }
    };

    fetchColis();
  }, [qrCode]);

  const handleSuccess = (data: { deliveryLocation: string; arrivalDate: string; arrivalTime: string }) => {
    setConfirmed(true);
    setSuccessData(data);
  };

  // ─── Loading state ───
  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#060B1F]">
        <ArriveeHeader qrCode={qrCode} lang={lang} label={t("Confirmation d'Arrivée", 'Arrival Confirmation')} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-white/60">{t('Chargement...', 'Loading...')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Determine notified state ───
  // When returning from /sending after notifying sender, show ArrivalSuccess with sender done
  const notifiedState = isReturningFromNotify
    ? (notifiedParam as 'sender' | 'receiver')
    : 'none';

  return (
    <div className="min-h-screen bg-[#060B1F]">
      <ArriveeHeader qrCode={qrCode} lang={lang} label={t("Confirmation d'Arrivée", 'Arrival Confirmation')} />

      <main className="max-w-[600px] mx-auto px-4 py-6 pb-20">
        {/* ─── Error: not found ─── */}
        {fetchError && !colis && (
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{fetchError}</h2>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 h-11 bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#34D399] hover:to-[#6EE7B7] text-[#060B1F] rounded-xl font-semibold text-sm transition-colors no-underline shadow-lg shadow-emerald-500/20"
            >
              <Home className="w-4 h-4" />
              {t("Retour à l'accueil", 'Back to home')}
            </Link>
          </div>
        )}

        {/* ─── Success state (normal confirm flow) ─── */}
        {confirmed && colis && successData && (
          <ArrivalSuccess
            reference={qrCode}
            arrivalCity={colis.arrivalCity}
            deliveryLocation={successData.deliveryLocation}
            arrivalDate={successData.arrivalDate}
            arrivalTime={successData.arrivalTime}
            senderName={colis.senderName}
            senderPhone={colis.senderPhone}
            receiverName={colis.receiverName}
            receiverPhone={colis.receiverPhone}
            companyName={colis.company}
            lang={lang}
            notified="none"
          />
        )}

        {/* ─── Returning from /sending (partial notification done) ─── */}
        {isReturningFromNotify && colis && !confirmed && (
          <ArrivalSuccess
            reference={qrCode}
            arrivalCity={colis.arrivalCity}
            deliveryLocation="—"
            arrivalDate={new Date().toISOString()}
            arrivalTime=""
            senderName={colis.senderName}
            senderPhone={colis.senderPhone}
            receiverName={colis.receiverName}
            receiverPhone={colis.receiverPhone}
            companyName={colis.company}
            lang={lang}
            notified={notifiedState}
          />
        )}

        {/* ─── Normal state: show info + form ─── */}
        {colis && !confirmed && !isReturningFromNotify && (
          <div className="space-y-4">
            {/* Already delivered */}
            {colis.status === 'delivered' && (
              <div className="glass-card border border-amber-500/30 rounded-xl p-4 text-center animate-in fade-in">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-full mb-2">
                  <CheckCircle className="w-6 h-6 text-amber-300" />
                </div>
                <p className="text-sm font-semibold text-amber-100 mt-2">
                  {t('Ce colis a déjà été livré.', 'This package has already been delivered.')}
                </p>
                <Link
                  href={`/suivi/${qrCode}`}
                  className="inline-flex items-center justify-center gap-3 mt-4 px-8 h-14 bg-gradient-to-r from-[#10B981] to-[#34D399] hover:from-[#34D399] hover:to-[#6EE7B7] text-[#060B1F] rounded-xl text-lg font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30 no-underline w-full max-w-xs mx-auto"
                >
                  {t('Voir le suivi', 'View tracking')}
                </Link>
              </div>
            )}

            {/* CARTE 1: Infos colis */}
            <ColisInfoCard
              reference={colis.reference}
              company={colis.company}
              arrivalCity={colis.arrivalCity}
              departureDate={colis.departureDate}
              departureTime={colis.departureTime}
              transportType={colis.transportType}
              lang={lang}
            />

            {/* CARTE 2: Contacts */}
            <ContactsCard
              senderName={colis.senderName}
              senderPhone={colis.senderPhone}
              receiverName={colis.receiverName}
              receiverPhone={colis.receiverPhone}
              reference={colis.reference}
              lang={lang}
            />

            {/* CARTE 3: Formulaire confirmation */}
            {colis.status === 'in_transit' && (
              <ConfirmForm
                reference={qrCode}
                senderName={colis.senderName}
                senderPhone={colis.senderPhone}
                receiverName={colis.receiverName}
                receiverPhone={colis.receiverPhone}
                arrivalCity={colis.arrivalCity}
                onSuccess={handleSuccess}
                lang={lang}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  HEADER COMPONENT
// ═══════════════════════════════════════════════════

function ArriveeHeader({ qrCode, lang, label }: { qrCode: string; lang: 'fr' | 'en'; label: string }) {
  return (
    <header className="sticky top-0 z-50 bg-[#060B1F]/80 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
      <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#3B6BD9] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight block leading-tight text-white">
              QR<span className="text-gradient-emerald">Trans</span>
            </span>
            {qrCode && <span className="text-[10px] font-mono text-white/50 leading-tight">{qrCode}</span>}
          </div>
        </div>
        <span className="text-sm text-white/60 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-emerald-400" />
          {label}
        </span>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════
//  PAGE EXPORT (with Suspense for useSearchParams)
// ═══════════════════════════════════════════════════

export default function ArriveePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060B1F]">
          <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        </div>
      }
    >
      <ArriveeContent />
    </Suspense>
  );
}
