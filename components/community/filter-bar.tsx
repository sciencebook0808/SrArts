'use client';
/**
 * components/community/filter-bar.tsx
 *
 * Filter controls for the community feed:
 *  - Sort: Latest · Oldest · Popular
 *  - Search: by author name/username
 *  - My Posts toggle (when signed in)
 */
import { useState, useRef, useCallback } from 'react';
import { Search, X, TrendingUp, Clock, Flame, User } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'motion/react';

export type SortMode = 'latest' | 'oldest' | 'popular';

export interface FeedFilters {
  sort:     SortMode;
  search:   string;
  mineOnly: boolean;
}

interface Props {
  filters:   FeedFilters;
  onChange:  (f: FeedFilters) => void;
  totalCount?: number;
}

const SORT_OPTIONS: { value: SortMode; label: string; icon: React.ElementType }[] = [
  { value: 'latest',  label: 'Latest',  icon: Clock    },
  { value: 'popular', label: 'Popular', icon: Flame     },
  { value: 'oldest',  label: 'Oldest',  icon: TrendingUp },
];

export function FeedFilterBar({ filters, onChange, totalCount }: Props) {
  const { userId } = useAuth();
  const [searchOpen, setSearchOpen] = useState(!!filters.search);
  const searchRef = useRef<HTMLInputElement>(null);

  const set = useCallback((patch: Partial<FeedFilters>) =>
    onChange({ ...filters, ...patch }), [filters, onChange]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 80);
  };

  const clearSearch = () => {
    set({ search: '' });
    setSearchOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Sort pills */}
      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 shadow-sm">
        {SORT_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const active = filters.sort === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ sort: opt.value })}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-accent-subtle hover:text-foreground'
                }
              `}
            >
              <Icon className="w-3 h-3" />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Search by author */}
      <AnimatePresence mode="wait">
        {searchOpen ? (
          <motion.div
            key="open"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            className="relative flex items-center"
          >
            <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={filters.search}
              onChange={e => set({ search: e.target.value })}
              placeholder="Search by name…"
              className="w-full pl-8 pr-8 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
            />
            {filters.search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            type="button"
            onClick={openSearch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground
              bg-white border border-border rounded-xl hover:bg-accent-subtle hover:text-foreground
              transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </motion.button>
        )}
      </AnimatePresence>

      {/* My posts toggle */}
      {userId && (
        <button
          type="button"
          onClick={() => set({ mineOnly: !filters.mineOnly })}
          className={`
            flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all shadow-sm
            ${filters.mineOnly
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-muted-foreground border-border hover:bg-accent-subtle hover:text-foreground'
            }
          `}
        >
          <User className="w-3 h-3" />
          My Posts
        </button>
      )}

      {/* Result count hint */}
      {(filters.search || filters.mineOnly) && totalCount !== undefined && (
        <span className="text-xs text-muted-foreground ml-auto">
          {totalCount} {totalCount === 1 ? 'post' : 'posts'}
        </span>
      )}
    </div>
  );
}
