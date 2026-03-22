'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ImageUploader } from '@/components/admin/image-uploader';
import { toast } from 'sonner';
import type { Category, Artwork } from '@prisma/client';
export default function EditArtworkPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ title: '', slug: '', description: '', category: '', categoryId: '', imageUrl: '', imageId: '', price: '', featured: false, status: 'draft' as 'draft' | 'published', instagramLink: '' });
  useEffect(() => {
    Promise.all([fetch(`/api/artworks/${id}`).then(r => r.json()), fetch('/api/categories').then(r => r.json())]).then(([artRes, catRes]) => {
      const a = (artRes as { artwork?: Artwork }).artwork;
      setCategories((catRes as { categories?: Category[] }).categories ?? []);
      if (a) setForm({ title: a.title, slug: a.slug, description: a.description ?? '', category: a.category ?? '', categoryId: a.categoryId ?? '', imageUrl: a.imageUrl, imageId: a.imageId ?? '', price: a.price ? String(a.price) : '', featured: a.featured, status: a.status as 'draft' | 'published', instagramLink: a.instagramLink ?? '' });
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [id]);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) { toast.error('Title and image required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: form.price ? parseFloat(form.price) : null }) });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? 'Failed');
      toast.success('Artwork updated!'); router.push('/admin/dashboard');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  };
  const inp = 'w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-border px-4 md:px-8 py-4 flex items-center gap-4"><Link href="/admin/dashboard" className="p-2 rounded-lg hover:bg-accent-subtle transition-colors"><ArrowLeft className="w-5 h-5" /></Link><h1 className="text-lg font-bold">Edit Artwork</h1></header>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3"><label className="text-sm font-semibold">Cover Image *</label><ImageUploader value={form.imageUrl} onChange={(url, pid) => { set('imageUrl', url); set('imageId', pid); }} onRemove={() => { set('imageUrl', ''); set('imageId', ''); }} aspectRatio="landscape" label="Upload Artwork Image" /></div>
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <div className="space-y-1"><label className="text-sm font-semibold">Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} required className={inp} /></div>
          <div className="space-y-1"><label className="text-sm font-semibold">Slug</label><input value={form.slug} onChange={e => set('slug', e.target.value)} className={`${inp} font-mono text-muted-foreground`} /></div>
          <div className="space-y-1"><label className="text-sm font-semibold">Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className={`${inp} resize-none`} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-sm font-semibold">Category</label><select value={form.categoryId} onChange={e => { const c = categories.find(x => x.id === e.target.value); set('categoryId', e.target.value); set('category', c?.name ?? ''); }} className={`${inp} bg-white`}><option value="">Select category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="space-y-1"><label className="text-sm font-semibold">Price</label><input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} className={inp} /></div>
          </div>
          <div className="space-y-1"><label className="text-sm font-semibold">Instagram Link</label><input value={form.instagramLink} onChange={e => set('instagramLink', e.target.value)} className={inp} /></div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-sm">Publish Settings</h2>
          <div className="flex gap-3">{(['draft', 'published'] as const).map(s => <button key={s} type="button" onClick={() => set('status', s)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border capitalize transition-colors ${form.status === s ? 'bg-primary text-white border-primary' : 'border-border text-foreground/70 hover:bg-accent-subtle'}`}>{s}</button>)}</div>
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded accent-primary" /><span className="text-sm font-medium">Mark as featured (shows on homepage)</span></label>
        </div>
        <div className="flex gap-3"><Link href="/admin/dashboard" className="flex-1 py-3 rounded-xl border border-border text-center text-sm font-semibold hover:bg-accent-subtle transition-colors">Cancel</Link><button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light disabled:opacity-60 transition-colors flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? 'Saving…' : 'Update Artwork'}</button></div>
      </form>
    </div>
  );
}
