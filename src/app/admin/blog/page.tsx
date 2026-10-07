'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Save,
  FileText,
  Globe,
  Calendar,
  Eye as EyeIcon,
  Tag,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Newspaper,
  Lightbulb,
  Moon,
  Rocket,
  User,
} from "lucide-react";
import KpiCard from '@/components/dashboard/KpiCard';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  status: string;
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string | null;
    email: string;
  };
  _count?: {
    blogViews: number;
  };
}

interface ApiResponse {
  posts: BlogPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const CATEGORY_ICONS: Record<string, typeof Newspaper> = {
  actualites: Newspaper,
  conseils: Lightbulb,
  hajj: Moon,
  mises_a_jour: Rocket,
};

const CATEGORIES = [
  { value: 'actualites', label: 'Actualités', icon: Newspaper },
  { value: 'conseils', label: 'Conseils', icon: Lightbulb },
  { value: 'hajj', label: 'Hajj 2026', icon: Moon },
  { value: 'mises_a_jour', label: 'Mises à jour', icon: Rocket }
];

const CATEGORY_LABELS: Record<string, string> = {
  actualites: 'Actualités',
  conseils: 'Conseils',
  hajj: 'Hajj 2026',
  mises_a_jour: 'Mises à jour'
};

export default function BlogAdminPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: 'actualites',
    status: 'draft'
  });

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, categoryFilter, page]);

  const fetchPosts = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      params.append('page', String(page));
      params.append('limit', '10');

      const response = await fetch(`/api/admin/blog?${params}`, { credentials: 'same-origin' });

      if (response.status === 401) {
        setAuthError('Session expirée — Veuillez vous reconnecter');
        return;
      }
      if (response.status === 403) {
        setAuthError('Accès non autorisé — Permissions insuffisantes');
        return;
      }

      const result = await response.json();

      if (result.posts) {
        setData(result);
      }
      if (result.error) {
        setAuthError(result.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setAuthError('Erreur de connexion — Vérifiez votre réseau');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPost(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      coverImage: '',
      category: 'actualites',
      status: 'draft'
    });
    setShowModal(true);
  };

  const openEditModal = (post: BlogPost) => {
    setModalMode('edit');
    setSelectedPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      coverImage: post.coverImage || '',
      category: post.category,
      status: post.status
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert('Titre et contenu requis');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/blog';
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const body = modalMode === 'create'
        ? formData
        : { id: selectedPost?.id, ...formData };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (response.ok) {
        setShowModal(false);
        fetchPosts();
      } else {
        alert(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog?id=${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';

    try {
      const response = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          id: post.id,
          ...post,
          status: newStatus
        })
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return (
        <span className="dash-badge dash-badge-success inline-flex items-center gap-1">
          <Globe className="w-3 h-3" />
          Publié
        </span>
      );
    }
    return (
      <span className="dash-badge dash-badge-neutral inline-flex items-center gap-1">
        <FileText className="w-3 h-3" />
        Brouillon
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    const Icon = cat?.icon || Tag;
    return (
      <span className="dash-badge dash-badge-info inline-flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {cat?.label || category}
      </span>
    );
  };

  // Rich text editor helpers
  const insertFormat = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let newText = '';
    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'h2':
        newText = `\n## ${selectedText}\n`;
        break;
      case 'ul':
        newText = `\n- ${selectedText}\n`;
        break;
      case 'ol':
        newText = `\n1. ${selectedText}\n`;
        break;
      case 'quote':
        newText = `\n> ${selectedText}\n`;
        break;
      case 'link':
        newText = `[${selectedText || 'lien'}](url)`;
        break;
      case 'image':
        newText = `![${selectedText || 'image'}](url)`;
        break;
      default:
        newText = selectedText;
    }

    const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end);
    setFormData({ ...formData, content: newContent });
  };

  // Stats
  const stats = {
    total: data?.pagination.total || 0,
    published: data?.posts.filter(p => p.status === 'published').length || 0,
    draft: data?.posts.filter(p => p.status === 'draft').length || 0,
    totalViews: data?.posts.reduce((sum, p) => sum + p.views, 0) || 0
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--dash-ink)]">Blog Interne</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1">Gérez les articles pour les agences partenaires</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-brand btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouvel article
        </button>
      </div>

      {/* Auth Error Banner */}
      {authError && (
        <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">{authError}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total articles" value={stats.total} icon={FileText} color="brand" loading={loading} />
        <KpiCard label="Publiés" value={stats.published} icon={Globe} color="emerald" loading={loading} />
        <KpiCard label="Brouillons" value={stats.draft} icon={Edit} color="amber" loading={loading} />
        <KpiCard label="Vues totales" value={stats.totalViews} icon={EyeIcon} color="violet" loading={loading} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] rounded-xl">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)]">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] rounded-xl">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)]">
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={fetchPosts}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-muted)] hover:bg-[var(--dash-bg-3)] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--dash-brand)]/30 border-t-[var(--dash-brand)] rounded-full animate-spin" />
        </div>
      ) : data?.posts.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 text-[var(--dash-muted-2)] mb-3" />
            <p className="text-[var(--dash-muted)]">Aucun article trouvé</p>
            <button
              onClick={openCreateModal}
              className="text-[var(--dash-brand)] mt-2 hover:underline text-sm font-medium"
            >
              Créer le premier article
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.posts.map((post) => (
              <div
                key={post.id}
                className="dash-card p-5"
              >
                {/* Card Header with cover image */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--dash-bg-3)] flex-shrink-0">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[var(--dash-muted-2)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--dash-ink)] line-clamp-2">{post.title}</p>
                    <p className="text-xs text-[var(--dash-muted)] line-clamp-2 mt-0.5">
                      {post.excerpt || post.content.replace(/[#*`>\-\[\]]/g, '').substring(0, 80)}...
                    </p>
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {getCategoryBadge(post.category)}
                  {getStatusBadge(post.status)}
                </div>

                {/* Meta info */}
                <div className="space-y-1.5 text-xs text-[var(--dash-muted)] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('fr-FR')
                        : new Date(post.createdAt).toLocaleDateString('fr-FR')
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 shrink-0" />
                    <span>{post.author?.name || 'Anonyme'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-3 h-3 shrink-0" />
                    <span>{post.views} vue(s)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--dash-border)]">
                  <Button
                    onClick={() => toggleStatus(post)}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    title={post.status === 'published' ? 'Dépublier' : 'Publier'}
                  >
                    {post.status === 'published' ? (
                      <FileText className="w-3.5 h-3.5 text-amber-500 mr-1" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-[var(--dash-emerald)] mr-1" />
                    )}
                    {post.status === 'published' ? 'Dépublier' : 'Publier'}
                  </Button>
                  <Button
                    onClick={() => openEditModal(post)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4 text-[var(--dash-muted)]" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(post.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-[var(--dash-muted)]">
                {((page - 1) * 10) + 1} à {Math.min(page * 10, data.pagination.total)} sur {data.pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-lg bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                >
                  Précédent
                </Button>
                <Button
                  onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                  variant="outline"
                  size="sm"
                  className="rounded-lg bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[var(--dash-card)] rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border-[var(--dash-border)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold text-[var(--dash-ink)]">
                  {modalMode === 'create' ? 'Nouvel article' : 'Modifier l\'article'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-5">
                {/* Title */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">Titre *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de l'article"
                    className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">Image de couverture (URL)</Label>
                  <Input
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://exemple.com/image.jpg"
                    className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                  />
                  {formData.coverImage && (
                    <div className="mt-2 h-32 rounded-lg overflow-hidden bg-[var(--dash-bg-3)]">
                      <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">Extrait (affiché dans la liste)</Label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Résumé court de l'article..."
                    rows={2}
                    className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]"
                  />
                </div>

                {/* Content with Toolbar */}
                <div>
                  <Label className="text-[var(--dash-ink-2)]">Contenu * (Markdown)</Label>

                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-1 mt-2 mb-2 p-2 bg-[var(--dash-bg-3)] rounded-t-xl border border-[var(--dash-border)] border-b-0">
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('bold')} title="Gras">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('italic')} title="Italique">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-[var(--dash-border)] mx-1" />
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('h2')} title="Titre">
                      <Heading2 className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('ul')} title="Liste">
                      <List className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('ol')} title="Liste numérotée">
                      <ListOrdered className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('quote')} title="Citation">
                      <Quote className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-[var(--dash-border)] mx-1" />
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('link')} title="Lien">
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertFormat('image')} title="Image">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  <Textarea
                    id="content-editor"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Écrivez votre article en Markdown..."
                    rows={12}
                    className="mt-0 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)] rounded-t-none"
                  />
                  <p className="text-xs text-[var(--dash-muted)] mt-1">
                    Utilisez **gras**, *italique*, ## Titre, - liste, [lien](url), ![image](url)
                  </p>
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[var(--dash-ink-2)]">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)]">
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[var(--dash-ink-2)]">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger className="mt-1 bg-[var(--dash-card)] border-[var(--dash-border)] text-[var(--dash-ink)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--dash-card)] border-[var(--dash-border)]">
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--dash-border)]">
                <button
                  onClick={() => setShowModal(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-card)] text-sm font-medium text-[var(--dash-ink)] hover:bg-[var(--dash-bg-3)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-brand btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Enregistrer
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
