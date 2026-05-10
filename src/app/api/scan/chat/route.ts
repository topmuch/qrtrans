/**
 * AI-FEATURE: API Route — Chatbot Trouveur (Feature #1)
 *
 * POST /api/scan/chat
 *
 * Route publique (sans auth) permettant au trouveur de poser des questions
 * contextuelles sur un bagage via Groq AI.
 *
 * Sécurité:
 *   - Rate limiting: 10 req/min par IP
 *   - Validation stricte de la référence et de la question
 *   - Kill switch: GROQ_AI_ENABLED + GROQ_CHAT_ENABLED + DB FeatureFlag 'chatbot_finder'
 *   - Ne bloque jamais: fallback si Groq échoue
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callGroqAI } from '@/lib/groq';
import { GROQ_AI_ENABLED, GROQ_CHAT_ENABLED } from '@/lib/config';
import { isFeatureEnabled } from '@/lib/features';
import { detectLocaleFromHeaders } from '@/lib/i18n';
import { logMetric } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import type { Language } from '@/lib/i18n';
import type { GroqMessage } from '@/types/ai';

export const dynamic = 'force-dynamic';

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
  };
}

interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ═══════════════════════════════════════════════════════
//  FALLBACK RESPONSES (par langue)
// ═══════════════════════════════════════════════════════

const FALLBACK_RESPONSES: Record<Language, string> = {
  fr: "Désolé, je ne peux pas répondre pour le moment. Veuillez contacter le propriétaire directement via WhatsApp.",
  en: "Sorry, I can't answer right now. Please contact the owner directly via WhatsApp.",
  ar: "عذراً، لا أستطيع الإجابة حالياً. يرجى الاتصال بالمالك مباشرة عبر واتساب.",
};

// ═══════════════════════════════════════════════════════
//  SYSTEM PROMPTS (par langue)
// ═══════════════════════════════════════════════════════

const CHATBOT_SYSTEM_PROMPTS: Record<Language, (ctx: string) => string> = {
  fr: (ctx) =>
    `Tu es l'assistant QRBag. Réponds en français, de façon concise et rassurante (max 3 phrases).
Contexte : ${ctx}
Règles :
- Ne jamais inventer de localisation ou d'information non présente dans le contexte.
- Si le bagage est actif, encourager à patienter et à contacter le propriétaire.
- Proposer un contact WhatsApp si besoin.
- Si question hors sujet, rediriger poliment vers le sujet du bagage.
- Ne jamais donner de conseil juridique ou médical.`,

  en: (ctx) =>
    `You are the QRBag assistant. Respond in English, concisely and reassuringly (max 3 sentences).
Context: ${ctx}
Rules:
- Never invent location or information not present in context.
- If baggage is active, encourage patience and contacting the owner.
- Suggest WhatsApp contact if needed.
- If off-topic, politely redirect to the baggage subject.
- Never give legal or medical advice.`,

  ar: (ctx) =>
    `أنت مساعد QRBag. أجب باللغة العربية، بطريقة موجزة ومطمئنة (بحد أقصى 3 جمل).
السياق: ${ctx}
القواعد:
- لا تخترع أبداً موقعاً أو معلومات غير موجودة في السياق.
- إذا كانت الأمتعة نشطة، شجع على الصبر والتواصل مع المالك.
- اقترح التواصل عبر واتساب إذا لزم الأمر.
- إذا كان السؤال خارج الموضوع، أعد التوجيه بلباقة إلى موضوع الأمتعة.
- لا تقدم أبداً نصيحة قانونية أو طبية.`,
};

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

  return {
    valid: true,
    data: {
      reference: data.reference.trim(),
      question: data.question.trim().substring(0, 500),
      locale: typeof data.locale === 'string' && ['fr', 'en', 'ar'].includes(data.locale)
        ? (data.locale as Language)
        : undefined,
      baggageContext: typeof data.baggageContext === 'object' && data.baggageContext !== null
        ? {
            destination: typeof (data.baggageContext as Record<string, unknown>).destination === 'string'
              ? (data.baggageContext as Record<string, unknown>).destination as string : undefined,
            city: typeof (data.baggageContext as Record<string, unknown>).city === 'string'
              ? (data.baggageContext as Record<string, unknown>).city as string : undefined,
            agency: typeof (data.baggageContext as Record<string, unknown>).agency === 'string'
              ? (data.baggageContext as Record<string, unknown>).agency as string : undefined,
            status: typeof (data.baggageContext as Record<string, unknown>).status === 'string'
              ? (data.baggageContext as Record<string, unknown>).status as string : undefined,
          }
        : undefined,
    },
  };
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

    // ─── 1. Rate limiting (10 req/min par IP) ───
    // NOTE: x-forwarded-for is trusted here because the app runs behind
    // Caddy/Vercel reverse proxy which overwrites this header.
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    if (rateLimit(`chat:${clientIp}`, { windowMs: 60_000, maxRequests: 10 })) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please wait.' },
        { status: 429 }
      );
    }

    // ─── 2. Kill switch triple check ───
    if (!GROQ_AI_ENABLED || !GROQ_CHAT_ENABLED) {
      const locale = validation.data.locale || detectLocaleFromHeaders(request.headers);
      return NextResponse.json({
        success: true,
        fallback: true,
        content: FALLBACK_RESPONSES[locale],
        latencyMs: Date.now() - startTime,
      });
    }

    const chatbotEnabled = await isFeatureEnabled('chatbot_finder').catch(() => false);
    if (!chatbotEnabled) {
      const locale = validation.data.locale || detectLocaleFromHeaders(request.headers);
      return NextResponse.json({
        success: true,
        fallback: true,
        content: FALLBACK_RESPONSES[locale],
        latencyMs: Date.now() - startTime,
      });
    }

    // ─── 3. Fetch baggage (optionnel — pour enrichir le contexte) ───
    let destination = baggageContext?.destination || '';
    let city = baggageContext?.city || '';
    let agency = baggageContext?.agency || '';
    let baggageStatus = baggageContext?.status || '';

    if (!destination || !agency) {
      try {
        const baggage = await db.baggage.findUnique({
          where: { reference },
          select: { destination: true, agency: { select: { name: true } }, status: true },
        });
        if (baggage) {
          destination = destination || baggage.destination || '';
          agency = agency || baggage.agency?.name || '';
          baggageStatus = baggageStatus || baggage.status || '';
        }
      } catch {
        // Continue without baggage context
      }
    }

    // ─── 4. Detect locale ───
    const locale = validation.data.locale || detectLocaleFromHeaders(request.headers);

    // ─── 5. Build context + call Groq ───
    const contextParts = [
      `Baggage ${reference}`,
      destination ? `destination ${destination}` : '',
      city ? `last scan at ${city}` : '',
      agency ? `agency: ${agency}` : '',
      baggageStatus ? `status: ${baggageStatus}` : '',
    ].filter(Boolean).join(', ');

    const messages: GroqMessage[] = [
      { role: 'system', content: CHATBOT_SYSTEM_PROMPTS[locale](contextParts) },
      { role: 'user', content: question },
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
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: (m.content as string).substring(0, 500) }));
      if (validHistory.length > 0) {
        messages.splice(1, 0, ...validHistory);
      }
    }

    const result = await callGroqAI({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.5,
      max_tokens: 200,
    });

    const latencyMs = Date.now() - startTime;

    if (result.success && result.content) {
      const cleaned = result.content
        .replace(/^["'`]+|["'`]+$/g, '')
        .trim();

      logMetric('groq', 'chatbot_response', latencyMs, true, {
        key: reference,
        details: `locale=${locale}, chars=${cleaned.length}`,
      });

      return NextResponse.json({
        success: true,
        fallback: false,
        content: cleaned,
        latencyMs,
      });
    }

    // Fallback
    logMetric('groq', 'chatbot_response', latencyMs, false, {
      key: reference,
      details: result.error || 'unknown',
    });

    return NextResponse.json({
      success: true,
      fallback: true,
      content: FALLBACK_RESPONSES[locale],
      latencyMs,
    });

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.error(`[Groq/Chatbot] ✗ Error:`, error);

    logMetric('groq', 'chatbot_response', latencyMs, false, {
      details: error instanceof Error ? error.message : 'unknown',
    });

    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
