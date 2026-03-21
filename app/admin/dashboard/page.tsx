'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  LayoutDashboard, ImageIcon, FolderOpen, FileText,
  ShoppingCart, LogOut, Plus, Edit, Trash2, Search,
  Star, StarOff, Check, ChevronDown,
  Menu, BarChart2, RefreshCw, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type TabType = 'overview' | 'artworks' | 'categories' | 'blog' | 'commissions';

// Proper icon type for React 19 + TypeScript 5.7 + lucide-react
type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
>;

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: 'bg-green-100 text-green-700 border-green-200',
    draft:     'bg-yellow-100 text-yellow-700 border-yellow-200',
    pending:   'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
        map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      {status}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
// Fixed: use LucideIcon instead of React.ElementType to avoid `never` error in React 19
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────
function DeleteDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This action cannot be undone. The item will be permanently removed.
        </p>
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ artworksTotal: 0, blogTotal: 0, ordersTotal: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/artworks?all=true').then((r) => r.json()),
      fetch('/api/blog?all=true').then((r) => r.json()),
      fetch('/api/commissions').then((r) => r.json()),
    ])
      .then(([art, blog, comm]) => {
        setStats({
          artworksTotal: art.artworks?.length ?? 0,
          blogTotal: blog.posts?.length ?? 0,
          ordersTotal: comm.commissions?.length ?? 0,
        });
      })
      .catch(() => {});
  }, [activeTab]);

  // Typed as LucideIcon so they work with StatCard and sidebar rendering
  const sidebarItems: {
    id: TabType;
    label: string;
    icon: LucideIcon;
  }[] = [
    { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
    { id: 'artworks',    label: 'Artworks',    icon: ImageIcon },
    { id: 'categories',  label: 'Categories',  icon: FolderOpen },
    { id: 'blog',        label: 'Blog Posts',  icon: FileText },
    { id: 'commissions', label: 'Commissions', icon: ShoppingCart },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  // Inner component — defined inside render so it can close over state
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
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-foreground/70 hover:bg-accent-subtle hover:text-foreground'
                }`}
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
            <ExternalLink className="w-4 h-4 shrink-0" />
            View Site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f7f8fa] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-border shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-border px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-accent-subtle transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold capitalize">
              {sidebarItems.find((s) => s.id === activeTab)?.label ?? 'Dashboard'}
            </h1>
          </div>
          {activeTab !== 'overview' && activeTab !== 'commissions' && (
            <Link
              href={`/admin/${activeTab}/new`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New</span>
            </Link>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'overview'    && <OverviewTab stats={stats} />}
          {activeTab === 'artworks'    && <ArtworksTab />}
          {activeTab === 'categories'  && <CategoriesTab />}
          {activeTab === 'blog'        && <BlogTab />}
          {activeTab === 'commissions' && <CommissionsTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({
  stats,
}: {
  stats: { artworksTotal: number; blogTotal: number; ordersTotal: number };
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Artworks" value={stats.artworksTotal} icon={ImageIcon}    color="bg-violet-100 text-violet-600" />
        <StatCard label="Blog Posts"     value={stats.blogTotal}     icon={FileText}     color="bg-blue-100 text-blue-600" />
        <StatCard label="Commissions"    value={stats.ordersTotal}   icon={ShoppingCart} color="bg-emerald-100 text-emerald-600" />
      </div>
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/artworks/new', label: 'Upload Artwork',  color: 'bg-violet-50 hover:bg-violet-100 text-violet-700' },
            { href: '/admin/blog/new',     label: 'Write Blog Post', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
            { href: '/admin/categories',   label: 'Add Category',    color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${a.color}`}
            >
              <Plus className="w-4 h-4" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Artworks tab ──────────────────────────────────────────────────────────────
type DocRecord = Record<string, unknown>;

