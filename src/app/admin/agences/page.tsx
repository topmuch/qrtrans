'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Building,
  RefreshCw,
  Mail,
  Phone,
  Users,
  Package,
  AlertCircle,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

// Types
interface Agency {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
  _count?: {
    baggages: number;
    users: number;
  };
}

export default function AgencesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyCreating, setAgencyCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [agencyForm, setAgencyForm] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agencies');
      const data = await res.json();
      setAgencies(data.agencies || []);
    } catch (error) {
      console.error('Error fetching agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgency = async () => {
    if (!agencyForm.email) {
      setErrorMessage("L'email est obligatoire");
      return;
    }
    if (!agencyForm.password || agencyForm.password.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (!/[A-Z]/.test(agencyForm.password)) {
      setErrorMessage('Le mot de passe doit contenir au moins une majuscule');
      return;
    }
    if (!/\d/.test(agencyForm.password)) {
      setErrorMessage('Le mot de passe doit contenir au moins un chiffre');
      return;
    }
    if (agencyForm.password !== agencyForm.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    setAgencyCreating(true);
    setErrorMessage('');

    try {
      const agencyResponse = await fetch('/api/admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agencyForm.name,
          slug: agencyForm.slug,
          email: agencyForm.email,
          phone: agencyForm.phone,
        }),
      });

      if (agencyResponse.ok) {
        const agencyData = await agencyResponse.json();

        await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: agencyForm.email,
            name: agencyForm.name,
            password: agencyForm.password,
            role: 'agency',
            agencyId: agencyData.agency.id,
          }),
        });

        setSuccessMessage(`Agence "${agencyForm.name}" créée avec succès !`);
        fetchAgencies();
        setDialogOpen(false);
        setAgencyForm({ name: '', slug: '', email: '', phone: '', password: '', confirmPassword: '' });
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const error = await agencyResponse.json();
        setErrorMessage(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating agency:', error);
      setErrorMessage("Erreur lors de la création de l'agence");
    } finally {
      setAgencyCreating(false);
    }
  };

  const handleDeleteAgency = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) return;

    try {
      const response = await fetch(`/api/admin/agencies?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAgencies();
      }
    } catch (error) {
      console.error('Error deleting agency:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">Agences Partenaires</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Gérez les agences de voyage partenaires</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAgencies}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="btn-brand inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
                <Plus className="w-4 h-4" />
                Nouvelle agence
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
              <DialogHeader>
                <DialogTitle className="text-[var(--dash-ink)]">Créer une agence</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {errorMessage && (
                  <div className="flex items-start gap-2 bg-[var(--dash-bg-3)] border border-[var(--dash-border-strong)] text-[var(--dash-ink-2)] px-4 py-3 rounded-xl text-sm">
                    <AlertCircle className="w-5 h-5 text-[var(--dash-badge-danger,#DC2626)] shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-[var(--dash-ink-2)]">Nom de l&apos;agence *</Label>
                  <Input
                    placeholder="Ashraf Voyages"
                    value={agencyForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setAgencyForm({
                        ...agencyForm,
                        name,
                        slug: name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                      });
                    }}
                    className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--dash-ink-2)]">Slug *</Label>
                  <Input
                    placeholder="ashraf_voyages"
                    value={agencyForm.slug}
                    onChange={(e) => setAgencyForm({ ...agencyForm, slug: e.target.value })}
                    className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--dash-ink-2)]">Email *</Label>
                    <Input
                      type="email"
                      placeholder="contact@agence.com"
                      value={agencyForm.email}
                      onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                      className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--dash-ink-2)]">Téléphone</Label>
                    <Input
                      placeholder="+33 6 00 00 00 00"
                      value={agencyForm.phone}
                      onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                      className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--dash-ink-2)]">Mot de passe *</Label>
                    <Input
                      type="password"
                      placeholder="Min 8 car., 1 maj, 1 chiffre"
                      value={agencyForm.password}
                      onChange={(e) => setAgencyForm({ ...agencyForm, password: e.target.value })}
                      className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--dash-ink-2)]">Confirmer *</Label>
                    <Input
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      value={agencyForm.confirmPassword}
                      onChange={(e) => setAgencyForm({ ...agencyForm, confirmPassword: e.target.value })}
                      className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                    />
                  </div>
                </div>
                <button
                  className="btn-brand w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium"
                  onClick={handleCreateAgency}
                  disabled={agencyCreating}
                >
                  {agencyCreating ? 'Création en cours...' : "Créer l'agence"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)] text-[var(--dash-emerald)]">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total agences"
          value={agencies.length}
          subtitle="Partenaires enregistrés"
          icon={Building}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Agences actives"
          value={agencies.filter(a => a.active).length}
          subtitle="Opérationnelles"
          icon={CheckCircle}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="Total colis"
          value={agencies.reduce((sum, a) => sum + (a._count?.baggages || 0), 0)}
          subtitle="Toutes agences"
          icon={Package}
          color="violet"
          loading={loading}
        />
        <KpiCard
          label="Utilisateurs"
          value={agencies.reduce((sum, a) => sum + (a._count?.users || 0), 0)}
          subtitle="Comptes liés"
          icon={Users}
          color="cyan"
          loading={loading}
        />
      </div>

      {/* Agencies Grid */}
      {loading ? (
        <div className="dash-card p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
        </div>
      ) : agencies.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <Building className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
          <p className="text-[var(--dash-muted)]">Aucune agence</p>
          <p className="text-sm text-[var(--dash-muted-2)] mt-2">Créez votre première agence partenaire</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agencies.map((agency) => (
            <div key={agency.id} className="dash-card p-5 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--dash-emerald-soft)] rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-[var(--dash-emerald)]" />
                </div>
                <span className={agency.active ? 'dash-badge dash-badge-success' : 'dash-badge dash-badge-danger'}>
                  {agency.active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {/* Name + Slug */}
              <h3 className="font-semibold text-[var(--dash-ink)] text-lg truncate">{agency.name}</h3>
              <p className="text-sm text-[var(--dash-muted-2)] font-mono mb-4 truncate">@{agency.slug}</p>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                {agency.email && (
                  <div className="flex items-center gap-2 text-sm text-[var(--dash-ink-2)]">
                    <Mail className="w-4 h-4 text-[var(--dash-muted-2)]" />
                    <span className="truncate">{agency.email}</span>
                  </div>
                )}
                {agency.phone && (
                  <div className="flex items-center gap-2 text-sm text-[var(--dash-ink-2)]">
                    <Phone className="w-4 h-4 text-[var(--dash-muted-2)]" />
                    <span className="truncate">{agency.phone}</span>
                  </div>
                )}
              </div>

              {/* Baggage count */}
              <div className="flex items-center gap-2 text-sm text-[var(--dash-muted)] mb-4">
                <Users className="w-4 h-4" />
                {agency._count?.baggages || 0} baggages · {agency._count?.users || 0} utilisateur(s)
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[var(--dash-border)] mt-auto">
                <button
                  size="sm"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--dash-muted)] hover:bg-[var(--dash-bg-3)] hover:text-[var(--dash-ink)] transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteAgency(agency.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--dash-muted)] hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
