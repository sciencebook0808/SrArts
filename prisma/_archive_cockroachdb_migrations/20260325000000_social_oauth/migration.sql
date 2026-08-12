-- Migration: 20260325000000_social_oauth
-- Creates SocialAccount table with Clerk OAuth integration and fetch tracking.
--
-- IDEMPOTENT:  IF NOT EXISTS guards on all statements — safe to re-run.
-- COCKROACHDB: Uses STRING columns + CHECK constraints for enum emulation.
--              Separate ALTER TABLE statements (CockroachDB requirement).
--              Uses gen_random_uuid() for PK default (built-in CockroachDB function).

-- ─── 1. SocialAccount ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SocialAccount" (
  "id"              STRING        NOT NULL DEFAULT gen_random_uuid()::STRING,
  "profileId"       STRING        NOT NULL DEFAULT 'artist_profile',
  "platform"        STRING        NOT NULL,
  "username"        STRING        NOT NULL,

  -- API-fetched (updated by cron job daily)
  "followers"       INT8,
  "posts"           INT8,
  "avatarUrl"       STRING,
  "displayName"     STRING,

  -- Manual override (admin-only, NEVER touched by cron)
  "manualFollowers" INT8,
  "manualPosts"     INT8,
  "useManual"       BOOL    NOT NULL DEFAULT false,

  -- Clerk OAuth (admin connects their own social accounts)
  "clerkUserId"     STRING,
  "clerkProvider"   STRING,
  "oauthConnected"  BOOL    NOT NULL DEFAULT false,

  -- Fetch tracking (admin dashboard metrics)
  "lastFetchMethod" STRING,
  "lastFetchError"  STRING,
  "fetchStatus"     STRING  NOT NULL DEFAULT 'pending',

  "lastFetchedAt"   TIMESTAMPTZ,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SocialAccount_platform_check" CHECK (
    "platform" IN ('INSTAGRAM','YOUTUBE','TWITTER','FACEBOOK')
  ),
  CONSTRAINT "SocialAccount_fetchStatus_check" CHECK (
    "fetchStatus" IN ('pending','success','failed','manual')
  )
);

-- ─── 2. Unique & performance indexes ─────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "SocialAccount_profileId_platform_username_key"
  ON "SocialAccount" ("profileId", "platform", "username");

CREATE INDEX IF NOT EXISTS "SocialAccount_profileId_idx"
  ON "SocialAccount" ("profileId");

CREATE INDEX IF NOT EXISTS "SocialAccount_platform_idx"
  ON "SocialAccount" ("platform");

CREATE INDEX IF NOT EXISTS "SocialAccount_fetchStatus_idx"
  ON "SocialAccount" ("fetchStatus");
