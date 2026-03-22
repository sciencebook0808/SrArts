/**
 * lib/db-server.ts — Server-only DB helpers (Prisma 7 + CockroachDB)
 *
 * Import ONLY in:
 *  - Server Components (no 'use client')
 *  - API Route handlers (app/api/*)
 *  - app/sitemap.ts, app/robots.ts
 *
 * All mutation functions requiring auth (likes, comments, community posts)
 * accept a `userId` parameter — callers must verify via Clerk before calling.
 */
import prisma from '@/lib/db';
import type {
  Artwork, BlogPost, Category, Commission, Profile,
  ArtworkLike, Comment, CommunityPost, CommunityLike,
} from '@prisma/client';

export type {
  Artwork, BlogPost, Category, Commission, Profile,
  ArtworkLike, Comment, CommunityPost, CommunityLike,
};
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

// ─── Artist Profile ───────────────────────────────────────────────────────────

const PROFILE_ID = 'artist_profile';

export async function getProfile(): Promise<Profile | null> {
  try { return await prisma.profile.findUnique({ where: { id: PROFILE_ID } }); }
  catch { return null; }
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

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  try {
    const bySlug = await prisma.artwork.findUnique({ where: { slug } });
    if (bySlug) return bySlug;
    return await prisma.artwork.findUnique({ where: { id: slug } });
  } catch { return null; }
}

export async function getArtwork(id: string): Promise<Artwork | null> {
  try { return await prisma.artwork.findUnique({ where: { id } }); }
  catch { return null; }
}

