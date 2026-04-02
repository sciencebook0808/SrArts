'use client';
/**
 * components/editor/extensions/social-block.tsx
 *
 * Social Media Block extensions — renderable preview nodes for
 * Instagram, YouTube (rich preview), and Facebook posts.
 * These are CONTENT blocks (not actual embeds) for content planning.
 */
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import { Youtube, Instagram, Trash2, Edit3, Check, Hash } from 'lucide-react';

// ─── YouTube Preview Block ─────────────────────────────────────────────────────
function YouTubeBlockView({ node, updateAttributes, deleteNode }: {
  node: { attrs: Record<string, unknown> };
  updateAttributes: (attrs: Record<string, unknown>) => void;
  deleteNode: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const { title, description, thumbnailUrl, videoUrl, mode } = node.attrs as {
    title: string; description: string; thumbnailUrl?: string;
    videoUrl?: string; mode?: 'video' | 'shorts';
  };

  const thumbSrc = thumbnailUrl ?? 'https://placehold.co/640x360/1a1a2e/FFFFFF?text=YouTube+Thumbnail';

  return (
    <NodeViewWrapper className="my-4 not-prose">
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b border-red-100">
          <Youtube className="w-5 h-5 text-red-600" />
          <span className="text-sm font-semibold text-red-700">
            YouTube {mode === 'shorts' ? 'Shorts' : 'Video'}
          </span>
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => setEditing(v => !v)}
              className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
            >
              {editing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbSrc} alt="thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl">
              <div className="w-0 h-0 border-l-[20px] border-l-white border-y-[12px] border-y-transparent ml-1" />
            </div>
          </div>
          {mode === 'shorts' && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
              SHORTS
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {editing ? (
            <>
              <input
                type="text"
                value={title ?? ''}
                onChange={e => updateAttributes({ title: e.target.value })}
                placeholder="Video title…"
                className="w-full font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <textarea
                value={description ?? ''}
                onChange={e => updateAttributes({ description: e.target.value })}
                placeholder="Video description…"
                rows={3}
                className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
              <input
                type="url"
                value={thumbnailUrl ?? ''}
                onChange={e => updateAttributes({ thumbnailUrl: e.target.value })}
                placeholder="Thumbnail URL (optional)…"
                className="w-full text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <div className="flex gap-2">
                {(['video', 'shorts'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateAttributes({ mode: m })}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors ${mode === m ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {title || <span className="text-gray-400 italic">Untitled video</span>}
              </h3>
              {description && (
                <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
              )}
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// ─── Instagram Preview Block ───────────────────────────────────────────────────
function InstagramBlockView({ node, updateAttributes, deleteNode }: {
  node: { attrs: Record<string, unknown> };
  updateAttributes: (attrs: Record<string, unknown>) => void;
  deleteNode: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const { caption, imageUrl, hashtags, type } = node.attrs as {
    caption: string; imageUrl?: string; hashtags?: string[];
    type?: 'post' | 'reel' | 'story';
  };
  const tags = hashtags ?? [];
  const imgSrc = imageUrl ?? 'https://placehold.co/400x400/f0e6ff/6d28d9?text=Instagram+Post';

  const addHashtag = () => {
    const tag = hashtagInput.replace(/^#/, '').trim();
    if (tag && !tags.includes(tag)) {
      updateAttributes({ hashtags: [...tags, tag] });
    }
    setHashtagInput('');
  };

  return (
    <NodeViewWrapper className="my-4 not-prose">
      <div className="rounded-2xl border border-purple-100 overflow-hidden shadow-sm bg-white max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-purple-50 bg-gradient-to-r from-purple-50 to-pink-50">
          <Instagram className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">
            Instagram {type === 'reel' ? 'Reel' : type === 'story' ? 'Story' : 'Post'}
          </span>
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => setEditing(v => !v)}
              className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-500 transition-colors"
            >
              {editing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt="Instagram post" className="w-full h-full object-cover" />
          {type === 'reel' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[16px] border-l-purple-600 border-y-[10px] border-y-transparent ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Type selector */}
          {editing && (
            <div className="flex gap-2">
              {(['post', 'reel', 'story'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateAttributes({ type: t })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors ${type === t ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Caption */}
          {editing ? (
            <>
              <textarea
                value={caption ?? ''}
                onChange={e => updateAttributes({ caption: e.target.value })}
                placeholder="Write your caption…"
                rows={3}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              />
              <input
                type="url"
                value={imageUrl ?? ''}
                onChange={e => updateAttributes({ imageUrl: e.target.value })}
                placeholder="Image URL (optional)…"
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              {/* Hashtag input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={e => setHashtagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHashtag(); } }}
                  placeholder="#hashtag"
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  type="button"
                  onClick={addHashtag}
                  className="px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-800 leading-relaxed">
              {caption || <span className="text-gray-400 italic">Caption your post…</span>}
            </p>
          )}

          {/* Hashtags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 rounded-full px-2 py-0.5 cursor-pointer"
                  onClick={() => editing && updateAttributes({ hashtags: tags.filter(t => t !== tag) })}
                >
                  <Hash className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// ─── Facebook Preview Block ────────────────────────────────────────────────────
function FacebookBlockView({ node, updateAttributes, deleteNode }: {
  node: { attrs: Record<string, unknown> };
  updateAttributes: (attrs: Record<string, unknown>) => void;
  deleteNode: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const { content, imageUrl } = node.attrs as { content: string; imageUrl?: string };
  const imgSrc = imageUrl ?? '';

  return (
    <NodeViewWrapper className="my-4 not-prose">
      <div className="rounded-2xl border border-blue-100 overflow-hidden shadow-sm bg-white">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">f</span>
          </div>
          <span className="text-sm font-semibold text-blue-700">Facebook Post</span>
          <div className="ml-auto flex gap-1">
            <button type="button" onClick={() => setEditing(v => !v)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors">
              {editing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            </button>
            <button type="button" onClick={deleteNode} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Post content */}
        <div className="p-4 space-y-3">
          {editing ? (
            <>
              <textarea
                value={content ?? ''}
                onChange={e => updateAttributes({ content: e.target.value })}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
              <input
                type="url"
                value={imageUrl ?? ''}
                onChange={e => updateAttributes({ imageUrl: e.target.value })}
                placeholder="Image URL (optional)…"
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </>
          ) : (
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {content || <span className="text-gray-400 italic">Facebook post content…</span>}
            </p>
          )}
        </div>

        {imgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt="post media" className="w-full object-cover max-h-60" />
        )}

        {/* Reactions bar */}
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>↗ Share</span>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// ─── Node definitions ──────────────────────────────────────────────────────────
export const YouTubeBlock = Node.create({
  name: 'youtubeBlock',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      title: { default: '' },
      description: { default: '' },
      thumbnailUrl: { default: null },
      videoUrl: { default: null },
      mode: { default: 'video' },
    };
  },
  parseHTML() { return [{ tag: 'div[data-type="youtube-block"]' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'youtube-block', ...HTMLAttributes }];
  },
  addNodeView() { return ReactNodeViewRenderer(YouTubeBlockView); },
});

export const InstagramBlock = Node.create({
  name: 'instagramBlock',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      caption: { default: '' },
      imageUrl: { default: null },
      hashtags: { default: [] },
      type: { default: 'post' },
    };
  },
  parseHTML() { return [{ tag: 'div[data-type="instagram-block"]' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'instagram-block', ...HTMLAttributes }];
  },
  addNodeView() { return ReactNodeViewRenderer(InstagramBlockView); },
});

export const FacebookBlock = Node.create({
  name: 'facebookBlock',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      content: { default: '' },
      imageUrl: { default: null },
    };
  },
  parseHTML() { return [{ tag: 'div[data-type="facebook-block"]' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'facebook-block', ...HTMLAttributes }];
  },
  addNodeView() { return ReactNodeViewRenderer(FacebookBlockView); },
});

// Add commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    socialBlocks: {
      insertYouTubeBlock: () => ReturnType;
      insertInstagramBlock: () => ReturnType;
      insertFacebookBlock: () => ReturnType;
    };
  }
}
