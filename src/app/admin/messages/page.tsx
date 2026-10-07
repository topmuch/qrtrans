'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Eye,
  CheckCircle,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  Send,
  XCircle,
  MessageSquare,
  Inbox,
  Handshake,
  Package,
  Reply,
  Crown,
  AlertCircle,
  CheckCheck,
} from "lucide-react";
import { AIBadge } from '@/components/ai/AIIndicators';
import KpiCard from '@/components/dashboard/KpiCard';

// Types
interface Message {
  id: string;
  type: string;
  status: string;
  subject: string | null;
  senderName: string | null;
  senderEmail: string | null;
  senderPhone: string | null;
  agencyId: string | null;
  recipientAgencyId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Type labels — lucide icons instead of emojis
type LucideIcon = typeof Mail;
const TYPE_LABELS: Record<string, { label: string; icon: LucideIcon; cls: string }> = {
  contact: { label: 'Contact', icon: Mail, cls: 'dash-badge dash-badge-info' },
  partenaire: { label: 'Partenaire', icon: Handshake, cls: 'dash-badge dash-badge-info' },
  commande_agence: { label: 'Commande', icon: Package, cls: 'dash-badge dash-badge-warning' },
  assistance_agence: { label: 'Assistance', icon: MessageSquare, cls: 'dash-badge dash-badge-warning' },
  reponse_assistance: { label: 'Réponse', icon: Reply, cls: 'dash-badge dash-badge-success' },
  message_superadmin: { label: 'SuperAdmin', icon: Crown, cls: 'dash-badge dash-badge-danger' },
};

// Status config — uses dash-badge classes
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  non_lu: { label: 'Non lu', cls: 'dash-badge dash-badge-danger' },
  lu: { label: 'Lu', cls: 'dash-badge dash-badge-neutral' },
  traite: { label: 'Traité', cls: 'dash-badge dash-badge-success' },
};

// Format message content for display
function formatMessageContent(content: string, messageType: string): string {
  if (!content) return '';

  try {
    const parsed = JSON.parse(content);

    // Handle commande_agence type
    if (messageType === 'commande_agence') {
      const typeLabel = parsed.type === 'hajj' ? 'Hajj (3 QR/pèlerin)' : 'Voyageur (1 ou 3 QR)';
      const countLabel = parsed.type === 'hajj' ? 'pèlerins' : 'voyageurs';
      const notes = parsed.notes ? `\nNotes: ${parsed.notes}` : '';
      return `Commande: ${parsed.count} ${countLabel}\nType: ${typeLabel}${notes}`;
    }

    // Handle assistance_agence type (contains message, priority, agencyName, agencyEmail)
    if (messageType === 'assistance_agence' && parsed.message) {
      const parts = [parsed.message];
      if (parsed.priority && parsed.priority !== 'normal') {
        parts.push(`Priorité: ${parsed.priority}`);
      }
      if (parsed.agencyName) {
        parts.push(`Agence: ${parsed.agencyName}`);
      }
      return parts.join('\n');
    }

    // Handle old contact/partenaire format (content was JSON with phone, subject, message)
    if (typeof parsed === 'object' && parsed !== null) {
      if (parsed.message && parsed.phone && parsed.subject) {
        // Old contact format: {phone, subject, message}
        return parsed.message;
      }
      if (parsed.message && parsed.agence) {
        // Old partenaire format: {agence, message}
        return `${parsed.agence}: ${parsed.message}`;
      }
      if (parsed.message) {
        return parsed.message;
      }
      if (parsed.nom) {
        const parts = [parsed.nom];
        if (parsed.email) parts.push(parsed.email);
        if (parsed.message) parts.push(parsed.message);
        return parts.join(' - ');
      }
    }

    // Default: try to extract meaningful text
    if (typeof parsed === 'string') return parsed;

    return content;
  } catch {
    // Not JSON — return plain text content
    return content;
  }
}

