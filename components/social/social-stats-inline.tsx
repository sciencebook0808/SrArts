'use client';

/**
 * components/social/social-stats-inline.tsx
 *
 * Compact pill-badge row for the homepage hero bar.
 * Shows followers per platform. Reads pre-fetched DB data — zero client API calls.
 * Icons and config pulled from shared platform-config.tsx.
 */

import { motion }             from 'motion/react';
import { PLATFORM_CONFIG, fmtCount } from '@/components/social/platform-config';
import type { SocialPlatformKey }    from '@/components/social/platform-config';

export interface SocialStatItem {
  platform:  SocialPlatformKey;
  followers: number;
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
        const cfg   = PLATFORM_CONFIG[stat.platform];
        const { Icon } = cfg;
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
            <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.textColor}`} />
            <span className="text-sm font-bold text-foreground/90 tracking-tight">
              {fmtCount(stat.followers)}+
            </span>
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              {cfg.followerLabel}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
