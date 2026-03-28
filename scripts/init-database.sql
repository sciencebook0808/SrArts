-- initDatabase.sql
-- Creates all tables if they do not exist.
-- Safe to run multiple times (idempotent).
-- Compatible with CockroachDB and PostgreSQL.

-- Artworks
CREATE TABLE IF NOT EXISTS "Artwork" (
  "id"            VARCHAR PRIMARY KEY,
  "slug"          VARCHAR UNIQUE NOT NULL,
  "title"         VARCHAR NOT NULL,
  "description"   TEXT,
  "category"      VARCHAR,
  "categoryId"    VARCHAR,
  "imageUrl"      VARCHAR NOT NULL DEFAULT '',
  "imageId"       VARCHAR,
  "price"         FLOAT,
  "featured"      BOOLEAN NOT NULL DEFAULT FALSE,
  "views"         INT     NOT NULL DEFAULT 0,
  "likes"         INT     NOT NULL DEFAULT 0,
  "order"         INT     NOT NULL DEFAULT 0,
  "status"        VARCHAR NOT NULL DEFAULT 'draft',
  "instagramLink" VARCHAR,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "Artwork_status_idx"          ON "Artwork"("status");
CREATE INDEX IF NOT EXISTS "Artwork_slug_idx"            ON "Artwork"("slug");
CREATE INDEX IF NOT EXISTS "Artwork_featured_status_idx" ON "Artwork"("featured", "status");

-- Blog Posts
CREATE TABLE IF NOT EXISTS "BlogPost" (
  "id"             VARCHAR PRIMARY KEY,
  "slug"           VARCHAR UNIQUE NOT NULL,
  "title"          VARCHAR NOT NULL,
  "content"        TEXT    NOT NULL,
  "excerpt"        TEXT,
  "coverImage"     VARCHAR,
  "coverImageId"   VARCHAR,
  "author"         VARCHAR NOT NULL DEFAULT 'SR Arts',
  "category"       VARCHAR,
  "tags"           VARCHAR[] NOT NULL DEFAULT '{}',
  "status"         VARCHAR NOT NULL DEFAULT 'draft',
  "views"          INT     NOT NULL DEFAULT 0,
  "featured"       BOOLEAN NOT NULL DEFAULT FALSE,
  "seoTitle"       VARCHAR,
  "seoDescription" TEXT,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "BlogPost_status_idx"          ON "BlogPost"("status");
CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx"            ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_featured_status_idx" ON "BlogPost"("featured", "status");

-- Categories
CREATE TABLE IF NOT EXISTS "Category" (
  "id"    VARCHAR PRIMARY KEY,
  "name"  VARCHAR UNIQUE NOT NULL,
  "slug"  VARCHAR UNIQUE NOT NULL,
  "order" INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "Category_order_idx" ON "Category"("order");

-- Commissions
CREATE TABLE IF NOT EXISTS "Commission" (
  "id"           VARCHAR PRIMARY KEY,
  "userName"     VARCHAR NOT NULL,
  "userEmail"    VARCHAR NOT NULL,
  "userPhone"    VARCHAR,
  "projectTitle" VARCHAR,
  "description"  TEXT,
  "style"        VARCHAR,
  "budget"       VARCHAR,
  "timeline"     VARCHAR,
  "status"       VARCHAR NOT NULL DEFAULT 'pending',
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "Commission_status_idx" ON "Commission"("status");

-- Artist Profile (singleton)
CREATE TABLE IF NOT EXISTS "Profile" (
  "id"              VARCHAR PRIMARY KEY DEFAULT 'artist_profile',
  "name"            VARCHAR,
  "headline"        VARCHAR,
  "bio"             TEXT,
  "location"        VARCHAR,
  "profileImage"    VARCHAR,
  "profileImageId"  VARCHAR,
  "bannerImage"     VARCHAR,
  "bannerImageId"   VARCHAR,
  "instagram"       VARCHAR,
  "twitter"         VARCHAR,
  "email"           VARCHAR,
  "website"         VARCHAR,
  "skills"          VARCHAR[] NOT NULL DEFAULT '{}',
  "yearsExperience" INT,
  "artworksCount"   VARCHAR,
  "clientsCount"    VARCHAR,
  "followersCount"  VARCHAR,
  "experience"      JSONB   NOT NULL DEFAULT '[]',
  "achievements"    JSONB   NOT NULL DEFAULT '[]',
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Artwork Likes
CREATE TABLE IF NOT EXISTS "ArtworkLike" (
  "id"        VARCHAR PRIMARY KEY,
  "artworkId" VARCHAR NOT NULL REFERENCES "Artwork"("id") ON DELETE CASCADE,
  "userId"    VARCHAR NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("artworkId", "userId")
);
CREATE INDEX IF NOT EXISTS "ArtworkLike_artworkId_idx" ON "ArtworkLike"("artworkId");
CREATE INDEX IF NOT EXISTS "ArtworkLike_userId_idx"    ON "ArtworkLike"("userId");

-- Comments (polymorphic)
CREATE TABLE IF NOT EXISTS "Comment" (
  "id"         VARCHAR PRIMARY KEY,
  "targetId"   VARCHAR NOT NULL,
  "targetType" VARCHAR NOT NULL,
  "userId"     VARCHAR NOT NULL,
  "username"   VARCHAR NOT NULL,
  "userImage"  VARCHAR,
  "message"    TEXT    NOT NULL,
  "artworkId"  VARCHAR REFERENCES "Artwork"("id")  ON DELETE CASCADE,
  "blogPostId" VARCHAR REFERENCES "BlogPost"("id") ON DELETE CASCADE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "Comment_targetId_targetType_idx" ON "Comment"("targetId", "targetType");
CREATE INDEX IF NOT EXISTS "Comment_userId_idx"              ON "Comment"("userId");

-- Community Posts
CREATE TABLE IF NOT EXISTS "CommunityPost" (
  "id"             VARCHAR PRIMARY KEY,
  "slug"           VARCHAR UNIQUE,
  "authorId"       VARCHAR NOT NULL,
  "authorName"     VARCHAR NOT NULL,
  "authorImage"    VARCHAR,
  "content"        TEXT    NOT NULL,
  "imageUrl"       VARCHAR,
  "imageId"        VARCHAR,
  "repostOfId"     VARCHAR REFERENCES "CommunityPost"("id") ON DELETE SET NULL,
  "repostNote"     TEXT,
  "referenceType"  VARCHAR,
  "referenceId"    VARCHAR,
  "referenceTitle" VARCHAR,
  "referenceImage" VARCHAR,
  "referenceSlug"  VARCHAR,
  "likesCount"     INT     NOT NULL DEFAULT 0,
  "commentsCount"  INT     NOT NULL DEFAULT 0,
  "repostsCount"   INT     NOT NULL DEFAULT 0,
  "shareCount"     INT     NOT NULL DEFAULT 0,
  "status"         VARCHAR NOT NULL DEFAULT 'published',
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "CommunityPost_authorId_idx"            ON "CommunityPost"("authorId");
CREATE INDEX IF NOT EXISTS "CommunityPost_status_createdAt_idx"    ON "CommunityPost"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "CommunityPost_slug_idx"                ON "CommunityPost"("slug");
CREATE INDEX IF NOT EXISTS "CommunityPost_referenceType_id_idx"    ON "CommunityPost"("referenceType", "referenceId");

-- Community Likes
CREATE TABLE IF NOT EXISTS "CommunityLike" (
  "id"        VARCHAR PRIMARY KEY,
  "postId"    VARCHAR NOT NULL REFERENCES "CommunityPost"("id") ON DELETE CASCADE,
  "userId"    VARCHAR NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("postId", "userId")
);
CREATE INDEX IF NOT EXISTS "CommunityLike_postId_idx" ON "CommunityLike"("postId");
CREATE INDEX IF NOT EXISTS "CommunityLike_userId_idx" ON "CommunityLike"("userId");

-- Static Pages
CREATE TABLE IF NOT EXISTS "StaticPage" (
  "id"        VARCHAR PRIMARY KEY,
  "title"     VARCHAR NOT NULL,
  "content"   TEXT    NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "StaticPage_id_idx" ON "StaticPage"("id");

-- ─── SocialAccount ────────────────────────────────────────────────────────────
-- Fetch priority: Clerk OAuth > YouTube Official API / RapidAPI > Manual
-- Max 8 accounts per artist_profile (enforced at application level).

CREATE TABLE IF NOT EXISTS "SocialAccount" (
  "id"              VARCHAR        PRIMARY KEY,
  "profileId"       VARCHAR        NOT NULL DEFAULT 'artist_profile',
  "platform"        VARCHAR        NOT NULL CHECK ("platform" IN ('INSTAGRAM','YOUTUBE','TWITTER','FACEBOOK')),
  "username"        VARCHAR        NOT NULL,
  "followers"       BIGINT,
  "posts"           BIGINT,
  "avatarUrl"       VARCHAR,
  "displayName"     VARCHAR,
  "manualFollowers" BIGINT,
  "manualPosts"     BIGINT,
  "useManual"       BOOLEAN        NOT NULL DEFAULT FALSE,
  "clerkUserId"     VARCHAR,
  "clerkProvider"   VARCHAR,
  "oauthConnected"  BOOLEAN        NOT NULL DEFAULT FALSE,
  "lastFetchMethod" VARCHAR,
  "lastFetchError"  TEXT,
  "fetchStatus"     VARCHAR        NOT NULL DEFAULT 'pending'
                      CHECK ("fetchStatus" IN ('pending','success','failed','manual')),
  "lastFetchedAt"   TIMESTAMPTZ,
  "createdAt"       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE ("profileId", "platform", "username")
);
CREATE INDEX IF NOT EXISTS "SocialAccount_profileId_idx"    ON "SocialAccount"("profileId");
CREATE INDEX IF NOT EXISTS "SocialAccount_platform_idx"     ON "SocialAccount"("platform");
CREATE INDEX IF NOT EXISTS "SocialAccount_fetchStatus_idx"  ON "SocialAccount"("fetchStatus");
