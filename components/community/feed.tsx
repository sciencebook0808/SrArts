'use client';
/**
 * components/community/feed.tsx
 *
 * Main community feed with:
 *  - Persistent inline composer (never navigates away, stays alive after posting)
 *  - "+" floating action button (always visible, opens composer)
 *  - Filter bar: sort (Latest/Popular/Oldest), search by author name, My Posts
 *  - Optimistic prepend — new posts appear instantly at the top
 *  - Load more / infinite scroll
 *  - Debounced server-side search & filter fetching
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { PostCard } from './post-card';
import { InlinePostComposer } from './inline-post-composer';
import { FeedFilterBar } from './filter-bar';
import type { FeedFilters } from './filter-bar';
import type { CommunityPostWithRepost } from '@/lib/db-server';

interface Props {
  initialPosts: CommunityPostWithRepost[];
}

const DEFAULT_FILTERS: FeedFilters = {
  sort:     'latest',
  search:   '',
  mineOnly: false,
};

export function CommunityFeed({ initialPosts }: Props) {
  const { userId } = useAuth();

  const [posts, setPosts]       = useState<CommunityPostWithRepost[]>(initialPosts);
  const [loading, setLoading]   = useState(false);
  const [hasMore, setHasMore]   = useState(initialPosts.length === 20);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters]   = useState<FeedFilters>(DEFAULT_FILTERS);
  const [composerOpen, setComposerOpen] = useState(false);

  // debounce timer for filter changes
  const filterTimer = useRef<ReturnType<typeof setTimeout>>();
  const prevFilters = useRef<FeedFilters>(DEFAULT_FILTERS);

  // ── Fetch with current filters ────────────────────────────────────────────
  const fetchPosts = useCallback(async (
    f: FeedFilters,
    skip = 0,
    append = false,
  ) => {
    const params = new URLSearchParams({
      take: '20',
      skip: String(skip),
      sort: f.sort,
    });
    if (f.search.trim()) params.set('search', f.search.trim());
    if (f.mineOnly && userId) params.set('authorId', userId);

    const res = await fetch(`/api/community?${params.toString()}`);
    const d   = await res.json() as { posts?: CommunityPostWithRepost[]; hasMore?: boolean };
    const incoming = d.posts ?? [];

    setPosts(prev => append ? [...prev, ...incoming] : incoming);
    setHasMore(d.hasMore ?? false);
    return incoming;
  }, [userId]);

  // ── Debounce filter changes → refetch ─────────────────────────────────────
  const handleFilterChange = useCallback((f: FeedFilters) => {
    setFilters(f);
    clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(async () => {
      setRefreshing(true);
      try { await fetchPosts(f, 0, false); }
      finally { setRefreshing(false); }
    }, f.search !== prevFilters.current.search ? 500 : 0);
    prevFilters.current = f;
  }, [fetchPosts]);

  // Cleanup timer
  useEffect(() => () => clearTimeout(filterTimer.current), []);

  // ── Load more ─────────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    setLoading(true);
    try { await fetchPosts(filters, posts.length, true); }
    finally { setLoading(false); }
  }, [filters, posts.length, fetchPosts]);

  // ── Manual refresh ────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchPosts(filters, 0, false); }
    finally { setRefreshing(false); }
  }, [filters, fetchPosts]);

  // ── Optimistic prepend after new post ─────────────────────────────────────
  const handlePosted = useCallback((post: CommunityPostWithRepost) => {
    // only prepend if there's no conflicting filter
    if (!filters.mineOnly || post.authorId === userId) {
      setPosts(prev => [post, ...prev]);
    }
  }, [filters.mineOnly, userId]);

  const handleDeleted = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const activeFilterCount =
    (filters.sort !== 'latest' ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.mineOnly ? 1 : 0);

  return (
    <div className="space-y-4 relative">

      {/* ── Inline composer (persistent — never unmounts) ─────────────────── */}
      <InlinePostComposer onPosted={handlePosted} />

      {/* ── Filter bar + refresh ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <FeedFilterBar
            filters={filters}
            onChange={handleFilterChange}
            totalCount={activeFilterCount > 0 ? posts.length : undefined}
          />
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="p-2 rounded-xl hover:bg-white border border-transparent
            hover:border-border text-muted-foreground hover:text-foreground
            transition-all disabled:opacity-40 shrink-0"
          title="Refresh feed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Section label */}
      <div className="flex items-center gap-2">
        <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
          {filters.mineOnly
            ? 'Your Posts'
            : filters.search
            ? `Results for "${filters.search}"`
            : filters.sort === 'popular'
            ? 'Trending Posts'
            : 'Community Feed'
          }
        </h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => handleFilterChange(DEFAULT_FILTERS)}
            className="text-xs text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Posts ─────────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false} mode="popLayout">
        {refreshing ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-16"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </motion.div>
        ) : posts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 bg-white rounded-2xl border border-border"
          >
            <div className="text-4xl mb-3">✦</div>
            <p className="text-muted-foreground text-base font-medium mb-1">
              {filters.search
                ? `No posts by "${filters.search}"`
                : filters.mineOnly
                ? "You haven't posted yet"
                : 'No posts yet'}
            </p>
            <p className="text-muted-foreground text-sm">
              {filters.search || filters.mineOnly
                ? 'Try different filters'
                : 'Be the first to share something!'}
            </p>
          </motion.div>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i < 3 ? i * 0.04 : 0 } }}
              exit={{ opacity: 0, scale: 0.97 }}
            >
              <PostCard
                post={post}
                currentUserId={userId ?? undefined}
                onDeleted={handleDeleted}
              />
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {/* Load more */}
      {hasMore && !refreshing && (
        <div className="text-center pt-2 pb-4">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="px-8 py-3 border border-border rounded-2xl text-sm font-semibold
              hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 bg-white/60"
          >
            {loading
              ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</span>
              : 'Load more posts'
            }
          </button>
        </div>
      )}

      {/* ── Floating "+" FAB — always visible, scrolls with page ─────────── */}
      <div className="fixed bottom-8 right-6 z-40 md:hidden">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-2xl
            flex items-center justify-center hover:bg-primary-light transition-colors
            active:scale-95"
          title="New post"
          aria-label="Create new post"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
