'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { TiptapEditor } from '@/components/admin/tiptap-editor';
import { ImageUploader } from '@/components/admin/image-uploader';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

type Status = 'draft' | 'published';

interface FormState {
  title: string; slug: string; excerpt: string; content: string;
  coverImage: string; coverImageId: string;
  author: string; category: string; tags: string;
  status: Status; featured: boolean;
  seoTitle: string; seoDescription: string;
}

function autoSlug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function NewBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '', slug: '', excerpt: '', content: '',
    coverImage: '', coverImageId: '',
    author: 'SR Arts', category: '', tags: '',
    status: 'draft', featured: false,
    seoTitle: '', seoDescription: '',
  });

  const set = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug: form.slug || autoSlug(form.title),
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? 'Failed');

      const { post } = await res.json() as { post?: { slug?: string; id?: string } };
      if (form.status === 'published' && BASE_URL && post) {
        void fetch('/api/indexing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: [`${BASE_URL}/blog/${post.slug ?? post.id}`] }),
        });
      }

      toast.success(form.status === 'published' ? 'Post published & indexed!' : 'Draft saved!');
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-border px-4 md:px-8 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="p-2 rounded-lg hover:bg-accent-subtle transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">New Blog Post</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Cover image */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
          <label className="text-sm font-semibold">Cover Image</label>
          <ImageUploader
            value={form.coverImage}
            onChange={(url, pid) => { set('coverImage', url); set('coverImageId', pid); }}
            onRemove={() => { set('coverImage', ''); set('coverImageId', ''); }}
            aspectRatio="landscape"
            label="Upload Cover Image"
          />
        </div>

        {/* Meta */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Title *</label>
            <input
              value={form.title}
              onChange={e => { set('title', e.target.value); if (!form.slug) set('slug', autoSlug(e.target.value)); }}
              required
              placeholder="Post title"
              className={inp}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">
              Slug <span className="text-muted-foreground font-normal text-xs">(URL: /blog/your-slug)</span>
            </label>
            <input
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder="auto-generated-from-title"
              className={`${inp} font-mono text-muted-foreground`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">
              Excerpt <span className="text-muted-foreground font-normal text-xs">(shown in cards)</span>
            </label>
            <textarea
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              rows={2}
              placeholder="Short summary…"
              className={`${inp} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Author</label>
              <input value={form.author} onChange={e => set('author', e.target.value)} className={inp} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Category</label>
              <input value={form.category} onChange={e => set('category', e.target.value)} placeholder="Tutorial, Process…" className={inp} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">
              Tags <span className="text-muted-foreground font-normal text-xs">(comma-separated)</span>
            </label>
            <input
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="digital art, commission, tutorial"
              className={inp}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
          <label className="text-sm font-semibold">Content *</label>
          <TiptapEditor content={form.content} onChange={html => set('content', html)} placeholder="Write your post here…" />
        </div>

        {/* SEO */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-sm">SEO Settings</h2>
          <input
            value={form.seoTitle}
            onChange={e => set('seoTitle', e.target.value)}
            placeholder="SEO Title (defaults to post title)"
            className={inp}
          />
          <div>
            <textarea
              value={form.seoDescription}
              onChange={e => set('seoDescription', e.target.value)}
              rows={2}
              placeholder="SEO Description (max 160 chars)"
              maxLength={160}
              className={`${inp} resize-none`}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">{form.seoDescription.length}/160</p>
          </div>
        </div>

        {/* Publish */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-sm">Publish Settings</h2>

          <div className="flex gap-3">
            {(['draft', 'published'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => set('status', s)}
                className={[
                  'flex-1 py-2.5 rounded-xl text-sm font-semibold border capitalize transition-colors',
                  form.status === s
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-foreground/70 hover:bg-accent-subtle',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>

          {form.status === 'published' && (
            <p className="text-xs text-green-600 font-medium">
              ✓ Will be auto-submitted to Google, Bing & other search engines.
            </p>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => set('featured', e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm font-medium">Featured post (shown prominently on blog page)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/dashboard" className="flex-1 py-3 rounded-xl border border-border text-center text-sm font-semibold hover:bg-accent-subtle transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : form.status === 'published' ? 'Publish & Index' : 'Save Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
