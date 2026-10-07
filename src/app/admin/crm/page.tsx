'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Trash2,
  UserPlus,
  Phone,
  Mail,
  Building,
  Search,
  Download,
  RefreshCw,
  Eye,
  Pencil,
  X
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/lib/permissions';
import KpiCard from '@/components/dashboard/KpiCard';

// Extended status type
type LeadStatus = 'new' | 'contacted' | 'in_discussion' | 'qualified' | 'converted' | 'lost';

// Types
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source: string;
  notes: string;
  agencyId?: string | null;
  agency?: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

// Extended status configuration — uses dash-badge utility classes
const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'Nouveau', className: 'dash-badge dash-badge-info' },
  contacted: { label: 'Contacté', className: 'dash-badge dash-badge-warning' },
  in_discussion: { label: 'En discussion', className: 'dash-badge dash-badge-info' },
  qualified: { label: 'Qualifié', className: 'dash-badge dash-badge-neutral' },
  converted: { label: 'Converti', className: 'dash-badge dash-badge-success' },
  lost: { label: 'Perdu', className: 'dash-badge dash-badge-danger' },
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Site web',
  referral: 'Recommandation',
  social: 'Réseaux sociaux',
  event: 'Événement',
  other: 'Autre',
};

export default function CRMPage() {
  const router = useRouter();
  const { can } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new' as LeadStatus,
    source: '',
    notes: '',
  });

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new' as LeadStatus,
    source: '',
    notes: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/crm/leads');
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async () => {
    try {
      const response = await fetch('/api/admin/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      });

      const data = await response.json();

      if (response.ok) {
        fetchLeads();
        setCreateDialogOpen(false);
        setLeadForm({ name: '', email: '', phone: '', company: '', status: 'new', source: '', notes: '' });
      } else {
        alert(`Erreur: ${data.error || 'Impossible de créer le lead'}`);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  const handleUpdateLead = async () => {
    if (!editForm.id) return;

    try {
      const response = await fetch('/api/admin/crm/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        fetchLeads();
        setEditDialogOpen(false);
        setSelectedLead(null);
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    try {
      const response = await fetch('/api/admin/crm/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) return;

    try {
      const response = await fetch(`/api/admin/crm/leads?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const openViewDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setViewDialogOpen(true);
  };

  const openEditDialog = (lead: Lead) => {
    setEditForm({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: lead.status,
      source: lead.source,
      notes: lead.notes,
    });
    setSelectedLead(lead);
    setEditDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Entreprise', 'Statut', 'Source', 'Notes', 'Date'];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      lead.company || 'Non attribué',
      STATUS_CONFIG[lead.status]?.label || lead.status,
      SOURCE_LABELS[lead.source] || lead.source,
      lead.notes,
      new Date(lead.createdAt).toLocaleDateString('fr-FR'),
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `crm-leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filter leads - search works on name, email, company, phone
  const filteredLeads = leads.filter(lead => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      lead.name.toLowerCase().includes(searchLower) ||
      lead.email.toLowerCase().includes(searchLower) ||
      lead.company.toLowerCase().includes(searchLower) ||
      lead.phone.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canManage = can(PERMISSIONS.MANAGE_CRM);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--dash-emerald)] rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">CRM</h1>
            <p className="text-sm text-[var(--dash-muted)]">Gestion des prospects et leads</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard label="Total" value={leads.length} icon={UserPlus} color="brand" loading={loading} />
        <KpiCard label="Nouveaux" value={leads.filter(l => l.status === 'new').length} icon={Mail} color="cyan" loading={loading} />
        <KpiCard label="En discussion" value={leads.filter(l => l.status === 'in_discussion').length} icon={Phone} color="amber" loading={loading} />
        <KpiCard label="Qualifiés" value={leads.filter(l => l.status === 'qualified').length} icon={Building} color="violet" loading={loading} />
        <KpiCard label="Convertis" value={leads.filter(l => l.status === 'converted').length} icon={UserPlus} color="emerald" loading={loading} />
        <KpiCard label="Perdus" value={leads.filter(l => l.status === 'lost').length} icon={Trash2} color="rose" loading={loading} />
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="dash-search">
            <Search className="w-4 h-4 text-[var(--dash-muted)]" />
            <input
              placeholder="Rechercher par nom, email, entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)]">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="new">Nouveaux</SelectItem>
            <SelectItem value="contacted">Contactés</SelectItem>
            <SelectItem value="in_discussion">En discussion</SelectItem>
            <SelectItem value="qualified">Qualifiés</SelectItem>
            <SelectItem value="converted">Convertis</SelectItem>
            <SelectItem value="lost">Perdus</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={fetchLeads}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>

        {canManage && (
          <button
            className="btn-emerald btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nouveau lead
          </button>
        )}
      </div>

      {/* Leads Table */}
      <div className="dash-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Contact</th>
                <th>Entreprise</th>
                <th>Statut</th>
                <th>Source</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-[var(--dash-muted)] py-8">
                    Chargement...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-[var(--dash-muted)] py-8">
                    Aucun lead trouvé
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="text-[var(--dash-ink)] font-medium">{lead.name}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm text-[var(--dash-ink-2)]">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-sm text-[var(--dash-muted)]">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[var(--dash-muted-2)]" />
                        {lead.company ? (
                          <span className="text-[var(--dash-ink-2)]">{lead.company}</span>
                        ) : (
                          <span className="text-[var(--dash-muted-2)] italic text-sm">Non attribué</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {canManage ? (
                        <Select
                          value={lead.status}
                          onValueChange={(v) => handleUpdateStatus(lead.id, v as LeadStatus)}
                        >
                          <SelectTrigger className="w-[140px] h-8 bg-transparent border-0 p-0">
                            <Badge className={STATUS_CONFIG[lead.status]?.className}>
                              {STATUS_CONFIG[lead.status]?.label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)]">
                            <SelectItem value="new">Nouveau</SelectItem>
                            <SelectItem value="contacted">Contacté</SelectItem>
                            <SelectItem value="in_discussion">En discussion</SelectItem>
                            <SelectItem value="qualified">Qualifié</SelectItem>
                            <SelectItem value="converted">Converti</SelectItem>
                            <SelectItem value="lost">Perdu</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={STATUS_CONFIG[lead.status]?.className}>
                          {STATUS_CONFIG[lead.status]?.label}
                        </Badge>
                      )}
                    </td>
                    <td className="text-[var(--dash-ink-2)]">
                      {SOURCE_LABELS[lead.source] || lead.source || '-'}
                    </td>
                    <td className="text-[var(--dash-ink-2)] text-sm">
                      {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 text-[var(--dash-muted)] hover:text-[var(--dash-brand)] hover:bg-[var(--dash-brand-soft)] rounded-lg transition-colors"
                          onClick={() => router.push(`/admin/crm/leads/${lead.id}`)}
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              className="p-2 text-[var(--dash-muted)] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                              onClick={() => openEditDialog(lead)}
                              title="Modifier"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-[var(--dash-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              onClick={() => handleDeleteLead(lead.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                placeholder="Jean Dupont"
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                placeholder="+33 6 12 34 56 78"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <div className="space-y-2">
              <Label>Entreprise</Label>
              <Input
                placeholder="Nom de l'entreprise"
                value={leadForm.company}
                onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={leadForm.source}
                onValueChange={(v) => setLeadForm({ ...leadForm, source: v })}
              >
                <SelectTrigger className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)]">
                  <SelectItem value="website">Site web</SelectItem>
                  <SelectItem value="referral">Recommandation</SelectItem>
                  <SelectItem value="social">Réseaux sociaux</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Notes additionnelles..."
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <button
              className="btn-emerald btn-magnetic w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              onClick={handleCreateLead}
              disabled={!leadForm.name || !leadForm.email}
            >
              Ajouter le lead
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Lead Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 p-4 bg-[var(--dash-bg-3)] rounded-xl">
                <div className="w-12 h-12 bg-[var(--dash-emerald)] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedLead.name}</p>
                  <Badge className={STATUS_CONFIG[selectedLead.status]?.className}>
                    {STATUS_CONFIG[selectedLead.status]?.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[var(--dash-muted-2)]" />
                  <a href={`mailto:${selectedLead.email}`} className="text-[var(--dash-brand)] hover:underline">
                    {selectedLead.email}
                  </a>
                </div>
                {selectedLead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[var(--dash-muted-2)]" />
                    <a href={`tel:${selectedLead.phone}`} className="text-[var(--dash-brand)] hover:underline">
                      {selectedLead.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-[var(--dash-muted-2)]" />
                  <span>{selectedLead.company || 'Non attribué'}</span>
                </div>
              </div>

              {selectedLead.notes && (
                <div className="p-3 bg-[var(--dash-bg-3)] rounded-lg">
                  <p className="text-sm text-[var(--dash-muted)] mb-1">Notes</p>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>
              )}

              <div className="text-xs text-[var(--dash-muted-2)] flex justify-between">
                <span>Créé: {new Date(selectedLead.createdAt).toLocaleDateString('fr-FR')}</span>
                <span>Source: {SOURCE_LABELS[selectedLead.source] || selectedLead.source || 'N/A'}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <div className="space-y-2">
              <Label>Entreprise</Label>
              <Input
                value={editForm.company}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm({ ...editForm, status: v as LeadStatus })}
              >
                <SelectTrigger className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)]">
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="contacted">Contacté</SelectItem>
                  <SelectItem value="in_discussion">En discussion</SelectItem>
                  <SelectItem value="qualified">Qualifié</SelectItem>
                  <SelectItem value="converted">Converti</SelectItem>
                  <SelectItem value="lost">Perdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={editForm.source}
                onValueChange={(v) => setEditForm({ ...editForm, source: v })}
              >
                <SelectTrigger className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)]">
                  <SelectItem value="website">Site web</SelectItem>
                  <SelectItem value="referral">Recommandation</SelectItem>
                  <SelectItem value="social">Réseaux sociaux</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
              />
            </div>
            <button
              className="btn-brand btn-magnetic w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
              onClick={handleUpdateLead}
            >
              Enregistrer les modifications
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
