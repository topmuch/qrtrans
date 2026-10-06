'use client';

import { Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import SmartPhoneInput from './SmartPhoneInput';

interface ReceiverSectionProps {
  receiverName: string;
  setReceiverName: (v: string) => void;
  receiverPhone: string;
  setReceiverPhone: (v: string) => void;
  phoneError: string | null;
  lang: 'fr' | 'en';
}

export default function ReceiverSection({
  receiverName, setReceiverName,
  receiverPhone, setReceiverPhone,
  phoneError,
  lang,
}: ReceiverSectionProps) {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-emerald-500/20">
      <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
        <Download className="w-5 h-5 text-emerald-400" />
        {t('DESTINATAIRE', 'RECEIVER')}
      </h2>

      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="receiver_name" className="text-sm sm:text-base font-semibold text-white">
            {t('Nom Complet', 'Full Name')} <span className="text-emerald-400">*</span>
          </Label>
          <Input
            id="receiver_name"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder={t('Ex: Fatou Sow', 'Ex: Fatou Sow')}
            className="h-12 sm:h-14 !bg-white border-white/30 focus-visible:ring-emerald-400/50 focus-visible:border-emerald-400/60 text-sm sm:text-base text-gray-900 placeholder:text-gray-500"
            aria-required="true"
          />
        </div>

        <SmartPhoneInput
          label={t('Numéro WhatsApp', 'WhatsApp Number')}
          value={receiverPhone}
          onChange={(v) => setReceiverPhone(v)}
          hint={t('Recevra le code de retrait par WhatsApp.', 'Will receive the pickup code via WhatsApp.')}
          error={phoneError}
          name="receiver_phone"
          labelClassName="text-white"
          hintClassName="text-white"
        />
      </div>
    </div>
  );
}
