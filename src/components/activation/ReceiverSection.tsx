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

const INPUT_CLS =
  'h-12 sm:h-14 !bg-white border-[#1E4B7A]/15 focus-visible:ring-[#1E4B7A]/20 focus-visible:border-[#1E4B7A]/60 text-sm sm:text-base text-gray-900 placeholder:text-gray-500';

export default function ReceiverSection({
  receiverName, setReceiverName,
  receiverPhone, setReceiverPhone,
  phoneError,
  lang,
}: ReceiverSectionProps) {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  return (
    <div className="glass-card-light rounded-2xl p-4 sm:p-6 border border-[#1E4B7A]/20">
      <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E4B7A] mb-4 sm:mb-6 flex items-center gap-2">
        <Download className="w-5 h-5 text-[#1E4B7A]" />
        {t('DESTINATAIRE', 'RECEIVER')}
      </h2>

      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="receiver_name" className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
            {t('Nom Complet', 'Full Name')} <span className="text-[#1E4B7A]">*</span>
          </Label>
          <Input
            id="receiver_name"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder={t('Ex: Fatou Sow', 'Ex: Fatou Sow')}
            className={INPUT_CLS}
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
          labelClassName="text-[#0F1B2E]"
          hintClassName="text-[#5B7088]"
        />
      </div>
    </div>
  );
}
