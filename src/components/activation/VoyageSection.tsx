'use client';

import { Bus, Truck, MapPin, Clock, CreditCard } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import TextareaAutosize from 'react-textarea-autosize';

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
  lang: 'fr' | 'en';
}

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
  lang,
}: VoyageSectionProps) {
  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  return (
    <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-6">
      <h2 className="text-base font-bold text-blue-800 mb-5 flex items-center gap-2">
        🚌 {t('ITINÉRAIRE & RETRAIT', 'ITINERARY & PICKUP')}
      </h2>

      <div className="space-y-5">
        {/* Transport Type Toggle */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-blue-700">
            {t('Type de Transport', 'Transport Type')} <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTransportType('GP')}
              aria-pressed={transportType === 'GP'}
              className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-sm font-semibold transition-all ${
                transportType === 'GP'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-200'
                  : 'border-blue-200 text-blue-300 hover:border-blue-300 hover:text-blue-500'
              }`}
            >
              <Truck className="w-4 h-4" />
              GP 🚛
            </button>
            <button
              type="button"
              onClick={() => setTransportType('BUS')}
              aria-pressed={transportType === 'BUS'}
              className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-sm font-semibold transition-all ${
                transportType === 'BUS'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-200'
                  : 'border-blue-200 text-blue-300 hover:border-blue-300 hover:text-blue-500'
              }`}
            >
              <Bus className="w-4 h-4" />
              BUS 🚌
            </button>
          </div>
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <Label htmlFor="company_name" className="text-sm font-medium text-blue-700">
            {t('Compagnie de Transport', 'Transport Company')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="company_name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Ex: Salam, Aline, Fatick Express..."
            className="h-12 bg-white border-blue-200 focus-visible:ring-blue-400 focus-visible:border-blue-400 text-sm"
            aria-required="true"
          />
        </div>

        {/* Cities */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="departure_city" className="text-sm font-medium text-blue-700">
              {t('Ville de Départ', 'Departure City')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="departure_city"
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              placeholder={t('Ex: Dakar', 'Ex: Dakar')}
              className="h-12 bg-white border-blue-200 focus-visible:ring-blue-400 focus-visible:border-blue-400 text-sm"
              aria-required="true"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="arrival_city" className="text-sm font-medium text-blue-700">
              {t("Ville d'Arrivée", 'Arrival City')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="arrival_city"
              value={arrivalCity}
              onChange={(e) => setArrivalCity(e.target.value)}
              placeholder={t('Ex: Ziguinchor', 'Ex: Ziguinchor')}
              className="h-12 bg-white border-blue-200 focus-visible:ring-blue-400 focus-visible:border-blue-400 text-sm"
              aria-required="true"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="departure_date" className="text-sm font-medium text-blue-700">
              {t('Date de Départ', 'Departure Date')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="departure_date"
              type="date"
              value={departureDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="h-12 bg-white border-blue-200 focus-visible:ring-blue-400 focus-visible:border-blue-400 text-sm [color-scheme:light]"
              aria-required="true"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="departure_time" className="text-sm font-medium text-blue-700">
              {t('Heure de Départ', 'Departure Time')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="departure_time"
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="h-12 bg-white border-blue-200 focus-visible:ring-blue-400 focus-visible:border-blue-400 text-sm [color-scheme:light]"
              aria-required="true"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-blue-200 pt-4">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {t('Récupération & Paiement', 'Pickup & Payment')}
          </p>
        </div>

        {/* Pickup Address */}
        <div className="space-y-1.5">
          <Label htmlFor="pickup_address" className="text-sm font-medium text-blue-700">
            📍 {t('Adresse de récupération précise', 'Precise pickup address')}
          </Label>
          <TextareaAutosize
            id="pickup_address"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            placeholder={t('Ex: Gare routière, Boutique X, N° de porte...', 'Ex: Bus station, Shop X, Door number...')}
            className="w-full min-h-[60px] px-3 py-2.5 bg-white border-blue-200 focus-visible:ring-blue-400 focus-visible:border-blue-400 rounded-lg text-sm resize-none"
            minRows={2}
          />
        </div>

        {/* Estimated Arrival */}
        <div className="space-y-1.5">
          <Label htmlFor="estimated_arrival" className="text-sm font-medium text-blue-700">
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            {t("Heure d'arrivée estimée", 'Estimated arrival time')}
          </Label>
          <Input
            id="estimated_arrival"
            type="time"
            value={estimatedArrival}
            onChange={(e) => setEstimatedArrival(e.target.value)}
            className="h-12 bg-white border-blue-200 focus-visible:ring-blue-400 focus-visible:border-blue-400 text-sm [color-scheme:light]"
          />
        </div>

        {/* Payment Status */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-blue-700">
            <CreditCard className="w-3.5 h-3.5 inline mr-1" />
            {t('Statut Paiement', 'Payment Status')} <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentStatus('SENDER_PAID')}
              aria-pressed={paymentStatus === 'SENDER_PAID'}
              className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-sm font-semibold transition-all px-3 ${
                paymentStatus === 'SENDER_PAID'
                  ? 'border-green-500 bg-green-500/10 text-green-700 shadow-sm shadow-green-200'
                  : 'border-blue-200 text-blue-400 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              ✅ {t('Payé par l\'expéditeur', 'Paid by sender')}
            </button>
            <button
              type="button"
              onClick={() => setPaymentStatus('RECEIVER_PAY')}
              aria-pressed={paymentStatus === 'RECEIVER_PAY'}
              className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-sm font-semibold transition-all px-3 ${
                paymentStatus === 'RECEIVER_PAY'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 shadow-sm shadow-amber-200'
                  : 'border-blue-200 text-blue-400 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              💸 {t('À payer par le destinataire', 'Pay on delivery')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
