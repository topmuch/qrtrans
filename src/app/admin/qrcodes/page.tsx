'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Search,
  Eye,
  Download,
  Share2,
  Trash2,
  Plane,
  Luggage,
  QrCode,
  Plus,
  X,
  AlertTriangle,
  User,
  Hash,
  Calendar,
  Building2,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

interface QRSet {
  id: string;
  setId: string;
  type: string;
  agencyId: string | null;
  agencyName: string | null;
  createdAt: Date;
  qrCount: number;
  references: string[];
  status: string;
  travelerName: string | null;
}

interface Stats {
  totalSets: number;
  totalQr: number;
  hajjSets: number;
  voyageurSets: number;
}

export default function QRCodesPage() {
  const qrRef = useRef<HTMLDivElement>(null);

  const [sets, setSets] = useState<QRSet[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSets: 0,
    totalQr: 0,
    hajjSets: 0,
    voyageurSets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSet, setSelectedSet] = useState<QRSet | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchSets();
  }, [typeFilter, search]);

  const fetchSets = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (search) params.set('search', search);

      const response = await fetch(`/api/qrcodes?${params}`);
      const data = await response.json();

      setSets(data.sets);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching QR sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = async () => {
    if (!selectedSet) return;

    try {
      const params = new URLSearchParams({ setId: selectedSet.setId });
      await fetch(`/api/qrcodes?${params}`, { method: 'DELETE' });

      setSets(sets.filter(s => s.setId !== selectedSet.setId));
      setShowDeleteModal(false);
      setSelectedSet(null);
    } catch (error) {
      console.error('Error deleting set:', error);
    }
  };

  const handleDownloadSet = async (set: QRSet) => {
    setIsDownloading(true);
    setSelectedSet(set);

    try {
      // Create a canvas with all QR codes
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const qrSize = 300;
      const padding = 40;
      const headerHeight = 100;
      const footerHeight = 60;

      // Calculate dimensions
      const cols = Math.min(set.qrCount, 3);
      const rows = Math.ceil(set.qrCount / 3);

      canvas.width = cols * qrSize + (cols + 1) * padding;
      canvas.height = headerHeight + rows * qrSize + (rows + 1) * padding + footerHeight;

      // Background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QRTrans - QR Codes', canvas.width / 2, 40);

      ctx.font = '16px Arial';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`${set.setId} | ${set.type === 'hajj' ? 'Hajj 2026' : 'Voyageur'} | ${set.qrCount} QR`, canvas.width / 2, 70);

      // Generate QR codes as images
      for (let i = 0; i < set.references.length; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = padding + col * (qrSize + padding);
        const y = headerHeight + padding + row * (qrSize + padding);

        // Draw QR background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, qrSize, qrSize);

        // Draw QR code using SVG
        const qrUrl = `${window.location.origin}/scan/${set.references[i]}`;
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            ${generateQRCodeSVG(qrUrl, set.type)}
          </svg>
        `;

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, x + 20, y + 20, qrSize - 40, qrSize - 40);

            // Draw reference text
            ctx.fillStyle = set.type === 'hajj' ? '#0d5e34' : '#1E4B7A';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(set.references[i], x + qrSize / 2, y + qrSize - 15);

            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          img.src = url;
        });
      }

      // Footer
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QRTrans - Protégez vos colis, en toute sérénité.', canvas.width / 2, canvas.height - 20);

      // Download
      const link = document.createElement('a');
      link.download = `QRTrans-${set.setId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (error) {
      console.error('Error downloading:', error);
      alert('Erreur lors du téléchargement');
    } finally {
      setIsDownloading(false);
      setSelectedSet(null);
    }
  };

  // Simple QR code SVG generator (fallback)
  const generateQRCodeSVG = (url: string, type: string) => {
    const color = type === 'hajj' ? '#0d5e34' : '#1E4B7A';
    return `<rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" fill="${color}" font-size="10">${url.slice(-20)}</text>`;
  };

  const handleShareSet = async (set: QRSet) => {
    const shareText = `QRTrans - ${set.setId}\n${set.qrCount} QR codes générés\nType: ${set.type === 'hajj' ? 'Hajj 2026' : 'Voyageur'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `QRTrans - ${set.setId}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Copié dans le presse-papiers !');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Filter buttons
  const filterButtons = [
    { id: 'all', label: 'Tous' },
    { id: 'hajj', label: 'Hajj' },
    { id: 'voyageur', label: 'Voyageur' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)] flex items-center gap-2">
            <QrCode className="w-6 h-6 text-[var(--dash-brand)]" />
            QR Codes Générés
          </h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Gérez vos sets de QR codes</p>
        </div>
        <Link
          href="/admin/generer"
          className="btn-brand btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Générer nouveau
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Sets"
          value={stats.totalSets}
          subtitle="Lots générés"
          icon={QrCode}
          color="brand"
          loading={loading}
        />
        <KpiCard
          label="Total QR"
          value={stats.totalQr}
          subtitle="Codes générés"
          icon={Hash}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          label="Hajj"
          value={stats.hajjSets}
          subtitle="Sets pèlerins"
          icon={Plane}
          color="cyan"
          loading={loading}
        />
        <KpiCard
          label="Voyageur"
          value={stats.voyageurSets}
          subtitle="Sets standards"
          icon={Luggage}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par référence ou set..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-lg py-3 px-4 text-[var(--dash-ink)] placeholder-[var(--dash-muted-2)] focus:outline-none focus:border-[var(--dash-brand)] focus:ring-2 focus:ring-[var(--dash-brand-soft)]"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dash-muted-2)]" />
        </div>
        <div className="flex gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setTypeFilter(btn.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === btn.id
                  ? 'bg-[var(--dash-brand)] text-white'
                  : 'bg-[var(--dash-card)] text-[var(--dash-muted)] border border-[var(--dash-border)] hover:bg-[var(--dash-bg-3)]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* QR Sets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="dash-card p-12 text-center">
            <div className="w-12 h-12 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--dash-muted)]">Chargement...</p>
          </div>
        ) : sets.length === 0 ? (
          <div className="dash-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--dash-bg-3)] mb-4">
              <QrCode className="w-8 h-8 text-[var(--dash-muted)]" />
            </div>
            <p className="text-[var(--dash-muted)]">Aucun QR code généré</p>
            <p className="text-sm text-[var(--dash-muted-2)] mt-2">
              Générez vos premiers QR codes pour commencer.
            </p>
          </div>
        ) : (
          sets.map((set) => (
            <div
              key={set.id}
              className="dash-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Left: Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  set.type === 'hajj'
                    ? 'bg-[var(--dash-emerald-soft)]'
                    : 'bg-[var(--dash-brand-soft)]'
                }`}>
                  {set.type === 'hajj' ? (
                    <Plane className="h-5 w-5 text-[var(--dash-emerald)]" />
                  ) : (
                    <Luggage className="h-5 w-5 text-[var(--dash-brand)]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-[var(--dash-ink)] font-mono">{set.setId}</h3>
                    <span className="dash-badge dash-badge-success">Nouveau</span>
                  </div>
                  <div className="text-[var(--dash-muted)] text-sm flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{set.travelerName || '1 voyageur'}</span>
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{set.qrCount} QR</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(set.createdAt)}</span>
                    {set.agencyName && (
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{set.agencyName}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="dash-badge dash-badge-neutral hidden sm:inline">
                  {set.status}
                </span>

                {/* View Button */}
                <button
                  onClick={() => {
                    setSelectedSet(set);
                    setShowDetailModal(true);
                  }}
                  className="w-10 h-10 rounded-lg bg-[var(--dash-bg-3)] flex items-center justify-center text-[var(--dash-ink-2)] hover:bg-[var(--dash-border)] transition-colors"
                  title="Voir détails"
                >
                  <Eye className="h-4 w-4" />
                </button>

                {/* Download Button */}
                <button
                  onClick={() => handleDownloadSet(set)}
                  disabled={isDownloading && selectedSet?.id === set.id}
                  className="w-10 h-10 rounded-lg bg-[var(--dash-brand)] flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  title="Télécharger"
                >
                  {isDownloading && selectedSet?.id === set.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShareSet(set)}
                  className="w-10 h-10 rounded-lg bg-[var(--dash-emerald)] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  title="Partager"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    setSelectedSet(set);
                    setShowDeleteModal(true);
                  }}
                  className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/25 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 px-2 py-3">
        <span className="text-[var(--dash-muted)] text-sm">
          {sets.length} set(s) affiché(s)
        </span>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--dash-border)]">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--dash-ink)]">{selectedSet.setId}</h2>
                <p className="text-[var(--dash-muted)] text-sm">
                  {selectedSet.type === 'hajj' ? 'Hajj 2026' : 'Voyageur'} • {selectedSet.qrCount} QR codes
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSet(null);
                }}
                className="p-2 rounded-lg hover:bg-[var(--dash-bg-3)] text-[var(--dash-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* QR Codes Grid */}
              <div
                ref={qrRef}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              >
                {selectedSet.references.map((ref, index) => (
                  <div
                    key={ref}
                    className="bg-white rounded-xl p-4 text-center"
                  >
                    <QRCodeSVG
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${ref}`}
                      size={140}
                      level="H"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor={selectedSet.type === 'hajj' ? '#0d5e34' : '#1E4B7A'}
                    />
                    <p className="text-slate-800 font-mono font-bold mt-2 text-sm">
                      {ref}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {index === 0 ? 'Cabine' : 'Soute'} #{index + 1}
                    </p>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                  <p className="text-[var(--dash-muted)] text-sm">Créé le</p>
                  <p className="text-[var(--dash-ink)] font-medium">{formatDate(selectedSet.createdAt)}</p>
                </div>
                <div className="bg-[var(--dash-bg-3)] rounded-lg p-4">
                  <p className="text-[var(--dash-muted)] text-sm">Agence</p>
                  <p className="text-[var(--dash-ink)] font-medium">{selectedSet.agencyName || 'N/A'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDownloadSet(selectedSet)}
                  className="btn-brand btn-magnetic flex-1 py-3 rounded-lg inline-flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Télécharger tout
                </button>
                <button
                  onClick={() => handleShareSet(selectedSet)}
                  className="btn-emerald btn-magnetic flex-1 py-3 rounded-lg inline-flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-500/15 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-[var(--dash-ink)] font-bold">Supprimer ce set ?</h3>
                <p className="text-[var(--dash-muted)] text-sm font-mono">{selectedSet.setId}</p>
              </div>
            </div>
            <p className="text-[var(--dash-muted)] text-sm mb-6">
              Cette action supprimera définitivement les {selectedSet.qrCount} QR codes de ce set.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSet(null);
                }}
                className="flex-1 py-2 px-4 bg-[var(--dash-bg-3)] text-[var(--dash-ink-2)] rounded-lg hover:bg-[var(--dash-border)] transition-colors text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteSet}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