function ArtworksTab() {
  const [items, setItems] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/artworks?all=true');
      const data = (await res.json()) as { artworks?: DocRecord[] };
      setItems(data.artworks ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (item: DocRecord, field: 'status' | 'featured') => {
    const next =
      field === 'status'
        ? item.status === 'published' ? 'draft' : 'published'
        : !item.featured;
    await fetch(`/api/artworks/${String(item.$id)}`, {
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

  const filtered = items.filter((i) =>
    String(i.title ?? '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {delId && <DeleteDialog onConfirm={del} onCancel={() => setDelId(null)} />}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search artworks…"
            className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={() => void load()}
          className="p-2.5 rounded-xl border border-border bg-white hover:bg-accent-subtle transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">
            No artworks yet.{' '}
            <Link href="/admin/artworks/new" className="text-primary underline">
              Add your first artwork
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent-subtle/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Artwork</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Featured</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">Views</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={String(item.$id)} className="hover:bg-accent-subtle/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-accent-subtle">
                            <NextImage
                              src={String(item.imageUrl)}
                              alt=""
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-accent-subtle shrink-0 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium truncate max-w-[140px]">
                          {String(item.title ?? '–')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell capitalize">
                      {String(item.category ?? '–')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => void toggle(item, 'status')} title="Toggle status">
                        <StatusBadge status={String(item.status ?? 'draft')} />
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <button
                        onClick={() => void toggle(item, 'featured')}
                        className="text-muted-foreground hover:text-yellow-500 transition-colors"
                      >
                        {item.featured ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {String(item.views ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/artworks/${String(item.$id)}/edit`}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDelId(String(item.$id))}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        >
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

// ─── Categories tab ────────────────────────────────────────────────────────────
function CategoriesTab() {
  const [cats, setCats] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [delId, setDelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = (await res.json()) as { categories?: DocRecord[] };
      setCats(data.categories ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
    } finally {
      setSaving(false);
    }
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
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void add()}
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
            {cats.map((cat) => (
              <li
                key={String(cat.$id)}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent-subtle/20 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{String(cat.name)}</p>
                  <p className="text-xs text-muted-foreground">/{String(cat.slug)}</p>
                </div>
                <button
                  onClick={() => setDelId(String(cat.$id))}
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

// ─── Blog tab ──────────────────────────────────────────────────────────────────
function BlogTab() {
  const [posts, setPosts] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog?all=true');
      const data = (await res.json()) as { posts?: DocRecord[] };
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleStatus = async (post: DocRecord) => {
    await fetch(`/api/blog/${String(post.$id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: post.status === 'published' ? 'draft' : 'published',
      }),
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

  const filtered = posts.filter((p) =>
    String(p.title ?? '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {delId && <DeleteDialog onConfirm={del} onCancel={() => setDelId(null)} />}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={() => void load()}
          className="p-2.5 rounded-xl border border-border bg-white hover:bg-accent-subtle transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">
            No blog posts yet.{' '}
            <Link href="/admin/blog/new" className="text-primary underline">
              Write your first post
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent-subtle/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Author</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Views</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((post) => (
                  <tr key={String(post.$id)} className="hover:bg-accent-subtle/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-accent-subtle">
                            <NextImage
                              src={String(post.coverImage)}
                              alt=""
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-accent-subtle shrink-0 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium truncate max-w-[160px]">
                          {String(post.title ?? '–')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {String(post.author ?? 'SR Arts')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => void toggleStatus(post)} title="Toggle status">
                        <StatusBadge status={String(post.status ?? 'draft')} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {String(post.views ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/admin/blog/${String(post.$id)}/edit`}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDelId(String(post.$id))}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        >
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

// ─── Commissions tab ───────────────────────────────────────────────────────────
const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

function CommissionsTab() {
  const [items, setItems] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/commissions');
      const data = (await res.json()) as { commissions?: DocRecord[] };
      setItems(data.commissions ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/commissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    toast.success(`Status → ${status}`);
    setOpenDropdown(null);
    void load();
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === s
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-foreground/70 hover:bg-accent-subtle'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm">No commissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={String(item.$id)}
              className="bg-white rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">
                      {String(item.userName ?? item.name ?? '—')}
                    </p>
                    <StatusBadge status={String(item.status ?? 'pending')} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {String(item.userEmail ?? item.email ?? '—')}
                  </p>
                  {item.projectTitle && (
                    <p className="text-sm mt-1 font-medium text-foreground/80">
                      {String(item.projectTitle)}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {String(item.description)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(String(item.createdAt ?? item.$createdAt)).toLocaleDateString()}
                    {item.budget ? ` · Budget: ${String(item.budget)}` : ''}
                    {item.style ? ` · Style: ${String(item.style)}` : ''}
                  </p>
                </div>

                {/* Status dropdown */}
                <div className="relative shrink-0">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === String(item.$id) ? null : String(item.$id)
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-accent-subtle/50 text-xs font-medium hover:bg-accent-subtle transition-colors"
                  >
                    Change <ChevronDown className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === String(item.$id) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        className="absolute right-0 top-full mt-1 z-10 bg-white border border-border rounded-xl shadow-xl overflow-hidden min-w-[130px]"
                      >
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => void updateStatus(String(item.$id), s)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium capitalize hover:bg-accent-subtle transition-colors text-left ${
                              item.status === s ? 'text-primary' : 'text-foreground/80'
                            }`}
                          >
                            {item.status === s && <Check className="w-3 h-3 shrink-0" />}
                            <span className={item.status === s ? 'ml-0' : 'ml-5'}>{s}</span>
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
