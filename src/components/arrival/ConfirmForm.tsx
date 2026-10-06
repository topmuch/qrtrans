'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, AlertTriangle, Target } from 'lucide-react';

interface ConfirmFormProps {
  reference: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  arrivalCity: string;
  onSuccess: (data: { deliveryLocation: string; arrivalDate: string; arrivalTime: string }) => void;
  lang: 'fr' | 'en';
}

export default function ConfirmForm({
  reference, senderName, senderPhone, receiverName, receiverPhone, arrivalCity, onSuccess, lang,
}: ConfirmFormProps) {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  // Default: today + now
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const nowTime = now.toTimeString().slice(0, 5);

  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [arrivalDate, setArrivalDate] = useState(todayStr);
  const [arrivalTime, setArrivalTime] = useState(nowTime);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);
    setErrorMessage('');

    if (!deliveryLocation.trim()) {
      setErrorCode('validation');
      setErrorMessage(t('Veuillez remplir le lieu de dépôt.', 'Please enter the delivery location.'));
      return;
    }

    setLoading(true);

    try {
      const arrivalDatetime = `${arrivalDate}T${arrivalTime}:00Z`;

      const res = await fetch(`/api/arrivee/${encodeURIComponent(reference)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arrival_datetime: arrivalDatetime,
          delivery_location: deliveryLocation.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess({
          deliveryLocation: deliveryLocation.trim(),
          arrivalDate,
          arrivalTime,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (data.error === 'not_activated') {
        setErrorCode('not_activated');
        setErrorMessage(data.message);
      } else if (data.error === 'already_delivered') {
        setErrorCode('already_delivered');
        setErrorMessage(data.message);
      } else {
        setErrorCode('server_error');
        setErrorMessage(data.message || t('Échec de la confirmation.', 'Confirmation failed.'));
      }
    } catch {
      setErrorCode('network');
      setErrorMessage(t("Vérifiez votre connexion et réessayez.", 'Check your connection and retry.'));
    } finally {
      setLoading(false);
    }
  };

  const INPUT_CLS = `h-12 !bg-white border-[#1E4B7A]/15 text-[#0F1B2E] placeholder:text-gray-500 focus-visible:ring-[#1E4B7A]/20 focus-visible:border-[#1E4B7A]/60 text-sm ${errorCode === 'validation' && !deliveryLocation.trim() ? 'border-red-400' : ''}`;

  return (
    <div className="glass-light-strong rounded-xl p-5 border-l-4 border-l-[#25D366]">
      <h2 className="font-display text-base font-bold text-[#0F1B2E] mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 text-[#1E4B7A]" />
        {t('Confirmation d\'Arrivée', 'Arrival Confirmation')}
      </h2>

      {/* Error banner */}
      {errorCode && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
            {errorCode === 'not_activated' && (
              <a
                href={`/activate/${reference}`}
                className="text-sm text-[#1E4B7A] underline mt-1 inline-block"
              >
                {t('Activer le colis maintenant →', 'Activate the package now →')}
              </a>
            )}
          </div>
          <button type="button" onClick={() => { setErrorCode(null); setErrorMessage(''); }} className="text-red-500 hover:text-red-600 text-lg leading-none">&times;</button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Lieu de dépôt */}
        <div className="space-y-1.5">
          <Label htmlFor="delivery_location" className="text-sm font-medium text-[#0F1B2E]">
            {t('Lieu de dépôt précis', 'Precise delivery location')} <span className="text-[#1E4B7A]">*</span>
          </Label>
          <Input
            id="delivery_location"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder={t('Ex: Gare routière, Boutique X', 'Ex: Bus station, Shop X')}
            className={INPUT_CLS}
            aria-required="true"
          />
        </div>

        {/* Date & Heure */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="arrival_date" className="text-sm font-medium text-[#0F1B2E]">
              {t("Date d'arrivée", 'Arrival date')} <span className="text-[#1E4B7A]">*</span>
            </Label>
            <Input
              id="arrival_date"
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="h-12 !bg-white border-[#1E4B7A]/15 text-[#0F1B2E] focus-visible:ring-[#1E4B7A]/20 focus-visible:border-[#1E4B7A]/60 text-sm [color-scheme:light]"
              aria-required="true"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="arrival_time" className="text-sm font-medium text-[#0F1B2E]">
              {t("Heure d'arrivée", 'Arrival time')} <span className="text-[#1E4B7A]">*</span>
            </Label>
            <Input
              id="arrival_time"
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="h-12 !bg-white border-[#1E4B7A]/15 text-[#0F1B2E] focus-visible:ring-[#1E4B7A]/20 focus-visible:border-[#1E4B7A]/60 text-sm [color-scheme:light]"
              aria-required="true"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-sm font-medium text-[#0F1B2E]">
            {t('Notes optionnelles', 'Optional notes')}
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('Ex: Colis remis au gardien', 'Ex: Package handed to the guard')}
            className="!bg-white border-[#1E4B7A]/15 text-[#0F1B2E] placeholder:text-gray-500 focus-visible:ring-[#1E4B7A]/20 focus-visible:border-[#1E4B7A]/60 text-sm min-h-[80px] resize-none"
            rows={3}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-emerald flex items-center justify-center gap-2 w-full h-14 rounded-xl font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('Confirmation...', 'Confirming...')}
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              {t('CONFIRMER L\'ARRIVÉE ET NOTIFIER', 'CONFIRM ARRIVAL AND NOTIFY')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
