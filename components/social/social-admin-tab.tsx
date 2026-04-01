'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence }           from 'framer-motion';
import {
  Plus, Trash2, RefreshCw, Loader2, Pencil, Check,
  X as XClose, Link2, Link2Off, AlertTriangle, CheckCircle2,
  ToggleLeft, ToggleRight, Instagram, Youtube, Twitter, Facebook,
} from 'lucide-react';
import { toast }  from 'sonner';
import Image      from 'next/image';

type Platform    = 'INSTAGRAM' | 'YOUTUBE' | 'TWITTER' | 'FACEBOOK';
type FetchStatus = 'pending' | 'success' | 'failed' | 'manual';

interface SocialAccount {
  id:              string;
  platform:        Platform;
  username:        string;
  followers:       number | null;
  posts:           number | null;
  avatarUrl:       string | null;
  displayName:     string | null;
  manualFollowers: number | null;
  manualPosts:     number | null;
  useManual:       boolean;
  clerkUserId:     string | null;
  clerkProvider:   string | null;
  oauthConnected:  boolean;
  lastFetchMethod: string | null;
  lastFetchError:  string | null;
  fetchStatus:     FetchStatus;
  lastFetchedAt:   string | null;
}

const PLATFORMS = [
  { value: 'INSTAGRAM' as Platform, label: 'Instagram',   Icon: Instagram, placeholder: 'srarts.official' },
  { value: 'YOUTUBE'   as Platform, label: 'YouTube',     Icon: Youtube,   placeholder: 'SRArtsOfficial'  },
  { value: 'TWITTER'   as Platform, label: 'X / Twitter', Icon: Twitter,   placeholder: 'srarts'           },
  { value: 'FACEBOOK'  as Platform, label: 'Facebook',    Icon: Facebook,  placeholder: 'srarts.official'  },
];

const PLATFORM_PROVIDER: Record<Platform, string> = {
  INSTAGRAM: 'oauth_facebook',
  FACEBOOK:  'oauth_facebook',
  TWITTER:   'oauth_twitter',
  YOUTUBE:   'oauth_google',
};

const PROVIDER_LABELS: Record<string, string> = {
  oauth_google:   'Google (YouTube)',
  oauth_facebook: 'Facebook / Meta',
  oauth_twitter:  'Twitter / X',
};

function fmtN(n: number | null): string {
  if (n === null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString();
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const cfg: Record<Platform, string> = {
    INSTAGRAM: 'bg-pink-50 text-pink-700 border-pink-200',
    YOUTUBE:   'bg-red-50 text-red-700 border-red-200',
    TWITTER:   'bg-sky-50 text-sky-700 border-sky-200',
    FACEBOOK:  'bg-blue-50 text-blue-700 border-blue-200',
  };
  const labels: Record<Platform, string> = {
    INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube', TWITTER: 'X / Twitter', FACEBOOK: 'Facebook',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg[platform]}`}>
      {labels[platform]}
    </span>
  );
}

function StatusDot({ status }: { status: FetchStatus }) {
  const cfg: Record<FetchStatus, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-400', label: 'Pending'  },
    success: { color: 'bg-green-500',  label: 'Success'  },
    failed:  { color: 'bg-red-500',    label: 'Failed'   },
    manual:  { color: 'bg-amber-400',  label: 'Manual'   },
  };
  const c = cfg[status] ?? cfg.pending;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <span className={`w-2 h-2 rounded-full ${c.color} shrink-0`} />
      {c.label}
    </span>
  );
}

function MethodTag({ method }: { method: string | null }) {
  if (!method) return null;
  const cfg: Record<string, string> = {
    clerk_oauth: 'bg-green-100 text-green-700',
    youtube_api: 'bg-blue-100 text-blue-700',
    rapidapi:    'bg-violet-100 text-violet-700',
    manual:      'bg-amber-100 text-amber-700',
    failed:      'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    clerk_oauth: '⚡ OAuth',  youtube_api: '📡 YouTube API',
    rapidapi: '🔌 RapidAPI', manual: '✏️ Manual', failed: '⚠ Failed',
  };
  const cls = cfg[method] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {labels[method] ?? method}
    </span>
  );
}

