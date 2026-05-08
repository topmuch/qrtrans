'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Luggage,
  AlertCircle,
  Clock,
  Shield,
  Navigation,
  CheckCircle,
  Plane,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Globe,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';
import { Language, LANGUAGE_NAMES } from '@/lib/i18n';

const FALLBACK_PHONE = '33745349339';

interface BaggageData {
  status: string;
  message?: string;
  theme?: string;
  type?: string;
  expiredAt?: string;
  agency?: string;
  baggage?: {
    reference: string;
    type: string;
    travelerName: string;
    baggageIndex: number;
    baggageType: string;
    status: string;
    flightNumber?: string;
    destination?: string;
    agency?: string;
    whatsappOwner?: string;
    declaredLostAt?: string | null;
    foundAt?: string | null;
    createdAt?: string | null;
    departureDate?: string | null;
    departureTime?: string | null;
  };
}

// Language Selector Component
function LanguageSelector({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors text-base font-medium backdrop-blur-sm border border-white/20 min-h-[48px]"
      >
        <Globe className="w-5 h-5" />
        <span>{LANGUAGE_NAMES[lang]}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl overflow-hidden z-50 min-w-[160px]">
          {(['fr', 'en', 'ar'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLang(l);
                setIsOpen(false);
              }}
              className={`w-full px-5 py-3.5 text-left text-base font-medium transition-colors ${
                lang === l 
                  ? 'bg-orange-500 text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {LANGUAGE_NAMES[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Activation Redirect Component
function ActivationRedirect({ type, reference, t, lang, setLang }: {
  type: string;
  reference: string;
  t: (key: string, params?: Record<string, string>) => string;
  lang: Language;
  setLang: (l: Language) => void;
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const url = type === 'hajj'
            ? `/hajj/activate?qr=${reference}`
            : `/inscrire?qr=${reference}`;
          router.push(url);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [type, reference, router]);

  const isHajj = type === 'hajj';
  const bgClass = isHajj ? 'bg-[#0d5e34]' : 'bg-[#6613e3]';

  return (
    <main className={`min-h-screen ${bgClass} flex items-center justify-center p-5 md:p-8`}>
      <div className="relative max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 text-center border border-white/20 shadow-xl">
        <div className="absolute top-4 right-4">
          <LanguageSelector lang={lang} setLang={setLang} />
        </div>

        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-pulse border border-white/20">
            {isHajj ? (
              <Plane className="w-10 h-10 text-white" />
            ) : (
              <Luggage className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#ffd700] rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#080c1a]" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t('common.welcome')}
        </h1>
        <p className="text-white/70 text-base md:text-lg mb-4">
          {t('common.activate_in')}
        </p>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-5 mb-6">
          <p className="text-white/60 text-base mb-2">{t('common.baggage_type')}</p>
          <Badge className={`${isHajj ? 'bg-[#1e3a2e] text-green-300' : 'bg-[#f59e0b]/20 text-[#fbbf24]'} text-base md:text-lg px-5 py-1.5`}>
            {isHajj ? t('common.hajj_label') : t('common.voyageur_label')}
          </Badge>
        </div>

        <p className="text-white/50 text-base mb-5">
          {t('common.auto_redirect')} <span className="text-white font-bold text-lg">{countdown}s</span>
        </p>

        <button
          className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 min-h-[56px]"
          onClick={() => {
            const url = isHajj
              ? `/hajj/activate?qr=${reference}`
              : `/inscrire?qr=${reference}`;
            router.push(url);
          }}
        >
          {t('common.start_activation')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </main>
  );
}

// Loading Component
function LoadingScreen({ t }: { t: (key: string) => string }) {
  return (
    <main className="min-h-screen bg-[#6613e3] flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-lg">{t('common.loading')}</p>
      </div>
    </main>
  );
}

// Error Screen
function ErrorScreen({
  type,
  t,
  lang,
  setLang
}: {
  type: string;
  t: (key: string) => string;
  lang: Language;
  setLang: (l: Language) => void;
}) {
  const router = useRouter();

  const errorConfig = {
    not_found: {
      icon: <AlertCircle className="w-12 h-12 text-red-400" />,
      title: t('errors.qr_not_valid'),
      message: t('errors.qr_not_valid_desc')
    },
    blocked: {
      icon: <Shield className="w-12 h-12 text-gray-400" />,
      title: t('errors.baggage_blocked'),
      message: t('errors.baggage_blocked_desc')
    },
    expired: {
      icon: <Clock className="w-12 h-12 text-gray-400" />,
      title: t('errors.protection_expired'),
      message: t('errors.protection_expired_desc')
    }
  };

  const config = errorConfig[type as keyof typeof errorConfig] || errorConfig.not_found;

  return (
    <main className="min-h-screen bg-[#6613e3] flex items-center justify-center p-5 md:p-8 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector lang={lang} setLang={setLang} />
      </div>

      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 text-center border border-white/20 shadow-xl">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {config.icon}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{config.title}</h1>
        <p className="text-white/70 text-base md:text-lg mb-6">{config.message}</p>
        <button
          className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors text-base font-medium min-h-[56px]"
          onClick={() => router.push('/')}
        >
          {t('common.back_home')}
        </button>
      </div>
    </main>
  );
}

// Success Toast Component
function SuccessToast({ show, message }: { show: boolean; message: string }) {
  if (!show) return null;
  
  return (
    <div className="fixed top-5 right-5 bg-orange-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-6 h-6" />
        <div>
          <div className="font-bold text-lg">Wahoo ! 🎉</div>
          <div className="text-base opacity-90">{message}</div>
        </div>
      </div>
    </div>
  );
}

// Main Scan Page
export default function ScanPage() {
  const params = useParams();
  const reference = params.reference as string;

  const { t, lang, setLang, dir } = useTranslation();

  const [baggageData, setBaggageData] = useState<BaggageData | null>(null);
  const [loading, setLoading] = useState(true);

  // Finder form state
  const [finderName, setFinderName] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [sharedPosition, setSharedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showManualLocation, setShowManualLocation] = useState(false);

  useEffect(() => {
    const fetchBaggage = async () => {
      try {
        const response = await fetch(`/api/scan/${reference}`);
        const data = await response.json();
        setBaggageData(data);
      } catch (error) {
        console.error('Error fetching baggage:', error);
        setBaggageData({ status: 'error', message: 'Erreur serveur' });
      } finally {
        setLoading(false);
      }
    };

    fetchBaggage();
  }, [reference]);

  // GPS Location Handler - iOS Optimized
  const handleShareLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError(t('errors.geolocation_not_supported'));
      setShowManualLocation(true);
      return;
    }

    setIsLoadingLocation(true);
    setGeoError(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            console.error('Geolocation error:', error.code, error.message);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      setSharedPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      setLocationText(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      setGeoError(null);
      setShowManualLocation(false);
    } catch (error) {
      const geoErr = error as GeolocationPositionError;
      let errorMessage = '';

      if (geoErr.code === 1) {
        errorMessage = t('errors.location_permission_denied') || '⚠️ Accès à la localisation refusé. Activez-la dans Réglages > Safari > QRBag ou entrez le lieu manuellement.';
      } else if (geoErr.code === 2) {
        errorMessage = t('errors.location_unavailable') || '📍 Service de localisation indisponible. Activez-le dans Réglages > Confidentialité > Services de localisation.';
      } else if (geoErr.code === 3) {
        errorMessage = t('errors.location_timeout') || '⏳ Détection impossible. Veuillez entrer le lieu manuellement.';
      } else {
        errorMessage = t('errors.location_failed') || 'Impossible de détecter votre position.';
      }

      setGeoError(errorMessage);
      setShowManualLocation(true);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [t]);

  // Generate WhatsApp message
  const generateWhatsAppMessage = useCallback((finderName: string, finderPhone: string, locationText: string, mapLink: string) => {
    return encodeURIComponent(
      `📦 *QRBag – Bagage trouvé !*\n\n` +
      `📍 *Référence* : ${reference}\n` +
      `📍 *Lieu* : ${locationText}\n` +
      `🗺️ *Carte* : ${mapLink}\n\n` +
      `👤 *Trouvé par* : ${finderName}\n` +
      `📱 *Contact* : ${finderPhone}\n\n` +
      `👉 Merci de le récupérer rapidement.\n` +
      `*QRBag – Protégez vos bagages, en toute sérénité.*`
    );
  }, [reference]);

  // Handle WhatsApp contact
  const handleWhatsApp = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Log the scan
      await fetch(`/api/scan/${reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: otherLocation.trim() || locationText || "Non précisé",
          finderName: finderName.trim(),
          finderPhone: finderPhone.trim(),
          message: '',
          latitude: sharedPosition?.lat,
          longitude: sharedPosition?.lng,
        }),
      });

      const finalLocationText = otherLocation.trim() || locationText || "Non précisé";
      const mapLink = sharedPosition
        ? `https://maps.app.goo.gl/?link=https://www.google.com/maps?q=${sharedPosition.lat},${sharedPosition.lng}`
        : "Localisation non partagée";

      const message = generateWhatsAppMessage(finderName, finderPhone, finalLocationText, mapLink);
      const ownerNumber = baggageData?.baggage?.whatsappOwner?.replace(/\D/g, '') || FALLBACK_PHONE;
      const url = `https://wa.me/${ownerNumber}?text=${message}`;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        window.location.href = url;
      } else {
        const newWindow = window.open(url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = url;
        }
      }

      // Show success
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);

    } catch (error) {
      console.error('Error:', error);
      alert(t('errors.error_occurred'));
    } finally {
      setIsSubmitting(false);
    }
  }, [reference, otherLocation, locationText, finderName, finderPhone, sharedPosition, baggageData, t, generateWhatsAppMessage]);

  // Handle phone call
  const handlePhoneCall = useCallback(async () => {
    // Log the scan before calling (same as WhatsApp)
    try {
      await fetch(`/api/scan/${reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: otherLocation.trim() || locationText || "Non précisé",
          finderName: finderName.trim(),
          finderPhone: finderPhone.trim(),
          message: '',
          latitude: sharedPosition?.lat,
          longitude: sharedPosition?.lng,
        }),
      });
    } catch (e) {
      // Continue with call even if logging fails
    }

    const phoneNumber = baggageData?.baggage?.whatsappOwner || FALLBACK_PHONE;
    window.location.href = `tel:${phoneNumber}`;
  }, [reference, otherLocation, locationText, finderName, finderPhone, sharedPosition, baggageData]);

  // Format date for display
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const locale = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR';
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Validate finder form before contacting
  const validateFinderForm = (): boolean => {
    if (!sharedPosition && !otherLocation.trim()) {
      setGeoError(t('finder.please_enter_location') || 'Veuillez entrer le lieu où vous avez trouvé le bagage.');
      return false;
    }
    if (!finderName.trim() || !finderPhone.trim()) {
      alert(t('finder.fill_info'));
      return false;
    }
    return true;
  };

  // Loading state
  if (loading) {
    return <LoadingScreen t={t} />;
  }

  // Redirect to activation if pending
  if (baggageData?.status === 'pending_activation' && baggageData?.type) {
    return (
      <ActivationRedirect
        type={baggageData.type}
        reference={reference}
        t={t}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  // Error states
  if (baggageData?.status === 'not_found') {
    return <ErrorScreen type="not_found" t={t} lang={lang} setLang={setLang} />;
  }

  if (baggageData?.status === 'blocked') {
    return <ErrorScreen type="blocked" t={t} lang={lang} setLang={setLang} />;
  }

  if (baggageData?.status === 'expired') {
    const expiredAt = baggageData.expiredAt || '';
    const agencyName = baggageData.agency || '';
    const urlParams = new URLSearchParams({
      ref: reference,
      ...(expiredAt && { expired: expiredAt }),
      ...(agencyName && { agency: agencyName })
    });
    if (typeof window !== 'undefined') {
      window.location.href = `/expired?${urlParams.toString()}`;
    }
    return <LoadingScreen t={t} />;
  }

  const baggage = baggageData?.baggage;

  // Lost baggage alert
  const isDeclaredLost = baggage?.declaredLostAt && !baggage?.foundAt;

  // ─── Main Render — Purple Theme with Enlarged Fonts ───
  return (
    <main 
      className="min-h-screen bg-[#6613e3] flex items-center justify-center p-5 md:p-8" 
      dir={dir}
    >
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-40">
        <LanguageSelector lang={lang} setLang={setLang} />
      </div>

      {/* Success Toast */}
      <SuccessToast show={showSuccess} message={t('finder.message_sent')} />

      {/* Content Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Urgent Banner for Lost Baggage */}
        {isDeclaredLost && (
          <div className="bg-red-600 text-white text-center py-3 px-5 rounded-t-2xl mb-0">
            <p className="font-bold text-base md:text-lg flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              URGENT – Bagage signalé perdu !
            </p>
          </div>
        )}

        {/* Success Badge */}
        <div className="bg-orange-500 text-white text-center py-3 px-6 rounded-full font-bold text-lg md:text-xl shadow-lg hover:shadow-xl transition-shadow tracking-wide mx-4 -mt-2 relative z-10">
          {t('finder.success_badge')} ✈️
        </div>

        {/* Main Card — Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-b-2xl rounded-t-2xl p-5 md:p-6 shadow-xl">
          
          {/* ─── Owner Info Block ─── */}
          {baggage && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 md:p-6 mb-4">
              <h3 className="text-[#FFFFFF] text-sm font-bold uppercase tracking-widest mb-4">
                {t('finder.owner_info')}
              </h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center border border-white/20 flex-shrink-0">
                  <Luggage className="w-7 h-7 text-orange-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-bold text-xl md:text-2xl leading-tight truncate">
                    {baggage.travelerName}
                  </div>
                  <div className="text-white/60 text-base font-mono mt-1">{reference}</div>
                </div>
              </div>
              {baggage.agency && (
                <div className="text-white/70 text-base flex items-center gap-2 mt-3 pl-1">
                  <Shield className="w-5 h-5 text-orange-400" />
                  {baggage.agency}
                </div>
              )}
            </div>
          )}

          {/* ─── Travel Details Block ─── */}
          {baggage && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 md:p-6 mb-5">
              <h3 className="text-[#FFFFFF] text-sm font-bold uppercase tracking-widest mb-4">
                {t('finder.travel_details')}
              </h3>
              <div className="space-y-3">
                {baggage.flightNumber && (
                  <div className="flex items-center gap-3">
                    <Plane className="w-5 h-5 text-white/70 flex-shrink-0" />
                    <span className="text-white text-lg md:text-xl font-semibold">{baggage.flightNumber}</span>
                  </div>
                )}
                {baggage.destination && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-white/70 flex-shrink-0" />
                    <span className="text-white text-lg md:text-xl font-semibold">{baggage.destination}</span>
                  </div>
                )}
                {baggage.departureDate && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-white/70 flex-shrink-0" />
                    <span className="text-white text-lg md:text-xl font-semibold">
                      {formatDate(baggage.departureDate)}{baggage.departureTime ? ` – ${baggage.departureTime}` : ''}
                    </span>
                  </div>
                )}
                {!baggage.departureDate && baggage.createdAt && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-white/70 flex-shrink-0" />
                    <span className="text-white text-lg md:text-xl font-semibold">
                      {t('finder.activation_date')} {formatDate(baggage.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Step 1: GPS Share Button ─── */}
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true);
                handleShareLocation();
              }}
              disabled={isLoadingLocation}
              className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg md:text-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl min-h-[56px] disabled:opacity-70 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#6613e3] mb-4"
            >
              {isLoadingLocation ? (
                <>
                  <span className="animate-spin text-xl">⏳</span>
                  {t('finder.locating')}
                </>
              ) : (
                <>
                  <Navigation className="w-6 h-6" />
                  {t('finder.share_gps')}
                </>
              )}
            </button>
          )}

          {/* ─── Step 2: Finder Form ─── */}
          {showForm && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* GPS Success */}
              {sharedPosition && !geoError && (
                <div className="p-4 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-white text-base md:text-lg font-medium">
                    ✓ {locationText}
                  </span>
                </div>
              )}

              {/* GPS Error */}
              {geoError && (
                <div className="p-4 bg-orange-500/15 border border-orange-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#FFFFFF] text-base font-medium">{t('finder.gps_unavailable')}</p>
                      <p className="text-[#FFFFFF] text-base mt-1">{geoError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Location Input */}
              <div className={sharedPosition ? 'opacity-75' : ''}>
                <label className="text-base font-medium text-[#FFFFFF] mb-1.5 block">
                  {sharedPosition ? t('finder.location_optional') : t('finder.location_label')}
                </label>
                <input
                  type="text"
                  placeholder={sharedPosition ? t('finder.location_optional_placeholder') : t('finder.location_placeholder')}
                  value={otherLocation}
                  onChange={(e) => setOtherLocation(e.target.value)}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-base md:text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all min-h-[56px]"
                />
              </div>

              {/* Name Input */}
              <input
                type="text"
                placeholder={t('finder.first_name')}
                value={finderName}
                onChange={(e) => setFinderName(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-base md:text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all min-h-[56px]"
              />

              {/* WhatsApp Input */}
              <input
                type="tel"
                placeholder={`${t('finder.whatsapp')} (+33612345678)`}
                value={finderPhone}
                onChange={(e) => setFinderPhone(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-base md:text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all min-h-[56px]"
              />

              {/* ─── Contact The Owner — Two Buttons ─── */}
              <div className="pt-2">
                <h3 className="text-[#FFFFFF] text-sm font-bold uppercase tracking-widest text-center mb-4">
                  {t('finder.contact_the_owner_title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp Button */}
                  <button
                    onClick={() => {
                      if (!validateFinderForm()) return;
                      handleWhatsApp();
                    }}
                    disabled={isSubmitting}
                    className="py-4 px-5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg min-h-[56px] disabled:opacity-70 shadow-lg focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-[#6613e3]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t('finder.by_whatsapp')}
                  </button>
                  {/* Phone Button */}
                  <button
                    onClick={() => {
                      if (!validateFinderForm()) return;
                      handlePhoneCall();
                    }}
                    disabled={isSubmitting}
                    className="py-4 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg min-h-[56px] disabled:opacity-70 shadow-lg focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#6613e3]"
                  >
                    <Phone className="w-5 h-5" />
                    {t('finder.by_phone')}
                  </button>
                </div>
              </div>

              {/* Retry GPS */}
              {geoError && !sharedPosition && (
                <button
                  onClick={handleShareLocation}
                  disabled={isLoadingLocation}
                  className="w-full py-3 text-base text-[#FFFFFF] hover:text-white flex items-center justify-center gap-2 transition-colors min-h-[48px]"
                >
                  <Navigation className="w-5 h-5" />
                  {isLoadingLocation ? t('finder.locating') : t('finder.retry_gps')}
                </button>
              )}
            </div>
          )}

          {/* ─── Trust Note ─── */}
          <div className="mt-6 text-center text-base text-[#FFFFFF] tracking-wide">
            <Shield className="w-5 h-5 inline mr-1.5 text-[#FFFFFF]" />
            {t('finder.trust_note')}
          </div>
        </div>
      </div>
    </main>
  );
}
