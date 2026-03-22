'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ImageUploader } from '@/components/admin/image-uploader';
import { toast } from 'sonner';
import type { Category } from '@prisma/client';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

type Status = 'draft' | 'published';

interface FormState {
  title: string;
  slug: string;
  description: string;
  category: string;
  categoryId: string;
  imageUrl: string;
  imageId: string;
  price: string;
  featured: boolean;
  status: Status;
  instagramLink: string;
}

const EMPTY: FormState = {
  title: '', slug: '', description: '', category: '', categoryId: '',
  imageUrl: '', imageId: '', price: '', featured: false,
  status: 'draft', instagramLink: '',
};

function autoSlug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function NewArtworkPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then((d: { categories?: Category[] }) => setCategories(d.categories ?? []));
  }, []);

  const set = (k: keyof FormState, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) {
      toast.error('Title and image are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug: form.slug || autoSlug(form.title),
          price: form.price ? parseFloat(form.price) : undefined,
        }),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? 'Failed');

      const { artwork } = await res.json() as { artwork?: { slug?: string; id?: string } };

      if (form.status === 'published' && BASE_URL && artwork) {
        void fetch('/api/indexing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: [`${BASE_URL}/gallery/${artwork.slug ?? artwork.id}`] }),
        });
      }

      toast.success(form.status === 'published' ? 'Artwork published & indexed!' : 'Draft saved!');
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
        <h1 className="text-lg font-bold">New Artwork</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        {/* Cover image */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
          <label className="text-sm font-semibold">Cover Image *</label>
          <ImageUploader
            value={form.imageUrl}
            onChange={(url, pid) => { set('imageUrl', url); set('imageId', pid); }}
            onRemove={() => { set('imageUrl', ''); set('imageId', ''); }}
            aspectRatio="landscape"
            label="Upload Artwork Image"
          />
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Title *</label>
            <input
              value={form.title}
              onChange={e => { set('title', e.target.value); if (!form.slug) set('slug', autoSlug(e.target.value)); }}
              required
              placeholder="Artwork title"
              className={inp}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">
              Slug{' '}
              <span className="text-muted-foreground font-normal text-xs">(URL: /gallery/your-slug)</span>
            </label>
            <input
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder="my-artwork-title"
              className={`${inp} font-mono text-muted-foreground`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Describe this artwork…"
              className={`${inp} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Category</label>
              <select
                value={form.categoryId}
                onChange={e => {
                  const c = categories.find(x => x.id === e.target.value);
                  set('categoryId', e.target.value);
                  set('category', c?.name ?? '');
                }}
                className={`${inp} bg-white`}
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Price (optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="0.00"
                className={inp}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Instagram Link</label>
            <input
              value={form.instagramLink}
              onChange={e => set('instagramLink', e.target.value)}
              placeholder="https://instagram.com/p/…"
              className={inp}
            />
          </div>
        </div>

        {/* Publish settings */}
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
            <span className="text-sm font-medium">Mark as featured (shows on homepage)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/dashboard"
            className="flex-1 py-3 rounded-xl border border-border text-center text-sm font-semibold hover:bg-accent-subtle transition-colors"
          >
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
