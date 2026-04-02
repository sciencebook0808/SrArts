-- Migration: social_profile_enrichment
-- Adds enriched profile fields to SocialAccount:
--   following    INT4        — following/friends count
--   bio          STRING      — profile biography / description
--   category     STRING      — platform category (e.g. "Artist", "Public Figure")
--   externalUrl  STRING      — external website link from profile
--   profileUrl   STRING      — full URL to the social media profile page
--
-- All new columns are nullable so existing rows are unaffected.
-- These fields are populated by the cron/manual sync on next run.

ALTER TABLE "SocialAccount" ADD COLUMN IF NOT EXISTS "following"    INT4;
ALTER TABLE "SocialAccount" ADD COLUMN IF NOT EXISTS "bio"          STRING;
ALTER TABLE "SocialAccount" ADD COLUMN IF NOT EXISTS "category"     STRING;
ALTER TABLE "SocialAccount" ADD COLUMN IF NOT EXISTS "externalUrl"  STRING;
ALTER TABLE "SocialAccount" ADD COLUMN IF NOT EXISTS "profileUrl"   STRING;
