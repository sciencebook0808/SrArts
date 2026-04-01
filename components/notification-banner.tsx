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

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

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
          className="overflow-hidden relative z-[70]"
        >
          <div className={`flex items-center justify-between px-4 py-2.5 text-sm ${cfg.bar}`}>
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
