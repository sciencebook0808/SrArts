'use client';

/**
 * components/social/platform-stats-cards.tsx
 *
 * Platform-specific stats cards for the homepage.
 * Each card shows: platform icon + colour, follower count, platform label.
 * More prominent than the pill badges but lighter than the full SocialProfileCard.
 *
 * Data: pre-fetched server-side from DB — zero client API calls.
 * Reads data from DB exclusively. API is never called from UI.
 */

import { motion }            from 'motion/react';
import { PLATFORM_CONFIG, fmtCount } from '@/components/social/platform-config';
import type { SocialPlatformKey }    from '@/components/social/platform-config';

export interface PlatformStatItem {
  platform:    SocialPlatformKey;
  followers:   number;
  displayName: string | null;
  username:    string;
  profileUrl:  string | null;
}

function PlatformStatCard({ item, index }: { item: PlatformStatItem; index: number }) {
  const cfg      = PLATFORM_CONFIG[item.platform];
  const { Icon } = cfg;
  const href     = item.profileUrl ?? `${cfg.profileBaseUrl}${item.username.replace(/^@/, '')}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.04, y: -3, transition: { duration: 0.18 } }}
      className="group relative flex flex-col items-center justify-center
        gap-2 p-5 rounded-2xl border border-border/60
        bg-white/80 backdrop-blur-sm shadow-sm
        hover:shadow-lg hover:border-transparent
        transition-all duration-200 overflow-hidden text-center"
    >
      {/* Background gradient bleed on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-[0.06]
          transition-opacity duration-300 bg-gradient-to-br ${cfg.gradient}`}
        aria-hidden
      />

      {/* Platform icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
        bg-gradient-to-br ${cfg.gradient} shadow-sm
        group-hover:scale-110 transition-transform duration-200`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Follower count */}
      <div>
        <p className={`text-2xl font-extrabold tracking-tight leading-none ${cfg.textColor}`}>
          {fmtCount(item.followers)}
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">{cfg.followerLabel}</p>
      </div>

      {/* Platform label */}
      <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
        {cfg.label}
      </p>
    </motion.a>
  );
}

export function PlatformStatsCards({ items }: { items: PlatformStatItem[] }) {
  const visible = items.filter(i => i.followers > 0);
  if (visible.length === 0) return null;

  return (
    <div className={`grid gap-4 ${
      visible.length <= 2 ? 'grid-cols-2 max-w-sm mx-auto' :
      visible.length === 3 ? 'grid-cols-3' :
      'grid-cols-2 sm:grid-cols-4'
    }`}>
      {visible.map((item, i) => (
        <PlatformStatCard key={item.platform} item={item} index={i} />
      ))}
    </div>
  );
}