// Parse message content to extract structured fields (for detail modal)
function parseMessageFields(content: string, messageType: string) {
  const fields: { phone?: string; subject?: string; message: string; agencyName?: string; priority?: string } = {
    message: content,
  };

  try {
    const parsed = JSON.parse(content);
    if (typeof parsed !== 'object' || parsed === null) return fields;

    // Old contact format: {phone, subject, message}
    if (parsed.phone) fields.phone = parsed.phone;
    if (parsed.subject) fields.subject = parsed.subject;
    if (parsed.message) fields.message = parsed.message;

    // Old partenaire format: {agence, message}
    if (parsed.agence) fields.agencyName = parsed.agence;

    // Assistance format
    if (parsed.priority) fields.priority = parsed.priority;
    if (parsed.agencyName) fields.agencyName = parsed.agencyName;
  } catch {
    // Not JSON, content is already plain text
  }

  return fields;
}

// AI Summary Component for messages
function MessageSummaryCell({ content, messageType }: { content: string; messageType: string }) {
  const [summary, setSummary] = useState<string>('');
  const [wasSummarized, setWasSummarized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAIAndSummarize();
  }, [content, messageType]);

  const checkAIAndSummarize = async () => {
    // First, format the content properly
    const text = formatMessageContent(content, messageType);

    if (text.length <= 50) {
      setSummary(text);
      return;
    }

    try {
      const statusRes = await fetch('/api/ai/suggestions?status=true');
      const statusData = await statusRes.json();
      const enabled = statusData.aiStatus?.ai_message_summary === true;

      if (enabled) {
        setLoading(true);
        const res = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, maxLength: 50 })
        });
        const data = await res.json();

        if (data.success) {
          setSummary(data.summary);
          setWasSummarized(data.wasSummarized);
        } else {
          setSummary(text.substring(0, 50) + '...');
        }
      } else {
        setSummary(text.substring(0, 50) + '...');
      }
    } catch {
      setSummary(text.substring(0, 50) + '...');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <span className="text-[var(--dash-muted-2)] animate-pulse">Résumé...</span>;
  }

  return (
    <span className="text-[var(--dash-ink-2)] text-sm flex items-center gap-1">
      {wasSummarized && (
        <span className="shrink-0">
          <AIBadge tooltip="Résumé généré par IA - Désactivable dans Paramètres" />
        </span>
      )}
      {summary}
    </span>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [typeFilter, statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/messages?${params}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'lu' }),
      });
      fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleMarkAsProcessed = async (id: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'traite' }),
      });
      fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      await fetch(`/api/messages?id=${id}`, {
        method: 'DELETE',
      });
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleExportPDF = () => {
    alert('Export PDF à implémenter');
  };

  const openMessageDetails = (message: Message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

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
    return parseMessageFields(content, 'contact');
  };

  // Calculate stats
  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'non_lu').length,
    processed: messages.filter(m => m.status === 'traite').length,
  };
  const assistanceCount = messages.filter(m => m.type === 'assistance_agence').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">Messages</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Gérez vos messages et demandes</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="dash-badge dash-badge-danger">
              <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
              {unreadCount} nouveaux
            </span>
          )}
          <button
            onClick={fetchMessages}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total messages"
          value={stats.total === 0 ? '—' : stats.total}
          subtitle="Tous types"
          icon={Inbox}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Non lus"
          value={stats.unread === 0 ? '—' : stats.unread}
          subtitle="À traiter"
          icon={Mail}
          color="rose"
          loading={loading}
        />
        <KpiCard
          label="Traités"
          value={stats.processed === 0 ? '—' : stats.processed}
          subtitle="Clôturés"
          icon={CheckCheck}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="Assistance"
          value={assistanceCount === 0 ? '—' : assistanceCount}
          subtitle="Demandes agences"
          icon={MessageSquare}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="flex items-center gap-2">
          <span className="text-[var(--dash-muted)] text-sm">Type:</span>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="partenaire">Partenaire</SelectItem>
              <SelectItem value="commande_agence">Commande</SelectItem>
              <SelectItem value="assistance_agence">Assistance</SelectItem>
              <SelectItem value="reponse_assistance">Réponses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--dash-muted)] text-sm">Statut:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="non_lu">Non lus</SelectItem>
              <SelectItem value="lu">Lus</SelectItem>
              <SelectItem value="traite">Traités</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={handleExportPDF}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Messages Grid */}
      {loading ? (
        <div className="dash-card p-12 flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
          <span className="text-[var(--dash-muted)]">Chargement...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <Mail className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
          <p className="text-[var(--dash-muted)]">Aucun message</p>
          <p className="text-sm text-[var(--dash-muted-2)] mt-2">Les nouveaux messages apparaîtront ici</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {messages.map((message) => {
              const typeConfig = TYPE_LABELS[message.type] || { label: message.type, icon: Mail, cls: 'dash-badge dash-badge-neutral' };
              const statusConfig = STATUS_CONFIG[message.status] || { label: message.status, cls: 'dash-badge dash-badge-neutral' };
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={message.id}
                  className={`dash-card p-5 flex flex-col ${
                    message.status === 'non_lu' ? 'ring-2 ring-[var(--dash-emerald)]/40' : ''
                  }`}
                >
                  {/* Header with date + status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--dash-muted-2)]">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {formatDate(message.createdAt)}
                    </div>
                    <span className={statusConfig.cls}>
                      {statusConfig.label}
                    </span>
                  </div>
                  {/* Sender info */}
                  <h3 className="font-semibold text-[var(--dash-ink)] mb-0.5 truncate">{message.senderName || 'Anonyme'}</h3>
                  {message.senderEmail && <p className="text-sm text-[var(--dash-muted)] mb-2 truncate">{message.senderEmail}</p>}
                  {/* Type badge */}
                  <span className={`${typeConfig.cls} self-start mb-3`}>
                    <TypeIcon className="w-3 h-3" />
                    {typeConfig.label}
                  </span>
                  {/* Content preview */}
                  <div className="text-sm line-clamp-3 mb-4">
                    <MessageSummaryCell content={message.content} messageType={message.type} />
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-[var(--dash-border)] mt-auto">
                    <button
                      onClick={() => openMessageDetails(message)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--dash-bg-3)] text-[var(--dash-ink)] hover:bg-[var(--dash-brand-soft)] hover:text-[var(--dash-brand)] transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      Détails
                    </button>
                    {message.status === 'non_lu' && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--dash-bg-3)] text-[var(--dash-ink)] hover:bg-[var(--dash-emerald-soft)] hover:text-[var(--dash-emerald)] transition-colors"
                        title="Marquer comme lu"
                      >
                        <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        Lu
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--dash-muted)] hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 px-2 py-3 flex justify-between items-center">
            <span className="text-[var(--dash-muted)] text-sm">
              {messages.length} message(s)
            </span>
          </div>
        </>
      )}

      {/* Message Details Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--dash-border)]">
              <h2 className="text-xl font-bold text-[var(--dash-ink)]">Détails du message</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-[var(--dash-bg-3)] text-[var(--dash-muted)] hover:text-[var(--dash-ink)] transition-colors"
              >
                <XCircle className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Type</p>
                  <p className="text-[var(--dash-ink)] font-medium flex items-center gap-1.5">
                    {(() => {
                      const cfg = TYPE_LABELS[selectedMessage.type] || { label: selectedMessage.type, icon: Mail };
                      const Icon = cfg.icon;
                      return <Icon className="w-4 h-4" />;
                    })()}
                    {TYPE_LABELS[selectedMessage.type]?.label || selectedMessage.type}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Statut</p>
                  <span className={`${STATUS_CONFIG[selectedMessage.status]?.cls || 'dash-badge dash-badge-neutral'}`}>
                    {STATUS_CONFIG[selectedMessage.status]?.label || selectedMessage.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Nom</p>
                  <p className="text-[var(--dash-ink)]">{selectedMessage.senderName || '—'}</p>
                </div>
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Email</p>
                  <p className="text-[var(--dash-ink)] truncate">{selectedMessage.senderEmail || '—'}</p>
                </div>
              </div>

              {(selectedMessage.senderPhone || parseContent(selectedMessage.content).phone) && (
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Téléphone</p>
                  <p className="text-[var(--dash-ink)]">{selectedMessage.senderPhone || parseContent(selectedMessage.content).phone}</p>
                </div>
              )}

              {(selectedMessage.subject || parseContent(selectedMessage.content).subject) && (
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Sujet</p>
                  <p className="text-[var(--dash-ink)] font-medium">{selectedMessage.subject || parseContent(selectedMessage.content).subject}</p>
                </div>
              )}

              {parseContent(selectedMessage.content).priority && parseContent(selectedMessage.content).priority !== 'normal' && (
                <div>
                  <p className="text-[var(--dash-muted)] text-sm">Priorité</p>
                  <span className={
                    parseContent(selectedMessage.content).priority === 'urgent' ? 'dash-badge dash-badge-danger' :
                    parseContent(selectedMessage.content).priority === 'high' ? 'dash-badge dash-badge-warning' :
                    'dash-badge dash-badge-info'
                  }>
                    {parseContent(selectedMessage.content).priority}
                  </span>
                </div>
              )}

              <div>
                <p className="text-[var(--dash-muted)] text-sm mb-2">Contenu</p>
                <div className="bg-[var(--dash-bg-3)] rounded-xl p-4 border border-[var(--dash-border)]">
                  <p className="text-[var(--dash-ink-2)] text-sm whitespace-pre-wrap">
                    {formatMessageContent(selectedMessage.content, selectedMessage.type)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[var(--dash-muted)] text-sm">Date</p>
                <p className="text-[var(--dash-ink)]">{new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-[var(--dash-border)] flex flex-wrap gap-3">
              {selectedMessage.type === 'assistance_agence' && selectedMessage.agencyId && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowReplyModal(true);
                  }}
                  className="btn-emerald inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Répondre à l&apos;agence
                </button>
              )}
              {selectedMessage.senderEmail && selectedMessage.type !== 'assistance_agence' && (
                <a
                  href={`mailto:${selectedMessage.senderEmail}?subject=Re: Votre message sur QRTrans`}
                  className="btn-brand inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Répondre par email
                </a>
              )}
              {selectedMessage.status !== 'traite' && (
                <button
                  onClick={() => {
                    handleMarkAsProcessed(selectedMessage.id);
                    setShowModal(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--dash-emerald-soft)] text-[var(--dash-emerald)] hover:opacity-90 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  Marquer comme traité
                </button>
              )}
              <button
                onClick={() => {
                  handleDelete(selectedMessage.id);
                  setShowModal(false);
                }}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-[var(--dash-bg-3)] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-2xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--dash-border)]">
              <h2 className="text-xl font-bold text-[var(--dash-ink)]">Répondre à {selectedMessage.senderName || 'l\'agence'}</h2>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyContent('');
                }}
                className="p-2 rounded-xl hover:bg-[var(--dash-bg-3)] text-[var(--dash-muted)] hover:text-[var(--dash-ink)] transition-colors"
              >
                <XCircle className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Original Message */}
            <div className="p-6 border-b border-[var(--dash-border)]">
              <p className="text-[var(--dash-muted)] text-sm mb-2">Message original :</p>
              <div className="bg-[var(--dash-bg-3)] rounded-xl p-3 border border-[var(--dash-border)]">
                <p className="text-[var(--dash-ink-2)] text-sm whitespace-pre-wrap">
                  {selectedMessage.subject && <strong className="block mb-1">{selectedMessage.subject}</strong>}
                  {formatMessageContent(selectedMessage.content, selectedMessage.type)}
                </p>
              </div>
            </div>

            {/* Reply Form */}
            <div className="p-6">
              <label className="block text-[var(--dash-muted)] text-sm mb-2">Votre réponse :</label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
                className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl p-4 text-[var(--dash-ink)] placeholder-[var(--dash-muted-2)] focus:outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] resize-none"
                placeholder="Écrivez votre réponse ici..."
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyContent('');
                  }}
                  className="flex-1 py-3 bg-[var(--dash-bg-3)] text-[var(--dash-ink)] rounded-lg hover:bg-[var(--dash-border)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (!replyContent.trim()) return;
                    setReplySubmitting(true);
                    try {
                      await fetch('/api/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'reponse_assistance',
                          recipientAgencyId: selectedMessage.agencyId,
                          subject: `Re: ${selectedMessage.subject || 'Votre demande d\'assistance'}`,
                          content: replyContent,
                          senderName: 'Support QRTrans',
                        }),
                      });

                      await fetch('/api/messages', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: selectedMessage.id, status: 'traite' }),
                      });

                      setShowReplyModal(false);
                      setReplyContent('');
                      fetchMessages();
                    } catch (error) {
                      console.error('Error sending reply:', error);
                    } finally {
                      setReplySubmitting(false);
                    }
                  }}
                  disabled={replySubmitting || !replyContent.trim()}
                  className="btn-emerald flex-1 py-3 rounded-lg font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replySubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer la réponse
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
