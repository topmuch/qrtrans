'use client';

import { useState, useEffect } from 'react';
import {
  Building,
  Users,
  QrCode,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Package,
  Search,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

// Types
interface Baggage {
  id: string;
  reference: string;
  type: string;
  travelerFirstName: string | null;
  travelerLastName: string | null;
  whatsappOwner: string | null;
  baggageIndex: number;
  baggageType: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  lastScanDate: string | null;
  lastLocation: string | null;
}

interface AgencyWithBaggages {
  id: string;
  name: string;
  baggages: Baggage[];
  travelerCount: number;
}

// Status Badge Component — uses dash-badge utility classes
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    pending_activation: { label: 'En attente', cls: 'dash-badge dash-badge-warning' },
    active: { label: 'Actif', cls: 'dash-badge dash-badge-success' },
    scanned: { label: 'Scanné', cls: 'dash-badge dash-badge-info' },
    lost: { label: 'Perdu', cls: 'dash-badge dash-badge-danger' },
    found: { label: 'Retrouvé', cls: 'dash-badge dash-badge-success' },
    blocked: { label: 'Bloqué', cls: 'dash-badge dash-badge-neutral' },
  };

  const { label, cls } = config[status] || { label: status, cls: 'dash-badge dash-badge-neutral' };

  return <span className={cls}>{label}</span>;
}

