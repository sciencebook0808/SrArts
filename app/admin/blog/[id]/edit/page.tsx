'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { TiptapEditor } from '@/components/admin/tiptap-editor';
import { ImageUploader } from '@/components/admin/image-uploader';
import { toast } from 'sonner';

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    coverImage: '', coverImageId: '', author: 'SR Arts',
    category: '', tags: '',
    status: 'draft' as 'draft' | 'published', featured: false,
    seoTitle: '', seoDescription: '',
  });

  useEffect(() => {
    fetch(`/api/blog/${id}`).then(r => r.json()).then(data => {
      if (data.post) {
        const p = data.post;
        setForm({
          title: p.title ?? '', slug: p.slug ?? '', excerpt: p.excerpt ?? '',
          content: p.content ?? '', coverImage: p.coverImage ?? '',
          coverImageId: p.coverImageId ?? '', author: p.author ?? 'SR Arts',
          category: p.category ?? '',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags ?? ''),
          status: p.status ?? 'draft', featured: !!p.featured,
          seoTitle: p.seoTitle ?? '', seoDescription: p.seoDescription ?? '',
        });
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          updatedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Post updated!');
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-border px-4 md:px-8 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="p-2 rounded-lg hover:bg-accent-subtle transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Edit Blog Post</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
          <label className="text-sm font-semibold">Cover Image</label>
          <ImageUploader value={form.coverImage}
            onChange={(url, pid) => { set('coverImage', url); set('coverImageId', pid); }}
            onRemove={() => { set('coverImage', ''); set('coverImageId', ''); }}
            aspectRatio="landscape" label="Upload Cover Image" />
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Slug</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Excerpt</label>
            <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
              rows={2} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Author</label>
              <input value={form.author} onChange={e => set('author', e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Category</label>
              <input value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Tags</label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
          <label className="text-sm font-semibold">Content *</label>
          <TiptapEditor content={form.content} onChange={html => set('content', html)} />
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-sm">SEO</h2>
          <input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)}
            placeholder="SEO Title"
            className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)}
            rows={2} placeholder="SEO Description"
            className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <div className="flex gap-3">
            {(['draft', 'published'] as const).map(s => (
              <button key={s} type="button" onClick={() => set('status', s)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border capitalize transition-colors ${form.status === s ? 'bg-primary text-white border-primary' : 'border-border text-foreground/70 hover:bg-accent-subtle'}`}>
                {s}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)}
              className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm font-medium">Featured post</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/dashboard" className="flex-1 py-3 rounded-xl border border-border text-center text-sm font-semibold hover:bg-accent-subtle transition-colors">Cancel</Link>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
