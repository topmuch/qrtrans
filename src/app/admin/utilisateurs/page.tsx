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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Users,
  Shield,
  UserCog,
  Building2,
  Crown,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

// Types
interface Agency {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  agency: {
    name: string;
  } | null;
}

// Role badge configuration — maps to dash-badge variants + icons
const ROLE_CONFIG: Record<string, { label: string; cls: string; icon: typeof Crown }> = {
  superadmin: { label: 'SuperAdmin', cls: 'dash-badge dash-badge-danger', icon: Crown },
  admin:      { label: 'Admin',      cls: 'dash-badge dash-badge-info',    icon: Shield },
  agent:      { label: 'Agent',      cls: 'dash-badge dash-badge-success', icon: UserCog },
  agency:     { label: 'Agence',     cls: 'dash-badge dash-badge-warning',  icon: Building2 },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role] || { label: role, cls: 'dash-badge dash-badge-neutral', icon: UserCog };
  const Icon = cfg.icon;
  return (
    <span className={cfg.cls}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'agent',
    agencyId: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchAgencies();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = async () => {
    try {
      const res = await fetch('/api/admin/agencies');
      const data = await res.json();
      setAgencies(data.agencies || []);
    } catch (error) {
      console.error('Error fetching agencies:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        fetchUsers();
        setDialogOpen(false);
        setUserForm({ email: '', name: '', password: '', role: 'agent', agencyId: '' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
  const agencyCount = users.filter(u => u.role === 'agency').length;
  const agentCount = users.filter(u => u.role === 'agent').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">Utilisateurs</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Gérez les utilisateurs et leurs accès</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-brand inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" />
              Nouvel utilisateur
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
            <DialogHeader>
              <DialogTitle className="text-[var(--dash-ink)]">Créer un utilisateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[var(--dash-ink-2)]">Nom</Label>
                <Input
                  placeholder="Jean Dupont"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--dash-ink-2)]">Email *</Label>
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--dash-ink-2)]">Mot de passe *</Label>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--dash-ink-2)]">Rôle</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(v) => setUserForm({ ...userForm, role: v })}
                >
                  <SelectTrigger className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="agency">Agence</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">SuperAdmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {userForm.role === 'agency' && (
                <div className="space-y-2">
                  <Label className="text-[var(--dash-ink-2)]">Agence</Label>
                  <Select
                    value={userForm.agencyId}
                    onValueChange={(v) => setUserForm({ ...userForm, agencyId: v })}
                  >
                    <SelectTrigger className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                      <SelectValue placeholder="Sélectionner une agence" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                      {agencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <button
                className="btn-brand w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium"
                onClick={handleCreateUser}
              >
                Créer l&apos;utilisateur
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total utilisateurs"
          value={totalUsers}
          subtitle="Tous rôles confondus"
          icon={Users}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Administrateurs"
          value={adminCount}
          subtitle="Admins + SuperAdmins"
          icon={Shield}
          color="violet"
          loading={loading}
        />
        <KpiCard
          label="Comptes agences"
          value={agencyCount}
          subtitle="Partenaires"
          icon={Building2}
          color="amber"
          loading={loading}
        />
        <KpiCard
          label="Agents"
          value={agentCount}
          subtitle="Équipe terrain"
          icon={UserCog}
          color="emerald"
          loading={loading}
        />
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="dash-card p-12 flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
          <span className="text-[var(--dash-muted)]">Chargement...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <Users className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
          <p className="text-[var(--dash-muted)]">Aucun utilisateur</p>
          <p className="text-sm text-[var(--dash-muted-2)] mt-2">Créez votre premier utilisateur</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="dash-card p-5 flex flex-col"
              >
                {/* Header with role + created date */}
                <div className="flex items-start justify-between mb-3">
                  <RoleBadge role={user.role} />
                  <span className="text-xs text-[var(--dash-muted-2)]">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {/* User info */}
                <h3 className="font-semibold text-[var(--dash-ink)] mb-0.5 truncate">{user.name || 'Sans nom'}</h3>
                <p className="text-sm text-[var(--dash-muted)] mb-2 truncate">{user.email}</p>
                {/* Agency */}
                {user.agency?.name && (
                  <span className="dash-badge dash-badge-neutral self-start mb-4">
                    <Building2 className="w-3 h-3" />
                    {user.agency.name}
                  </span>
                )}
                {!user.agency?.name && <div className="mb-4" />}
                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-[var(--dash-border)] mt-auto">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--dash-muted)] hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 px-2 py-3">
            <span className="text-[var(--dash-muted)] text-sm">
              {users.length} utilisateur(s)
            </span>
          </div>
        </>
      )}
    </div>
  );
}
