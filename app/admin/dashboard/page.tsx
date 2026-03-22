'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  LayoutDashboard, ImageIcon, FolderOpen, FileText,
  ShoppingCart, LogOut, Plus, Edit, Trash2, Search,
  Star, StarOff, Check, ChevronDown, User, Menu,
  BarChart2, RefreshCw, ExternalLink, Loader2,
  Instagram, Twitter, Globe, Mail, MapPin, Users, MessageSquare,
  Scale,
} from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ImageUploader } from '@/components/admin/image-uploader';
import { TiptapEditor } from '@/components/admin/tiptap-editor';
import type { Artwork, BlogPost, Category, Commission, Profile, Comment } from '@prisma/client';

type TabType =
  | 'overview' | 'artworks' | 'categories' | 'blog'
  | 'commissions' | 'comments' | 'profile' | 'legal';

type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
>;

function cls(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    published: 'bg-green-100 text-green-700 border-green-200',
    draft:     'bg-yellow-100 text-yellow-700 border-yellow-200',
    pending:   'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={cls(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
      colours[status] ?? 'bg-gray-100 text-gray-700 border-gray-200',
    )}>
      {status}
    </span>
  );
}

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: string | number; icon: LucideIcon; color: string;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className={cls('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function DeleteDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
        <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Root dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab]   = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    artworksTotal: 0, blogTotal: 0, ordersTotal: 0, communityTotal: 0,
  });

  useEffect(() => {
    void Promise.all([
      fetch('/api/artworks?all=true').then(r => r.json()),
      fetch('/api/blog?all=true').then(r => r.json()),
      fetch('/api/commissions').then(r => r.json()),
    ]).then(([art, blog, comm]) => {
      setStats({
        artworksTotal:  (art  as { artworks?:   unknown[] }).artworks?.length    ?? 0,
        blogTotal:      (blog as { posts?:       unknown[] }).posts?.length       ?? 0,
        ordersTotal:    (comm as { commissions?: unknown[] }).commissions?.length ?? 0,
        communityTotal: 0,
      });
    }).catch(() => {});
  }, [activeTab]);

  const sidebarItems: { id: TabType; label: string; icon: LucideIcon }[] = [
    { id: 'overview',    label: 'Overview',     icon: LayoutDashboard },
    { id: 'artworks',    label: 'Artworks',     icon: ImageIcon },
    { id: 'categories',  label: 'Categories',   icon: FolderOpen },
    { id: 'blog',        label: 'Blog Posts',   icon: FileText },
    { id: 'commissions', label: 'Commissions',  icon: ShoppingCart },
    { id: 'comments',    label: 'Comments',     icon: MessageSquare },
    { id: 'profile',     label: 'Profile',      icon: User },
    { id: 'legal',       label: 'Legal Pages',  icon: Scale },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-5 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">SR Arts</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => {
            const Icon   = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={cls(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-sm font-medium',
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-foreground/70 hover:bg-accent-subtle hover:text-foreground',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:bg-accent-subtle hover:text-foreground transition-all"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />View Site
          </a>
          <a
            href="/community"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:bg-accent-subtle hover:text-foreground transition-all"
          >
            <Users className="w-4 h-4 shrink-0" />Community
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />Logout
          </button>
        </div>
      </div>
    );
  }

  const showAddNew = activeTab === 'artworks' || activeTab === 'blog';

  return (
    <div className="flex h-screen bg-[#f7f8fa] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-border shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-border px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-accent-subtle transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">
              {sidebarItems.find(s => s.id === activeTab)?.label ?? 'Dashboard'}
            </h1>
          </div>
          {showAddNew && (
            <Link
              href={`/admin/${activeTab}/new`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New</span>
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'overview'    && <OverviewTab stats={stats} />}
          {activeTab === 'artworks'    && <ArtworksTab />}
          {activeTab === 'categories'  && <CategoriesTab />}
          {activeTab === 'blog'        && <BlogTab />}
          {activeTab === 'commissions' && <CommissionsTab />}
          {activeTab === 'comments'    && <CommentsTab />}
          {activeTab === 'profile'     && <ProfileTab />}
          {activeTab === 'legal'       && <LegalTab />}
        </main>
      </div>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewTab({
  stats,
}: {
  stats: { artworksTotal: number; blogTotal: number; ordersTotal: number; communityTotal: number };
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Artworks" value={stats.artworksTotal} icon={ImageIcon}    color="bg-violet-100 text-violet-600" />
        <StatCard label="Blog Posts"     value={stats.blogTotal}     icon={FileText}     color="bg-blue-100 text-blue-600" />
        <StatCard label="Commissions"    value={stats.ordersTotal}   icon={ShoppingCart} color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Community"      value="Live"                icon={Users}        color="bg-orange-100 text-orange-600" />
      </div>
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Link href="/admin/artworks/new" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 transition-colors">
            <Plus className="w-4 h-4" />Upload Artwork
          </Link>
          <Link href="/admin/blog/new" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors">
            <Plus className="w-4 h-4" />Write Blog Post
          </Link>
          <a href="/community" target="_blank" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors">
            <ExternalLink className="w-4 h-4" />View Community
          </a>
          <a href="/about" target="_blank" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors">
            <ExternalLink className="w-4 h-4" />View About Page
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Artworks tab ──────────────────────────────────────────────────────────────

function ArtworksTab() {
  const [items, setItems]     = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [delId, setDelId]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/artworks?all=true').then(r => r.json()) as { artworks?: Artwork[] };
      setItems(d.artworks ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const toggleField = async (item: Artwork, field: 'status' | 'featured') => {
    const next = field === 'status'
      ? (item.status === 'published' ? 'draft' : 'published')
      : !item.featured;
    await fetch(`/api/artworks/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: next }),
    });
    toast.success('Updated');
    void load();
  };

  const del = async () => {
    if (!delId) return;
    await fetch(`/api/artworks/${delId}`, { method: 'DELETE' });
    toast.success('Artwork deleted');
    setDelId(null);
    void load();
  };

  const filtered = items.filter(i => i.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      {delId && <DeleteDialog onConfirm={del} onCancel={() => setDelId(null)} />}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search artworks…"
            className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button onClick={() => void load()} className="p-2.5 rounded-xl border border-border bg-white hover:bg-accent-subtle transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">
            No artworks yet.{' '}
            <Link href="/admin/artworks/new" className="text-primary underline">Add your first</Link>.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent-subtle/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Artwork</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Slug</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">Featured</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-accent-subtle/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-accent-subtle">
                            <NextImage src={item.imageUrl} alt="" width={40} height={40} className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-accent-subtle shrink-0 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium truncate max-w-[120px]">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell truncate max-w-[120px]">{item.slug}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => void toggleField(item, 'status')}>
                        <StatusBadge status={item.status} />
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <button onClick={() => void toggleField(item, 'featured')} className="text-muted-foreground hover:text-yellow-500 transition-colors">
                        {item.featured
                          ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          : <StarOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/admin/artworks/${item.id}/edit`} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDelId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

// ── Categories tab ────────────────────────────────────────────────────────────

function CategoriesTab() {
  const [cats, setCats]       = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName]       = useState('');
  const [delId, setDelId]     = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/categories').then(r => r.json()) as { categories?: Category[] };
      setCats(d.categories ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
          order: cats.length,
        }),
      });
      toast.success('Category created');
      setName('');
      void load();
    } finally { setSaving(false); }
  };

  const del = async () => {
    if (!delId) return;
    await fetch(`/api/categories/${delId}`, { method: 'DELETE' });
    toast.success('Deleted');
    setDelId(null);
    void load();
  };

  return (
    <div className="space-y-4 max-w-lg">
      {delId && <DeleteDialog onConfirm={del} onCancel={() => setDelId(null)} />}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="font-bold text-sm mb-3">Add New Category</h2>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && void add()}
            placeholder="Category name…"
            className="flex-1 px-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => void add()}
            disabled={saving || !name.trim()}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light disabled:opacity-50 transition-colors"
          >
            {saving ? '…' : 'Add'}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <p className="text-center py-8 text-muted-foreground text-sm">Loading…</p>
        ) : cats.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {cats.map(cat => (
              <li key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent-subtle/20 transition-colors">
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                </div>
                <button
                  onClick={() => setDelId(cat.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Blog tab ──────────────────────────────────────────────────────────────────

function BlogTab() {
  const [posts, setPosts]     = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState('');
  const [delId, setDelId]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/blog?all=true').then(r => r.json()) as { posts?: BlogPost[] };
      setPosts(d.posts ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const toggleStatus = async (post: BlogPost) => {
    await fetch(`/api/blog/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: post.status === 'published' ? 'draft' : 'published' }),
    });
    toast.success('Updated');
    void load();
  };

  const del = async () => {
    if (!delId) return;
    await fetch(`/api/blog/${delId}`, { method: 'DELETE' });
    toast.success('Post deleted');
    setDelId(null);
    void load();
  };

  const filtered = posts.filter(p => p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      {delId && <DeleteDialog onConfirm={del} onCancel={() => setDelId(null)} />}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button onClick={() => void load()} className="p-2.5 rounded-xl border border-border bg-white hover:bg-accent-subtle transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">
            No blog posts yet.{' '}
            <Link href="/admin/blog/new" className="text-primary underline">Write your first</Link>.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent-subtle/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Slug</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(post => (
                  <tr key={post.id} className="hover:bg-accent-subtle/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-accent-subtle">
                            <NextImage src={post.coverImage} alt="" width={40} height={40} className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-accent-subtle shrink-0 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium truncate max-w-[140px]">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell truncate max-w-[120px]">{post.slug}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => void toggleStatus(post)}>
                        <StatusBadge status={post.status} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/admin/blog/${post.id}/edit`} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDelId(post.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

// ── Commissions tab ───────────────────────────────────────────────────────────

const COMMISSION_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
type CommissionStatus = typeof COMMISSION_STATUSES[number];

function CommissionsTab() {
  const [items, setItems]           = useState<Commission[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<'all' | CommissionStatus>('all');
  const [openDropdown, setDropdown] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/commissions').then(r => r.json()) as { commissions?: Commission[] };
      setItems(d.commissions ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const updateStatus = async (id: string, status: CommissionStatus) => {
    await fetch(`/api/commissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    toast.success(`Status → ${status}`);
    setDropdown(null);
    void load();
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(['all', ...COMMISSION_STATUSES] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cls(
              'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
              filter === s ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/70 hover:bg-accent-subtle',
            )}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">No commissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{item.userName}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.userEmail}</p>
                  {item.projectTitle && <p className="text-sm mt-1 font-medium text-foreground/80">{item.projectTitle}</p>}
                  {item.description  && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {item.createdAt.toLocaleDateString()}
                    {item.budget ? ` · Budget: ${item.budget}` : ''}
                    {item.style  ? ` · Style: ${item.style}`   : ''}
                  </p>
                </div>
                <div className="relative shrink-0">
                  <button
                    onClick={() => setDropdown(openDropdown === item.id ? null : item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-accent-subtle/50 text-xs font-medium hover:bg-accent-subtle transition-colors"
                  >
                    Change <ChevronDown className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === item.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        className="absolute right-0 top-full mt-1 z-10 bg-white border border-border rounded-xl shadow-xl overflow-hidden min-w-[130px]"
                      >
                        {COMMISSION_STATUSES.map(s => (
                          <button
                            key={s}
                            onClick={() => void updateStatus(item.id, s)}
                            className={cls(
                              'w-full flex items-center gap-2 px-3 py-2 text-xs font-medium capitalize hover:bg-accent-subtle transition-colors text-left',
                              item.status === s ? 'text-primary' : 'text-foreground/80',
                            )}
                          >
                            {item.status === s
                              ? <Check className="w-3 h-3 shrink-0" />
                              : <span className="w-3 h-3 shrink-0" />}
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Comments tab ──────────────────────────────────────────────────────────────

function CommentsTab() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'all' | 'artwork' | 'blog' | 'community'>('all');
  const [delId, setDelId]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/comments');
      if (res.ok) {
        const d = await res.json() as { comments?: Comment[] };
        setComments(d.comments ?? []);
      }
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const del = async () => {
    if (!delId) return;
    await fetch(`/api/comments/${delId}`, { method: 'DELETE' });
    toast.success('Comment deleted');
    setDelId(null);
    void load();
  };

  const filtered = filter === 'all' ? comments : comments.filter(c => c.targetType === filter);

  return (
    <div className="space-y-4">
      {delId && <DeleteDialog onConfirm={del} onCancel={() => setDelId(null)} />}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'artwork', 'blog', 'community'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cls(
              'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors',
              filter === t ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/70 hover:bg-accent-subtle',
            )}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-sm text-muted-foreground">No comments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="divide-y divide-border">
            {filtered.map(c => (
              <div key={c.id} className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-accent-subtle/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{c.username}</span>
                    <span className={cls(
                      'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                      c.targetType === 'artwork'   ? 'bg-violet-100 text-violet-700' :
                      c.targetType === 'blog'      ? 'bg-blue-100 text-blue-700' :
                                                     'bg-orange-100 text-orange-700',
                    )}>
                      {c.targetType}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2">{c.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.createdAt.toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setDelId(c.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Legal tab — Terms & Conditions + Privacy Policy editors ───────────────────

interface StaticPageData {
  title:   string;
  content: string;
}

type LegalSlug = 'terms' | 'privacy';

interface LegalEditorProps {
  slug:    LegalSlug;
  heading: string;
  href:    string;
}

function LegalEditor({ slug, heading, href }: LegalEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState<StaticPageData>({ title: '', content: '' });

  useEffect(() => {
    void fetch(`/api/pages/${slug}`)
      .then(r => r.json())
      .then((d: { page?: StaticPageData | null }) => {
        if (d.page) {
          setForm({ title: d.page.title, content: d.page.content });
        } else {
          // Pre-fill sensible defaults when no DB row exists yet
          setForm({
            title:   slug === 'terms' ? 'Terms & Conditions' : 'Privacy Policy',
            content: '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title: form.title.trim(), content: form.content }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success(`${heading} saved!`);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30';

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          {heading}
        </h2>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Preview page
        </a>
      </div>

      {/* Page title */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Page Title</label>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder={heading}
          className={inp}
        />
      </div>

      {/* Rich text content */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Content</label>
        <TiptapEditor
          content={form.content}
          onChange={html => setForm(f => ({ ...f, content: html }))}
          placeholder={`Write your ${heading.toLowerCase()} here…`}
        />
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving…' : `Save ${heading}`}
        </button>
      </div>
    </div>
  );
}

function LegalTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-accent-subtle/40 rounded-2xl border border-border p-4">
        <p className="text-sm text-muted-foreground">
          Edit your legal pages below. Changes are saved to the database and reflected immediately on
          <strong className="text-foreground"> /terms</strong> and
          <strong className="text-foreground"> /privacy</strong>.
        </p>
      </div>

      <LegalEditor slug="terms"   heading="Terms & Conditions" href="/terms"   />
      <LegalEditor slug="privacy" heading="Privacy Policy"     href="/privacy" />
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────

interface ProfileForm {
  name: string; headline: string; bio: string; location: string;
  profileImage: string; profileImageId: string;
  bannerImage: string;  bannerImageId: string;
  instagram: string; twitter: string; email: string; website: string;
  skills: string; yearsExperience: string;
  artworksCount: string; clientsCount: string; followersCount: string;
}

const EMPTY_PROFILE: ProfileForm = {
  name: '', headline: '', bio: '', location: '',
  profileImage: '', profileImageId: '',
  bannerImage: '',  bannerImageId: '',
  instagram: '', twitter: '', email: '', website: '',
  skills: '', yearsExperience: '',
  artworksCount: '', clientsCount: '', followersCount: '',
};

const socialFields: { key: keyof ProfileForm; label: string; Icon: LucideIcon; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram',   Icon: Instagram, placeholder: '@sr_arts' },
  { key: 'twitter',   label: 'Twitter / X', Icon: Twitter,   placeholder: '@sr_arts' },
  { key: 'email',     label: 'Email',       Icon: Mail,      placeholder: 'hello@sr-arts.com' },
  { key: 'website',   label: 'Website',     Icon: Globe,     placeholder: 'https://sr-arts.com' },
];

const statFields: { key: keyof ProfileForm; label: string; placeholder: string }[] = [
  { key: 'artworksCount',  label: 'Artworks',  placeholder: '500+' },
  { key: 'clientsCount',   label: 'Clients',   placeholder: '1K+' },
  { key: 'followersCount', label: 'Followers', placeholder: '50K+' },
];

function ProfileTab() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [form, setForm]                     = useState<ProfileForm>(EMPTY_PROFILE);

  useEffect(() => {
    void fetch('/api/profile')
      .then(r => r.json())
      .then((data: { profile?: Profile | null }) => {
        if (data.profile) {
          const p = data.profile;
          setForm({
            name:            p.name            ?? '',
            headline:        p.headline        ?? '',
            bio:             p.bio             ?? '',
            location:        p.location        ?? '',
            profileImage:    p.profileImage    ?? '',
            profileImageId:  p.profileImageId  ?? '',
            bannerImage:     p.bannerImage     ?? '',
            bannerImageId:   p.bannerImageId   ?? '',
            instagram:       p.instagram       ?? '',
            twitter:         p.twitter         ?? '',
            email:           p.email           ?? '',
            website:         p.website         ?? '',
            skills:          (p.skills ?? []).join(', '),
            yearsExperience: p.yearsExperience ? String(p.yearsExperience) : '',
            artworksCount:   p.artworksCount   ?? '',
            clientsCount:    p.clientsCount    ?? '',
            followersCount:  p.followersCount  ?? '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const set = (k: keyof ProfileForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          yearsExperience: form.yearsExperience.trim()
            ? (v => (Number.isNaN(v) ? null : v))(parseInt(form.yearsExperience, 10))
            : null,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Profile saved!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const inp = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="max-w-2xl space-y-6">
      {/* Images */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-5">
        <h2 className="font-bold text-sm">Profile Images</h2>
        <div>
          <label className="text-sm font-medium block mb-2">Profile Photo</label>
          <ImageUploader
            value={form.profileImage}
            aspectRatio="square"
            label="Upload Profile Photo"
            onChange={(url, pid) => { set('profileImage', url); set('profileImageId', pid); }}
            onRemove={() => { set('profileImage', ''); set('profileImageId', ''); }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Banner / Cover Image</label>
          <ImageUploader
            value={form.bannerImage}
            aspectRatio="landscape"
            label="Upload Banner Image"
            onChange={(url, pid) => { set('bannerImage', url); set('bannerImageId', pid); }}
            onRemove={() => { set('bannerImage', ''); set('bannerImageId', ''); }}
          />
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-sm">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="SR Arts" className={inp} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" className={`${inp} pl-9`} />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Headline</label>
          <input value={form.headline} onChange={e => set('headline', e.target.value)} placeholder="Digital Artist & Illustrator" className={inp} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Bio / About</label>
          <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={5} placeholder="Tell your story…" className={`${inp} resize-none`} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Skills <span className="text-muted-foreground font-normal text-xs">(comma-separated)</span>
          </label>
          <input value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="Digital Art, Anime, Realistic Portrait" className={inp} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Years of Experience</label>
          <input type="number" min="0" value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} placeholder="10" className={inp} />
        </div>
      </div>

      {/* Social */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-sm">Social &amp; Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socialFields.map(({ key, label, Icon, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} className={`${inp} pl-9`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-sm">
          Display Stats <span className="text-muted-foreground font-normal text-xs">(shown on About page)</span>
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {statFields.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium">{label}</label>
              <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} className={inp} />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <a
          href="/about"
          target="_blank"
          className="flex-1 py-3 rounded-xl border border-border text-center text-sm font-semibold hover:bg-accent-subtle transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Preview
        </a>
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
