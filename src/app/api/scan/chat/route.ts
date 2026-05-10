/**
 * CHATBOT-KB: API Route — Chatbot Trouveur (Feature #1)
 * Agent de support intelligent avec Base de Connaissances QRBag.
 *
 * POST /api/scan/chat
 *
 * Route publique (sans auth) permettant au trouveur de poser des questions
 * contextuelles sur un bagage via Groq AI, enrichi d'une KB structurée.
 *
 * Sécurité:
 *   - Rate limiting: 10 req/min par IP
 *   - Validation stricte de la référence et de la question
 *   - Kill switch: GROQ_AI_ENABLED + GROQ_CHAT_ENABLED + DB FeatureFlag 'chatbot_finder'
 *   - Sanitization HTML de la question utilisateur
 *   - Ne bloque jamais: fallback SAV si Groq échoue/timeout
 *
 * CHATBOT-KB: Modifications depuis la version initiale:
 *   - System prompts enrichis avec KB complète (tarifs, SAV, FAQ, pages, confidentialité)
 *   - Temperature 0.5 → 0.7, max_tokens 200 → 300
 *   - Timeout Groq 3s strict via Promise.race
 *   - Sanitization HTML de la question
 *   - transportMode dans le contexte bagage
 *   - Réponse format: answer (au lieu de content)
 *   - Fallback orienté SAV (au lieu de "contactez le propriétaire")
 *   - Logging [Groq/Chat] sur succès
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callGroqAI } from '@/lib/groq';
import { GROQ_AI_ENABLED, GROQ_CHAT_ENABLED } from '@/lib/config';
import { isFeatureEnabled } from '@/lib/features';
import { detectLocaleFromHeaders } from '@/lib/i18n';
import { logMetric } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { safeTransportMode } from '@/lib/transport';
import type { Language } from '@/lib/i18n';
import type { GroqMessage, GroqResult } from '@/types/ai';

export const dynamic = 'force-dynamic';

// ═══════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════

/** CHATBOT-KB: Timeout strict pour la réponse Groq chatbot (3s) */
const CHATBOT_TIMEOUT_MS = 3000;

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════

interface ChatRequestBody {
  reference: string;
  question: string;
  locale?: Language;
  baggageContext?: {
    destination?: string;
    city?: string;
    agency?: string;
    status?: string;
    // CHATBOT-KB: transportMode added for multi-transport KB context
    transportMode?: string;
  };
}

