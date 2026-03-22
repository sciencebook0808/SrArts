'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { PostCard } from './post-card';
import { CreatePost } from './create-post';
import type { CommunityPostWithRepost } from '@/lib/db-server';

interface Props {
  initialPosts: CommunityPostWithRepost[];
}

export function CommunityFeed({ initialPosts }: Props) {
  const { userId }  = useAuth();
  const [posts, setPosts]         = useState<CommunityPostWithRepost[]>(initialPosts);
  const [loading, setLoading]     = useState(false);
  const [hasMore, setHasMore]     = useState(initialPosts.length === 20);
  const [refreshing, setRefreshing] = useState(false);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community?take=20&skip=${posts.length}`);
      const d = await res.json() as { posts?: CommunityPostWithRepost[]; hasMore?: boolean };
      const newPosts = d.posts ?? [];
      setPosts(p => [...p, ...newPosts]);
      setHasMore(d.hasMore ?? false);
    } finally { setLoading(false); }
  }, [posts.length]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/community?take=20&skip=0');
      const d = await res.json() as { posts?: CommunityPostWithRepost[]; hasMore?: boolean };
      setPosts(d.posts ?? []);
      setHasMore(d.hasMore ?? false);
    } finally { setRefreshing(false); }
  }, []);

  const handleDeleted = (id: string) => {
    setPosts(p => p.filter(post => post.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Create post */}
      <CreatePost onCreated={() => void refresh()} />

      {/* Refresh bar */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
          Community Feed
        </h2>
        <button
          onClick={() => void refresh()}
          disabled={refreshing}
          className="p-2 rounded-xl hover:bg-accent-subtle text-muted-foreground transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Posts */}
      <AnimatePresence initial={false}>
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl border border-border"
          >
            <p className="text-muted-foreground text-lg font-medium mb-2">No posts yet</p>
            <p className="text-muted-foreground text-sm">Be the first to share something with the community!</p>
          </motion.div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={userId ?? undefined}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </AnimatePresence>

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={() => void loadMore()} disabled={loading}
            className="px-6 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-accent-subtle transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
            Load more posts
          </button>
        </div>
      )}
    </div>
  );
}
