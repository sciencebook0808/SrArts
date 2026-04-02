'use client';

/**
 * components/social/social-card.tsx
 *
 * Glassmorphic social stats card (compact).
 * Used on the homepage "Follow the Journey" section.
 * Shows: avatar, display name, username, platform, follower count, post count, sync badge.
 *
 * For the full enriched about-page cards (bio, following, external link), use SocialProfileCard.
 */

import { motion }              from 'motion/react';
import Image                   from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { PLATFORM_CONFIG, fmtCount } from '@/components/social/platform-config';
import type { SocialPlatformKey }    from '@/components/social/platform-config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SocialCardAccount {
  id:              string;
  platform:        SocialPlatformKey;
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

// ─── Fetch method badge ───────────────────────────────────────────────────────

const METHOD_BADGE: Record<string, { label: string; className: string }> = {
  clerk_oauth: { label: '⚡ OAuth',    className: 'bg-green-100 text-green-700'   },
  youtube_api: { label: '📡 API',      className: 'bg-blue-100 text-blue-700'     },
  rapidapi:    { label: '🔌 RapidAPI', className: 'bg-violet-100 text-violet-700' },
  manual:      { label: '✏️ Manual',   className: 'bg-amber-100 text-amber-700'   },
  failed:      { label: '⚠️ Failed',   className: 'bg-red-100 text-red-700'       },
};

function MethodBadge({ method }: { method: string | null }) {
  if (!method) return null;
  const cfg = METHOD_BADGE[method];
  if (!cfg)   return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function SocialCard({ account, index = 0 }: { account: SocialCardAccount; index?: number }) {
  const cfg  = PLATFORM_CONFIG[account.platform];
  const { Icon } = cfg;

  const effectiveFollowers = account.useManual ? account.manualFollowers : account.followers;
  const displayName        = account.displayName ?? account.username;
  const lastUpdated        = account.lastFetchedAt
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
      {/* Gradient glow border on hover */}
      <div
        className={`absolute -inset-[1.5px] rounded-2xl opacity-0 group-hover:opacity-100
          transition-opacity duration-300 bg-gradient-to-br ${cfg.gradient}`}
        aria-hidden
      />

      <div className={`relative rounded-2xl border border-border bg-white/85
        backdrop-blur-sm p-5 shadow-sm group-hover:shadow-lg transition-shadow duration-300
        ${isFailed ? 'border-red-200' : ''}`}
      >
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
                src={account.avatarUrl} alt={displayName} fill sizes="48px"
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
            {account.oauthConnected && (
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full
                  bg-green-500 ring-2 ring-white flex items-center justify-center"
                title="Connected via OAuth"
              >
                <svg viewBox="0 0 12 12" fill="white" className="w-2.5 h-2.5">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            )}
          </div>

          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            bg-gradient-to-br ${cfg.gradient} shadow-sm`}>
            <Icon className="w-[18px] h-[18px] text-white" />
          </div>
        </div>

        {/* Name + username */}
        <p className="font-semibold text-sm text-foreground/90 truncate mb-0.5">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate mb-3">@{account.username} · {cfg.label}</p>

        {/* Follower count */}
        <div className="mb-1">
          {effectiveFollowers !== null ? (
            <p className={`text-3xl font-extrabold tracking-tight ${cfg.textColor}`}>
              {fmtCount(effectiveFollowers)}
            </p>
          ) : (
            <p className="text-2xl font-bold text-muted-foreground/30">—</p>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-muted-foreground font-medium">{cfg.followerLabel}</p>
            <MethodBadge method={account.useManual ? 'manual' : account.lastFetchMethod} />
          </div>
        </div>

        {/* Posts */}
        {account.posts !== null && (
          <p className="text-xs text-muted-foreground mb-3">
            <span className="font-semibold text-foreground/70">{account.posts.toLocaleString()}</span>
            {' '}{cfg.postLabel.toLowerCase()}
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