interface ChatResponse {
  success: boolean;
  fallback: boolean;
  // CHATBOT-KB: renamed from 'content' to 'answer' per spec
  answer: string;
  latencyMs: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════
//  CHATBOT-KB: FALLBACK RESPONSES (orienté SAV)
// ═══════════════════════════════════════════════════════

const FALLBACK_RESPONSES: Record<Language, string> = {
  // CHATBOT-KB: Fallback orienté SAV (pas "contactez le propriétaire")
  fr: 'Je rencontre un problème technique. Veuillez contacter le SAV : support@qrbags.com',
  en: 'I am experiencing a technical issue. Please contact support: support@qrbags.com',
  ar: 'أواجه مشكلة تقنية. يرجى التواصل مع الدعم: support@qrbags.com',
};

// ═══════════════════════════════════════════════════════
//  CHATBOT-KB: SYSTEM PROMPTS (KB QRBag enrichie)
//
//  Structure identique FR/EN/AR — mêmes sections, même ordre.
//  Tarifs en € non convertis. Numéro SAV au format international.
//  Liens URL bruts non traduits.
// ═══════════════════════════════════════════════════════

/**
 * CHATBOT-KB: Fonction pour construire le prompt dynamique avec KB + contexte bagage.
 * @param locale - Langue de réponse
 * @param contextStr - Chaîne de contexte bagage dynamique (injectée à la fin)
 */
function buildSystemPrompt(locale: Language, contextStr: string): string {
  const prompts: Record<Language, string> = {
    fr: `Tu es l'assistant QRBag, un agent de support intelligent. Réponds en français, de façon concise (max 3 phrases) et empathique.

CONNAISSANCES QRBag :
• Service de protection de bagages via QR codes uniques. Multi-contextes (✈️🚢🚌).
• Pages : /inscrire (activation), /scan/[ref] (trouveur), /suivi/[ref] (propriétaire).
• Confidentialité stricte : numéros/emails jamais affichés en clair. Mise en relation sécurisée via boutons.
• Modèle B2C : vente de packs QR aux voyageurs. Pas de consigne/stockage.

💰 TARIFS :
• Pack 3 QR : 9,90€ | Pack 10 QR : 24,90€ | Pack 30 QR : 59,90€
• Livraison digitale immédiate. Paiement : Carte, Mobile Money.
• Achat : qrbags.com/inscrire

🆘 CONTACT SAV :
• Email : support@qrbags.com | WhatsApp : +221 78 XXX XX XX | Lun-Ven 9h-18h GMT
• Délai réponse : <2h. Orientations empathiques vers le SAV si hors scope ou sensible.

FAQ TOP 5 :
• Activation ? → qrbags.com/inscrire + référence QR
• Bagage perdu ? → Alerte WhatsApp + suivi si scan par trouveur
• Données sécurisées ? → Oui, jamais en clair, boutons de contact uniquement
• QR unique ? → Oui, 1 QR = 1 bagage pour sécurité
• Trouveur injoignable ? → Contacter l'agence ou le SAV

CONTEXTE BAGAGE ACTUEL :
${contextStr}

RÈGLES :
- Réponds UNIQUEMENT sur QRBag, les bagages, le voyage, la protection.
- Si question sensible/hors scope → oriente empathiquement vers le SAV.
- Ne jamais inventer d'info non présente dans la KB ou le contexte.
- Ne jamais donner de conseil juridique ou médical.
- Pour contacter le propriétaire : utiliser les boutons WhatsApp/Phone de la page.`,

    en: `You are the QRBag assistant, an intelligent support agent. Respond in English, concisely (max 3 sentences) and empathetically.

QRBag KNOWLEDGE:
• Baggage protection service via unique QR codes. Multi-context (✈️🚢🚌).
• Pages: /inscrire (activation), /scan/[ref] (finder), /suivi/[ref] (owner).
• Strict confidentiality: phone/email never shown in plain text. Secure connection via buttons.
• B2C model: selling QR packs to travelers. No luggage storage/consignment.

💰 PRICING:
• Pack 3 QR: 9.90€ | Pack 10 QR: 24.90€ | Pack 30 QR: 59.90€
• Instant digital delivery. Payment: Card, Mobile Money.
• Purchase: qrbags.com/inscrire

🆘 SUPPORT CONTACT:
• Email: support@qrbags.com | WhatsApp: +221 78 XXX XX XX | Mon-Fri 9am-6pm GMT
• Response time: <2h. Empathetic redirection to support if off-scope or sensitive.

TOP 5 FAQ:
• Activation? → qrbags.com/inscrire + QR reference
• Lost baggage? → WhatsApp alert + tracking if scanned by finder
• Data secure? → Yes, never in plain text, buttons only
• Unique QR? → Yes, 1 QR = 1 baggage for security
• Finder unreachable? → Contact the agency or support

CURRENT BAGGAGE CONTEXT:
${contextStr}

RULES:
- Respond ONLY about QRBag, baggage, travel, protection.
- If sensitive/off-topic question → empathetically redirect to support.
- Never invent info not in the KB or context.
- Never give legal or medical advice.
- To contact the owner: use the WhatsApp/Phone buttons on the page.`,

    ar: `أنت مساعد QRBag، وكيل دعم ذكي. أجب باللغة العربية، بطريقة موجزة (بحد أقصى 3 جمل) وبلطف.

معرفة QRBag :
• خدمة حماية الأمتعة عبر رموز QR فريدة. متعددة السياقات (✈️🚢🚌).
• الصفحات: /inscrire (التفعيل)، /scan/[ref] (لمن يجدها)، /suivi/[ref] (للمالك).
• سرية صارمة: الأرقام/البريد لا تُعرض أبداً. تواصل آمن عبر أزرار.
• نموذج B2C: بيع باقات QR للمسافرين. لا تخزين/حفظ أمتعة.

💰 الأسعار :
• باقة 3 QR : 9.90€ | باقة 10 QR : 24.90€ | باقة 30 QR : 59.90€
• تسليم رقمي فوري. الدفع: بطاقة، أموال محمولة.
• الشراء: qrbags.com/inscrire

🆘 اتصل بالدعم :
• البريد: support@qrbags.com | واتساب: +221 78 XXX XX XX | الاثنين-الجمعة 9ص-6م GMT
• وقت الرد: <2 ساعة. توجيه بلطف إلى الدعم إذا خارج النطاق أو حساس.

الأسئلة الأكثر شيوعاً :
• التفعيل؟ → qrbags.com/inscrire + مرجع QR
• أمتعة مفقودة؟ → تنبيه واتساب + تتبع إذا مسحها من وجدها
• البيانات آمنة؟ → نعم، أبداً بشكل واضح، أزرار فقط
• QR فريد؟ → نعم، 1 QR = 1 حقيبة للأمان
• لم يتم العثور على من وجدها؟ → اتصل بالوكالة أو الدعم

سياق الأمتعة الحالي :
${contextStr}

القواعد :
• أجب فقط عن QRBag، الأمتعة، السفر، الحماية.
• إذا كان السؤال حساساً/خارج النطاق → وجّه بلطف إلى الدعم.
• لا تخترع أبداً معلومات غير موجودة في المعرفة أو السياق.
• لا تقدم أبداً نصيحة قانونية أو طبية.
• للتواصل مع المالك: استخدم أزرار واتساب/الهاتف في الصفحة.`,
  };

  return prompts[locale] || prompts.fr;
}

// ═══════════════════════════════════════════════════════
//  CHATBOT-KB: SANITIZATION
// ═══════════════════════════════════════════════════════

/**
 * CHATBOT-KB: Nettoie la question utilisateur pour éviter les injections de prompt basiques.
 * - Supprime les balises HTML
 * - Supprime les backticks (markdown)
 * // TEST: Sanitization → <script>alert('xss')</script> nettoyé
 */
function sanitizeQuestion(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')       // Strip HTML tags
    .replace(/`{3}[\s\S]*?`{3}/g, '') // Strip code blocks
    .replace(/`[^`]*`/g, '')        // Strip inline code
    .trim();
}

// ═══════════════════════════════════════════════════════
//  VALIDATION
// ═══════════════════════════════════════════════════════

function validateBody(body: unknown): { valid: true; data: ChatRequestBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body.' };
  }

  const data = body as Record<string, unknown>;

  if (!data.reference || typeof data.reference !== 'string' || data.reference.trim().length === 0) {
    return { valid: false, error: 'Reference is required.' };
  }

  if (!data.question || typeof data.question !== 'string' || data.question.trim().length === 0) {
    return { valid: false, error: 'Question is required.' };
  }

  if (data.question.trim().length > 500) {
    return { valid: false, error: 'Question too long (max 500 characters).' };
  }

  // CHATBOT-KB: Parse baggageContext with transportMode support
  const rawCtx = data.baggageContext;
  const ctx = typeof rawCtx === 'object' && rawCtx !== null ? rawCtx as Record<string, unknown> : null;

  return {
    valid: true,
    data: {
      reference: data.reference.trim(),
      question: data.question.trim().substring(0, 500),
      locale: typeof data.locale === 'string' && ['fr', 'en', 'ar'].includes(data.locale)
        ? (data.locale as Language)
        : undefined,
      baggageContext: ctx ? {
        destination: typeof ctx.destination === 'string' ? ctx.destination : undefined,
        city: typeof ctx.city === 'string' ? ctx.city : undefined,
        agency: typeof ctx.agency === 'string' ? ctx.agency : undefined,
        status: typeof ctx.status === 'string' ? ctx.status : undefined,
        // CHATBOT-KB: transportMode added
        transportMode: typeof ctx.transportMode === 'string' ? ctx.transportMode : undefined,
      } : undefined,
    },
  };
}

// ═══════════════════════════════════════════════════════
//  CHATBOT-KB: TIMEOUT WRAPPER
//  Même pattern que generateWhatsAppMessage() dans groq.ts
// // TEST: Timeout 3s → fallback silencieux si Groq lent
// ═══════════════════════════════════════════════════════

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) =>
      setTimeout(() => resolve(fallback), ms)
    ),
  ]);
}

// ═══════════════════════════════════════════════════════
//  POST HANDLER
// ═══════════════════════════════════════════════════════

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // ─── Parse body ───
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const validation = validateBody(rawBody);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { reference, question, baggageContext } = validation.data;

    // CHATBOT-KB: Sanitize question to prevent prompt injection
    const sanitizedQuestion = sanitizeQuestion(question);

    // ─── 1. Rate limiting (10 req/min par IP) ───
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    if (rateLimit(`chat:${clientIp}`, { windowMs: 60_000, maxRequests: 10 })) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please wait.' },
        { status: 429 }
      );
    }

    // ─── 2. Kill switch triple check (GROQ_AI_ENABLED + GROQ_CHAT_ENABLED + DB FeatureFlag) ───
    if (!GROQ_AI_ENABLED || !GROQ_CHAT_ENABLED) {
      const locale = validation.data.locale || detectLocaleFromHeaders(request.headers);
      return NextResponse.json({
        success: true,
        fallback: true,
        answer: FALLBACK_RESPONSES[locale],
        latencyMs: Date.now() - startTime,
      } satisfies ChatResponse);
    }

    const chatbotEnabled = await isFeatureEnabled('chatbot_finder').catch(() => false);
    if (!chatbotEnabled) {
      const locale = validation.data.locale || detectLocaleFromHeaders(request.headers);
      return NextResponse.json({
        success: true,
        fallback: true,
        answer: FALLBACK_RESPONSES[locale],
        latencyMs: Date.now() - startTime,
      } satisfies ChatResponse);
    }

    // ─── 3. Fetch baggage (pour enrichir le contexte si manquant) ───
    let destination = baggageContext?.destination || '';
    let city = baggageContext?.city || '';
    let agency = baggageContext?.agency || '';
    let baggageStatus = baggageContext?.status || '';
    // CHATBOT-KB: transportMode with safe fallback
    let transportMode = baggageContext?.transportMode || '';

    if (!destination || !agency || !transportMode) {
      try {
        const baggage = await db.baggage.findUnique({
          where: { reference },
          select: {
            destination: true,
            agency: { select: { name: true } },
            status: true,
            // CHATBOT-KB: Fetch transportMode from DB
            transportMode: true,
          },
        });
        if (baggage) {
          destination = destination || baggage.destination || '';
          agency = agency || baggage.agency?.name || '';
          baggageStatus = baggageStatus || baggage.status || '';
          // CHATBOT-KB: safeTransportMode fallback for legacy data
          transportMode = transportMode || safeTransportMode(baggage.transportMode);
        }
      } catch {
        // Continue without baggage context
      }
    }

    // ─── 4. Detect locale ───
    const locale = validation.data.locale || detectLocaleFromHeaders(request.headers);

    // ─── 5. Build dynamic context string ───
    const transportLabels: Record<string, string> = {
      flight: '✈️ Avion',
      train: '🚆 Train',
      boat: '🚢 Bateau',
      bus: '🚌 Bus',
    };
    const safeMode = safeTransportMode(transportMode);

    const contextParts = [
      `Bagage ${reference}`,
      transportMode ? `Mode de transport: ${transportLabels[safeMode] || safeMode}` : '',
      destination ? `Destination: ${destination}` : '',
      city ? `Dernier scan: ${city}` : '',
      agency ? `Agence: ${agency}` : '',
      baggageStatus ? `Statut: ${baggageStatus}` : '',
    ].filter(Boolean).join(', ');

    // ─── 6. Build messages with KB-enriched system prompt ───
    const systemPrompt = buildSystemPrompt(locale, contextParts);

    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: sanitizedQuestion },
    ];

    // Add history if provided — validate each entry to prevent prompt injection
    const historyPayload = rawBody as Record<string, unknown>;
    const rawHistory = historyPayload.history;
    if (Array.isArray(rawHistory) && rawHistory.length > 0) {
      const validHistory = rawHistory
        .filter((m) =>
          m && typeof m === 'object' &&
          typeof m.role === 'string' && (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' && m.content.length <= 500
        )
        .slice(-10)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: sanitizeQuestion(m.content as string).substring(0, 500),
        }));
      if (validHistory.length > 0) {
        messages.splice(1, 0, ...validHistory);
      }
    }

    // ─── 7. Call Groq with timeout 3s ───
    const timeoutFallback: GroqResult = {
      success: false,
      error: 'Chatbot timeout (3s)',
      fallback: true,
      latencyMs: CHATBOT_TIMEOUT_MS,
    };

    // CHATBOT-KB: Temperature 0.7, max_tokens 300, timeout 3s
    const result = await withTimeout(
      callGroqAI({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
      CHATBOT_TIMEOUT_MS,
      timeoutFallback,
    );

    const latencyMs = Date.now() - startTime;

    // ─── 8. Process result ───
    if (result.success && result.content) {
      const cleaned = result.content
        .replace(/^["'`]+|["'`]+$/g, '')
        .trim();

      // CHATBOT-KB: Logging [Groq/Chat] on success
      console.log(`[Groq/Chat] ${reference} → ${latencyMs}ms`);

      logMetric('groq', 'chatbot_response', latencyMs, true, {
        key: reference,
        details: `locale=${locale}, chars=${cleaned.length}`,
      });

      return NextResponse.json({
        success: true,
        fallback: false,
        answer: cleaned,
        latencyMs,
      } satisfies ChatResponse);
    }

    // Fallback
    logMetric('groq', 'chatbot_response', latencyMs, false, {
      key: reference,
      details: result.error || 'unknown',
    });

    return NextResponse.json({
      success: true,
      fallback: true,
      answer: FALLBACK_RESPONSES[locale],
      latencyMs,
    } satisfies ChatResponse);

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.error(`[Groq/Chat] ✗ Error:`, error);

    logMetric('groq', 'chatbot_response', latencyMs, false, {
      details: error instanceof Error ? error.message : 'unknown',
    });

    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