export async function createArtwork(
  data: Partial<Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Artwork> {
  const title = data.title ?? '';
  const slug  = data.slug?.trim() || `${generateSlug(title)}-${Date.now()}`;
  return prisma.artwork.create({
    data: {
      title, imageUrl: data.imageUrl ?? '', slug,
      description:   data.description   ?? null,
      category:      data.category      ?? null,
      categoryId:    data.categoryId    ?? null,
      imageId:       data.imageId       ?? null,
      price:         data.price         ?? null,
      featured:      data.featured      ?? false,
      order:         data.order         ?? 0,
      status:        data.status        ?? 'draft',
      instagramLink: data.instagramLink ?? null,
      views: 0, likes: 0,
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
    await prisma.artwork.update({ where: { id }, data: { views: { increment: 1 } } });
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

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const bySlug = await prisma.blogPost.findUnique({ where: { slug } });
    if (bySlug) return bySlug;
    return await prisma.blogPost.findUnique({ where: { id: slug } });
  } catch { return null; }
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try { return await prisma.blogPost.findUnique({ where: { id } }); }
  catch { return null; }
}

export async function createBlogPost(
  data: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<BlogPost> {
  const title = data.title ?? '';
  const slug  = data.slug?.trim() || `${generateSlug(title)}-${Date.now()}`;
  return prisma.blogPost.create({
    data: {
      title, content: data.content ?? '', slug,
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
  try { return await prisma.category.findMany({ orderBy: { order: 'asc' }, take: 50 }); }
  catch { return []; }
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
  try { return await prisma.commission.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }); }
  catch { return []; }
}

export async function createCommission(
  data: Omit<Commission, 'id' | 'createdAt' | 'status'>
): Promise<Commission> {
  return prisma.commission.create({ data: { ...data, status: 'pending' } });
}

export async function updateCommissionStatus(id: string, status: string): Promise<Commission> {
  return prisma.commission.update({ where: { id }, data: { status } });
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  try {
    const [artworksTotal, blogTotal, ordersTotal, communityTotal] = await Promise.all([
      prisma.artwork.count(),
      prisma.blogPost.count(),
      prisma.commission.count(),
      prisma.communityPost.count(),
    ]);
    return { artworksTotal, blogTotal, ordersTotal, communityTotal };
  } catch {
    return { artworksTotal: 0, blogTotal: 0, ordersTotal: 0, communityTotal: 0 };
  }
}

// ─── Artwork Likes (Clerk auth required) ─────────────────────────────────────

export async function getLikeCount(artworkId: string): Promise<number> {
  try { return await prisma.artworkLike.count({ where: { artworkId } }); }
  catch { return 0; }
}

export async function hasLiked(artworkId: string, userId: string): Promise<boolean> {
  try {
    const like = await prisma.artworkLike.findUnique({
      where: { artworkId_userId: { artworkId, userId } },
    });
    return !!like;
  } catch { return false; }
}

export async function toggleArtworkLike(
  artworkId: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
  const existing = await prisma.artworkLike.findUnique({
    where: { artworkId_userId: { artworkId, userId } },
  });

  if (existing) {
    await prisma.artworkLike.delete({ where: { artworkId_userId: { artworkId, userId } } });
    await prisma.artwork.update({ where: { id: artworkId }, data: { likes: { decrement: 1 } } });
  } else {
    await prisma.artworkLike.create({ data: { artworkId, userId } });
    await prisma.artwork.update({ where: { id: artworkId }, data: { likes: { increment: 1 } } });
  }

  const count = await getLikeCount(artworkId);
  return { liked: !existing, count };
}

// ─── Comments (Clerk auth required, polymorphic) ──────────────────────────────

export async function getComments(
  targetId: string,
  targetType: 'artwork' | 'blog' | 'community'
): Promise<Comment[]> {
  try {
    return await prisma.comment.findMany({
      where:   { targetId, targetType },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  } catch { return []; }
}

export async function createComment(data: {
  targetId: string;
  targetType: 'artwork' | 'blog' | 'community';
  userId: string;
  username: string;
  userImage?: string;
  message: string;
}): Promise<Comment> {
  return prisma.comment.create({
    data: {
      targetId:   data.targetId,
      targetType: data.targetType,
      userId:     data.userId,
      username:   data.username.trim().slice(0, 60),
      userImage:  data.userImage ?? null,
      message:    data.message.trim().slice(0, 1000),
    },
  });
}

export async function deleteComment(id: string): Promise<void> {
  await prisma.comment.delete({ where: { id } });
}

export async function getAllComments(): Promise<Comment[]> {
  try { return await prisma.comment.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }); }
  catch { return []; }
}

// ─── Community Posts ──────────────────────────────────────────────────────────

export interface CommunityPostWithRepost extends CommunityPost {
  repostOf: CommunityPost | null;
}

export async function getCommunityPosts(
  opts: { take?: number; skip?: number } = {}
): Promise<CommunityPostWithRepost[]> {
  try {
    return await prisma.communityPost.findMany({
      where:   { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take:    opts.take ?? 20,
      skip:    opts.skip ?? 0,
      include: { repostOf: true },
    }) as CommunityPostWithRepost[];
  } catch { return []; }
}

export async function getCommunityPost(id: string): Promise<CommunityPostWithRepost | null> {
  try {
    return await prisma.communityPost.findUnique({
      where:   { id },
      include: { repostOf: true },
    }) as CommunityPostWithRepost | null;
  } catch { return null; }
}

export async function createCommunityPost(data: {
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  imageUrl?: string;
  imageId?: string;
}): Promise<CommunityPost> {
  return prisma.communityPost.create({
    data: {
      authorId:    data.authorId,
      authorName:  data.authorName,
      authorImage: data.authorImage ?? null,
      content:     data.content.trim().slice(0, 3000),
      imageUrl:    data.imageUrl ?? null,
      imageId:     data.imageId  ?? null,
      status: 'published',
    },
  });
}

export async function createRepost(data: {
  authorId: string;
  authorName: string;
  authorImage?: string;
  repostNote: string;
  repostOfId: string;
}): Promise<CommunityPost> {
  const [post] = await prisma.$transaction([
    prisma.communityPost.create({
      data: {
        authorId:    data.authorId,
        authorName:  data.authorName,
        authorImage: data.authorImage ?? null,
        content:     data.repostNote.trim().slice(0, 1000),
        repostOfId:  data.repostOfId,
        repostNote:  data.repostNote.trim().slice(0, 1000),
        status: 'published',
      },
    }),
    prisma.communityPost.update({
      where: { id: data.repostOfId },
      data:  { repostsCount: { increment: 1 } },
    }),
  ]);
  return post;
}

export async function deleteCommunityPost(id: string, userId: string): Promise<void> {
  const post = await prisma.communityPost.findUnique({ where: { id } });
  if (!post || post.authorId !== userId) throw new Error('Forbidden');
  await prisma.communityPost.delete({ where: { id } });
}

// ─── Community Likes ──────────────────────────────────────────────────────────

export async function getCommunityLikeCount(postId: string): Promise<number> {
  try { return await prisma.communityLike.count({ where: { postId } }); }
  catch { return 0; }
}

export async function hasCommunityLiked(postId: string, userId: string): Promise<boolean> {
  try {
    const like = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    return !!like;
  } catch { return false; }
}

export async function toggleCommunityLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
  const existing = await prisma.communityLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.communityLike.delete({ where: { postId_userId: { postId, userId } } });
    await prisma.communityPost.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } });
  } else {
    await prisma.communityLike.create({ data: { postId, userId } });
    await prisma.communityPost.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } });
  }

  const count = await getCommunityLikeCount(postId);
  return { liked: !existing, count };
}
