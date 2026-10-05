'use client';

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
    <div className="bg-[#f97316] rounded-2xl p-4 sm:p-6 shadow-lg shadow-orange-500/20 border-2 border-dashed border-white/60">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
        📤 {t('EXPÉDITEUR', 'SENDER')}
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {/* ─── Section A: Coordonnées Expéditeur ─── */}
        <div className="border-2 border-dashed border-white/60 rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-2 sm:mb-3">
            👤 {t('Coordonnées Expéditeur', 'Sender Details')}
          </p>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sender_name" className="text-sm sm:text-base font-semibold text-white">
                {t('Nom Complet', 'Full Name')} <span className="text-yellow-300">*</span>
              </Label>
              <Input
                id="sender_name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={t('Ex: Moussa Diop', 'Ex: Moussa Diop')}
                className="h-12 sm:h-14 !bg-white border-white/30 focus-visible:ring-white/50 focus-visible:border-white/60 text-sm sm:text-base text-gray-900 placeholder:text-gray-500"
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
