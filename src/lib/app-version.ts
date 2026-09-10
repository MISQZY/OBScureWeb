import { fetchLatestRelease } from '@/lib/github';

/**
 * Used only if the GitHub API is unreachable at request time (rate-limited,
 * offline build, GitHub outage) — the last release known to be correct as of
 * when this file was last touched, so the badge degrades to "probably still
 * right" instead of breaking.
 */
const FALLBACK_APP_VERSION = '0.6.0';

/**
 * The current released OBScure app version — the same "newest release" data
 * the homepage's release list already fetches (see lib/github.ts), reduced
 * to a bare version string. Every docs page's own `appVersion` frontmatter
 * is compared against this to render the freshness badge (see
 * components/docs/version-badge.tsx).
 */
export async function fetchLatestAppVersion(): Promise<string> {
  const latest = await fetchLatestRelease();
  if (!latest) return FALLBACK_APP_VERSION;
  // Release tags are typically "v0.5.1" — strip the leading "v" so this
  // matches the bare "0.5.1" shape every page's own appVersion uses.
  return latest.tag_name.trim().replace(/^v/i, '') || FALLBACK_APP_VERSION;
}

/**
 * Compares two `major.minor.patch`-shaped version strings. Returns -1, 0, or
 * 1, same convention as Array#sort — good enough for the badge's own
 * older/equal/newer check without pulling in a full semver dependency.
 * Missing/non-numeric parts count as 0, and a metadata suffix (`-beta.1`) is
 * ignored entirely for the comparison.
 */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string): number[] =>
    v
      .split('-')[0]
      .split('.')
      .map((part) => Number.parseInt(part, 10) || 0);
  const [aParts, bParts] = [parse(a), parse(b)];
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}
