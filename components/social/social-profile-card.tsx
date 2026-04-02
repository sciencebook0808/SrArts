'use client';

/**
 * components/social/social-profile-card.tsx
 *
 * Full enriched social profile card for the About page.
 *
 * Shows:
 *   - Profile image with platform-coloured ring
 *   - Display name + @username
 *   - Bio (clamped to 3 lines, expandable)
 *   - Category badge (if available)
 *   - Followers / Following / Posts stats row
 *   - External website link
 *   - Platform label with icon
 *   - "Follow" link button to the profile page
 *   - Last-synced timestamp
 *
 * Design: clean frosted card, gradient border accent on hover,
 *         Framer Motion stagger entry.
 *
 * Data contract: accepts PublicSocialAccount from db-server or SocialProfile from social-db.
 * Both types are compatible — the component uses the intersection.
 */

import { useState }        from 'react';
import { motion }          from 'motion/react';
import Image               from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Globe } from 'lucide-react';
import {
  PLATFORM_CONFIG,
  fmtCount,
  type SocialPlatformKey,
} from '@/components/social/platform-config';

// ─── Data contract ────────────────────────────────────────────────────────────

export interface SocialProfileCardData {
  id:              string;
  platform:        SocialPlatformKey;
  username:        string;
  displayName:     string | null;
  avatarUrl:       string | null;
  bio:             string | null;
  category:        string | null;
  externalUrl:     string | null;
  profileUrl:      string | null;
  followers:       number | null;
  following:       number | null;
  posts:           number | null;
  manualFollowers: number | null;
  manualPosts:     number | null;
  useManual:       boolean;
  oauthConnected:  boolean;
  lastFetchMethod: string | null;
  fetchStatus:     string;
  lastFetchedAt:   Date | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function effectiveCount(apiVal: number | null, manualVal: number | null, useManual: boolean): number | null {
  return useManual ? manualVal : apiVal;
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: number | null; label: string }) {
  if (value === null) return null;
  return (
    <div className="flex flex-col items-center min-w-0">
      <span className="text-lg font-extrabold text-foreground/90 tabular-nums leading-none">
        {fmtCount(value)}
      </span>
      <span className="text-[11px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function SocialProfileCard({
  account,
  index = 0,
}: {
  account: SocialProfileCardData;
  index?:  number;
}) {
  const [bioExpanded, setBioExpanded] = useState(false);

  const cfg  = PLATFORM_CONFIG[account.platform];
  const { Icon } = cfg;

  const followers = effectiveCount(account.followers, account.manualFollowers, account.useManual);
  const posts     = effectiveCount(account.posts, account.manualPosts, account.useManual);
  const following = account.following;

  const displayName = account.displayName ?? account.username;
  const profileHref = account.profileUrl ?? `${cfg.profileBaseUrl}${account.username.replace(/^@/, '')}`;

  const lastUpdated = account.lastFetchedAt
    ? formatDistanceToNow(new Date(account.lastFetchedAt), { addSuffix: true })
    : null;

  const bio    = account.bio?.trim() ?? null;
  const bioLong = bio && bio.length > 120;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.22 } }}
      className="relative group flex flex-col"
    >
      {/* Gradient glow border on hover */}
      <div
        className={`absolute -inset-[1.5px] rounded-2xl opacity-0 group-hover:opacity-100
          transition-opacity duration-300 bg-gradient-to-br ${cfg.gradient} blur-[2px]`}
        aria-hidden
      />

      {/* Card body */}
      <div className="relative rounded-2xl border border-border/80 bg-white
        shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col flex-1 overflow-hidden"
      >
        {/* Platform accent bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${cfg.gradient}`} />

        <div className="p-5 flex flex-col flex-1">

          {/* ── Header row ── */}
          <div className="flex items-start gap-3 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              {account.avatarUrl ? (
                <div className={`relative w-14 h-14 rounded-full ring-2 ring-offset-2 ${cfg.ringColor}`}>
                  <Image
                    src={account.avatarUrl} alt={displayName} fill sizes="56px"
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className={`w-14 h-14 rounded-full ring-2 ring-offset-2 ${cfg.ringColor}
                  bg-gradient-to-br ${cfg.gradient} flex items-center justify-center
                  text-white font-bold text-xl`}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {account.oauthConnected && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full
                    bg-green-500 ring-2 ring-white flex items-center justify-center"
                  title="Connected via OAuth"
                >
                  <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
              )}
            </div>

            {/* Name + handle + platform */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground/95 truncate leading-tight">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">@{account.username}</p>
              {account.category && (
                <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold
                  rounded-full ${cfg.bgLight} ${cfg.textColor} border ${cfg.borderColor}`}
                >
                  {account.category}
                </span>
              )}
            </div>

            {/* Platform icon pill */}
            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
              bg-gradient-to-br ${cfg.gradient} shadow-sm`}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* ── Bio ── */}
          {bio && (
            <div className="mb-4">
              <p className={`text-xs text-muted-foreground leading-relaxed
                ${!bioExpanded && bioLong ? 'line-clamp-3' : ''}`}
              >
                {bio}
              </p>
              {bioLong && (
                <button
                  onClick={() => setBioExpanded(v => !v)}
                  className={`text-[11px] font-semibold mt-1 ${cfg.textColor} hover:underline focus:outline-none`}
                >
                  {bioExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* ── Stats row ── */}
          {(followers !== null || following !== null || posts !== null) && (
            <div className="flex items-center justify-around py-3 px-2
              rounded-xl bg-accent-subtle/30 border border-border/40 mb-4"
            >
              <StatPill value={followers} label={cfg.followerLabel} />
              {following !== null && (
                <>
                  <div className="w-px h-6 bg-border/60" />
                  <StatPill value={following} label="Following" />
                </>
              )}
              {posts !== null && (
                <>
                  <div className="w-px h-6 bg-border/60" />
                  <StatPill value={posts} label={cfg.postLabel} />
                </>
              )}
            </div>
          )}

          {/* ── External link ── */}
          {account.externalUrl && (
            <a
              href={account.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs font-medium mb-4
                ${cfg.textColor} hover:underline truncate`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {account.externalUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </span>
            </a>
          )}

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ── Footer: Follow button + last synced ── */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
            <p className="text-[10px] text-muted-foreground/50 font-medium">
              {lastUpdated ? `Synced ${lastUpdated}` : 'Not synced yet'}
            </p>
            <a
              href={profileHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold
                bg-gradient-to-r ${cfg.gradient} text-white shadow-sm
                hover:shadow-md hover:scale-105 active:scale-100 transition-all duration-150`}
            >
              Follow
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export function SocialProfileCardsGrid({ accounts }: { accounts: SocialProfileCardData[] }) {
  if (accounts.length === 0) return null;

  const colClass =
    accounts.length === 1 ? 'max-w-xs mx-auto' :
    accounts.length === 2 ? 'grid-cols-2' :
    accounts.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
    'grid-cols-2 xl:grid-cols-4';

  return (
    <div className={`grid gap-5 ${colClass}`}>
      {accounts.map((account, i) => (
        <SocialProfileCard key={account.id} account={account} index={i} />
      ))}
    </div>
  );
}
