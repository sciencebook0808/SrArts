'use client';
/**
 * components/notification-banner.tsx
 *
 * Displays the latest active site notification above the navbar.
 * Fetches from /api/notifications on mount.
 * Dismissal is stored in localStorage keyed by notification id —
 * so the same notification won't re-appear in future sessions either.
 *
 * Types:
 *   info    → blue/teal bar (default)
 *   warning → amber bar
 *   success → green bar
 *   error   → red bar
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * The banner is fixed to the top of the viewport, so the fixed navbar has to
 * move down by exactly its height. We publish that height as a CSS custom
 * property on <html> and the navbar offsets itself with
 * `calc(… + var(--banner-height, 0px))` — no prop drilling, and it stays
 * correct if the banner is dismissed mid-session.
 */
const BANNER_HEIGHT_VAR = '--banner-height';

function setBannerHeight(px: number) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, `${px}px`);
}

interface Notification {
  id:      string;
  message: string;
  type:    'info' | 'warning' | 'success' | 'error';
}

const DISMISSED_KEY = 'sr_dismissed_notifications';

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  try {
    // Keep only last 20 dismissed IDs to avoid unbounded localStorage growth
    const arr = [...ids].slice(-20);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(arr));
  } catch { /* ignore */ }
}

const TYPE_STYLES: Record<string, {
  bar:   string;
  icon:  string;
  close: string;
  Icon:  React.ComponentType<{ className?: string }>;
}> = {
  info: {
    bar:   'bg-gradient-to-r from-primary/90 to-primary text-white',
    icon:  'text-white/80',
    close: 'hover:bg-white/20 text-white',
    Icon:  Info,
  },
  warning: {
    bar:   'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
    icon:  'text-white/80',
    close: 'hover:bg-white/20 text-white',
    Icon:  AlertTriangle,
  },
  success: {
    bar:   'bg-gradient-to-r from-green-600 to-green-700 text-white',
    icon:  'text-white/80',
    close: 'hover:bg-white/20 text-white',
    Icon:  CheckCircle2,
  },
  error: {
    bar:   'bg-gradient-to-r from-red-600 to-red-700 text-white',
    icon:  'text-white/80',
    close: 'hover:bg-white/20 text-white',
    Icon:  AlertCircle,
  },
};

export function NotificationBanner() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [visible,      setVisible]      = useState(false);
  const barRef                          = useRef<HTMLDivElement>(null);

  // Publish / clear the height the navbar offsets against.
  useEffect(() => {
    if (!visible) { setBannerHeight(0); return; }
    const measure = () => setBannerHeight(barRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      setBannerHeight(0);
    };
  }, [visible, notification?.id]);

  useEffect(() => {
    void (async () => {
      try {
        const res  = await fetch('/api/notifications');
        const data = await res.json() as { notification: Notification | null };
        if (!data.notification) return;

        const dismissed = getDismissed();
        if (dismissed.has(data.notification.id)) return;

        setNotification(data.notification);
        setVisible(true);
      } catch { /* silent — banner is non-critical */ }
    })();
  }, []);

  const dismiss = () => {
    setVisible(false);
    if (notification) {
      const dismissed = getDismissed();
      dismissed.add(notification.id);
      saveDismissed(dismissed);
    }
  };

  const cfg = TYPE_STYLES[notification?.type ?? 'info'] ?? TYPE_STYLES.info;
  const { Icon } = cfg;

  return (
    <AnimatePresence>
      {visible && notification && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          /* LAYOUT FIX: this banner sits in normal document flow at the very top
             of <body>, but the navbar is `fixed top-6` (desktop) / `fixed top-0`
             (mobile), so the two overlapped — the banner rendered underneath a
             floating pill. Pinning the banner to the top of the viewport above
             the navbar keeps both readable and stops the late fetch from
             shifting the whole page down (CLS). */
          className="fixed top-0 left-0 right-0 overflow-hidden z-[70]"
        >
          <div ref={barRef} className={`flex items-center justify-between px-4 py-2.5 text-sm ${cfg.bar}`}>
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 ${cfg.icon}`} />
              <p className="truncate font-medium leading-snug">{notification.message}</p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss notification"
              className={`ml-3 shrink-0 p-1 rounded-full transition-colors ${cfg.close}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
