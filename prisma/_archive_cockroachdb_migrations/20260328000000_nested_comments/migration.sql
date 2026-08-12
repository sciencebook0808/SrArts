-- prisma/migrations/20260328000000_nested_comments/migration.sql
--
-- MIGRATION: Nested Comment System
-- Target:    CockroachDB (PostgreSQL-compatible)
-- Date:      2026-03-28
--
-- ROOT CAUSE FIXES (build errors resolved):
--
--   Error 1-3: "Changed the type of updatedAt on Artwork/Profile/StaticPage"
--     → Those tables were first pushed with older Prisma which used TIMESTAMP(3).
--       Prisma 7 now defaults to TIMESTAMPTZ. Fix: the schema pins those columns
--       with @db.Timestamp(3) so Prisma stops detecting a drift.
--       NO DDL needed here — schema annotation is the fix.
--
--   Error 4: "Added the required column updatedAt to Comment without a default"
--     → The Comment table has 2 existing rows. A NOT NULL column with no DEFAULT
--       cannot be added to a non-empty table in CockroachDB.
--       Fix: schema uses @default(now()) which generates DEFAULT NOW() below.
--
-- CHANGES:
--   1. Add threading fields to Comment
--      (parentId, replyCount, replyTo*, isDeleted, editedAt, updatedAt WITH DEFAULT)
--   2. Add communityPostId FK  →  CommunityPost (CASCADE)
--   3. Add self-referential FK →  Comment.parentId (SET NULL)
--   4. Replace stale index with optimised composite index
--
-- SAFETY:
--   • All new columns are nullable OR have explicit DEFAULT values
--   • ADD COLUMN is non-blocking in CockroachDB (online schema change)
--   • IF NOT EXISTS / IF EXISTS guards make this idempotent

-- ─── 1. ADD NEW COLUMNS TO Comment ───────────────────────────────────────────
-- updatedAt: NOT NULL DEFAULT NOW() — this is critical.
--   The table has existing rows; without DEFAULT the ADD COLUMN would fail.
--   Prisma schema uses @default(now()) @updatedAt which generates this DEFAULT.

ALTER TABLE "Comment"
  ADD COLUMN IF NOT EXISTS "parentId"         STRING,
  ADD COLUMN IF NOT EXISTS "replyCount"       INT4       NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "replyToUserId"    STRING,
  ADD COLUMN IF NOT EXISTS "replyToUsername"  STRING,
  ADD COLUMN IF NOT EXISTS "isDeleted"        BOOL       NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "editedAt"         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "communityPostId"  STRING,
  ADD COLUMN IF NOT EXISTS "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── 2. FK: Comment.communityPostId → CommunityPost.id (CASCADE) ─────────────
-- Ensures comments are cascade-deleted when a community post is deleted.
-- Previously missing — this was the silent data leak bug.

ALTER TABLE "Comment"
  ADD CONSTRAINT IF NOT EXISTS "Comment_communityPostId_fkey"
  FOREIGN KEY ("communityPostId")
  REFERENCES "CommunityPost"("id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

-- ─── 3. FK: Comment.parentId → Comment.id (SET NULL on delete) ───────────────
-- SET NULL: when a parent comment is deleted, its replies are not cascade-deleted.
-- Instead replies become orphaned top-level comments — thread structure preserved.

ALTER TABLE "Comment"
  ADD CONSTRAINT IF NOT EXISTS "Comment_parentId_fkey"
  FOREIGN KEY ("parentId")
  REFERENCES "Comment"("id")
  ON DELETE SET NULL
  ON UPDATE NO ACTION;

-- ─── 4. REPLACE OLD INDEX WITH OPTIMISED COMPOSITE ───────────────────────────

DROP INDEX IF EXISTS "Comment_targetId_targetType_idx";

-- Composite covering index for the main threaded-comment feed query:
--   WHERE targetId = ? AND targetType = ? AND parentId IS NULL
--   ORDER BY createdAt ASC
-- This is a pure index-seek even on 100k+ comment tables.

CREATE INDEX IF NOT EXISTS "Comment_targetId_targetType_parentId_createdAt_idx"
  ON "Comment" ("targetId", "targetType", "parentId", "createdAt");

CREATE INDEX IF NOT EXISTS "Comment_parentId_idx"
  ON "Comment" ("parentId");

CREATE INDEX IF NOT EXISTS "Comment_communityPostId_idx"
  ON "Comment" ("communityPostId");

-- userId index may already exist from initial schema — create if missing
CREATE INDEX IF NOT EXISTS "Comment_userId_idx"
  ON "Comment" ("userId");
