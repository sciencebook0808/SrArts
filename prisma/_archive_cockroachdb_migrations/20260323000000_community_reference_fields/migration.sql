-- Migration: 20260323000000_community_reference_fields
-- Adds universal reference fields to CommunityPost for artwork/blog/post reposts.
-- 
-- IDEMPOTENT: Uses IF NOT EXISTS on every statement.
-- SAFE:       All new columns are nullable VARCHAR — no constraint violations possible.
-- COCKROACHDB COMPATIBLE: Separate ALTER TABLE per column (CockroachDB requires this).
--
-- If this migration previously failed and was partially applied, the IF NOT EXISTS
-- guards ensure re-running is safe and non-destructive.

ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceType"  STRING;

ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceId"    STRING;

ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceTitle" STRING;

ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceImage" STRING;

ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceSlug"  STRING;

-- Index: only create if the columns were just added.
-- Uses CockroachDB-compatible CREATE INDEX IF NOT EXISTS syntax.
CREATE INDEX IF NOT EXISTS "CommunityPost_referenceType_referenceId_idx"
  ON "CommunityPost" ("referenceType", "referenceId");
