module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "prisma",
    ()=>prisma
]);
/**
 * lib/db.ts — Prisma 7 client singleton for Next.js
 *
 * Prisma 7 requires an adapter — PrismaClient({ adapter }) is mandatory.
 * CockroachDB uses @prisma/adapter-pg (PostgreSQL wire protocol, port 26257).
 *
 * SINGLETON PATTERN:
 *  Prevents multiple PrismaClient instances during Next.js hot-reload in
 *  development. Each reload would otherwise open a new connection pool,
 *  quickly exhausting CockroachDB's connection limits.
 *
 * PRODUCTION:
 *  In production each serverless invocation gets one PrismaClient instance.
 *  The global cache is irrelevant in production but kept for safety.
 *
 * @prisma/adapter-pg bundles its own pg types since 7.5.0 —
 * no separate @types/pg is needed.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$adapter$2d$pg__$5b$external$5d$__$2840$prisma$2f$adapter$2d$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$29$__ = __turbopack_context__.i("[externals]/@prisma/adapter-pg [external] (@prisma/adapter-pg, esm_import, [project]/node_modules/@prisma/adapter-pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$adapter$2d$pg__$5b$external$5d$__$2840$prisma$2f$adapter$2d$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$adapter$2d$pg__$5b$external$5d$__$2840$prisma$2f$adapter$2d$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// ─── Global cache key (survives hot-reload in dev) ────────────────────────────
const globalForPrisma = globalThis;
// ─── Factory ─────────────────────────────────────────────────────────────────
function createClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('[SR Arts] DATABASE_URL is not set.\n' + 'Add it to .env.local:\n' + '  DATABASE_URL="postgresql://user:pass@host:26257/defaultdb?sslmode=verify-full"\n' + 'Get it from: https://cockroachlabs.cloud → Your cluster → Connection string');
    }
    const adapter = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$adapter$2d$pg__$5b$external$5d$__$2840$prisma$2f$adapter$2d$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$29$__["PrismaPg"]({
        connectionString
    });
    return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
        adapter,
        log: ("TURBOPACK compile-time truthy", 1) ? [
            'warn',
            'error'
        ] : "TURBOPACK unreachable",
        errorFormat: 'minimal'
    });
}
const prisma = globalForPrisma.prisma ?? createClient();
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = prisma;
}
const __TURBOPACK__default__export__ = prisma;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/html-sanitizer.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MAX_RICH_HTML_LENGTH",
    ()=>MAX_RICH_HTML_LENGTH,
    "htmlToPlainText",
    ()=>htmlToPlainText,
    "sanitizeRichHtml",
    ()=>sanitizeRichHtml
]);
/**
 * lib/html-sanitizer.ts — Server-only rich-text HTML sanitizer.
 *
 * WHY THIS EXISTS
 *  Community posts are authored by any signed-in user through the TipTap
 *  UnifiedEditor and stored as raw HTML. That HTML is rendered with
 *  `dangerouslySetInnerHTML` (components/prose-content.tsx and
 *  components/community/post-detail.tsx). Before this module existed, nothing
 *  stripped `<script>`, `on*=` handlers or `javascript:` URLs on the way in,
 *  which made `POST /api/community` a stored-XSS vector against every visitor
 *  — including admins browsing the feed.
 *
 *  The site CSP allows `'unsafe-inline'` for scripts (Clerk + next/script need
 *  it), so CSP does NOT mitigate this. Sanitization is the actual control.
 *
 * STRATEGY — allowlist, applied twice
 *  1. ON WRITE  — every user-authored rich-text field is sanitized before it
 *     reaches the database (see lib/db-server.ts community writers).
 *  2. ON READ   — community post content is sanitized again when loaded, so
 *     rows written before this module shipped are neutralised too, without a
 *     destructive data migration.
 *
 *  `server-only` keeps sanitize-html (and htmlparser2) out of the client
 *  bundle — the sanitizer runs in route handlers and server components only.
 *
 * The allowlist covers exactly what the TipTap extension set can emit
 * (see components/editor/config/extensions.ts): headings, lists, task lists,
 * tables, images/figures, code blocks, marks, alignment and YouTube embeds.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/index.js [app-rsc] (ecmascript)");
;
;
/** Hosts permitted as <iframe> sources — matches `frame-src` in next.config.mjs */ const ALLOWED_IFRAME_HOSTNAMES = [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'youtube-nocookie.com'
];
/**
 * CSS properties we allow through inline `style` attributes.
 * The editor sets colour, background colour, font family/size, line height and
 * alignment inline. Anything else (position, behavior, expression, url(), …)
 * is dropped by sanitize-html because it is not listed here.
 */ const ALLOWED_STYLES = {
    '*': {
        'color': [
            /^#[0-9a-f]{3,8}$/i,
            /^rgba?\([\d\s.,%]+\)$/i,
            /^hsla?\([\d\s.,%]+\)$/i,
            /^oklch\([\d\s.,%/]+\)$/i,
            /^[a-z]+$/i
        ],
        'background-color': [
            /^#[0-9a-f]{3,8}$/i,
            /^rgba?\([\d\s.,%]+\)$/i,
            /^hsla?\([\d\s.,%]+\)$/i,
            /^oklch\([\d\s.,%/]+\)$/i,
            /^[a-z]+$/i
        ],
        'font-family': [
            /^[\w\s,'"-]+$/
        ],
        'font-size': [
            /^\d+(\.\d+)?(px|em|rem|pt|%)$/
        ],
        'line-height': [
            /^\d+(\.\d+)?(px|em|rem|%)?$/
        ],
        'text-align': [
            /^(left|right|center|justify)$/
        ],
        'width': [
            /^\d+(\.\d+)?(px|em|rem|%)$/
        ],
        'max-width': [
            /^\d+(\.\d+)?(px|em|rem|%)$/
        ]
    }
};
const OPTIONS = {
    allowedTags: [
        // Block
        'p',
        'div',
        'br',
        'hr',
        'blockquote',
        'pre',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        // Lists (incl. TipTap task lists)
        'ul',
        'ol',
        'li',
        'label',
        'input',
        // Inline marks
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'strike',
        'del',
        'ins',
        'code',
        'span',
        'mark',
        'sub',
        'sup',
        'small',
        'a',
        // Media
        'img',
        'figure',
        'figcaption',
        'iframe',
        // Tables
        'table',
        'thead',
        'tbody',
        'tfoot',
        'tr',
        'th',
        'td',
        'colgroup',
        'col'
    ],
    allowedAttributes: {
        '*': [
            'style',
            'class',
            'data-type',
            'data-align',
            'dir'
        ],
        a: [
            'href',
            'target',
            'rel',
            'title'
        ],
        img: [
            'src',
            'alt',
            'title',
            'width',
            'height',
            'loading'
        ],
        iframe: [
            'src',
            'width',
            'height',
            'allow',
            'allowfullscreen',
            'title',
            'frameborder'
        ],
        // TipTap TaskItem renders a real checkbox
        input: [
            'type',
            'checked',
            'disabled'
        ],
        li: [
            'data-checked',
            'data-type'
        ],
        ul: [
            'data-type'
        ],
        table: [
            'style'
        ],
        th: [
            'colspan',
            'rowspan',
            'colwidth',
            'style'
        ],
        td: [
            'colspan',
            'rowspan',
            'colwidth',
            'style'
        ],
        col: [
            'style',
            'width'
        ],
        figure: [
            'data-type'
        ]
    },
    allowedStyles: ALLOWED_STYLES,
    // Only these URL schemes survive; `javascript:`, `data:` (except images
    // below) and `vbscript:` are stripped entirely.
    allowedSchemes: [
        'http',
        'https',
        'mailto'
    ],
    allowedSchemesByTag: {
        // data: images are allowed so pasted/inlined editor images keep working.
        img: [
            'http',
            'https',
            'data'
        ]
    },
    allowProtocolRelative: false,
    // Drop the contents (not just the tags) of anything executable or
    // namespace-confusing — this is what closes mXSS style bypasses.
    nonTextTags: [
        'script',
        'style',
        'textarea',
        'noscript',
        'template',
        'title',
        'xmp'
    ],
    // Force safe rel on every outbound link.
    transformTags: {
        a: (tagName, attribs)=>({
                tagName,
                attribs: {
                    ...attribs,
                    ...attribs.href ? {
                        target: '_blank',
                        rel: 'nofollow noopener noreferrer ugc'
                    } : {}
                }
            }),
        // Checkboxes in rendered (non-editor) content must never be submittable.
        input: (tagName, attribs)=>({
                tagName,
                attribs: {
                    ...attribs,
                    type: 'checkbox',
                    disabled: 'disabled'
                }
            })
    },
    // Any iframe whose src is not a YouTube embed is removed.
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
    allowIframeRelativeUrls: false,
    parser: {
        lowerCaseTags: true,
        lowerCaseAttributeNames: true,
        recognizeSelfClosing: true
    }
};
const MAX_RICH_HTML_LENGTH = 50_000;
function sanitizeRichHtml(raw, limit = MAX_RICH_HTML_LENGTH) {
    if (!raw) return '';
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(raw, OPTIONS).slice(0, limit);
}
function htmlToPlainText(raw, limit = 5_000) {
    if (!raw) return '';
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(raw, {
        allowedTags: [],
        allowedAttributes: {}
    }).replace(/\s+/g, ' ').trim().slice(0, limit);
}
}),
"[project]/lib/db-server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createArtwork",
    ()=>createArtwork,
    "createBlogPost",
    ()=>createBlogPost,
    "createCategory",
    ()=>createCategory,
    "createComment",
    ()=>createComment,
    "createCommission",
    ()=>createCommission,
    "createCommunityPost",
    ()=>createCommunityPost,
    "createExternalRepost",
    ()=>createExternalRepost,
    "createRepost",
    ()=>createRepost,
    "deleteArtwork",
    ()=>deleteArtwork,
    "deleteBlogPost",
    ()=>deleteBlogPost,
    "deleteCategory",
    ()=>deleteCategory,
    "deleteComment",
    ()=>deleteComment,
    "deleteCommunityPost",
    ()=>deleteCommunityPost,
    "deleteOwnComment",
    ()=>deleteOwnComment,
    "editComment",
    ()=>editComment,
    "generateCommunitySlug",
    ()=>generateCommunitySlug,
    "generateSlug",
    ()=>generateSlug,
    "getAllComments",
    ()=>getAllComments,
    "getArtwork",
    ()=>getArtwork,
    "getArtworkBySlug",
    ()=>getArtworkBySlug,
    "getArtworks",
    ()=>getArtworks,
    "getBlogPost",
    ()=>getBlogPost,
    "getBlogPostBySlug",
    ()=>getBlogPostBySlug,
    "getBlogPosts",
    ()=>getBlogPosts,
    "getCategories",
    ()=>getCategories,
    "getCommentCount",
    ()=>getCommentCount,
    "getComments",
    ()=>getComments,
    "getCommissions",
    ()=>getCommissions,
    "getCommunityLikeCount",
    ()=>getCommunityLikeCount,
    "getCommunityPost",
    ()=>getCommunityPost,
    "getCommunityPosts",
    ()=>getCommunityPosts,
    "getDashboardStats",
    ()=>getDashboardStats,
    "getFeaturedArtworks",
    ()=>getFeaturedArtworks,
    "getLikeCount",
    ()=>getLikeCount,
    "getProfile",
    ()=>getProfile,
    "getPublicSocialAccounts",
    ()=>getPublicSocialAccounts,
    "getPublicStats",
    ()=>getPublicStats,
    "getReplies",
    ()=>getReplies,
    "getStaticPage",
    ()=>getStaticPage,
    "getThreadedComments",
    ()=>getThreadedComments,
    "hasCommunityLiked",
    ()=>hasCommunityLiked,
    "hasLiked",
    ()=>hasLiked,
    "incrementArtworkViews",
    ()=>incrementArtworkViews,
    "incrementBlogViews",
    ()=>incrementBlogViews,
    "incrementShareCount",
    ()=>incrementShareCount,
    "toggleArtworkLike",
    ()=>toggleArtworkLike,
    "toggleCommunityLike",
    ()=>toggleCommunityLike,
    "updateArtwork",
    ()=>updateArtwork,
    "updateBlogPost",
    ()=>updateBlogPost,
    "updateCommissionStatus",
    ()=>updateCommissionStatus,
    "upsertProfile",
    ()=>upsertProfile,
    "upsertStaticPage",
    ()=>upsertStaticPage
]);
/**
 * lib/db-server.ts — Server-only DB helpers (Prisma 7 + CockroachDB)
 *
 * Import ONLY in:
 *  - Server Components (no 'use client')
 *  - API Route handlers (app/api/*)
 *  - app/sitemap.ts, app/robots.ts
 *
 * All mutation functions requiring auth accept a `userId` parameter.
 * Callers must verify the user via Clerk before calling mutators.
 *
 * FIELD ALIGNMENT (March 2026):
 *  Artwork:       status String, views Int, likes Int, categoryId String?, instagramLink String?
 *  BlogPost:      status String (NOT published: Boolean), author String, seoTitle?, seoDescription?
 *  Commission:    userName, userEmail, userPhone?, projectTitle?, style?
 *  CommunityPost: status String, slug String?, shareCount Int
 *
 * JSON TYPE NOTE (Prisma 7):
 *  Prisma returns Json fields typed as `Prisma.JsonValue` which includes `null`.
 *  Prisma's write inputs for Json fields expect `Prisma.InputJsonValue` which does NOT include
 *  plain null. Therefore we define `ProfileInput` with `Prisma.InputJsonValue` for the
 *  experience / achievements fields instead of using `Partial<Omit<Profile, ...>>` directly,
 *  which would produce:
 *    "Type 'JsonValue | undefined' is not assignable to type 'JsonNull | InputJsonValue | undefined'"
 *  Reference: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/html-sanitizer.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function generateSlug(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
function generateCommunitySlug(content) {
    const words = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["htmlToPlainText"])(content).split(/\s+/).filter(Boolean).slice(0, 6).join(' ');
    const base = generateSlug(words);
    const suffix = Date.now().toString(36);
    return base ? `${base}-${suffix}` : suffix;
}
// ─── Artist Profile ───────────────────────────────────────────────────────────
const PROFILE_ID = 'artist_profile';
async function getProfile() {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].profile.findUnique({
            where: {
                id: PROFILE_ID
            }
        });
    } catch  {
        return null;
    }
}
async function upsertProfile(data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].profile.upsert({
        where: {
            id: PROFILE_ID
        },
        update: data,
        create: {
            id: PROFILE_ID,
            skills: [],
            experience: [],
            achievements: [],
            ...data
        }
    });
}
async function getPublicStats() {
    try {
        const [profile, artworksCount, communityCount] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].profile.findUnique({
                where: {
                    id: PROFILE_ID
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.count({
                where: {
                    status: 'published'
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.count({
                where: {
                    status: 'published'
                }
            })
        ]);
        return {
            artworks: profile?.artworksCount ?? (artworksCount > 0 ? `${artworksCount}+` : '500+'),
            clients: profile?.clientsCount ?? '1K+',
            followers: profile?.followersCount ?? '50K+',
            posts: communityCount > 0 ? `${communityCount}+` : '0'
        };
    } catch  {
        return {
            artworks: '500+',
            clients: '1K+',
            followers: '50K+',
            posts: '0'
        };
    }
}
async function getArtworks(publishedOnly = true) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.findMany({
            where: publishedOnly ? {
                status: 'published'
            } : undefined,
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        });
    } catch  {
        return [];
    }
}
async function getFeaturedArtworks() {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.findMany({
            where: {
                status: 'published',
                featured: true
            },
            orderBy: {
                order: 'asc'
            },
            take: 6
        });
    } catch  {
        return [];
    }
}
async function getArtworkBySlug(slug) {
    try {
        const bySlug = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.findUnique({
            where: {
                slug
            }
        });
        if (bySlug) return bySlug;
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.findUnique({
            where: {
                id: slug
            }
        });
    } catch  {
        return null;
    }
}
async function getArtwork(id) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.findUnique({
            where: {
                id
            }
        });
    } catch  {
        return null;
    }
}
async function createArtwork(data) {
    const title = data.title ?? '';
    const slug = data.slug?.trim() || `${generateSlug(title)}-${Date.now()}`;
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.create({
        data: {
            title,
            slug,
            imageUrl: data.imageUrl ?? '',
            description: data.description ?? null,
            category: data.category ?? null,
            categoryId: data.categoryId ?? null,
            imageId: data.imageId ?? null,
            price: data.price ?? null,
            featured: data.featured ?? false,
            status: data.status ?? 'draft',
            instagramLink: data.instagramLink ?? null,
            order: data.order ?? 0
        }
    });
}
async function updateArtwork(id, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.update({
        where: {
            id
        },
        data
    });
}
async function deleteArtwork(id) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.delete({
        where: {
            id
        }
    });
}
async function incrementArtworkViews(id) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.update({
            where: {
                id
            },
            data: {
                views: {
                    increment: 1
                }
            }
        });
    } catch  {}
}
async function getBlogPosts(publishedOnly = true) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].blogPost.findMany({
            where: publishedOnly ? {
                status: 'published'
            } : undefined,
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        });
    } catch  {
        return [];
    }
}
async function getBlogPostBySlug(slug) {
    try {
        const bySlug = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].blogPost.findUnique({
            where: {
                slug
            }
        });
        if (bySlug) return bySlug;
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].blogPost.findUnique({
            where: {
                id: slug
            }
        });
    } catch  {
        return null;
    }
}
async function getBlogPost(id) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].blogPost.findUnique({
            where: {
                id
            }
        });
    } catch  {
        return null;
    }
}
async function createBlogPost(data) {
    const title = data.title ?? '';
    const slug = data.slug?.trim() || `${generateSlug(title)}-${Date.now()}`;
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].blogPost.create({
        data: {
            title,
            slug,
            // Admin-authored, but still rendered with dangerouslySetInnerHTML —
            // sanitize so a compromised admin session cannot plant persistent script.
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(data.content ?? ''),
            excerpt: data.excerpt ?? null,
            coverImage: data.coverImage ?? null,
            coverImageId: data.coverImageId ?? null,
            author: data.author ?? 'SR Arts',
            category: data.category ?? null,
            tags: data.tags ?? [],
            status: data.status ?? 'draft',
            featured: data.featured ?? false,
            seoTitle: data.seoTitle ?? null,
            seoDescription: data.seoDescription ?? null
        }
    });
}
async function updateBlogPost(id, data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].blogPost.update({
        where: {
            id
        },
        data: {
            ...data,
            ...data.content !== undefined ? {
                content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(data.content)
            } : {}
        }
    });
}
async function deleteBlogPost(id) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].blogPost.delete({
        where: {
            id
        }
    });
}
async function incrementBlogViews(id) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].blogPost.update({
            where: {
                id
            },
            data: {
                views: {
                    increment: 1
                }
            }
        });
    } catch  {}
}
async function getCategories() {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].category.findMany({
            orderBy: {
                order: 'asc'
            }
        });
    } catch  {
        return [];
    }
}
async function createCategory(data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].category.create({
        data: {
            name: data.name,
            slug: data.slug,
            order: data.order ?? 0
        }
    });
}
async function deleteCategory(id) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].category.delete({
        where: {
            id
        }
    });
}
async function getCommissions() {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].commission.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch  {
        return [];
    }
}
async function createCommission(data) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].commission.create({
        data: {
            userName: data.userName,
            userEmail: data.userEmail,
            userPhone: data.userPhone ?? null,
            projectTitle: data.projectTitle ?? null,
            description: data.description ?? null,
            style: data.style ?? null,
            budget: data.budget ?? null,
            timeline: data.timeline ?? null,
            status: 'pending'
        }
    });
}
async function updateCommissionStatus(id, status) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].commission.update({
        where: {
            id
        },
        data: {
            status
        }
    });
}
async function getDashboardStats() {
    try {
        const [artworksTotal, blogTotal, ordersTotal, communityTotal] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.count(),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].blogPost.count(),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].commission.count(),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.count()
        ]);
        return {
            artworksTotal,
            blogTotal,
            ordersTotal,
            communityTotal
        };
    } catch  {
        return {
            artworksTotal: 0,
            blogTotal: 0,
            ordersTotal: 0,
            communityTotal: 0
        };
    }
}
async function getLikeCount(artworkId) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artworkLike.count({
            where: {
                artworkId
            }
        });
    } catch  {
        return 0;
    }
}
async function hasLiked(artworkId, userId) {
    try {
        const like = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artworkLike.findUnique({
            where: {
                artworkId_userId: {
                    artworkId,
                    userId
                }
            }
        });
        return !!like;
    } catch  {
        return false;
    }
}
async function toggleArtworkLike(artworkId, userId) {
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artworkLike.findUnique({
        where: {
            artworkId_userId: {
                artworkId,
                userId
            }
        }
    });
    if (existing) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artworkLike.delete({
            where: {
                artworkId_userId: {
                    artworkId,
                    userId
                }
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.update({
            where: {
                id: artworkId
            },
            data: {
                likes: {
                    decrement: 1
                }
            }
        }).catch(()=>{});
    } else {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artworkLike.create({
            data: {
                artworkId,
                userId
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].artwork.update({
            where: {
                id: artworkId
            },
            data: {
                likes: {
                    increment: 1
                }
            }
        });
    }
    const count = await getLikeCount(artworkId);
    return {
        liked: !existing,
        count
    };
}
const COMMENTS_PAGE_SIZE = 20;
const REPLIES_PRELOAD = 3; // replies eagerly loaded per top-level comment
function buildTargetFks(targetType, targetId) {
    return {
        artworkId: targetType === 'artwork' ? targetId : undefined,
        blogPostId: targetType === 'blog' ? targetId : undefined,
        communityPostId: targetType === 'community' ? targetId : undefined
    };
}
async function getThreadedComments(targetId, targetType, cursor, take = COMMENTS_PAGE_SIZE) {
    try {
        const where = {
            targetId,
            targetType,
            parentId: null
        };
        const [total, rawComments] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.count({
                where
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.findMany({
                where,
                orderBy: {
                    createdAt: 'asc'
                },
                take: take + 1,
                ...cursor ? {
                    cursor: {
                        id: cursor
                    },
                    skip: 1
                } : {},
                include: {
                    replies: {
                        where: {
                            isDeleted: false
                        },
                        orderBy: {
                            createdAt: 'asc'
                        },
                        take: REPLIES_PRELOAD
                    }
                }
            })
        ]);
        const hasMore = rawComments.length > take;
        const comments = hasMore ? rawComments.slice(0, take) : rawComments;
        const nextCursor = hasMore ? comments[comments.length - 1].id : null;
        return {
            comments: comments,
            nextCursor,
            total
        };
    } catch  {
        return {
            comments: [],
            nextCursor: null,
            total: 0
        };
    }
}
async function getCommentCount(targetId, targetType) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.count({
            where: {
                targetId,
                targetType,
                isDeleted: false
            }
        });
    } catch  {
        return 0;
    }
}
async function getReplies(parentId) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.findMany({
            where: {
                parentId,
                isDeleted: false
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    } catch  {
        return [];
    }
}
async function createComment(data) {
    const fks = buildTargetFks(data.targetType, data.targetId);
    const comment = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.create({
        data: {
            targetId: data.targetId,
            targetType: data.targetType,
            userId: data.userId,
            username: data.username,
            userImage: data.userImage ?? null,
            message: data.message,
            parentId: data.parentId ?? null,
            replyToUserId: data.replyToUserId ?? null,
            replyToUsername: data.replyToUsername ?? null,
            ...fks
        }
    });
    if (data.parentId) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.update({
            where: {
                id: data.parentId
            },
            data: {
                replyCount: {
                    increment: 1
                }
            }
        }).catch(()=>{});
    }
    if (data.targetType === 'community') {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.update({
            where: {
                id: data.targetId
            },
            data: {
                commentsCount: {
                    increment: 1
                }
            }
        }).catch(()=>{});
    }
    return comment;
}
async function editComment(id, userId, message) {
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.findUnique({
        where: {
            id
        }
    });
    if (!existing) throw new Error('Comment not found.');
    if (existing.userId !== userId) throw new Error('Forbidden: not your comment.');
    if (existing.isDeleted) throw new Error('Cannot edit a deleted comment.');
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.update({
        where: {
            id
        },
        data: {
            message,
            editedAt: new Date()
        }
    });
}
async function deleteOwnComment(id, userId) {
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.findUnique({
        where: {
            id
        }
    });
    if (!existing) throw new Error('Comment not found.');
    if (existing.userId !== userId) throw new Error('Forbidden: not your comment.');
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.update({
        where: {
            id
        },
        data: {
            isDeleted: true,
            message: '[deleted]',
            userImage: null
        }
    });
    if (existing.parentId) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.update({
            where: {
                id: existing.parentId
            },
            data: {
                replyCount: {
                    decrement: 1
                }
            }
        }).catch(()=>{});
    }
    if (existing.targetType === 'community') {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.update({
            where: {
                id: existing.targetId
            },
            data: {
                commentsCount: {
                    decrement: 1
                }
            }
        }).catch(()=>{});
    }
}
async function deleteComment(id) {
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.findUnique({
        where: {
            id
        }
    });
    if (!existing) return;
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.delete({
        where: {
            id
        }
    });
    if (existing.parentId) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.update({
            where: {
                id: existing.parentId
            },
            data: {
                replyCount: {
                    decrement: 1
                }
            }
        }).catch(()=>{});
    }
    if (existing.targetType === 'community') {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.update({
            where: {
                id: existing.targetId
            },
            data: {
                commentsCount: {
                    decrement: 1
                }
            }
        }).catch(()=>{});
    }
}
async function getComments(targetId, targetType) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.findMany({
            where: {
                targetId,
                targetType
            },
            orderBy: {
                createdAt: 'asc'
            },
            take: 200
        });
    } catch  {
        return [];
    }
}
async function getAllComments() {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].comment.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 200
        });
    } catch  {
        return [];
    }
}
async function getCommunityPosts(opts = {}) {
    const { take = 20, skip = 0, authorId, search, sort = 'latest' } = opts;
    const orderBy = sort === 'popular' ? [
        {
            likesCount: 'desc'
        },
        {
            commentsCount: 'desc'
        }
    ] : sort === 'oldest' ? [
        {
            createdAt: 'asc'
        }
    ] : [
        {
            createdAt: 'desc'
        }
    ];
    try {
        const posts = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.findMany({
            where: {
                status: 'published',
                ...authorId ? {
                    authorId
                } : {},
                ...search ? {
                    authorName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                } : {}
            },
            orderBy,
            take,
            skip,
            include: {
                repostOf: true
            }
        });
        return posts.map(sanitizePostContent);
    } catch  {
        return [];
    }
}
async function getCommunityPost(slugOrId) {
    try {
        const bySlug = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.findFirst({
            where: {
                slug: slugOrId,
                status: 'published'
            },
            include: {
                repostOf: true
            }
        });
        if (bySlug) return sanitizePostContent(bySlug);
        const byId = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.findUnique({
            where: {
                id: slugOrId
            },
            include: {
                repostOf: true
            }
        });
        return sanitizePostContent(byId);
    } catch  {
        return null;
    }
}
async function createCommunityPost(data) {
    const slug = generateCommunitySlug(data.content);
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.create({
        data: {
            slug,
            authorId: data.authorId,
            authorName: data.authorName,
            authorImage: data.authorImage ?? null,
            // SECURITY: post content is rendered with dangerouslySetInnerHTML, and any
            // signed-in user can author it. Sanitize against a strict allowlist before
            // it ever reaches the database. See lib/html-sanitizer.ts.
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(data.content),
            imageUrl: data.imageUrl ?? null,
            imageId: data.imageId ?? null,
            status: 'published'
        }
    });
}
/**
 * Sanitize the rich-text fields of a post loaded from the database.
 *
 * Defence in depth: rows created before HTML sanitization shipped may still
 * contain hostile markup, so we scrub on read as well as on write rather than
 * running a destructive data migration.
 */ function sanitizePostContent(post) {
    if (!post) return post;
    const cleaned = {
        ...post,
        content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(post.content)
    };
    const nested = cleaned.repostOf;
    if (nested) {
        cleaned.repostOf = {
            ...nested,
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(nested.content)
        };
    }
    return cleaned;
}
async function createExternalRepost(data) {
    const slug = generateCommunitySlug(data.note || `repost-${data.referenceType}-${data.referenceId}`);
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.create({
        data: {
            slug,
            authorId: data.authorId,
            authorName: data.authorName,
            authorImage: data.authorImage ?? null,
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(data.note, 1000),
            referenceType: data.referenceType,
            referenceId: data.referenceId,
            referenceTitle: data.referenceTitle,
            referenceImage: data.referenceImage ?? null,
            referenceSlug: data.referenceSlug,
            status: 'published'
        }
    });
}
async function createRepost(data) {
    // Verify the target exists before creating the repost, otherwise the
    // transaction fails on the counter update and the caller sees a bare 500.
    const target = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.findUnique({
        where: {
            id: data.repostOfId
        },
        select: {
            id: true,
            status: true
        }
    });
    if (!target || target.status !== 'published') {
        throw new Error('Post not found');
    }
    const slug = generateCommunitySlug(data.repostNote || `repost-${data.repostOfId}`);
    const [post] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].$transaction([
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.create({
            data: {
                slug,
                authorId: data.authorId,
                authorName: data.authorName,
                authorImage: data.authorImage ?? null,
                content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(data.repostNote, 1000),
                repostOfId: data.repostOfId,
                repostNote: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(data.repostNote, 1000),
                referenceType: 'post',
                referenceId: data.repostOfId,
                status: 'published'
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.update({
            where: {
                id: data.repostOfId
            },
            data: {
                repostsCount: {
                    increment: 1
                }
            }
        })
    ]);
    return post;
}
async function incrementShareCount(postId) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.update({
            where: {
                id: postId
            },
            data: {
                shareCount: {
                    increment: 1
                }
            }
        });
    } catch  {}
}
async function deleteCommunityPost(id, userId, opts = {}) {
    const post = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.findUnique({
        where: {
            id
        }
    });
    // Distinguish "missing" from "not yours" so the route can return 404 vs 403
    // instead of collapsing both into a generic failure.
    if (!post) {
        throw new Error('Post not found');
    }
    if (!opts.asAdmin && post.authorId !== userId) {
        throw new Error('Forbidden: you can only delete your own posts');
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.delete({
        where: {
            id
        }
    });
}
async function getCommunityLikeCount(postId) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityLike.count({
            where: {
                postId
            }
        });
    } catch  {
        return 0;
    }
}
async function hasCommunityLiked(postId, userId) {
    try {
        const like = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });
        return !!like;
    } catch  {
        return false;
    }
}
async function toggleCommunityLike(postId, userId) {
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityLike.findUnique({
        where: {
            postId_userId: {
                postId,
                userId
            }
        }
    });
    if (existing) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityLike.delete({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.update({
            where: {
                id: postId
            },
            data: {
                likesCount: {
                    decrement: 1
                }
            }
        }).catch(()=>{});
    } else {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityLike.create({
            data: {
                postId,
                userId
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].communityPost.update({
            where: {
                id: postId
            },
            data: {
                likesCount: {
                    increment: 1
                }
            }
        });
    }
    const count = await getCommunityLikeCount(postId);
    return {
        liked: !existing,
        count
    };
}
async function getStaticPage(slug) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].staticPage.findUnique({
            where: {
                id: slug
            }
        });
    } catch  {
        return null;
    }
}
async function upsertStaticPage(slug, data) {
    const content = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$html$2d$sanitizer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(data.content);
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].staticPage.upsert({
        where: {
            id: slug
        },
        update: {
            title: data.title,
            content
        },
        create: {
            id: slug,
            title: data.title,
            content
        }
    });
}
async function getPublicSocialAccounts() {
    try {
        const accounts = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].socialAccount.findMany({
            where: {
                profileId: 'artist_profile'
            },
            orderBy: {
                createdAt: 'asc'
            },
            select: {
                id: true,
                platform: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                category: true,
                externalUrl: true,
                profileUrl: true,
                followers: true,
                following: true,
                posts: true,
                manualFollowers: true,
                manualPosts: true,
                useManual: true,
                oauthConnected: true,
                lastFetchMethod: true,
                fetchStatus: true,
                lastFetchedAt: true
            }
        });
        // Only return accounts that have something to show (followers or manual)
        return accounts.filter((a)=>{
            const f = a.useManual ? a.manualFollowers : a.followers;
            return f !== null && f > 0;
        });
    } catch  {
        return [];
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/app/(public)/blog/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>BlogPage,
    "metadata",
    ()=>metadata,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$floating$2d$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/floating-navbar.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db-server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-rsc] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-rsc] (ecmascript) <export default as User>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const revalidate = 30;
