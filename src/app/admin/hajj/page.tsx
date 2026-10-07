'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Luggage,
  Users,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  MapPin,
  Building2,
  RefreshCw,
  Download,
  Search,
  Moon,
  CheckCircle,
  CircleDashed,
  ScanLine,
  Phone,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

// Types
interface Baggage {
  id: string;
  reference: string;
  baggageIndex: number;
  baggageType: string;
  status: string;
  lastScanDate: string | null;
  lastLocation: string | null;
  createdAt: string;
  // Founder information
  founderName: string | null;
  founderPhone: string | null;
  founderAt: string | null;
}

interface Pilgrim {
  id: string;
  firstName: string;
  lastName: string;
  whatsapp: string | null;
  agencyId: string | null;
  agency: { name: string } | null;
  createdAt: string;
  baggages: Baggage[];
}

interface PilgrimStats {
  total: number;
  activeBaggages: number;
  pending: number;
  lost: number;
}

export default function HajjAdminPage() {
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [agencies, setAgencies] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<PilgrimStats>({ total: 0, activeBaggages: 0, pending: 0, lost: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Modal
  const [selectedPilgrim, setSelectedPilgrim] = useState<Pilgrim | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Hajj pilgrims
      const response = await fetch('/api/admin/hajj');
      const data = await response.json();
      setPilgrims(data.pilgrims || []);
      setAgencies(data.agencies || []);
      calculateStats(data.pilgrims || []);
    } catch (error) {
      console.error('Error fetching Hajj data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (pilgrimList: Pilgrim[]) => {
    let activeBaggages = 0;
    let pending = 0;
    let lost = 0;

    pilgrimList.forEach(pilgrim => {
      pilgrim.baggages.forEach(bag => {
        if (bag.status === 'active') activeBaggages++;
        if (bag.status === 'pending_activation') pending++;
        if (bag.status === 'lost') lost++;
      });
    });

    setStats({
      total: pilgrimList.length,
      activeBaggages,
      pending,
      lost
    });
  };

  // Get global status for a pilgrim (worst bagage status)
  const getGlobalStatus = (baggages: Baggage[]): { status: string; label: string; cls: string } => {
    const statuses = baggages.map(b => b.status);

    if (statuses.some(s => s === 'lost')) {
      const lostCount = statuses.filter(s => s === 'lost').length;
      return { status: 'lost', label: `${lostCount}/3 perdu${lostCount > 1 ? 's' : ''}`, cls: 'dash-badge dash-badge-danger' };
    }
    if (statuses.some(s => s === 'scanned')) {
      return { status: 'scanned', label: 'Scanné', cls: 'dash-badge dash-badge-info' };
    }
    if (statuses.some(s => s === 'pending_activation')) {
      return { status: 'pending', label: 'En attente', cls: 'dash-badge dash-badge-warning' };
    }
    if (statuses.every(s => s === 'active')) {
      return { status: 'active', label: 'Actif', cls: 'dash-badge dash-badge-success' };
    }

    return { status: 'mixed', label: 'Mixte', cls: 'dash-badge dash-badge-neutral' };
  };

  // Get last scan date from baggages
  const getLastScan = (baggages: Baggage[]): string => {
    const scanDates = baggages
      .filter(b => b.lastScanDate)
      .map(b => new Date(b.lastScanDate!))
      .sort((a, b) => b.getTime() - a.getTime());

    if (scanDates.length === 0) return 'Jamais';

    const lastDate = scanDates[0];
    return `${lastDate.getDate().toString().padStart(2, '0')}/${(lastDate.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Filter pilgrims
  const filteredPilgrims = pilgrims.filter(pilgrim => {
    // Search filter
    if (searchFilter) {
      const fullName = `${pilgrim.firstName} ${pilgrim.lastName}`.toLowerCase();
      if (!fullName.includes(searchFilter.toLowerCase())) return false;
    }

    // Agency filter
    if (agencyFilter !== 'all' && pilgrim.agencyId !== agencyFilter) return false;

    // Status filter
    if (statusFilter !== 'all') {
      const globalStatus = getGlobalStatus(pilgrim.baggages);
      if (statusFilter === 'active' && globalStatus.status !== 'active') return false;
      if (statusFilter === 'pending' && globalStatus.status !== 'pending') return false;
      if (statusFilter === 'lost' && globalStatus.status !== 'lost') return false;
    }

    // Date filter
    if (dateFilter) {
      const createdDate = new Date(pilgrim.createdAt).toISOString().split('T')[0];
      if (createdDate !== dateFilter) return false;
    }

    return true;
  });

  const handleDeletePilgrim = async (pilgrimId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pèlerin et ses colis ?')) return;

    try {
      const response = await fetch(`/api/admin/hajj?id=${pilgrimId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting pilgrim:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Prénom', 'Agence', 'Statut', 'Colis', 'Dernier scan'];
    const rows = filteredPilgrims.map(p => [
      p.lastName,
      p.firstName,
      p.agency?.name || '-',
      getGlobalStatus(p.baggages).label,
      `${p.baggages.length} colis`,
      getLastScan(p.baggages)
    ]);

    const csv = [headers, ...rows].map(row => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hajj_pilgrims_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
            <Moon className="w-6 h-6 text-[var(--dash-emerald)]" />
            Pèlerins Hajj 2026
          </h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Gérez les pèlerins et leurs 3 colis</p>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-ink-2)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total pèlerins"
          value={stats.total}
          subtitle="Inscrits"
          icon={Users}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Colis actifs"
          value={stats.activeBaggages}
          subtitle="En service"
          icon={Luggage}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="En attente"
          value={stats.pending}
          subtitle="À activer"
          icon={Clock}
          color="amber"
          loading={loading}
        />
        <KpiCard
          label="Perdus"
          value={stats.lost}
          subtitle="À retrouver"
          icon={AlertTriangle}
          color="rose"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="dash-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dash-muted-2)]" />
            <Input
              placeholder="Rechercher un pèlerin..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] pl-9"
            />
          </div>
          <Select value={agencyFilter} onValueChange={setAgencyFilter}>
            <SelectTrigger className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
              <SelectValue placeholder="Agence" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
              <SelectItem value="all">Toutes les agences</SelectItem>
              {agencies.map((agency) => (
                <SelectItem key={agency.id} value={agency.id}>
                  {agency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="lost">Perdu</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
          />
        </div>
      </div>

      {/* Pilgrim Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
        </div>
      ) : filteredPilgrims.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <Moon className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
          <p className="text-[var(--dash-muted)]">Aucun pèlerin trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPilgrims.map((pilgrim) => {
            const globalStatus = getGlobalStatus(pilgrim.baggages);
            return (
              <div
                key={pilgrim.id}
                className="dash-card p-5 cursor-pointer"
                onClick={() => {
                  setSelectedPilgrim(pilgrim);
                  setModalOpen(true);
                }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[var(--dash-emerald-soft)] flex items-center justify-center">
                      <Moon className="w-5 h-5 text-[var(--dash-emerald)]" />
                    </div>
                    <span className="font-medium text-[var(--dash-ink)]">{pilgrim.firstName} {pilgrim.lastName}</span>
                  </div>
                  <span className={globalStatus.cls}>
                    {globalStatus.label}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
                    <Building2 className="w-3 h-3 text-[var(--dash-muted-2)] shrink-0" />
                    <span className="truncate">{pilgrim.agency?.name || 'Non renseignée'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
                    <Luggage className="w-3 h-3 text-[var(--dash-muted-2)] shrink-0" />
                    <span>{pilgrim.baggages.length} colis</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--dash-muted)]">
                    <Clock className="w-3 h-3 text-[var(--dash-muted-2)] shrink-0" />
                    <span className="text-xs">Dernier scan : {getLastScan(pilgrim.baggages)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[var(--dash-border)]" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="p-2 rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-bg-3)] hover:text-[var(--dash-ink)] transition-colors"
                    onClick={() => {
                      setSelectedPilgrim(pilgrim);
                      setModalOpen(true);
                    }}
                    title="Voir détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    onClick={() => handleDeletePilgrim(pilgrim.id)}
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pilgrim Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[var(--dash-ink)]">
              <Moon className="w-6 h-6 text-[var(--dash-emerald)]" />
              {selectedPilgrim?.firstName} {selectedPilgrim?.lastName}
            </DialogTitle>
          </DialogHeader>

          {selectedPilgrim && (
            <div className="space-y-6 pt-4">
              {/* Pilgrim Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--dash-bg-3)] rounded-xl p-4">
                  <p className="text-[var(--dash-muted)] text-sm mb-1">Agence</p>
                  <p className="text-[var(--dash-ink)] font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {selectedPilgrim.agency?.name || 'Non renseignée'}
                  </p>
                </div>
                <div className="bg-[var(--dash-bg-3)] rounded-xl p-4">
                  <p className="text-[var(--dash-muted)] text-sm mb-1">WhatsApp</p>
                  <p className="text-[var(--dash-ink)] font-medium">
                    {selectedPilgrim.whatsapp || 'Non renseigné'}
                  </p>
                </div>
              </div>

              {/* Baggages */}
              <div>
                <h3 className="text-[var(--dash-ink)] font-medium mb-3 flex items-center gap-2">
                  <Luggage className="w-5 h-5 text-[var(--dash-brand)]" />
                  Colis (3)
                </h3>
                <div className="space-y-2">
                  {selectedPilgrim.baggages.map((baggage, index) => {
                    const statusInfo = (() => {
                      if (baggage.status === 'active') return { cls: 'dash-badge dash-badge-success', icon: CheckCircle, label: 'Actif' };
                      if (baggage.status === 'pending_activation') return { cls: 'dash-badge dash-badge-warning', icon: CircleDashed, label: 'En attente' };
                      if (baggage.status === 'lost') return { cls: 'dash-badge dash-badge-danger', icon: AlertTriangle, label: 'Perdu' };
                      return { cls: 'dash-badge dash-badge-info', icon: ScanLine, label: 'Scanné' };
                    })();
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div
                        key={baggage.id}
                        className="bg-[var(--dash-bg-3)] rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              baggage.baggageType === 'cabine'
                                ? 'bg-[var(--dash-brand-soft)]'
                                : 'bg-[var(--dash-emerald-soft)]'
                            }`}>
                              <Luggage className={`w-5 h-5 ${
                                baggage.baggageType === 'cabine'
                                  ? 'text-[var(--dash-brand)]'
                                  : 'text-[var(--dash-emerald)]'
                              }`} />
                            </div>
                            <div>
                              <p className="text-[var(--dash-ink)] font-medium">
                                {baggage.baggageType === 'cabine' ? 'Cabine' : `Soute ${index}`}
                              </p>
                              <p className="text-[var(--dash-muted)] text-sm font-mono">
                                {baggage.reference}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {baggage.lastLocation && (
                              <span className="text-[var(--dash-muted)] text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {baggage.lastLocation}
                              </span>
                            )}
                            <span className={statusInfo.cls}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                        {/* Founder Information */}
                        {baggage.founderName && (
                          <div className="mt-3 p-3 bg-[var(--dash-emerald-soft)] border border-[var(--dash-emerald)]/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[var(--dash-emerald)] text-sm font-medium">Trouvé par :</span>
                              <span className="text-[var(--dash-ink)] font-medium">{baggage.founderName}</span>
                            </div>
                            {baggage.founderPhone && (
                              <a
                                href={`https://wa.me/${baggage.founderPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[var(--dash-emerald)] hover:opacity-80 text-sm"
                              >
                                <Phone className="w-4 h-4" />
                                {baggage.founderPhone}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