// ─── Manual editor ────────────────────────────────────────────────────────────

function ManualEditor({
  account, onSave, onClose,
}: {
  account: SocialAccount;
  onSave: (followers: number | null, posts: number | null) => Promise<void>;
  onClose: () => void;
}) {
  const [followers, setFollowers] = useState(account.manualFollowers?.toString() ?? '');
  const [posts,     setPosts]     = useState(account.manualPosts?.toString() ?? '');
  const [saving,    setSaving]    = useState(false);

  const handleSave = async () => {
    const f = followers.trim() === '' ? null : parseInt(followers.trim(), 10);
    const p = posts.trim() === ''     ? null : parseInt(posts.trim(), 10);
    if (followers.trim() !== '' && (isNaN(f!) || f! < 0)) { toast.error('Invalid follower count'); return; }
    if (posts.trim()     !== '' && (isNaN(p!) || p! < 0)) { toast.error('Invalid post count');     return; }
    setSaving(true);
    await onSave(f, p);
    setSaving(false);
    onClose();
  };

  const inp = 'w-full px-2.5 py-1.5 border border-border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/30';
  return (
    <div className="mt-2 p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
      <p className="text-xs font-semibold text-amber-800">Set Manual Data</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground font-medium">
            {account.platform === 'YOUTUBE' ? 'Subscribers' : 'Followers'}
          </label>
          <input type="number" min="0" value={followers} onChange={e => setFollowers(e.target.value)}
            placeholder="e.g. 12400" onKeyDown={e => { if (e.key === 'Enter') void handleSave(); if (e.key === 'Escape') onClose(); }}
            autoFocus className={inp} />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground font-medium">
            {account.platform === 'YOUTUBE' ? 'Videos' : 'Posts'} (optional)
          </label>
          <input type="number" min="0" value={posts} onChange={e => setPosts(e.target.value)}
            placeholder="e.g. 284" className={inp} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => void handleSave()} disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg
            hover:bg-primary-light disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Save
        </button>
        <button onClick={onClose}
          className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium
            hover:bg-accent-subtle transition-colors text-muted-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Account row ──────────────────────────────────────────────────────────────

function AccountRow({
  account, onDelete, onToggleManual, onUpdateManual, onConnect, onDisconnect, onSyncOne,
}: {
  account:         SocialAccount;
  onDelete:        (id: string) => Promise<void>;
  onToggleManual:  (id: string, current: boolean) => Promise<void>;
  onUpdateManual:  (id: string, f: number | null, p: number | null) => Promise<void>;
  onConnect:       (id: string, provider: string) => Promise<void>;
  onDisconnect:    (id: string) => Promise<void>;
  onSyncOne:       (id: string) => Promise<void>;
}) {
  const [editManual,  setEditManual]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [toggling,    setToggling]    = useState(false);
  const [connecting,  setConnecting]  = useState(false);
  const [syncingRow,  setSyncingRow]  = useState(false);

  const effectiveFollowers = account.useManual ? account.manualFollowers : account.followers;
  const displayName = account.displayName ?? account.username;
  const provider    = PLATFORM_PROVIDER[account.platform];

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(account.id);
    setDeleting(false);
  };

  const handleToggle = async () => {
    setToggling(true);
    await onToggleManual(account.id, account.useManual);
    setToggling(false);
  };

  const handleConnect = async () => {
    setConnecting(true);
    await onConnect(account.id, provider);
    setConnecting(false);
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    await onDisconnect(account.id);
    setConnecting(false);
  };

  const handleSyncRow = async () => {
    setSyncingRow(true);
    await onSyncOne(account.id);
    setSyncingRow(false);
  };

  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
      className="p-4 hover:bg-accent-subtle/20 transition-colors">

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative w-10 h-10 shrink-0 mt-0.5">
          {account.avatarUrl ? (
            <Image src={account.avatarUrl} alt={displayName} fill sizes="40px"
              className="rounded-full object-cover ring-1 ring-border" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent-subtle flex items-center justify-center
              font-bold text-sm text-muted-foreground ring-1 ring-border">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {account.oauthConnected && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500
              ring-2 ring-white" title="OAuth Connected" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-sm truncate">{displayName}</p>
            <PlatformBadge platform={account.platform} />
          </div>
          <p className="text-xs text-muted-foreground mb-2">@{account.username}</p>

          {/* Stats row */}
          <div className="flex items-center flex-wrap gap-4 mb-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {account.platform === 'YOUTUBE' ? 'Subscribers' : 'Followers'}
              </p>
              <p className="text-base font-bold text-foreground/80">{fmtN(effectiveFollowers)}</p>
            </div>
            {account.posts !== null && (
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {account.platform === 'YOUTUBE' ? 'Videos' : 'Posts'}
                </p>
                <p className="text-base font-bold text-foreground/80">{fmtN(account.posts)}</p>
              </div>
            )}
          </div>

          {/* Metrics row */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <StatusDot status={account.fetchStatus} />
            <MethodTag method={account.useManual ? 'manual' : account.lastFetchMethod} />
            {account.lastFetchedAt && (
              <span className="text-[10px] text-muted-foreground/60">
                {new Date(account.lastFetchedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
              </span>
            )}
          </div>

          {/* Error message */}
          {account.fetchStatus === 'failed' && account.lastFetchError && (
            <div className="flex items-start gap-1.5 mt-1 p-2 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-700 break-words">{account.lastFetchError}</p>
            </div>
          )}

          {/* OAuth connection section */}
          <div className="mt-2">
            {account.oauthConnected ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected via {PROVIDER_LABELS[account.clerkProvider ?? ''] ?? account.clerkProvider}
                </div>
                <button onClick={() => void handleDisconnect()} disabled={connecting}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                    font-semibold text-red-600 hover:bg-red-50 transition-colors border border-red-200">
                  {connecting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Link2Off className="w-2.5 h-2.5" />}
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={() => void handleConnect()} disabled={connecting}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                  font-semibold text-primary border border-primary/30 hover:bg-primary/5
                  disabled:opacity-50 transition-colors">
                {connecting
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Link2 className="w-3 h-3" />
                }
                Connect via {PROVIDER_LABELS[provider]}
              </button>
            )}
          </div>

          {/* Manual data editor */}
          {account.useManual && !editManual && (
            <button onClick={() => setEditManual(true)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-amber-600 hover:underline font-medium">
              <Pencil className="w-3 h-3" />
              {account.manualFollowers !== null
                ? `Edit manual data (${fmtN(account.manualFollowers)} followers)`
                : 'Set manual data'
              }
            </button>
          )}
          {editManual && (
            <ManualEditor
              account={account}
              onSave={async (f, p) => { await onUpdateManual(account.id, f, p); }}
              onClose={() => setEditManual(false)}
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
          {/* Sync this account */}
          <button onClick={() => void handleSyncRow()} disabled={syncingRow || account.useManual}
            title={account.useManual ? 'Using manual data — sync disabled' : 'Fetch latest stats now'}
            className="p-1.5 rounded-lg hover:bg-primary/5 text-primary transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed">
            {syncingRow ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>

          {/* Manual toggle */}
          <button onClick={() => void handleToggle()} disabled={toggling}
            title={account.useManual ? 'Using manual data' : 'Using API data'}
            className={`p-1.5 rounded-lg transition-colors ${
              account.useManual
                ? 'text-amber-500 hover:bg-amber-50'
                : 'text-muted-foreground hover:bg-accent-subtle'
            }`}>
            {toggling
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : account.useManual
                ? <ToggleRight className="w-4 h-4" />
                : <ToggleLeft className="w-4 h-4" />
            }
          </button>

          {/* Delete */}
          <button onClick={() => void handleDelete()} disabled={deleting}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600
              transition-colors disabled:opacity-50">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Metrics summary ──────────────────────────────────────────────────────────

function MetricsSummary({ accounts }: { accounts: SocialAccount[] }) {
  const total   = accounts.length;
  const success = accounts.filter(a => a.fetchStatus === 'success').length;
  const failed  = accounts.filter(a => a.fetchStatus === 'failed').length;
  const manual  = accounts.filter(a => a.fetchStatus === 'manual' || a.useManual).length;
  const oauth   = accounts.filter(a => a.oauthConnected).length;

  if (total === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {[
        { label: 'Synced OK',        value: success, icon: CheckCircle2, cls: 'text-green-600 bg-green-50' },
        { label: 'Failed',           value: failed,  icon: AlertTriangle, cls: 'text-red-600 bg-red-50'   },
        { label: 'Manual',           value: manual,  icon: Pencil,        cls: 'text-amber-600 bg-amber-50'},
        { label: 'OAuth Connected',  value: oauth,   icon: Link2,         cls: 'text-blue-600 bg-blue-50'  },
      ].map(({ label, value, icon: Icon, cls }) => (
        <div key={label} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-border shadow-sm">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{value}</p>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

const MAX = 8;

export function SocialAdminTab() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [syncing,  setSyncing]  = useState(false);
  const [platform, setPlatform] = useState<Platform>('INSTAGRAM');
  const [username, setUsername] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/social').then(r => r.json()) as { accounts?: SocialAccount[] };
      setAccounts(d.accounts ?? []);
    } catch { toast.error('Failed to load accounts'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleAdd = async () => {
    if (!username.trim()) { toast.error('Username is required'); return; }
    if (accounts.length >= MAX) { toast.error(`Maximum ${MAX} accounts`); return; }
    setSaving(true);
    try {
      const res  = await fetch('/api/social', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, username: username.trim() }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      toast.success('Account added — will sync at next cron run (5 PM IST)');
      setUsername('');
      void load();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally      { setSaving(false); }
  };

  // ── Manual sync ──────────────────────────────────────────────────────────

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const res  = await fetch('/api/admin/social-sync', { method: 'POST' });
      const data = await res.json() as { updated?: number; skipped?: number; failed?: number; errors?: Array<{ platform: string; username: string; error: string }> };
      if (!res.ok) throw new Error('Sync failed');
      const msg = `Sync complete — ${data.updated ?? 0} updated, ${data.skipped ?? 0} skipped (manual), ${data.failed ?? 0} failed`;
      if ((data.failed ?? 0) > 0) toast.warning(msg); else toast.success(msg);
      void load();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Sync failed'); }
    finally { setSyncing(false); }
  };

  const handleSyncOne = async (id: string) => {
    setSyncing(true);
    try {
      const res  = await fetch(`/api/admin/social-sync?id=${id}`, { method: 'POST' });
      const data = await res.json() as { updated?: number; failed?: number };
      if (!res.ok) throw new Error('Sync failed');
      if ((data.updated ?? 0) > 0) toast.success('Account synced successfully');
      else if ((data.failed ?? 0) > 0) toast.error('Sync failed for this account');
      else toast.info('Account uses manual data — sync skipped');
      void load();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Sync failed'); }
    finally { setSyncing(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/social/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Removed');
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleManual = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/social/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useManual: !current }),
      });
      if (!res.ok) throw new Error();
      toast.success(!current ? 'Switched to manual mode' : 'Switched to API mode');
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, useManual: !current, fetchStatus: !current ? 'manual' : 'pending' } : a));
    } catch { toast.error('Toggle failed'); }
  };

  const handleUpdateManual = async (id: string, f: number | null, p: number | null) => {
    try {
      const res = await fetch(`/api/social/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualFollowers: f, manualPosts: p }),
      });
      if (!res.ok) throw new Error();
      toast.success('Manual data saved');
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, manualFollowers: f, manualPosts: p } : a));
    } catch { toast.error('Failed to save'); }
  };

  const handleConnect = async (id: string, provider: string) => {
    try {
      const res = await fetch('/api/social/connect', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: id, provider }),
      });
      const data = await res.json() as { error?: string; hint?: string; message?: string };
      if (!res.ok) {
        toast.error(data.error ?? 'Connection failed', { description: data.hint });
        return;
      }
      toast.success(data.message ?? 'OAuth connected!');
      void load();
    } catch { toast.error('Connection failed'); }
  };

  const handleDisconnect = async (id: string) => {
    try {
      const res = await fetch('/api/social/connect', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: id }),
      });
      if (!res.ok) throw new Error();
      toast.success('OAuth disconnected');
      void load();
    } catch { toast.error('Failed to disconnect'); }
  };

  const inp = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="space-y-5 max-w-3xl">

      {/* ── HOW IT WORKS ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
        <p className="font-bold text-blue-800 mb-1.5">3-Tier Sync Priority</p>
        <div className="space-y-1 text-xs text-blue-700">
          <p><span className="font-semibold">⚡ Tier 1 — OAuth</span>: Connect your social account via Clerk. Cron uses your real OAuth token. Most accurate.</p>
          <p><span className="font-semibold">📡 Tier 2 — API/Scraper</span>: If not connected via OAuth, YouTube official API or RapidAPI is used as fallback.</p>
          <p><span className="font-semibold">✏️ Tier 3 — Manual</span>: Toggle manual mode to set your own numbers. Cron will never overwrite manual data.</p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-blue-200 text-xs text-blue-700">
          <p><span className="font-semibold">Scopes required in Clerk Dashboard:</span></p>
          <p>Google: <code className="bg-blue-100 px-1 rounded">youtube.readonly</code></p>
          <p>Facebook: <code className="bg-blue-100 px-1 rounded">pages_show_list instagram_basic pages_read_engagement</code></p>
          <p>Twitter: <code className="bg-blue-100 px-1 rounded">tweet.read users.read offline.access</code></p>
        </div>
      </div>

      {/* ── METRICS ── */}
      <MetricsSummary accounts={accounts} />

      {/* ── ADD ACCOUNT ── */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Add Account
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            {accounts.length}/{MAX}
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className={inp}>
              {PLATFORMS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Username (without @)</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleAdd()}
              placeholder={PLATFORMS.find(p => p.value === platform)?.placeholder ?? 'username'}
              className={inp} />
          </div>
          <div className="flex items-end">
            <button onClick={() => void handleAdd()}
              disabled={saving || accounts.length >= MAX || !username.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary
                text-white text-sm font-semibold rounded-xl hover:bg-primary-light
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</>
                : <><Plus className="w-4 h-4" /> Add</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── ACCOUNTS LIST ── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h2 className="font-bold text-sm">Connected Accounts</h2>
          <div className="flex items-center gap-2">
            {/* Manual fetch — runs the same 3-tier sync logic as the cron job */}
            <button
              onClick={() => void handleSyncAll()}
              disabled={syncing || loading}
              title="Fetch latest stats now (same as cron job)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30
                text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50
                transition-colors"
            >
              {syncing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</>
                : <><RefreshCw className="w-3.5 h-3.5" /> Sync Now</>
              }
            </button>
            <button onClick={() => void load()} disabled={loading}
              className="p-1.5 rounded-lg border border-border hover:bg-accent-subtle
                transition-colors text-muted-foreground disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-14">
            <div className="flex items-center justify-center gap-3 mb-3 text-muted-foreground/30">
              <Instagram className="w-6 h-6" /><Youtube className="w-6 h-6" />
              <Twitter className="w-6 h-6" /><Facebook className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">No accounts added yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add up to {MAX} accounts above</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {accounts.map(account => (
                <AccountRow
                  key={account.id}
                  account={account}
                  onDelete={handleDelete}
                  onToggleManual={handleToggleManual}
                  onUpdateManual={handleUpdateManual}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onSyncOne={handleSyncOne}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {accounts.length > 0 && (
          <div className="px-5 py-3 bg-accent-subtle/30 border-t border-border">
            <p className="text-[11px] text-muted-foreground">
              <ToggleRight className="w-3.5 h-3.5 text-amber-500 inline mr-1" />
              <strong>Manual ON</strong> — your set numbers shown, cron skips this account.{' '}
              <ToggleLeft className="w-3.5 h-3.5 inline mx-1" />
              <strong>Manual OFF</strong> — cron updates nightly from API/OAuth.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
