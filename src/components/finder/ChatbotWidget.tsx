'use client';

/**
 * AI-FEATURE: Chatbot Trouveur (Feature #1)
 *
 * Widget chat flottant pour la page /scan/[reference].
 * Permet au trouveur de poser des questions contextuelles sur le bagage.
 *
 * Props:
 *   - reference: Référence du bagage
 *   - baggageContext: Infos du bagage pour enrichir le contexte IA
 *   - locale: Langue détectée ('fr' | 'en' | 'ar')
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotWidgetProps {
  reference: string;
  baggageContext?: {
    destination?: string;
    city?: string;
    agency?: string;
    status?: string;
  };
  locale: 'fr' | 'en' | 'ar';
  t: (key: string) => string;
  dir?: 'ltr' | 'rtl';
}

// ═══════════════════════════════════════════════════════
//  SUGGESTIONS
// ═══════════════════════════════════════════════════════

function getSuggestions(t: (key: string) => string): string[] {
  return [
    t('chatbot.suggestion_1'),
    t('chatbot.suggestion_2'),
    t('chatbot.suggestion_3'),
    t('chatbot.suggestion_4'),
  ];
}

// ═══════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════

export default function ChatbotWidget({
  reference,
  baggageContext,
  locale,
  t,
  dir = 'ltr',
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Conditional load: show button only after page is loaded
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/scan/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          question: text.trim(),
          locale,
          baggageContext,
          history: messages.slice(-6), // Send last 6 messages for context
        }),
      });

      const data = await response.json();

      if (data.success && data.content) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.content },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatbot.error') },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatbot.error_fallback') },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [reference, locale, baggageContext, messages, isLoading, t]);

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  }, [input, sendMessage]);

  if (!isLoaded) return null;

  return (
    <>
      {/* ─── Floating Button ─── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={t('chatbot.aria_open')}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-full shadow-lg shadow-orange-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#6613e3]"
        >
          <Bot className="w-7 h-7" />
        </button>
      )}

      {/* ─── Chat Panel ─── */}
      {isOpen && (
        <div
          ref={panelRef}
          dir={dir}
          className="fixed bottom-0 right-0 z-50 w-full sm:bottom-6 sm:right-6 sm:w-[380px] sm:max-h-[520px] bg-[#1a1040] border-t border-white/20 sm:border sm:border-white/20 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
          style={{ maxHeight: 'min(85vh, 520px)' }}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#6613e3] to-[#4b0082] border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-orange-300" />
              <span className="text-white font-semibold text-sm">{t('chatbot.title')}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={t('chatbot.aria_close')}
              className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ─── Messages ─── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] custom-scrollbar">
            {/* Welcome message (only if no messages) */}
            {messages.length === 0 && (
              <div className="text-center text-white/60 text-sm py-6">
                <p className="text-lg mb-1">🤖</p>
                <p>{t('chatbot.welcome')}</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-orange-500' : 'bg-white/10'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-white" />
                    : <Bot className="w-3.5 h-3.5 text-orange-300" />
                  }
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-md'
                      : 'bg-white/10 text-white rounded-tl-md'
                  }`}
                  role="log"
                  aria-label={t('chatbot.aria_message')}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-white/10">
                  <Bot className="w-3.5 h-3.5 text-orange-300 animate-pulse" />
                </div>
                <div className="bg-white/10 text-white/70 px-3 py-2 rounded-2xl rounded-tl-md text-sm">
                  {t('chatbot.thinking')}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── Suggestions (only when empty) ─── */}
          {messages.length === 0 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {getSuggestions(t).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs rounded-full border border-white/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* ─── Input ─── */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 border-t border-white/10 bg-[#0d0a2a]/50"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatbot.placeholder')}
              disabled={isLoading}
              maxLength={500}
              aria-label={t('chatbot.placeholder')}
              className="flex-1 bg-white/10 text-white placeholder:text-white/40 text-sm px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-transparent disabled:opacity-50 transition-all min-h-[40px]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label={t('chatbot.send')}
              className="w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
