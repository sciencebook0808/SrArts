'use client';

/**
 * components/social/social-stats-inline.tsx
 *
 * Inline follower pill badges for homepage. Shows max 3 platforms.
 * Reads pre-fetched DB data — zero client API calls.
 */

import { motion } from 'motion/react';

export interface SocialStatItem {
  platform:  'INSTAGRAM' | 'YOUTUBE' | 'TWITTER' | 'FACEBOOK';
  followers: number;
}

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K+`;
  return `${n.toLocaleString()}+`;
}

const PLATFORM_META = {
  INSTAGRAM: {
    label: 'Followers',
    color: 'text-pink-500',
    Icon:  InstagramIcon,
  },
  YOUTUBE: {
    label: 'Subscribers',
    color: 'text-red-500',
    Icon:  YouTubeIcon,
  },
  TWITTER: {
    label: 'Followers',
    color: 'text-sky-500',
    Icon:  XIcon,
  },
  FACEBOOK: {
    label: 'Followers',
    color: 'text-blue-500',
    Icon:  FacebookIcon,
  },
} as const;

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
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

export function SocialStatsInline({ stats, maxShow = 3 }: { stats: SocialStatItem[]; maxShow?: number }) {
  const visible = stats.filter(s => s.followers > 0).slice(0, maxShow);
  if (visible.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex flex-wrap items-center gap-2"
    >
      {visible.map((stat, i) => {
        const meta = PLATFORM_META[stat.platform];
        const { Icon } = meta;
        return (
          <motion.div
            key={stat.platform}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-white/70 backdrop-blur-sm border border-border/60
              shadow-sm hover:shadow-md hover:-translate-y-0.5
              transition-all duration-200 cursor-default select-none"
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${meta.color}`} />
            <span className="text-sm font-bold text-foreground/90 tracking-tight">
              {fmtFollowers(stat.followers)}
            </span>
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              {meta.label}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
