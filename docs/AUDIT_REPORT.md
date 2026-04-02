# SrArts — Full Codebase Audit Report
**Date:** April 2026 | **Auditor:** Senior Full-Stack Review  
**Stack:** Next.js 16 · React 19 · TypeScript strict · Prisma 7 · CockroachDB · Clerk · Cloudinary

---

## 1. Architecture

### ✅ Strengths
- **ISR everywhere** — all public pages use `export const revalidate = 60`. Correct pattern for an artist portfolio.
- **Server-first data loading** — home and about pages use `Promise.all()` server-side; no client-side `useEffect` fetching.
- **3-tier social fetch chain** — Clerk OAuth → Official/RapidAPI → Manual. Thoughtful fallback design.
- **Per-account try/catch in sync loops** — one DB write failure doesn't abort the whole batch. Critical for reliability.
- **Prisma 7 compliance** — `DATABASE_URL` in `prisma.config.ts` (not `schema.prisma`), correct `InputJsonValue` typing.
- **Soft deletes on comments** — `isDeleted: true` preserves thread tree. Correct design.
- **CommunityPost slug generation** — deterministic, collision-resistant (words + timestamp base36). Good.

### ⚠️ Issues Found & Fixed

| ID | Area | Issue | Fix Applied |
|----|------|-------|-------------|
| A1 | Schema | `SocialAccount` missing `bio`, `following`, `category`, `externalUrl`, `profileUrl` — APIs returned this data but it was discarded | Added 5 new nullable columns + migration |
| A2 | social-fetcher.ts | `SocialStats` interface only had 4 fields; enriched data from scrapers was silently dropped | Expanded interface to 9 fields |
| A3 | social-fetcher.ts | `getInstagramProfile`, `getTwitterProfile`, `getFacebookProfile` not exported — couldn't call per-platform from outside | Exported as named functions |
| A4 | social-fetcher.ts | No retry logic — a single transient 503 from RapidAPI causes permanent failure for that cron run | Added `withRetry()` (2 attempts, skip on 4xx) |
| A5 | social-fetcher.ts | Rate-limit errors (429) surfaced as generic "HTTP 429" — hard to distinguish from other errors in logs | Explicit `HTTP 429: Rate limit exceeded` message |
| A6 | cron + admin sync | Both routes only wrote 4 fields (`followers`, `posts`, `avatarUrl`, `displayName`); new enriched fields never stored | Updated both to write all 9 fields |
| A7 | Social UI | `SocialCard` and about-page card couldn't display bio/following/external link — data wasn't in DB | New `SocialProfileCard` component; existing card updated |
| A8 | Icons | Platform SVG icons duplicated identically in 3 files (social-card, social-stats-inline, about/page) | Extracted to `platform-config.tsx` as single source of truth |
| A9 | social-db.ts | Didn't exist — social DB logic was scattered across db-server.ts, cron, and admin routes | New dedicated module with clean API |
| A10 | Caching | No staleness check — no path to refresh stale data outside cron | `getOrFetchSocialProfile()` with 8h threshold |
| A11 | Home page | `PlatformStatsCards` section absent — just pills and full cards, nothing in between | Added `PlatformStatsCards` grid |
| A12 | About page | Used old inline cards with only followers+posts; no bio, following, category, link | Now uses `SocialProfileCardsGrid` with all fields |

---

## 2. Data Flow (Before vs After)

### Before
```
RapidAPI → fetchSocialStatsWithFallback() → only followers/posts/avatar/name saved
UI reads DB → only 4 fields available to render
```

### After
```
RapidAPI → fetchSocialStatsWithFallback() → full profile (9 fields) saved
                                             ↓
                                    lib/social-db.ts
                                    ├── fetchAndStoreSocialProfile()   [cron/admin]
                                    ├── getSocialProfileFromDB()       [direct read]
                                    └── getOrFetchSocialProfile()      [cache-aware]
                                             ↓
UI reads DB → full profile available: bio, following, category, externalUrl, profileUrl
```

---

## 3. Performance

| Check | Status | Notes |
|-------|--------|-------|
| DB queries on public pages | ✅ | `Promise.all()` parallelises all DB calls per page |
| Client API calls | ✅ | Zero — UI always reads from DB |
| ISR revalidation | ✅ | 60s on all public pages. Social data fresher via cron |
| N+1 queries | ✅ | `findMany` with `include: { repostOf: true }` on community feed |
| CockroachDB indexes | ✅ | Correct indexes on `fetchStatus`, `platform`, `profileId` |
| Image optimisation | ✅ | `next/image` with `sizes` props on all artwork/avatar images |
| Font loading | ⚠️ | No `font-display: swap` observed — verify in globals.css |
| Bundle size | ⚠️ | Three.js (r128) imported unconditionally in hero — consider dynamic import for non-3D pages |

