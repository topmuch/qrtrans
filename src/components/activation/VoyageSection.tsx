'use client';

import { Bus, Truck, MapPin, Clock, CreditCard, Phone, Navigation } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import TextareaAutosize from 'react-textarea-autosize';
import SmartPhoneInput from './SmartPhoneInput';

interface VoyageSectionProps {
  transportType: string;
  setTransportType: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  departureCity: string;
  setDepartureCity: (v: string) => void;
  arrivalCity: string;
  setArrivalCity: (v: string) => void;
  departureDate: string;
  setDepartureDate: (v: string) => void;
  departureTime: string;
  setDepartureTime: (v: string) => void;
  pickupAddress: string;
  setPickupAddress: (v: string) => void;
  estimatedArrival: string;
  setEstimatedArrival: (v: string) => void;
  paymentStatus: string;
  setPaymentStatus: (v: string) => void;
  driverPhone: string;
  setDriverPhone: (v: string) => void;
  shareDriverPhone: boolean;
  setShareDriverPhone: (v: boolean) => void;
  driverPhoneError: string | null;
  lang: 'fr' | 'en';
}

const INPUT_CLS =
  'h-12 sm:h-14 !bg-white border-[#1E4B7A]/15 focus-visible:ring-[#1E4B7A]/20 focus-visible:border-[#1E4B7A]/60 text-sm sm:text-base text-gray-900 placeholder:text-gray-500';

