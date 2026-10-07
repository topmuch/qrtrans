'use client';

import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  RefreshCw,
  Inbox,
  HelpCircle,
  LifeBuoy,
} from "lucide-react";
import { useAgency } from '../layout';

interface Message {
  id: string;
  type: string;
  status: string;
  subject: string | null;
  content: string;
  senderName: string | null;
  createdAt: string;
}

export default function AssistancePage() {
  const { agencyId, agencyName, agencyData } = useAgency();
  const [form, setForm] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'sent' | 'replies'>('new');

  useEffect(() => {
    fetchMessages();
  }, [agencyId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const sentRes = await fetch(`/api/agency/messages?agencyId=${agencyId}&type=assistance_agence`);
      const sentData = await sentRes.json();

      const repliesRes = await fetch(`/api/agency/messages?agencyId=${agencyId}&type=reponse_assistance`);
      const repliesData = await repliesRes.json();

      const allMessages = [
        ...(sentData.messages || []),
        ...(repliesData.messages || [])
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setMessages(allMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/agency/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'assistance_agence',
          agencyId: agencyId,
          senderName: agencyName,
          subject: form.subject,
          content: {
            message: form.message,
            priority: form.priority,
            agencyName: agencyName,
            agencyEmail: agencyData?.email
          }
        })
      });

      if (response.ok) {
        setSuccess(true);
        setForm({ subject: '', message: '', priority: 'normal' });
        fetchMessages();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Téléphone",
      value: "+221 33 123 45 67",
      subtitle: "Lun-Ven, 9h-18h"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      value: "support@qrtrans.com",
      subtitle: "Réponse sous 24h"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Adresse",
      value: "Dakar, Sénégal",
      subtitle: "Siège social"
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return parsed.message || parsed.nom || content;
    } catch {
      return content;
    }
  };

  const sentMessages = messages.filter(m => m.type === 'assistance_agence');
  const replies = messages.filter(m => m.type === 'reponse_assistance');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-[var(--dash-brand)]" />
            Assistance
          </h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Notre équipe est là pour vous aider</p>
        </div>
        <button
          onClick={fetchMessages}
          className="p-2 text-[var(--dash-muted)] hover:text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] rounded-lg transition-colors"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('new')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'new'
              ? 'bg-[var(--dash-brand)] text-white'
              : 'bg-[var(--dash-card)] text-[var(--dash-muted)] hover:bg-[var(--dash-bg-3)] border border-[var(--dash-border)]'
          }`}
        >
          <Send className="w-4 h-4" />
          Nouveau message
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'sent'
              ? 'bg-[var(--dash-brand)] text-white'
              : 'bg-[var(--dash-card)] text-[var(--dash-muted)] hover:bg-[var(--dash-bg-3)] border border-[var(--dash-border)]'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Mes messages ({sentMessages.length})
        </button>
        <button
          onClick={() => setActiveTab('replies')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'replies'
              ? 'bg-[var(--dash-brand)] text-white'
              : 'bg-[var(--dash-card)] text-[var(--dash-muted)] hover:bg-[var(--dash-bg-3)] border border-[var(--dash-border)]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Réponses ({replies.length})
        </button>
      </div>

      {/* New Message Form */}
      {activeTab === 'new' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="dash-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--dash-brand-soft)] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[var(--dash-brand)]" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-[var(--dash-ink)]">Envoyer un message</h2>
                  <p className="text-sm text-[var(--dash-muted)]">Nous vous répondrons dans les plus brefs délais</p>
                </div>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)]/30 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--dash-emerald)]" />
                  <span className="text-[var(--dash-emerald)]">Message envoyé avec succès !</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2">Sujet</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Objet de votre demande"
                    className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] placeholder-[var(--dash-muted-2)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2">Priorité</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
                  >
                    <option value="low">Basse</option>
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre problème ou votre question..."
                    rows={5}
                    className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] placeholder-[var(--dash-muted-2)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-brand btn-magnetic w-full py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info & Working Hours */}
          <div className="space-y-6">
            <div className="dash-card p-6">
              <h3 className="font-display text-lg font-semibold text-[var(--dash-ink)] mb-4">Nous contacter</h3>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--dash-bg-3)] flex items-center justify-center text-[var(--dash-brand)]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-[var(--dash-muted)]">{item.title}</p>
                      <p className="text-[var(--dash-ink)] font-medium">{item.value}</p>
                      <p className="text-xs text-[var(--dash-muted-2)]">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-gradient-to-br from-[var(--dash-brand)] to-[var(--dash-brand-2)] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5" />
                <h3 className="font-semibold">Horaires d&apos;assistance</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Lundi - Vendredi</span>
                  <span className="font-medium">9h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Samedi</span>
                  <span className="font-medium">9h00 - 12h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Dimanche</span>
                  <span className="font-medium">Fermé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sent Messages Tab */}
      {activeTab === 'sent' && (
        <div className="dash-card overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[var(--dash-muted)]">Chargement...</p>
            </div>
          ) : sentMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
                <Inbox className="w-8 h-8 text-[var(--dash-muted)]" />
              </div>
              <p className="text-[var(--dash-muted)]">Aucun message envoyé</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--dash-border)]">
              {sentMessages.map((msg) => (
                <div key={msg.id} className="p-6 hover:bg-[var(--dash-bg-3)] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-[var(--dash-ink)]">{msg.subject || 'Sans sujet'}</h3>
                        <span className={
                          msg.status === 'non_lu' ? 'dash-badge dash-badge-danger' :
                          msg.status === 'lu' ? 'dash-badge dash-badge-info' :
                          'dash-badge dash-badge-success'
                        }>
                          {msg.status === 'non_lu' ? 'Non lu' : msg.status === 'lu' ? 'Lu' : 'Traité'}
                        </span>
                      </div>
                      <p className="text-[var(--dash-ink-2)] text-sm line-clamp-2">
                        {parseContent(msg.content)}
                      </p>
                      <p className="text-[var(--dash-muted-2)] text-xs mt-2">{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Replies Tab */}
      {activeTab === 'replies' && (
        <div className="dash-card overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--dash-emerald)]/30 border-t-[var(--dash-emerald)] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[var(--dash-muted)]">Chargement...</p>
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
                <MessageCircle className="w-8 h-8 text-[var(--dash-muted)]" />
              </div>
              <p className="text-[var(--dash-muted)]">Aucune réponse pour le moment</p>
              <p className="text-[var(--dash-muted-2)] text-sm mt-2">Les réponses du support apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--dash-border)]">
              {replies.map((msg) => (
                <div key={msg.id} className="p-6 bg-[var(--dash-emerald-soft)]">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--dash-emerald)] flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">SA</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-[var(--dash-ink)]">Support QRTrans</h3>
                        <span className="dash-badge dash-badge-success">
                          Réponse
                        </span>
                      </div>
                      <p className="text-[var(--dash-ink-2)] text-sm">
                        {msg.subject && <strong className="block mb-1">{msg.subject}</strong>}
                        {parseContent(msg.content)}
                      </p>
                      <p className="text-[var(--dash-muted-2)] text-xs mt-2">{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
