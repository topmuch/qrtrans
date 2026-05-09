/**
 * Client utilitaire Wakit — WhatsApp Business API
 *
 * Prêt à recevoir les appels. Pour l'instant:
 * - Si WAKIT_API_KEY n'est pas configurée → retourne { fallback: true }
 * - Si l'API est configurée → envoie la requête avec timeout + retry (1 tentative)
 * - En cas d'échec → log console.warn et retourne { fallback: true }
 *
 * Usage:
 *   const result = await sendWakitMessage({ to: "33612345678", template: "baggage_scan_alert", variables: { name: "Ali" } });
 *   if (result.fallback) { // ouvrir wa.me à la place }
 */

import type { WakitPayload, WakitResult } from '@/types/ai';
import {
  WAKIT_API_KEY,
  WAKIT_BASE_URL,
  WAKIT_TIMEOUT_MS,
  API_RETRY_COUNT,
  API_RETRY_DELAY_MS,
  FALLBACK_MESSAGES,
} from './config';

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Valide un numéro de téléphone.
 * Accepte les formats: +33612345678, 33612345678, 0612345678
 */
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  const pattern = /^\+?\d{7,15}$/;
  return pattern.test(cleaned);
}

/**
 * Normalise un numéro de téléphone pour l'API Wakit.
 * Retire les espaces, tirets, parenthèses. Garde le + si présent.
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().]/g, '');
}

/**
 * Attend un délai donné (ms).
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════
//  FETCH AVEC TIMEOUT & RETRY
// ═══════════════════════════════════════════════════════

/**
 * Effectue un fetch avec timeout et retry.
 * Ne propage jamais l'erreur — retourne toujours un objet { success, ... }.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  retries: number
): Promise<{ ok: boolean; data: unknown; status?: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.warn(`[Wakit] Retry ${attempt}/${retries} après ${API_RETRY_DELAY_MS}ms...`);
        await sleep(API_RETRY_DELAY_MS);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.warn(
          `[Wakit] HTTP ${response.status} — ${text.substring(0, 200)}`
        );
        lastError = new Error(`HTTP ${response.status}`);
        continue; // retry
      }

      const data = await response.json();
      return { ok: true, data, status: response.status };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur inconnue';
      console.warn(`[Wakit] Tentative ${attempt + 1} échouée: ${message}`);
      lastError = err instanceof Error ? err : new Error(message);
    }
  }

  return { ok: false, data: null, status: lastError ? 500 : undefined };
}

// ═══════════════════════════════════════════════════════
//  FONCTION PRINCIPALE
// ═══════════════════════════════════════════════════════

/**
 * Envoie un message WhatsApp via l'API Wakit.
 *
 * @returns WakitResult — jamais lance d'exception
 */
export async function sendWakitMessage(payload: WakitPayload): Promise<WakitResult> {
  const startTime = Date.now();

  // ─── Guard: API key non configurée → fallback ───
  if (!WAKIT_API_KEY) {
    console.warn('[Wakit] Clé API non configurée → fallback.');
    return {
      success: false,
      status: 'fallback',
      error: FALLBACK_MESSAGES.wakit.noApiKey,
      fallback: true,
      latencyMs: Date.now() - startTime,
    };
  }

  // ─── Validation du numéro ───
  if (!payload.to || !isValidPhone(payload.to)) {
    console.warn(`[Wakit] Numéro invalide: "${payload.to}"`);
    return {
      success: false,
      status: 'failed',
      error: FALLBACK_MESSAGES.wakit.invalidPhone,
      fallback: false, // pas de fallback pour une erreur de validation
      latencyMs: Date.now() - startTime,
    };
  }

  // ─── Validation du template ───
  if (!payload.template) {
    console.warn('[Wakit] Nom de template manquant.');
    return {
      success: false,
      status: 'failed',
      error: 'Template name is required.',
      fallback: false,
      latencyMs: Date.now() - startTime,
    };
  }

  const phone = normalizePhone(payload.to);

  // ─── Appel API ───
  console.log(`[Wakit] Envoi à ${phone.substring(0, 4)}*** via template "${payload.template}"`);

  const url = `${WAKIT_BASE_URL}/messages`;
  const body = {
    to: phone,
    template: payload.template,
    variables: payload.variables || {},
  };

  const result = await fetchWithRetry(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WAKIT_API_KEY}`,
      },
      body: JSON.stringify(body),
    },
    WAKIT_TIMEOUT_MS,
    API_RETRY_COUNT
  );

  const latencyMs = Date.now() - startTime;

  if (result.ok) {
    const data = result.data as Record<string, unknown>;
    console.log(`[Wakit] ✓ Message envoyé en ${latencyMs}ms — ID: ${data?.id ?? 'N/A'}`);
    return {
      success: true,
      messageId: (data?.id as string) || undefined,
      status: 'sent',
      latencyMs,
      fallback: false,
    };
  }

  // ─── Échec → fallback (ne bloque jamais le flux) ───
  console.warn(`[Wakit] ✗ Échec après ${API_RETRY_COUNT + 1} tentatives (${latencyMs}ms) → fallback.`);
  return {
    success: false,
    status: 'fallback',
    error: FALLBACK_MESSAGES.wakit.genericError,
    fallback: true,
    latencyMs,
  };
}