export default function VoyageSection({
  transportType, setTransportType,
  company, setCompany,
  departureCity, setDepartureCity,
  arrivalCity, setArrivalCity,
  departureDate, setDepartureDate,
  departureTime, setDepartureTime,
  pickupAddress, setPickupAddress,
  estimatedArrival, setEstimatedArrival,
  paymentStatus, setPaymentStatus,
  driverPhone, setDriverPhone,
  shareDriverPhone, setShareDriverPhone,
  driverPhoneError,
  lang,
}: VoyageSectionProps) {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  return (
    <div className="glass-card-light rounded-2xl p-4 sm:p-6 border border-[#1E4B7A]/20">
      <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E4B7A] mb-4 sm:mb-6 flex items-center gap-2">
        <Navigation className="w-5 h-5 text-[#1E4B7A]" />
        {t('ITINÉRAIRE & RETRAIT', 'ITINERARY & PICKUP')}
      </h2>

      <div className="space-y-4 sm:space-y-5">
        {/* Transport Type Toggle */}
        <div className="space-y-1.5">
          <Label className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
            {t('Type de Transport', 'Transport Type')} <span className="text-[#1E4B7A]">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setTransportType('GP')}
              aria-pressed={transportType === 'GP'}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 h-12 sm:h-14 rounded-xl border-2 text-sm sm:text-base font-bold transition-all ${
                transportType === 'GP'
                  ? 'border-[#1E4B7A] bg-[#1E4B7A]/15 text-[#0F1B2E] shadow-sm shadow-[#1E4B7A]/20'
                  : 'border-[#1E4B7A]/15 text-[#5B7088] hover:border-[#1E4B7A]/40'
              }`}
            >
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              GP
            </button>
            <button
              type="button"
              onClick={() => setTransportType('BUS')}
              aria-pressed={transportType === 'BUS'}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 h-12 sm:h-14 rounded-xl border-2 text-sm sm:text-base font-bold transition-all ${
                transportType === 'BUS'
                  ? 'border-[#1E4B7A] bg-[#1E4B7A]/15 text-[#0F1B2E] shadow-sm shadow-[#1E4B7A]/20'
                  : 'border-[#1E4B7A]/15 text-[#5B7088] hover:border-[#1E4B7A]/40'
              }`}
            >
              <Bus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              BUS
            </button>
          </div>
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <Label htmlFor="company_name" className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
            {t('Compagnie de Transport', 'Transport Company')} <span className="text-[#1E4B7A]">*</span>
          </Label>
          <Input
            id="company_name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Ex: Salam, Aline, Fatick Express..."
            className={INPUT_CLS}
            aria-required="true"
          />
        </div>

        {/* Cities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="departure_city" className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
              {t('Ville de Départ', 'Departure City')} <span className="text-[#1E4B7A]">*</span>
            </Label>
            <Input
              id="departure_city"
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              placeholder={t('Ex: Dakar', 'Ex: Dakar')}
              className={INPUT_CLS}
              aria-required="true"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="arrival_city" className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
              {t("Ville d'Arrivée", 'Arrival City')} <span className="text-[#1E4B7A]">*</span>
            </Label>
            <Input
              id="arrival_city"
              value={arrivalCity}
              onChange={(e) => setArrivalCity(e.target.value)}
              placeholder={t('Ex: Ziguinchor', 'Ex: Ziguinchor')}
              className={INPUT_CLS}
              aria-required="true"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="departure_date" className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
              {t('Date de Départ', 'Departure Date')} <span className="text-[#1E4B7A]">*</span>
            </Label>
            <Input
              id="departure_date"
              type="date"
              value={departureDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
              className={`${INPUT_CLS} [color-scheme:light]`}
              aria-required="true"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="departure_time" className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
              {t('Heure de Départ', 'Departure Time')} <span className="text-[#1E4B7A]">*</span>
            </Label>
            <Input
              id="departure_time"
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className={`${INPUT_CLS} [color-scheme:light]`}
              aria-required="true"
            />
          </div>
        </div>

        {/* ─── Récupération & Paiement ─── */}
        <div className="border-2 border-dashed border-[#1E4B7A]/30 rounded-xl p-3 sm:p-4">
          <p className="font-display text-xs sm:text-sm font-bold text-[#1E4B7A] uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t('Récupération & Paiement', 'Pickup & Payment')}
          </p>

          {/* Pickup Address */}
          <div className="space-y-1.5">
            <Label htmlFor="pickup_address" className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
              {t('Adresse de récupération précise', 'Precise pickup address')}
            </Label>
            <TextareaAutosize
              id="pickup_address"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder={t('Ex: Gare routière, Boutique X, N° de porte...', 'Ex: Bus station, Shop X, Door number...')}
              className="w-full min-h-[56px] sm:min-h-[70px] px-3 py-2.5 sm:py-3 !bg-white border-[#1E4B7A]/15 focus-visible:ring-[#1E4B7A]/20 focus-visible:border-[#1E4B7A]/60 rounded-lg text-sm sm:text-base text-gray-900 placeholder:text-gray-500 resize-none"
              minRows={2}
            />
          </div>

          {/* Estimated Arrival */}
          <div className="space-y-1.5 mt-3">
            <Label htmlFor="estimated_arrival" className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
              {t("Heure d'arrivée estimée", 'Estimated arrival time')}
            </Label>
            <Input
              id="estimated_arrival"
              type="time"
              value={estimatedArrival}
              onChange={(e) => setEstimatedArrival(e.target.value)}
              className={`${INPUT_CLS} [color-scheme:light]`}
            />
          </div>
        </div>

        {/* ─── Chauffeur / Transporteur ─── */}
        <div className="border-2 border-dashed border-[#1E4B7A]/30 rounded-xl p-3 sm:p-4">
          <p className="font-display text-xs sm:text-sm font-bold text-[#1E4B7A] uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t('Chauffeur / Transporteur', 'Driver / Transporter')}
          </p>

          <div className="space-y-1.5">
            <SmartPhoneInput
              label={t('Numéro du Chauffeur', 'Driver Number')}
              value={driverPhone}
              onChange={(v) => setDriverPhone(v)}
              hint={t('Numéro WhatsApp du chauffeur ou transporteur.', 'WhatsApp number of the driver or transporter.')}
              error={driverPhoneError}
              name="driver_phone"
              optional
              labelClassName="text-[#0F1B2E]"
              hintClassName="text-[#5B7088]"
            />
          </div>

          {/* Share Toggle — stacked on mobile */}
          <div className="p-3 sm:p-3.5 bg-[#1E4B7A]/5 border border-[#1E4B7A]/10 rounded-xl mt-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <Label className="text-sm sm:text-base font-semibold text-[#0F1B2E] cursor-pointer leading-snug">
                  {t('Partager ce numéro avec le destinataire ?', 'Share this number with the recipient?')}
                </Label>
                <p className="text-xs sm:text-sm text-[#5B7088] mt-0.5 leading-snug">
                  {t('Le destinataire pourra contacter le chauffeur directement.', 'The recipient will be able to contact the driver directly.')}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={shareDriverPhone}
                onClick={() => setShareDriverPhone(!shareDriverPhone)}
                className={`relative inline-flex h-7 w-12 sm:h-6 sm:w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4B7A]/30 focus-visible:ring-offset-2 self-end sm:self-auto ${
                  shareDriverPhone ? 'bg-gradient-to-r from-[#1E4B7A] to-[#487AA8]' : 'bg-[#1E4B7A]/15'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 sm:h-5 sm:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 sm:mt-0 ${
                    shareDriverPhone ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Statut & Paiement ─── */}
        <div className="border-2 border-dashed border-[#1E4B7A]/30 rounded-xl p-3 sm:p-4">
          <Label className="text-sm sm:text-base font-semibold text-[#0F1B2E]">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
            {t('Statut Paiement', 'Payment Status')} <span className="text-[#1E4B7A]">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => setPaymentStatus('SENDER_PAID')}
              aria-pressed={paymentStatus === 'SENDER_PAID'}
              className={`flex items-center justify-center gap-1 sm:gap-2 h-12 sm:h-14 rounded-xl border-2 text-xs sm:text-base font-bold transition-all px-1.5 sm:px-3 ${
                paymentStatus === 'SENDER_PAID'
                  ? 'border-[#1E4B7A] bg-[#1E4B7A]/15 text-[#0F1B2E] shadow-sm shadow-[#1E4B7A]/20'
                  : 'border-[#1E4B7A]/15 text-[#5B7088] hover:border-[#1E4B7A]/40'
              }`}
            >
              {t('Payé', 'Paid')}
            </button>
            <button
              type="button"
              onClick={() => setPaymentStatus('RECEIVER_PAY')}
              aria-pressed={paymentStatus === 'RECEIVER_PAY'}
              className={`flex items-center justify-center gap-1 sm:gap-2 h-12 sm:h-14 rounded-xl border-2 text-xs sm:text-base font-bold transition-all px-1.5 sm:px-3 ${
                paymentStatus === 'RECEIVER_PAY'
                  ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm shadow-amber-500/20'
                  : 'border-[#1E4B7A]/15 text-[#5B7088] hover:border-amber-500/40'
              }`}
            >
              {t('À payer', 'Pay on delivery')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