---

## 4. UI / UX

| Check | Status | Notes |
|-------|--------|-------|
| Component reuse | ✅ (improved) | `platform-config.tsx` now shared; `SocialProfileCard` reusable |
| Responsive layouts | ✅ | Grid col counts adapt: 1→2→3→4 based on account count |
| Bio truncation | ✅ | `line-clamp-3` with "Read more" toggle on `SocialProfileCard` |
| Empty states | ✅ | All grid components render graceful empty messages |
| Loading states | ⚠️ | No skeleton loaders on social cards — consider `loading.tsx` per route |
| Accessibility | ⚠️ | SVG icons have `aria-hidden` ✅ but gradient divs lack `aria-label` on hover borders |
| Dark mode | ⚠️ | CSS variables suggest light-only; no `dark:` variants observed on social cards |

---

## 5. API Layer

| Check | Status | Notes |
|-------|--------|-------|
| Error handling | ✅ (improved) | Per-account try/catch in cron; explicit rate-limit messaging |
| Retry logic | ✅ (new) | `withRetry()` with 2 attempts, intelligent 4xx skip |
| Auth on admin routes | ✅ | `requireAdminClerk()` on all `/api/admin/*` endpoints |
| Cron security | ✅ | `Authorization: Bearer ${CRON_SECRET}` verified |
| Rate limiting | ⚠️ | Comment creation has rate limiter; social sync does not — RapidAPI has its own limits |
| Input validation | ✅ | Platform enum validated on social account creation |
| Max accounts cap | ✅ | Hard limit of 8 accounts per profile |

---

## 6. New Files Summary

| File | Type | Purpose |
|------|------|---------|
| `lib/social-db.ts` | **New** | Dedicated social DB module — `fetchAndStoreSocialProfile`, `getSocialProfileFromDB`, `getOrFetchSocialProfile`, `effectiveFollowers`, `formatFollowers` |
| `components/social/platform-config.tsx` | **New** | Single source of truth for platform icons, colours, labels |
| `components/social/social-profile-card.tsx` | **New** | Full enriched profile card: bio, following, category, external link, follow button |
| `components/social/platform-stats-cards.tsx` | **New** | Homepage per-platform follower count cards grid |
| `prisma/migrations/20260401000000_social_profile_enrichment/migration.sql` | **New** | Adds `following`, `bio`, `category`, `externalUrl`, `profileUrl` to `SocialAccount` |

---

## 7. Modified Files Summary

| File | Change |
|------|--------|
| `prisma/schema.prisma` | +5 fields on `SocialAccount` |
| `lib/social-fetcher.ts` | Expanded `SocialStats`, added `withRetry`, exported per-platform functions, captures all enriched data |
| `lib/db-server.ts` | Updated `PublicSocialAccount` type + `getPublicSocialAccounts` select to include new fields |
| `components/social/social-card.tsx` | Uses `platform-config.tsx` — eliminates icon duplication |
| `components/social/social-stats-inline.tsx` | Uses `platform-config.tsx` — eliminates icon duplication |
| `app/api/cron/social-sync/route.ts` | Writes all 9 enriched fields on success |
| `app/api/admin/social-sync/route.ts` | Writes all 9 enriched fields on success |
| `app/(public)/page.tsx` | Adds `PlatformStatsCards`; maps enriched data correctly |
| `app/(public)/about/page.tsx` | Uses `SocialProfileCardsGrid` with all enriched fields |

---

## 8. Recommendations (Not Implemented — Future Work)

1. **`SocialAccount.following` for YouTube** — YouTube API returns subscriber count but not following (it's not a concept there). Consider making `following` truly optional and not rendering the stat for YouTube.
2. **Dynamic import Three.js** — `hero-scene.tsx` loads Three.js on every page via layout. Wrap in `next/dynamic` with `ssr: false` and only import on pages that need it.
3. **Skeleton loaders** — Add `loading.tsx` for gallery, blog, community routes. Currently shows blank page on slow connections.
4. **Social sync webhook** — Instead of polling, expose a webhook endpoint that Instagram/Meta can call on profile updates. Reduces RapidAPI costs.
5. **Error monitoring** — Add `captureException` (Sentry/similar) in `fetchSocialStatsWithFallback` catch block. Currently errors are only in console logs.
6. **CockroachDB connection pool** — Verify `@prisma/adapter-pg` pool size is set via `DATABASE_URL` params (`?pool_timeout=10&pool_max=5`). Serverless functions can starve the pool.
7. **`revalidateTag` granular ISR** — Currently `revalidate = 60` is page-wide. Using tagged revalidation on the social section would allow the cron job to flush only the social cache segment without rebuilding the full page.
