-- prisma/migrations/20260328000000_nested_comments/migration.sql
--
-- MIGRATION: Nested Comment System
-- Target: CockroachDB (PostgreSQL-compatible)
-- Date:   2026-03-28
--
-- CHANGES:
--   1. Add threading fields to Comment (parentId, replyCount, replyTo*, isDeleted, editedAt, updatedAt)
--   2. Add communityPostId FK on Comment → CommunityPost (CASCADE)
--   3. Add self-referential FK on Comment.parentId → Comment.id (SET NULL)
--   4. Drop stale indexes, add optimised composite indexes
--
-- SAFETY:
--   • All new columns are nullable or have DEFAULT values — no backfill needed
--   • ADD COLUMN is non-blocking in CockroachDB
--   • Each DDL statement in its own batch to avoid lock contention

-- ─── 1. ADD NEW COLUMNS TO Comment ──────────────────────────────────────────

ALTER TABLE "Comment"
  ADD COLUMN IF NOT EXISTS "parentId"         STRING,
  ADD COLUMN IF NOT EXISTS "replyCount"       INT4 NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "replyToUserId"    STRING,
  ADD COLUMN IF NOT EXISTS "replyToUsername"  STRING,
  ADD COLUMN IF NOT EXISTS "isDeleted"        BOOL NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "editedAt"         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "communityPostId"  STRING,
  ADD COLUMN IF NOT EXISTS "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── 2. FK: Comment.communityPostId → CommunityPost.id (CASCADE) ────────────

ALTER TABLE "Comment"
  ADD CONSTRAINT "Comment_communityPostId_fkey"
  FOREIGN KEY ("communityPostId")
  REFERENCES "CommunityPost"("id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

-- ─── 3. FK: Comment.parentId → Comment.id (SET NULL) ────────────────────────
-- SET NULL so that when a parent is deleted, replies become orphaned top-level
-- comments rather than being cascade-deleted (preserves thread context).

ALTER TABLE "Comment"
  ADD CONSTRAINT "Comment_parentId_fkey"
  FOREIGN KEY ("parentId")
  REFERENCES "Comment"("id")
  ON DELETE SET NULL
  ON UPDATE NO ACTION;

-- ─── 4. DROP OLD INDEX (replaced by composite) ───────────────────────────────

DROP INDEX IF EXISTS "Comment_targetId_targetType_idx";

-- ─── 5. ADD OPTIMISED INDEXES ────────────────────────────────────────────────
-- Composite index covers the main feed query:
--   WHERE targetId = ? AND targetType = ? AND parentId IS NULL
--   ORDER BY createdAt ASC/DESC

CREATE INDEX IF NOT EXISTS "Comment_targetId_targetType_parentId_createdAt_idx"
  ON "Comment" ("targetId", "targetType", "parentId", "createdAt");

CREATE INDEX IF NOT EXISTS "Comment_parentId_idx"
  ON "Comment" ("parentId");

CREATE INDEX IF NOT EXISTS "Comment_communityPostId_idx"
  ON "Comment" ("communityPostId");

-- userId index should already exist from previous migration — create if missing
CREATE INDEX IF NOT EXISTS "Comment_userId_idx"
  ON "Comment" ("userId");
