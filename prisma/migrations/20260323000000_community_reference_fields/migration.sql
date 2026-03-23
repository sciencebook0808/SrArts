-- Migration: Add universal reference fields to CommunityPost
-- Safe to run on existing databases: all new columns are nullable

ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceType"  VARCHAR;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceId"    VARCHAR;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceTitle" VARCHAR;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceImage" VARCHAR;
ALTER TABLE "CommunityPost" ADD COLUMN IF NOT EXISTS "referenceSlug"  VARCHAR;

CREATE INDEX IF NOT EXISTS "CommunityPost_referenceType_id_idx" ON "CommunityPost"("referenceType", "referenceId");
