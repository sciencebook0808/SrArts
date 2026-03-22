/**
 * lib/types.ts — Shared type definitions and JSON parsing utilities
 *
 * Centralised types used across app/, components/, and lib/.
 * All Prisma JSON field parsing happens here via safe type guards.
 */

// ─── JSON primitive types ─────────────────────────────────────────────────────

export type JsonPrimitive = string | number | boolean | null;
export type JsonObject    = { [key: string]: JsonValue };
export type JsonArray     = JsonValue[];
export type JsonValue     = JsonPrimitive | JsonObject | JsonArray;

// ─── Profile JSON sub-structures ─────────────────────────────────────────────

export interface ExperienceEntry {
  id:          string;
  year:        string;
  title:       string;
  role:        string;
  description: string;
}

export interface AchievementEntry {
  id:          string;
  year:        string;
  title:       string;
  description: string;
}

// ─── Type guards ──────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Safely parse a Prisma Json field (which Prisma types as `Prisma.JsonValue`)
 * into a typed `ExperienceEntry[]`. Never throws. Falls back to [].
 */
export function parseExperience(raw: unknown): ExperienceEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map(item => ({
      id:          String(item['id']          ?? ''),
      year:        String(item['year']         ?? ''),
      title:       String(item['title']        ?? ''),
      role:        String(item['role']         ?? ''),
      description: String(item['description'] ?? ''),
    }));
}

/**
 * Safely parse a Prisma Json field into a typed `AchievementEntry[]`.
 * Never throws. Falls back to [].
 */
export function parseAchievements(raw: unknown): AchievementEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map(item => ({
      id:          String(item['id']          ?? ''),
      year:        String(item['year']         ?? ''),
      title:       String(item['title']        ?? ''),
      description: String(item['description'] ?? ''),
    }));
}

// ─── API response helpers ─────────────────────────────────────────────────────

/** Safely cast a fetch().json() response; the caller must validate fields. */
export async function fetchJson<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  return res.json() as Promise<T>;
}

// ─── Stat display type (About + Hero sections) ────────────────────────────────

export interface DisplayStat {
  label: string;
  value: string;
}
