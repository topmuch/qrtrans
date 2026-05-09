/**
 * Configuration centralisée pour les services externes Wakit & Groq.
 *
 * Ce module ne contient que des constantes et fonctions pures.
 * Aucun appel réseau n'est effectué ici.
 *
 * Les clés API sont lues depuis process.env côté serveur uniquement.
 */

// ═══════════════════════════════════════════════════════
//  WAKIT CONFIG
// ═══════════════════════════════════════════════════════

export const WAKIT_BASE_URL =
  process.env.WAKIT_BASE_URL || 'https://api.wakit.ai/v1';

export const WAKIT_API_KEY = process.env.WAKIT_API_KEY || '';

export const WAKIT_PHONE_NUMBER_ID =
  process.env.WAKIT_PHONE_NUMBER_ID || '';

export const WAKIT_TEMPLATE_SCAN_ALERT =
  process.env.WAKIT_TEMPLATE_SCAN_ALERT || 'baggage_scan_alert';

export const WAKIT_TIMEOUT_MS =
  parseInt(process.env.WAKIT_TIMEOUT_MS || '10000', 10);

export const WAKIT_ENABLED = WAKIT_API_KEY.length > 0;

// ═══════════════════════════════════════════════════════
//  GROQ CONFIG
// ═══════════════════════════════════════════════════════

export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export const GROQ_MODEL_CHAT =
  process.env.GROQ_MODEL_CHAT || 'llama3-8b-8192';

export const GROQ_MODEL_ANALYSIS =
  process.env.GROQ_MODEL_ANALYSIS || 'llama3-8b-8192';

export const GROQ_TIMEOUT_MS =
  parseInt(process.env.GROQ_TIMEOUT_MS || '30000', 10);

export const GROQ_ENABLED = GROQ_API_KEY.length > 0;

// ═══════════════════════════════════════════════════════
//  TIMEOUTS & FALLBACK
// ═══════════════════════════════════════════════════════

/** Timeout par défaut pour les appels API (ms) */
export const API_TIMEOUT_MS = 10000;

/** Nombre de tentatives de retry pour les appels API */
export const API_RETRY_COUNT = 1;

/** Délai entre les retries (ms) */
export const API_RETRY_DELAY_MS = 1000;

// ═══════════════════════════════════════════════════════
//  FALLBACK MESSAGES
// ═══════════════════════════════════════════════════════

export const FALLBACK_MESSAGES = {
  wakit: {
    unavailable: 'Service WhatsApp indisponible — le message n\'a pas été envoyé.',
    noApiKey: 'Clé API Wakit non configurée — fallback vers wa.me.',
    invalidPhone: 'Numéro de téléphone invalide.',
    genericError: 'Erreur lors de l\'envoi WhatsApp.',
  },
  groq: {
    unavailable: 'Service IA indisponible — réponse par défaut utilisée.',
    noApiKey: 'Clé API Groq non configurée — fallback logique classique.',
    invalidRequest: 'Requête IA invalide.',
    genericError: 'Erreur lors de l\'appel au modèle IA.',
  },
} as const;

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Vérifie si un service externe est activé et prêt.
 * Un service est considéré "activé" si sa clé API est configurée.
 */
export function isEnabled(service: 'wakit' | 'groq'): boolean {
  if (service === 'wakit') return WAKIT_ENABLED;
  if (service === 'groq') return GROQ_ENABLED;
  return false;
}

/**
 * Retourne un résumé de l'état de tous les services externes.
 * Utile pour le debugging et le dashboard admin.
 */
export function getServicesStatus(): Record<string, { enabled: boolean; label: string }> {
  return {
    wakit: {
      enabled: WAKIT_ENABLED,
      label: 'WhatsApp Business (Wakit)',
    },
    groq: {
      enabled: GROQ_ENABLED,
      label: 'IA Inference (Groq)',
    },
  };
}
