/**
 * components/social/platform-config.tsx
 *
 * Single source of truth for platform display config + SVG icons.
 * Eliminates the duplication that existed across:
 *   - components/social/social-card.tsx
 *   - components/social/social-stats-inline.tsx
 *   - app/(public)/about/page.tsx
 *
 * Import from here in all social UI components.
 */

// ─── Platform types ───────────────────────────────────────────────────────────

export type SocialPlatformKey = 'INSTAGRAM' | 'YOUTUBE' | 'TWITTER' | 'FACEBOOK';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20.06 12 20.06 12 20.06s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ─── Platform config map ──────────────────────────────────────────────────────

export interface PlatformConfig {
  label:         string;
  followerLabel: string;
  postLabel:     string;
  gradient:      string;    // Tailwind bg-gradient-to-br class values
  ringColor:     string;
  textColor:     string;
  bgLight:       string;
  borderColor:   string;
  hoverShadow:   string;
  profileBaseUrl: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}

export const PLATFORM_CONFIG: Record<SocialPlatformKey, PlatformConfig> = {
  INSTAGRAM: {
    label:          'Instagram',
    followerLabel:  'Followers',
    postLabel:      'Posts',
    gradient:       'from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
    ringColor:      'ring-pink-300/60',
    textColor:      'text-pink-600',
    bgLight:        'bg-pink-50/60',
    borderColor:    'border-pink-200',
    hoverShadow:    'hover:shadow-pink-100',
    profileBaseUrl: 'https://instagram.com/',
    Icon:           InstagramIcon,
  },
  YOUTUBE: {
    label:          'YouTube',
    followerLabel:  'Subscribers',
    postLabel:      'Videos',
    gradient:       'from-[#ff0000] to-[#cc0000]',
    ringColor:      'ring-red-300/60',
    textColor:      'text-red-600',
    bgLight:        'bg-red-50/60',
    borderColor:    'border-red-200',
    hoverShadow:    'hover:shadow-red-100',
    profileBaseUrl: 'https://youtube.com/',
    Icon:           YouTubeIcon,
  },
  TWITTER: {
    label:          'X / Twitter',
    followerLabel:  'Followers',
    postLabel:      'Posts',
    gradient:       'from-[#000000] to-[#1d9bf0]',
    ringColor:      'ring-sky-300/60',
    textColor:      'text-sky-600',
    bgLight:        'bg-sky-50/60',
    borderColor:    'border-sky-200',
    hoverShadow:    'hover:shadow-sky-100',
    profileBaseUrl: 'https://twitter.com/',
    Icon:           XIcon,
  },
  FACEBOOK: {
    label:          'Facebook',
    followerLabel:  'Followers',
    postLabel:      'Posts',
    gradient:       'from-[#1877f2] to-[#0e5fd4]',
    ringColor:      'ring-blue-300/60',
    textColor:      'text-blue-600',
    bgLight:        'bg-blue-50/60',
    borderColor:    'border-blue-200',
    hoverShadow:    'hover:shadow-blue-100',
    profileBaseUrl: 'https://facebook.com/',
    Icon:           FacebookIcon,
  },
};

// ─── Formatters ───────────────────────────────────────────────────────────────

export function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString();
}

export function fmtCountPlus(n: number): string {
  return `${fmtCount(n)}+`;
}
