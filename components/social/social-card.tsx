'use client';

/**
 * components/social/social-card.tsx
 *
 * Premium glassmorphic social card with:
 * - Gradient border glow on hover
 * - Framer Motion stagger fade-in
 * - Fetch method badge (OAuth / API / Manual / Failed)
 * - Formatted follower counts (12.4K, 1.2M)
 */

import { motion }              from 'framer-motion';
import Image                   from 'next/image';
import { formatDistanceToNow } from 'date-fns';

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORM_CFG = {
  INSTAGRAM: {
    label:     'Instagram',
    gradient:  'from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
    ringColor: 'ring-pink-300/60',
    textColor: 'text-pink-600',
    bgLight:   'bg-pink-50/60',
    Icon:      InstagramIcon,
  },
  YOUTUBE: {
    label:     'YouTube',
    gradient:  'from-[#ff0000] to-[#cc0000]',
    ringColor: 'ring-red-300/60',
    textColor: 'text-red-600',
    bgLight:   'bg-red-50/60',
    Icon:      YouTubeIcon,
  },
  TWITTER: {
    label:     'X / Twitter',
    gradient:  'from-[#000000] to-[#1d9bf0]',
    ringColor: 'ring-sky-300/60',
    textColor: 'text-sky-600',
    bgLight:   'bg-sky-50/60',
    Icon:      XIcon,
  },
  FACEBOOK: {
    label:     'Facebook',
    gradient:  'from-[#1877f2] to-[#0e5fd4]',
    ringColor: 'ring-blue-300/60',
    textColor: 'text-blue-600',
    bgLight:   'bg-blue-50/60',
    Icon:      FacebookIcon,
  },
} as const;

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20.06 12 20.06 12 20.06s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString();
}

// ─── Fetch method badge ───────────────────────────────────────────────────────

function MethodBadge({ method }: { method: string | null }) {
  if (!method) return null;

  const config: Record<string, { label: string; className: string }> = {
    clerk_oauth:  { label: '⚡ OAuth',  className: 'bg-green-100 text-green-700' },
    youtube_api:  { label: '📡 API',    className: 'bg-blue-100 text-blue-700'   },
    rapidapi:     { label: '🔌 RapidAPI',className: 'bg-violet-100 text-violet-700' },
    manual:       { label: '✏️ Manual',  className: 'bg-amber-100 text-amber-700' },
    failed:       { label: '⚠️ Failed',  className: 'bg-red-100 text-red-700'    },
  };

  const cfg = config[method];
  if (!cfg) return null;

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Card types ───────────────────────────────────────────────────────────────

export interface SocialCardAccount {
  id:              string;
  platform:        'INSTAGRAM' | 'YOUTUBE' | 'TWITTER' | 'FACEBOOK';
  username:        string;
  followers:       number | null;
  posts:           number | null;
  avatarUrl:       string | null;
  displayName:     string | null;
  manualFollowers: number | null;
  useManual:       boolean;
  oauthConnected:  boolean;
  lastFetchMethod: string | null;
  fetchStatus:     string;
  lastFetchedAt:   Date | null;
}

// ─── Social Card ──────────────────────────────────────────────────────────────

export function SocialCard({ account, index = 0 }: { account: SocialCardAccount; index?: number }) {
  const cfg         = PLATFORM_CFG[account.platform];
  const { Icon }    = cfg;

  const effectiveFollowers = account.useManual
    ? account.manualFollowers
    : account.followers;

  const displayName = account.displayName ?? account.username;
  const lastUpdated = account.lastFetchedAt
    ? formatDistanceToNow(new Date(account.lastFetchedAt), { addSuffix: true })
    : 'Not synced yet';

  const isFailed = account.fetchStatus === 'failed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.025, y: -4, transition: { duration: 0.2 } }}
      className="relative group"
    >
      {/* Gradient glow border */}
      <div className={`absolute -inset-[1.5px] rounded-2xl opacity-0 group-hover:opacity-100
        transition-opacity duration-300 bg-gradient-to-br ${cfg.gradient}`} aria-hidden />

      {/* Card */}
      <div className={`relative rounded-2xl border border-border bg-white/85
        backdrop-blur-sm p-5 shadow-sm group-hover:shadow-lg transition-shadow duration-300
        ${isFailed ? 'border-red-200' : ''}`}
      >
        {/* Failed overlay hint */}
        {isFailed && (
          <div className="absolute top-2 right-2">
            <span className="text-xs text-red-400 font-medium">⚠ Sync failed</span>
          </div>
        )}

        {/* Header: avatar + platform icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative w-12 h-12 shrink-0">
            {account.avatarUrl ? (
              <Image
                src={account.avatarUrl}
                alt={displayName}
                fill
                sizes="48px"
                className={`rounded-full object-cover ring-2 ring-white shadow-sm ring-offset-1 ${cfg.ringColor}`}
              />
            ) : (
              <div className={`w-12 h-12 rounded-full ring-2 ring-white shadow-sm
                bg-gradient-to-br ${cfg.gradient} flex items-center justify-center
                text-white font-bold text-lg`}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {/* OAuth connected indicator */}
            {account.oauthConnected && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full
                bg-green-500 ring-2 ring-white flex items-center justify-center"
                title="Connected via OAuth">
                <svg viewBox="0 0 12 12" fill="white" className="w-2.5 h-2.5">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
            )}
          </div>

          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            bg-gradient-to-br ${cfg.gradient} shadow-sm`}>
            <Icon className="w-4.5 h-4.5 text-white" />
          </div>
        </div>

        {/* Name + username */}
        <p className="font-semibold text-sm text-foreground/90 truncate mb-0.5">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate mb-3">
          @{account.username} · {cfg.label}
        </p>

        {/* Follower count */}
        <div className="mb-1">
          {effectiveFollowers !== null ? (
            <p className={`text-3xl font-extrabold tracking-tight ${cfg.textColor}`}>
              {fmtFollowers(effectiveFollowers)}
            </p>
          ) : (
            <p className="text-2xl font-bold text-muted-foreground/30">—</p>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-muted-foreground font-medium">
              {account.platform === 'YOUTUBE' ? 'Subscribers' : 'Followers'}
            </p>
            <MethodBadge method={account.useManual ? 'manual' : account.lastFetchMethod} />
          </div>
        </div>

        {/* Posts */}
        {account.posts !== null && (
          <p className="text-xs text-muted-foreground mb-3">
            <span className="font-semibold text-foreground/70">{account.posts.toLocaleString()}</span>
            {' '}{account.platform === 'YOUTUBE' ? 'videos' : 'posts'}
          </p>
        )}

        <div className="h-px bg-border/50 mt-3 mb-2.5" />
        <p className="text-[10px] text-muted-foreground/60 font-medium">Updated {lastUpdated}</p>
      </div>
    </motion.div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export function SocialCardsGrid({ accounts }: { accounts: SocialCardAccount[] }) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No social accounts configured yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {accounts.map((account, i) => (
        <SocialCard key={account.id} account={account} index={i} />
      ))}
    </div>
  );
}
