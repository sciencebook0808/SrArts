/**
 * lib/db-server.ts  —  Server-only database helpers (Prisma 7 + CockroachDB)
 *
 * Completely replaces lib/appwrite-server.ts and lib/appwrite.ts
 *
 * Import ONLY in:
 *  - Server Components (files without 'use client')
 *  - API Route handlers (app/api/*)
 *  - app/sitemap.ts, app/robots.ts
 *
 * ROUTING STRATEGY:
 *  - Admin API routes always use Prisma `id` (cuid) — stable internal key
 *  - Public page routes use `slug`, fallback to `id` for old links
 *  - createArtwork/createBlogPost auto-generate slug from title if none provided
 */
import { prisma } from '@/lib/db';
import type { Artwork, BlogPost, Category, Commission, Profile } from '@prisma/client';

export type { Artwork, BlogPost, Category, Commission, Profile };
export type ArtistProfile = Profile;

// ─── Slug utility ─────────────────────────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Artist Profile (singleton) ───────────────────────────────────────────────

const PROFILE_ID = 'artist_profile';

export async function getProfile(): Promise<Profile | null> {
  try {
    return await prisma.profile.findUnique({ where: { id: PROFILE_ID } });
  } catch { return null; }
}

export async function upsertProfile(
  data: Partial<Omit<Profile, 'id' | 'updatedAt'>>
): Promise<Profile> {
  return prisma.profile.upsert({
    where:  { id: PROFILE_ID },
    update: data,
    create: { id: PROFILE_ID, skills: [], ...data },
  });
}

// ─── Artworks ─────────────────────────────────────────────────────────────────

export async function getArtworks(publishedOnly = true): Promise<Artwork[]> {
  try {
    return await prisma.artwork.findMany({
      where:   publishedOnly ? { status: 'published' } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  } catch { return []; }
}

export async function getFeaturedArtworks(): Promise<Artwork[]> {
  try {
    return await prisma.artwork.findMany({
      where:   { status: 'published', featured: true },
      orderBy: { order: 'asc' },
      take: 6,
    });
  } catch { return []; }
}

/** Public gallery/[slug] — slug first, fallback to id */
export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  try {
    const bySlug = await prisma.artwork.findUnique({ where: { slug } });
    if (bySlug) return bySlug;
    return await prisma.artwork.findUnique({ where: { id: slug } });
  } catch { return null; }
}

/** Admin routes — always by id */
export async function getArtwork(id: string): Promise<Artwork | null> {
  try {
    return await prisma.artwork.findUnique({ where: { id } });
  } catch { return null; }
}

export async function createArtwork(
  data: Partial<Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Artwork> {
  const title = data.title ?? '';
  const slug  = data.slug?.trim() || `${generateSlug(title)}-${Date.now()}`;
  return prisma.artwork.create({
    data: {
      title,
      imageUrl:      data.imageUrl      ?? '',
      slug,
      description:   data.description   ?? null,
      category:      data.category      ?? null,
      categoryId:    data.categoryId    ?? null,
      imageId:       data.imageId       ?? null,
      price:         data.price         ?? null,
      featured:      data.featured      ?? false,
      order:         data.order         ?? 0,
      status:        data.status        ?? 'draft',
      instagramLink: data.instagramLink ?? null,
      views: 0,
      likes: 0,
    },
  });
}

export async function updateArtwork(
  id: string,
  data: Partial<Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Artwork> {
  return prisma.artwork.update({ where: { id }, data });
}

export async function deleteArtwork(id: string): Promise<void> {
  await prisma.artwork.delete({ where: { id } });
}

export async function incrementArtworkViews(id: string): Promise<void> {
  try {
    await prisma.artwork.update({
      where: { id },
      data:  { views: { increment: 1 } },
    });
  } catch { /* non-critical */ }
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export async function getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
  try {
    return await prisma.blogPost.findMany({
      where:   publishedOnly ? { status: 'published' } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  } catch { return []; }
}

/** Public blog/[slug] — slug first, fallback to id */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const bySlug = await prisma.blogPost.findUnique({ where: { slug } });
    if (bySlug) return bySlug;
    return await prisma.blogPost.findUnique({ where: { id: slug } });
  } catch { return null; }
}

/** Admin routes — always by id */
export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    return await prisma.blogPost.findUnique({ where: { id } });
  } catch { return null; }
}

export async function createBlogPost(
  data: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<BlogPost> {
  const title = data.title ?? '';
  const slug  = data.slug?.trim() || `${generateSlug(title)}-${Date.now()}`;
  return prisma.blogPost.create({
    data: {
      title,
      content:        data.content        ?? '',
      slug,
      excerpt:        data.excerpt        ?? null,
      coverImage:     data.coverImage     ?? null,
      coverImageId:   data.coverImageId   ?? null,
      author:         data.author         ?? 'SR Arts',
      category:       data.category       ?? null,
      tags:           data.tags           ?? [],
      status:         data.status         ?? 'draft',
      featured:       data.featured       ?? false,
      seoTitle:       data.seoTitle       ?? null,
      seoDescription: data.seoDescription ?? null,
      views: 0,
    },
  });
}

export async function updateBlogPost(
  id: string,
  data: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<BlogPost> {
  return prisma.blogPost.update({ where: { id }, data });
}

export async function deleteBlogPost(id: string): Promise<void> {
  await prisma.blogPost.delete({ where: { id } });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({ orderBy: { order: 'asc' }, take: 50 });
  } catch { return []; }
}

export async function createCategory(
  data: { name: string; slug: string; order?: number }
): Promise<Category> {
  return prisma.category.create({ data: { name: data.name, slug: data.slug, order: data.order ?? 0 } });
}

export async function deleteCategory(id: string): Promise<void> {
  await prisma.category.delete({ where: { id } });
}

// ─── Commissions ──────────────────────────────────────────────────────────────

export async function getCommissions(): Promise<Commission[]> {
  try {
    return await prisma.commission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  } catch { return []; }
}

export async function createCommission(
  data: Omit<Commission, 'id' | 'createdAt' | 'status'>
): Promise<Commission> {
  return prisma.commission.create({ data: { ...data, status: 'pending' } });
}

export async function updateCommissionStatus(
  id: string,
  status: string
): Promise<Commission> {
  return prisma.commission.update({ where: { id }, data: { status } });
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  try {
    const [artworksTotal, blogTotal, ordersTotal] = await Promise.all([
      prisma.artwork.count(),
      prisma.blogPost.count(),
      prisma.commission.count(),
    ]);
    return { artworksTotal, blogTotal, ordersTotal };
  } catch {
    return { artworksTotal: 0, blogTotal: 0, ordersTotal: 0 };
  }
}
