import { execSync } from "child_process"

const DATABASE_URL =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim()

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5_000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function pushSchema(attempt: number): Promise<boolean> {
  // ── Flag priority: FORCE_RESET > ACCEPT_DATA_LOSS > safe default ───────────
  //
  // FORCE_RESET=true  → prisma db push --force-reset
  //   Drops and recreates the ENTIRE database. ALL DATA WILL BE LOST.
  //   Use once to resolve irrecoverable TIMESTAMP/TIMESTAMPTZ type-mismatch
  //   errors on CockroachDB. Remove the env var immediately after success.
  //
  // ACCEPT_DATA_LOSS=true → prisma db push --accept-data-loss
  //   Allows column drop+recreate. Less drastic — only affected columns lost.
  //
  // Neither (default) → prisma db push
  //   Safe. Fails fast if any change would lose data.

  const forceReset     = process.env.FORCE_RESET      === "true"
  const acceptDataLoss = process.env.ACCEPT_DATA_LOSS === "true"

  const flag = forceReset ? " --force-reset" : acceptDataLoss ? " --accept-data-loss" : ""

  console.log(`[setup-database] prisma db push${flag} — attempt ${attempt}/${MAX_RETRIES}`)

  try {
    execSync(`npx prisma db push${flag}`, {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL },
    })
    return true
  } catch {
    return false
  }
}

async function main() {
  if (process.env.SKIP_DB_PUSH === "true") {
    console.log("[setup-database] SKIP_DB_PUSH=true — skipping schema push.")
    process.exit(0)
  }

  console.log("[setup-database] Starting database schema sync...")

  if (!DATABASE_URL) {
    console.error(
      "[setup-database] ❌ No database URL found.\n" +
      "  Set DATABASE_URL (or POSTGRES_URL / POSTGRES_PRISMA_URL) in Vercel env vars.\n" +
      "  To skip this step set SKIP_DB_PUSH=true."
    )
    process.exit(1)
  }

  const maskedUrl = DATABASE_URL.replace(/:([^@]+)@/, ":****@")
  console.log(`[setup-database] Using DB: ${maskedUrl}`)

  if (process.env.FORCE_RESET === "true") {
    console.warn(
      "[setup-database] ⚠️  FORCE_RESET=true — the database will be DROPPED and recreated.\n" +
      "  ‼️  ALL DATA WILL BE LOST.\n" +
      "  Remove FORCE_RESET from Vercel env vars after this deployment succeeds."
    )
  } else if (process.env.ACCEPT_DATA_LOSS === "true") {
    console.warn("[setup-database] ⚠️  ACCEPT_DATA_LOSS=true — destructive column changes allowed.")
  } else {
    console.warn(
      "[setup-database] ⚠️  Running without --accept-data-loss (safe default).\n" +
      "  If push fails due to destructive changes, set in Vercel env vars:\n" +
      "    • FORCE_RESET=true       — drops entire DB (all data lost), use once then remove\n" +
      "    • ACCEPT_DATA_LOSS=true  — allows column-level drop+recreate only\n" +
      "    • SKIP_DB_PUSH=true      — skip entirely and manage schema manually"
    )
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const ok = await pushSchema(attempt)
    if (ok) {
      console.log("[setup-database] ✅ Schema push successful!")
      if (process.env.FORCE_RESET === "true") {
        console.warn("[setup-database] 🔔 Reminder: remove FORCE_RESET=true from Vercel env vars now.")
      }
      process.exit(0)
    }

    if (attempt < MAX_RETRIES) {
      console.log(
        `[setup-database] ⚠️  Attempt ${attempt} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`
      )
      await sleep(RETRY_DELAY_MS)
    }
  }

  console.error(
    `[setup-database] ❌ Schema push failed after ${MAX_RETRIES} attempts.\n` +
    "  To fix, set ONE of these in Vercel Environment Variables:\n" +
    "    1. FORCE_RESET=true       — drops ALL data, redeploy once, then remove\n" +
    "    2. ACCEPT_DATA_LOSS=true  — column-level data loss only\n" +
    "    3. SKIP_DB_PUSH=true      — skip push, manage schema manually\n" +
    "  Or run scripts/init-database.sql in your CockroachDB SQL editor."
  )
  process.exit(1)
}

main()
