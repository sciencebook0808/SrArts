'use client';
/**
 * AdSlot — ENV-controlled ad placeholder system.
 *
 * MONETIZATION ARCHITECTURE:
 *  - ENV vars control which ad networks are active (AdSense, custom)
 *  - NEXT_PUBLIC_ADSENSE_CLIENT    → Google AdSense publisher ID (ca-pub-xxx)
 *  - NEXT_PUBLIC_ADSENSE_ENABLED   → "true" to activate AdSense
 *  - Each slot renders nothing if ad network is disabled (zero layout impact)
 *  - Slots are pre-wired in layout-sensitive positions — no UI breaks when enabled
 *
 * Usage:
 *   <AdSlot slot="gallery-between-rows" format="leaderboard" />
 *   <AdSlot slot="blog-post-sidebar" format="rectangle" />
 */
import { useEffect, useRef } from 'react';

type AdFormat = 'banner' | 'rectangle' | 'leaderboard' | 'skyscraper' | 'auto';

interface Props {
  slot: string;
  format?: AdFormat;
  className?: string;
}

const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';
const ADSENSE_CLIENT  = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';

const formatSizes: Record<AdFormat, { w: number; h: number }> = {
  banner:      { w: 728, h: 90  },
  rectangle:   { w: 300, h: 250 },
  leaderboard: { w: 728, h: 90  },
  skyscraper:  { w: 160, h: 600 },
  auto:        { w: 0,   h: 0   },
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSlot({ slot, format = 'auto', className = '' }: Props) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!ADSENSE_ENABLED || !ADSENSE_CLIENT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch { /* AdSense not loaded yet */ }
  }, []);

  // No ad network configured — render nothing (zero layout footprint)
  if (!ADSENSE_ENABLED || !ADSENSE_CLIENT) return null;

  const size = formatSizes[format];

  return (
    <div
      className={`ad-slot overflow-hidden ${className}`}
      data-ad-slot={slot}
      style={size.w ? { minWidth: size.w, minHeight: size.h } : undefined}
    >
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block', ...(size.w ? { width: size.w, height: size.h } : {}) }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format === 'auto' ? 'auto' : undefined}
        data-full-width-responsive={format === 'auto' ? 'true' : undefined}
      />
    </div>
  );
}
