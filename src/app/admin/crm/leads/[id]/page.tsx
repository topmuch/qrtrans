'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  Calendar,
  User,
  Plus,
  Save,
  MessageSquare,
  Clock,
  FileText,
  PhoneCall,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/lib/permissions';

// Types
type LeadStatus = 'new' | 'contacted' | 'in_discussion' | 'qualified' | 'converted' | 'lost';

interface Observation {
  id: string;
  type: string;
  content: string;
  date: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
  };
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  assignedToId: string | null;
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
  observations: Observation[];
  createdAt: string;
  updatedAt: string;
}

interface DailyReport {
  id: string;
  content: string;
  date: string;
}

// Status configuration
const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'Nouveau', className: 'dash-badge dash-badge-info' },
  contacted: { label: 'Contacté', className: 'dash-badge dash-badge-warning' },
  in_discussion: { label: 'En discussion', className: 'dash-badge dash-badge-warning' },
  qualified: { label: 'Qualifié', className: 'dash-badge dash-badge-info' },
  converted: { label: 'Converti', className: 'dash-badge dash-badge-success' },
  lost: { label: 'Perdu', className: 'dash-badge dash-badge-danger' },
};

// Observation type configuration
const OBSERVATION_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  note: { label: 'Note', icon: <FileText className="w-4 h-4" />, className: 'bg-[var(--dash-muted-2)]' },
  appel: { label: 'Appel', icon: <PhoneCall className="w-4 h-4" />, className: 'bg-[var(--dash-emerald)]' },
  rdv: { label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" />, className: 'bg-[var(--dash-brand)]' },
  email: { label: 'Email', icon: <Mail className="w-4 h-4" />, className: 'bg-[var(--dash-brand-2)]' },
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, className: 'bg-[var(--dash-emerald)]' },
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const { can, user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [observationDialogOpen, setObservationDialogOpen] = useState(false);

  // Observation form
  const [observationForm, setObservationForm] = useState({
    type: 'note',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Daily report
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [dailyReportContent, setDailyReportContent] = useState('');
  const [savingReport, setSavingReport] = useState(false);

  const canManage = can(PERMISSIONS.MANAGE_CRM);

  useEffect(() => {
    fetchLead();
    if (user?.id) fetchDailyReport();
  }, [leadId, user?.id]);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/leads/${leadId}`);
      const data = await res.json();
      setLead(data.lead || null);
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReport = async () => {
    if (!user?.id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/admin/crm/daily-reports?date=${today}&userId=${user.id}`);
      const data = await res.json();
      if (data.report) {
        setDailyReport(data.report);
        setDailyReportContent(data.report.content);
      }
    } catch (error) {
      console.error('Error fetching daily report:', error);
    }
  };

  const handleUpdateStatus = async (status: LeadStatus) => {
    try {
      const response = await fetch('/api/admin/crm/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status }),
      });

      if (response.ok) {
        fetchLead();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddObservation = async () => {
    if (!observationForm.content.trim() || !user?.id) return;

    try {
      const response = await fetch(`/api/admin/crm/leads/${leadId}/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...observationForm, userId: user.id }),
      });

      if (response.ok) {
        setObservationDialogOpen(false);
        setObservationForm({ type: 'note', content: '', date: new Date().toISOString().split('T')[0] });
        fetchLead();
      }
    } catch (error) {
      console.error('Error adding observation:', error);
    }
  };

  const handleSaveDailyReport = async () => {
    if (!dailyReportContent.trim() || !user?.id) return;
    setSavingReport(true);
    try {
      const response = await fetch('/api/admin/crm/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: dailyReportContent, userId: user.id }),
      });

      if (response.ok) {
        fetchDailyReport();
      }
    } catch (error) {
      console.error('Error saving daily report:', error);
    } finally {
      setSavingReport(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--dash-brand-soft)] border-t-[var(--dash-brand)] rounded-full" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <p className="text-[var(--dash-muted)]">Lead non trouvé</p>
          <button
            onClick={() => router.push('/admin/crm')}
            className="btn-brand btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mt-4"
          >
            Retour au CRM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push('/admin/crm')}
        className="inline-flex items-center gap-2 text-[var(--dash-muted)] hover:text-[var(--dash-ink)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au CRM
      </button>

      {/* Header Card */}
      <div className="dash-card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[var(--dash-brand)] to-[var(--dash-brand-2)] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">{lead.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {canManage ? (
                  <Select value={lead.status} onValueChange={(v) => handleUpdateStatus(v as LeadStatus)}>
                    <SelectTrigger className="w-[160px] h-9 bg-transparent border-0 p-0">
                      <span className={STATUS_CONFIG[lead.status]?.className}>
                        {STATUS_CONFIG[lead.status]?.label}
                      </span>
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                      <SelectItem value="new">Nouveau</SelectItem>
                      <SelectItem value="contacted">Contacté</SelectItem>
                      <SelectItem value="in_discussion">En discussion</SelectItem>
                      <SelectItem value="qualified">Qualifié</SelectItem>
                      <SelectItem value="converted">Converti</SelectItem>
                      <SelectItem value="lost">Perdu</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={STATUS_CONFIG[lead.status]?.className}>
                    {STATUS_CONFIG[lead.status]?.label}
                  </span>
                )}
                {lead.assignedTo && (
                  <div className="flex items-center gap-1 text-sm text-[var(--dash-muted)]">
                    <User className="w-4 h-4" />
                    {lead.assignedTo.name || 'Agent'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {canManage && (
            <button
              onClick={() => setObservationDialogOpen(true)}
              className="btn-emerald btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter une observation
            </button>
          )}
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--dash-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--dash-brand-soft)] rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-[var(--dash-brand)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--dash-muted)]">Email</p>
              <a href={`mailto:${lead.email}`} className="text-sm text-[var(--dash-brand)] hover:underline">
                {lead.email}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--dash-emerald-soft)] rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-[var(--dash-emerald)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--dash-muted)]">Téléphone</p>
              {lead.phone ? (
                <a href={`tel:${lead.phone}`} className="text-sm text-[var(--dash-emerald)] hover:underline">
                  {lead.phone}
                </a>
              ) : (
                <span className="text-sm text-[var(--dash-muted-2)]">Non renseigné</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--dash-bg-3)] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[var(--dash-ink-2)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--dash-muted)]">Entreprise</p>
              <span className="text-sm text-[var(--dash-ink-2)]">
                {lead.company || 'Non attribué'}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="mt-4 p-4 bg-[var(--dash-bg-3)] rounded-lg">
            <p className="text-xs text-[var(--dash-muted)] mb-1">Notes</p>
            <p className="text-sm text-[var(--dash-ink-2)]">{lead.notes}</p>
          </div>
        )}

        {/* Created date */}
        <div className="mt-4 text-xs text-[var(--dash-muted-2)] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Créé le {formatDateShort(lead.createdAt)}
        </div>
      </div>

      {/* Observations */}
      <div className="dash-card p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-[var(--dash-ink)] mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--dash-brand)]" />
          Historique des observations ({lead.observations.length})
        </h2>

        {lead.observations.length === 0 ? (
          <div className="text-center py-8 text-[var(--dash-muted)]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-3">
              <MessageSquare className="w-8 h-8 text-[var(--dash-muted-2)]" />
            </div>
            <p>Aucune observation pour ce lead</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lead.observations.map((obs) => (
              <div
                key={obs.id}
                className="bg-[var(--dash-bg-3)] p-4 rounded-xl border border-[var(--dash-border)]"
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white ${OBSERVATION_TYPE_CONFIG[obs.type]?.className || 'bg-[var(--dash-muted-2)]'}`}>
                      {OBSERVATION_TYPE_CONFIG[obs.type]?.icon}
                      {OBSERVATION_TYPE_CONFIG[obs.type]?.label || obs.type}
                    </span>
                    <span className="text-xs text-[var(--dash-muted)]">
                      par {obs.user?.name || 'Utilisateur'}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--dash-muted-2)]">
                    {formatDate(obs.date)}
                  </span>
                </div>
                <p className="text-[var(--dash-ink-2)] text-sm whitespace-pre-wrap">
                  {obs.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Report */}
      <div className="dash-card p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--dash-ink)] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--dash-brand)]" />
          Rapport journalier — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>

        <textarea
          value={dailyReportContent}
          onChange={(e) => setDailyReportContent(e.target.value)}
          placeholder="Résumé de la journée : 3 leads contactés, 1 rendez-vous confirmé, 1 converti..."
          className="w-full h-32 px-4 py-3 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl text-[var(--dash-ink)] placeholder-[var(--dash-muted-2)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--dash-brand)]"
        />

        <div className="flex items-center justify-between mt-4">
          {dailyReport && (
            <span className="text-xs text-[var(--dash-muted-2)]">
              Dernière sauvegarde : {formatDate(dailyReport.date)}
            </span>
          )}
          <button
            onClick={handleSaveDailyReport}
            disabled={savingReport || !dailyReportContent.trim()}
            className="btn-brand btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ml-auto disabled:opacity-50"
          >
            {savingReport ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {savingReport ? 'Enregistrement...' : 'Sauvegarder le rapport'}
          </button>
        </div>
      </div>

      {/* Add Observation Dialog */}
      <Dialog open={observationDialogOpen} onOpenChange={setObservationDialogOpen}>
        <DialogContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--dash-ink)]">Ajouter une observation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[var(--dash-ink-2)]">Type d&apos;interaction</Label>
              <Select
                value={observationForm.type}
                onValueChange={(v) => setObservationForm({ ...observationForm, type: v })}
              >
                <SelectTrigger className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="appel">Appel</SelectItem>
                  <SelectItem value="rdv">Rendez-vous</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--dash-ink-2)]">Date</Label>
              <Input
                type="date"
                value={observationForm.date}
                onChange={(e) => setObservationForm({ ...observationForm, date: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--dash-ink-2)]">Contenu</Label>
              <textarea
                value={observationForm.content}
                onChange={(e) => setObservationForm({ ...observationForm, content: e.target.value })}
                placeholder="Détails de l'interaction..."
                className="w-full h-24 px-4 py-3 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl text-[var(--dash-ink)] placeholder-[var(--dash-muted-2)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--dash-brand)]"
              />
            </div>

            <button
              className="btn-emerald btn-magnetic w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
              onClick={handleAddObservation}
              disabled={!observationForm.content.trim()}
            >
              Enregistrer l&apos;observation
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
