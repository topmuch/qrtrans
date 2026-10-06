'use client';

import { Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import SmartPhoneInput from './SmartPhoneInput';

interface SenderSectionProps {
  senderName: string;
  setSenderName: (v: string) => void;
  senderPhone: string;
  setSenderPhone: (v: string) => void;
  phoneError: string | null;
  lang: 'fr' | 'en';
}

export default function SenderSection({
  senderName, setSenderName,
  senderPhone, setSenderPhone,
  phoneError,
  lang,
}: SenderSectionProps) {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-emerald-500/20">
      <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
        <Upload className="w-5 h-5 text-emerald-400" />
        {t('EXPÉDITEUR', 'SENDER')}
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {/* ─── Section A: Coordonnées Expéditeur ─── */}
        <div className="border-2 border-dashed border-emerald-500/30 rounded-xl p-3 sm:p-4">
          <p className="font-display text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wider mb-2 sm:mb-3">
            {t('Coordonnées Expéditeur', 'Sender Details')}
          </p>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sender_name" className="text-sm sm:text-base font-semibold text-white">
                {t('Nom Complet', 'Full Name')} <span className="text-emerald-400">*</span>
              </Label>
              <Input
                id="sender_name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={t('Ex: Moussa Diop', 'Ex: Moussa Diop')}
                className="h-12 sm:h-14 !bg-white border-white/30 focus-visible:ring-emerald-400/50 focus-visible:border-emerald-400/60 text-sm sm:text-base text-gray-900 placeholder:text-gray-500"
                aria-required="true"
              />
            </div>

            <SmartPhoneInput
              label={t('Numéro WhatsApp', 'WhatsApp Number')}
              value={senderPhone}
              onChange={(v) => setSenderPhone(v)}
              hint={t('Recevra la confirmation de départ.', 'Will receive the departure confirmation.')}
              error={phoneError}
              name="sender_phone"
              labelClassName="text-white"
              hintClassName="text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