// Agency Card Component — premium dashboard card
function AgencyCard({
  agency,
  isExpanded,
  onToggle,
}: {
  agency: AgencyWithBaggages;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const activeCount = agency.baggages.filter(b => b.status === 'active' || b.status === 'scanned').length;
  const lostCount = agency.baggages.filter(b => b.status === 'lost').length;
  const pendingCount = agency.baggages.filter(b => b.status === 'pending_activation').length;

  return (
    <div className="dash-card overflow-hidden">
      {/* Agency Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[var(--dash-bg-3)] transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[var(--dash-brand-soft)] flex items-center justify-center shrink-0">
            <Building className="w-6 h-6 text-[var(--dash-brand)]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[var(--dash-ink)] truncate">{agency.name}</h3>
            <p className="text-sm text-[var(--dash-muted)]">
              {agency.travelerCount} voyageur{agency.travelerCount > 1 ? 's' : ''} • {agency.baggages.length} colis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Stats */}
          <div className="hidden sm:flex items-center gap-2">
            {activeCount > 0 && (
              <span className="dash-badge dash-badge-success">
                {activeCount} actif{activeCount > 1 ? 's' : ''}
              </span>
            )}
            {lostCount > 0 && (
              <span className="dash-badge dash-badge-danger">
                {lostCount} perdu{lostCount > 1 ? 's' : ''}
              </span>
            )}
            {pendingCount > 0 && (
              <span className="dash-badge dash-badge-warning">
                {pendingCount} en attente
              </span>
            )}
          </div>

          {/* Expand Icon */}
          <div className={`w-8 h-8 rounded-lg bg-[var(--dash-bg-3)] flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5 text-[var(--dash-muted)]" />
          </div>
        </div>
      </button>

      {/* Expanded Content - Baggages List */}
      {isExpanded && (
        <div className="border-t border-[var(--dash-border)]">
          <div className="overflow-x-auto">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Voyageur</th>
                  <th className="hidden md:table-cell">Type</th>
                  <th className="hidden lg:table-cell">WhatsApp</th>
                  <th>Statut</th>
                  <th className="hidden xl:table-cell">Dernier scan</th>
                </tr>
              </thead>
              <tbody>
                {agency.baggages.map((baggage) => (
                  <tr
                    key={baggage.id}
                    className={baggage.status === 'lost' ? 'bg-[var(--dash-bg-3)]' : ''}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--dash-brand-soft)] flex items-center justify-center">
                          <QrCode className="w-4 h-4 text-[var(--dash-brand)]" />
                        </div>
                        <span className="text-[var(--dash-ink)] font-mono font-medium text-sm">
                          {baggage.reference}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-[var(--dash-ink)] font-medium">
                        {baggage.travelerFirstName} {baggage.travelerLastName}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-[var(--dash-ink-2)] text-sm">
                        {baggage.baggageType} #{baggage.baggageIndex}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className="text-[var(--dash-ink-2)] text-sm">
                        {baggage.whatsappOwner || '—'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={baggage.status} />
                    </td>
                    <td className="hidden xl:table-cell">
                      <span className="text-[var(--dash-muted)] text-sm">
                        {baggage.lastScanDate
                          ? new Date(baggage.lastScanDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : 'Jamais'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Page Component
export default function VoyageursAdminPage() {
  const [agencies, setAgencies] = useState<AgencyWithBaggages[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchVoyageurs();
  }, []);

  const fetchVoyageurs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/voyageurs');
      const data = await response.json();

      // Group by agency
      const agencyMap = new Map<string, AgencyWithBaggages>();

      data.travelers?.forEach((traveler: {
        agencyId: string | null;
        agency: { id: string; name: string } | null;
        baggages: Baggage[];
      }) => {
        const agencyId = traveler.agencyId || 'no-agency';
        const agencyName = traveler.agency?.name || 'Sans agence';

        if (!agencyMap.has(agencyId)) {
          agencyMap.set(agencyId, {
            id: agencyId,
            name: agencyName,
            baggages: [],
            travelerCount: 0,
          });
        }

        const agency = agencyMap.get(agencyId)!;
        agency.baggages.push(...traveler.baggages);
        agency.travelerCount++;
      });

      // Sort agencies alphabetically, "Sans agence" at the end
      const sortedAgencies = Array.from(agencyMap.values()).sort((a, b) => {
        if (a.id === 'no-agency') return 1;
        if (b.id === 'no-agency') return -1;
        return a.name.localeCompare(b.name);
      });

      setAgencies(sortedAgencies);
    } catch (error) {
      console.error('Error fetching voyageurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgency = (agencyId: string) => {
    setExpandedAgencies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agencyId)) {
        newSet.delete(agencyId);
      } else {
        newSet.add(agencyId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedAgencies(new Set(agencies.map(a => a.id)));
  };

  const collapseAll = () => {
    setExpandedAgencies(new Set());
  };

  // Filter agencies
  const filteredAgencies = agencies.filter(agency => {
    if (!searchFilter) return true;
    const searchLower = searchFilter.toLowerCase();

    // Search in agency name
    if (agency.name.toLowerCase().includes(searchLower)) return true;

    // Search in baggages
    return agency.baggages.some(b =>
      b.reference.toLowerCase().includes(searchLower) ||
      `${b.travelerFirstName || ''} ${b.travelerLastName || ''}`.toLowerCase().includes(searchLower)
    );
  });

  // Calculate total stats
  const totalBaggages = agencies.reduce((sum, a) => sum + a.baggages.length, 0);
  const totalTravelers = agencies.reduce((sum, a) => sum + a.travelerCount, 0);
  const totalActive = agencies.reduce((sum, a) => sum + a.baggages.filter(b => b.status === 'active' || b.status === 'scanned').length, 0);
  const totalLost = agencies.reduce((sum, a) => sum + a.baggages.filter(b => b.status === 'lost').length, 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">Colis</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">QR codes organisés par agence</p>
        </div>
        <button
          onClick={fetchVoyageurs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total agences"
          value={agencies.length}
          subtitle="Partenaires"
          icon={Building}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Total colis"
          value={totalBaggages}
          subtitle={`${totalTravelers} voyageurs`}
          icon={Users}
          color="violet"
          loading={loading}
        />
        <KpiCard
          label="Colis actifs"
          value={totalActive}
          subtitle="En service"
          icon={CheckCircle}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="Colis perdus"
          value={totalLost}
          subtitle="À retrouver"
          icon={AlertTriangle}
          color="rose"
          loading={loading}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="dash-search flex-1">
          <Search className="w-4 h-4 text-[var(--dash-muted)]" />
          <input
            type="text"
            placeholder="Rechercher par agence, voyageur ou référence..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="btn-emerald inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium"
          >
            Tout ouvrir
          </button>
          <button
            onClick={collapseAll}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors"
          >
            Tout fermer
          </button>
        </div>
      </div>

      {/* Agencies List */}
      {loading ? (
        <div className="dash-card p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
        </div>
      ) : filteredAgencies.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
            <Package className="w-8 h-8 text-[var(--dash-muted)]" />
          </div>
          <p className="text-[var(--dash-muted)]">Aucun colis trouvé</p>
          <p className="text-sm text-[var(--dash-muted-2)] mt-2">
            {searchFilter ? 'Modifiez vos critères de recherche' : 'Les colis apparaîtront ici une fois les QR codes générés'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAgencies.map((agency) => (
            <AgencyCard
              key={agency.id}
              agency={agency}
              isExpanded={expandedAgencies.has(agency.id)}
              onToggle={() => toggleAgency(agency.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
