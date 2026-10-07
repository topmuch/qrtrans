'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  CheckCircle,
  Key,
  Calendar,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { useAgency } from '../layout';
import KpiCard from '@/components/dashboard/KpiCard';

export default function ProfilPage() {
  const { agencyData, userName, userEmail } = useAgency();
  const [form, setForm] = useState({
    name: agencyData?.name || '',
    email: agencyData?.email || userEmail || '',
    phone: agencyData?.phone || '',
    address: agencyData?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSuccess(true);
    setSaving(false);

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
          <User className="w-6 h-6 text-[var(--dash-brand)]" />
          Profil de l&apos;agence
        </h1>
        <p className="text-sm text-[var(--dash-muted)] mt-1">Gérez les informations de votre agence</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)]/30 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[var(--dash-emerald)]" />
          <span className="text-[var(--dash-emerald)]">Modifications enregistrées avec succès !</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Agency Info */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--dash-brand-soft)] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[var(--dash-brand)]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--dash-ink)]">Informations de l&apos;agence</h2>
              <p className="text-sm text-[var(--dash-muted)]">Ces informations apparaîtront sur vos documents</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Nom de l&apos;agence
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Adresse
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-brand btn-magnetic inline-flex items-center gap-2 py-3 px-6 rounded-xl font-medium disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--dash-bg-3)] flex items-center justify-center">
              <Key className="w-5 h-5 text-[var(--dash-muted)]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--dash-ink)]">Changer le mot de passe</h2>
              <p className="text-sm text-[var(--dash-muted)]">Mettez à jour votre mot de passe régulièrement</p>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2">Mot de passe actuel</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--dash-ink-2)] mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl py-3 px-4 text-[var(--dash-ink)] focus:ring-2 focus:ring-[var(--dash-brand-soft)] focus:border-[var(--dash-brand)] transition-all"
                />
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 bg-[var(--dash-ink)] text-[var(--dash-bg)] py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Changer le mot de passe
            </button>
          </form>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="Statut du compte"
            value="Actif"
            subtitle="En service"
            icon={ShieldCheck}
            color="emerald"
          />
          <KpiCard
            label="Membre depuis"
            value="Jan 2024"
            subtitle="Inscription"
            icon={Calendar}
            color="brand"
          />
          <KpiCard
            label="Abonnement"
            value="Premium"
            subtitle="Plan actuel"
            icon={Crown}
            color="amber"
          />
        </div>
      </div>
    </div>
  );
}