const metadata = {
    title: 'Blog | SR Arts',
    description: 'Insights, tutorials, and behind-the-scenes stories from the SR Arts studio.'
};
async function BlogPage() {
    const posts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBlogPosts"])(true);
    const featured = posts.find((p)=>p.featured);
    const rest = posts.filter((p)=>p.id !== featured?.id);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "w-full min-h-screen bg-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$floating$2d$navbar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FloatingNavbar"], {}, void 0, false, {
                fileName: "[project]/app/(public)/blog/page.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "pt-28 md:pt-32 pb-12 px-4 md:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-5xl md:text-6xl font-extrabold mb-3",
                            children: "Blog"
                        }, void 0, false, {
                            fileName: "[project]/app/(public)/blog/page.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl text-muted-foreground max-w-2xl",
                            children: "Insights, tutorials, and behind-the-scenes from the studio."
                        }, void 0, false, {
                            fileName: "[project]/app/(public)/blog/page.tsx",
                            lineNumber: 20,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(public)/blog/page.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(public)/blog/page.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "px-4 md:px-8 pb-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto",
                    children: posts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground text-lg",
                            children: "No posts published yet. Check back soon."
                        }, void 0, false, {
                            fileName: "[project]/app/(public)/blog/page.tsx",
                            lineNumber: 26,
                            columnNumber: 48
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(public)/blog/page.tsx",
                        lineNumber: 26,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            featured && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: `/blog/${featured.slug}`,
                                className: "group block mb-12",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "card-base overflow-hidden hover:shadow-2xl transition-all duration-300 md:flex",
                                    children: [
                                        featured.coverImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative w-full md:w-1/2 aspect-video md:aspect-auto md:min-h-[320px] bg-accent-subtle overflow-hidden",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                src: featured.coverImage,
                                                alt: featured.title,
                                                fill: true,
                                                className: "object-cover group-hover:scale-105 transition-transform duration-500",
                                                sizes: "(max-width: 768px) 100vw, 50vw",
                                                priority: true
                                            }, void 0, false, {
                                                fileName: "[project]/app/(public)/blog/page.tsx",
                                                lineNumber: 34,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(public)/blog/page.tsx",
                                            lineNumber: 33,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-8 md:w-1/2 flex flex-col justify-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-bold text-primary uppercase tracking-widest mb-3",
                                                    children: "Featured Post"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                    lineNumber: 38,
                                                    columnNumber: 23
                                                }, this),
                                                featured.category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-muted-foreground mb-2 capitalize",
                                                    children: featured.category
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                    lineNumber: 39,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-2xl md:text-3xl font-extrabold mb-4 group-hover:text-primary transition-colors",
                                                    children: featured.title
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                    lineNumber: 40,
                                                    columnNumber: 23
                                                }, this),
                                                featured.excerpt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-muted-foreground leading-relaxed mb-6 line-clamp-3",
                                                    children: featured.excerpt
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                    lineNumber: 41,
                                                    columnNumber: 44
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-4 text-sm text-muted-foreground flex-wrap",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                                    className: "w-3.5 h-3.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                                    lineNumber: 43,
                                                                    columnNumber: 69
                                                                }, this),
                                                                featured.author
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(public)/blog/page.tsx",
                                                            lineNumber: 43,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                                    className: "w-3.5 h-3.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                                    lineNumber: 44,
                                                                    columnNumber: 69
                                                                }, this),
                                                                featured.createdAt.toLocaleDateString('en-GB', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(public)/blog/page.tsx",
                                                            lineNumber: 44,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                    lineNumber: 42,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(public)/blog/page.tsx",
                                            lineNumber: 37,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                    lineNumber: 31,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(public)/blog/page.tsx",
                                lineNumber: 30,
                                columnNumber: 17
                            }, this),
                            rest.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
                                children: rest.map((post)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/blog/${post.slug}`,
                                        className: "group",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "card-base overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col",
                                            children: [
                                                post.coverImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative w-full aspect-video bg-accent-subtle overflow-hidden",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                        src: post.coverImage,
                                                        alt: post.title,
                                                        fill: true,
                                                        className: "object-cover group-hover:scale-105 transition-transform duration-500",
                                                        sizes: "(max-width: 640px) 100vw, 33vw"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(public)/blog/page.tsx",
                                                        lineNumber: 55,
                                                        columnNumber: 124
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                    lineNumber: 55,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-5 flex flex-col flex-1",
                                                    children: [
                                                        post.category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-primary font-semibold uppercase tracking-wide mb-2",
                                                            children: post.category
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(public)/blog/page.tsx",
                                                            lineNumber: 57,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1",
                                                            children: post.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(public)/blog/page.tsx",
                                                            lineNumber: 58,
                                                            columnNumber: 27
                                                        }, this),
                                                        post.excerpt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-muted-foreground line-clamp-2 mb-4",
                                                            children: post.excerpt
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(public)/blog/page.tsx",
                                                            lineNumber: 59,
                                                            columnNumber: 44
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3 text-xs text-muted-foreground",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                                    className: "w-3 h-3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                                    lineNumber: 60,
                                                                    columnNumber: 98
                                                                }, this),
                                                                post.createdAt.toLocaleDateString('en-GB', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(public)/blog/page.tsx",
                                                            lineNumber: 60,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(public)/blog/page.tsx",
                                                    lineNumber: 56,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(public)/blog/page.tsx",
                                            lineNumber: 54,
                                            columnNumber: 23
                                        }, this)
                                    }, post.id, false, {
                                        fileName: "[project]/app/(public)/blog/page.tsx",
                                        lineNumber: 53,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(public)/blog/page.tsx",
                                lineNumber: 51,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/app/(public)/blog/page.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(public)/blog/page.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "py-10 px-4 md:px-8 border-t border-border bg-accent-subtle/20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: [
                            "© ",
                            new Date().getFullYear(),
                            " SR Arts. All rights reserved."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(public)/blog/page.tsx",
                        lineNumber: 72,
                        columnNumber: 56
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(public)/blog/page.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(public)/blog/page.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(public)/blog/page.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/app/(public)/blog/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(public)/blog/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0o3grv3._.js.map