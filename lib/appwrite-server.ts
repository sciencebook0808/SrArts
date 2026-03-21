/**
 * lib/appwrite-server.ts
 *
 * node-appwrite v14+ — all methods use named object params.
 * Storage removed from imports (unused — uploads handled by Cloudinary).
 */
import { Client, Databases, Query, ID } from 'node-appwrite';

const endpoint   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT   || 'https://cloud.appwrite.io/v1';
const projectId  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const apiKey     = process.env.APPWRITE_API_KEY                || '';

const DB_ID          = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID             || 'sr_arts_db';
const ARTWORKS_COL   = process.env.NEXT_PUBLIC_APPWRITE_ARTWORKS_COLLECTION     || 'artworks';
const BLOG_COL       = process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION         || 'blog_posts';
const CATEGORIES_COL = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION   || 'categories';
const ORDERS_COL     = process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION       || 'orders';

function getClient() {
  return new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
}
function getDB() { return new Databases(getClient()); }

// ─── Artworks ─────────────────────────────────────────────────────────────────
export async function getArtworks(publishedOnly = true) {
  try {
    const queries: string[] = [Query.orderDesc('$createdAt'), Query.limit(100)];
    if (publishedOnly) queries.push(Query.equal('status', 'published'));
    const res = await getDB().listDocuments({ databaseId: DB_ID, collectionId: ARTWORKS_COL, queries });
    return res.documents;
  } catch { return []; }
}

export async function getFeaturedArtworks() {
  try {
    const res = await getDB().listDocuments({
      databaseId: DB_ID, collectionId: ARTWORKS_COL,
      queries: [Query.equal('status','published'), Query.equal('featured',true), Query.orderAsc('order'), Query.limit(6)],
    });
    return res.documents;
  } catch { return []; }
}

export async function getArtwork(id: string) {
  try { return await getDB().getDocument({ databaseId: DB_ID, collectionId: ARTWORKS_COL, documentId: id }); }
  catch { return null; }
}

export async function createArtwork(data: Record<string, unknown>) {
  return getDB().createDocument({
    databaseId: DB_ID, collectionId: ARTWORKS_COL, documentId: ID.unique(),
    data: { ...data, views: 0, likes: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  });
}

export async function updateArtwork(id: string, data: Record<string, unknown>) {
  return getDB().updateDocument({
    databaseId: DB_ID, collectionId: ARTWORKS_COL, documentId: id,
    data: { ...data, updatedAt: new Date().toISOString() },
  });
}

export async function deleteArtwork(id: string) {
  return getDB().deleteDocument({ databaseId: DB_ID, collectionId: ARTWORKS_COL, documentId: id });
}

// Explicit Promise<void> return type so callers can safely `void` it
export async function incrementArtworkViews(id: string, currentViews: number): Promise<void> {
  try {
    await getDB().updateDocument({
      databaseId: DB_ID, collectionId: ARTWORKS_COL, documentId: id,
      data: { views: currentViews + 1 },
    });
  } catch { /* silent */ }
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export async function getBlogPosts(publishedOnly = true) {
  try {
    const queries: string[] = [Query.orderDesc('$createdAt'), Query.limit(100)];
    if (publishedOnly) queries.push(Query.equal('status', 'published'));
    const res = await getDB().listDocuments({ databaseId: DB_ID, collectionId: BLOG_COL, queries });
    return res.documents;
  } catch { return []; }
}

export async function getBlogPost(id: string) {
  try { return await getDB().getDocument({ databaseId: DB_ID, collectionId: BLOG_COL, documentId: id }); }
  catch { return null; }
}

export async function createBlogPost(data: Record<string, unknown>) {
  return getDB().createDocument({
    databaseId: DB_ID, collectionId: BLOG_COL, documentId: ID.unique(),
    data: { ...data, views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  });
}

export async function updateBlogPost(id: string, data: Record<string, unknown>) {
  return getDB().updateDocument({
    databaseId: DB_ID, collectionId: BLOG_COL, documentId: id,
    data: { ...data, updatedAt: new Date().toISOString() },
  });
}

export async function deleteBlogPost(id: string) {
  return getDB().deleteDocument({ databaseId: DB_ID, collectionId: BLOG_COL, documentId: id });
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories() {
  try {
    const res = await getDB().listDocuments({
      databaseId: DB_ID, collectionId: CATEGORIES_COL,
      queries: [Query.orderAsc('order'), Query.limit(50)],
    });
    return res.documents;
  } catch { return []; }
}

export async function createCategory(data: Record<string, unknown>) {
  return getDB().createDocument({ databaseId: DB_ID, collectionId: CATEGORIES_COL, documentId: ID.unique(), data });
}

export async function deleteCategory(id: string) {
  return getDB().deleteDocument({ databaseId: DB_ID, collectionId: CATEGORIES_COL, documentId: id });
}

// ─── Commissions ──────────────────────────────────────────────────────────────
export async function getCommissions() {
  try {
    const res = await getDB().listDocuments({
      databaseId: DB_ID, collectionId: ORDERS_COL,
      queries: [Query.orderDesc('$createdAt'), Query.limit(100)],
    });
    return res.documents;
  } catch { return []; }
}

export async function createCommission(data: Record<string, unknown>) {
  return getDB().createDocument({
    databaseId: DB_ID, collectionId: ORDERS_COL, documentId: ID.unique(),
    data: { ...data, status: 'pending', createdAt: new Date().toISOString() },
  });
}

export async function updateCommissionStatus(id: string, status: string) {
  return getDB().updateDocument({ databaseId: DB_ID, collectionId: ORDERS_COL, documentId: id, data: { status } });
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  try {
    const db = getDB();
    const [artworks, blogs, orders] = await Promise.all([
      db.listDocuments({ databaseId: DB_ID, collectionId: ARTWORKS_COL, queries: [Query.limit(1)] }),
      db.listDocuments({ databaseId: DB_ID, collectionId: BLOG_COL,     queries: [Query.limit(1)] }),
      db.listDocuments({ databaseId: DB_ID, collectionId: ORDERS_COL,   queries: [Query.limit(1)] }),
    ]);
    return { artworksTotal: artworks.total, blogTotal: blogs.total, ordersTotal: orders.total };
  } catch { return { artworksTotal: 0, blogTotal: 0, ordersTotal: 0 }; }
}
