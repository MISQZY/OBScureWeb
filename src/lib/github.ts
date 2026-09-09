/**
 * Single source of truth for "which GitHub repo" — every URL below is built
 * from this instead of being separately hardcoded per call site. Update
 * here if the repo is ever renamed/moved and every consumer follows.
 */
export const GITHUB_OWNER = 'MISQZY';
export const GITHUB_REPO_NAME = 'OBScure';
export const GITHUB_REPO = `${GITHUB_OWNER}/${GITHUB_REPO_NAME}`;

export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;
export const GITHUB_RELEASES_URL = `${GITHUB_REPO_URL}/releases`;

const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`;

export interface GithubReleaseAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
}

export interface GithubRelease {
  id: number;
  name: string;
  tag_name: string;
  published_at: string;
  html_url: string;
  body: string;
  assets: GithubReleaseAsset[];
}

/**
 * Every release, newest first — the one fetch every consumer (the homepage's
 * release list, the docs freshness badge) shares, so there's exactly one
 * place hitting GitHub's API instead of each caller repeating its own fetch.
 * `next: { revalidate }` makes this an ISR fetch: Next's Data Cache serves
 * this same URL to every caller across every route and only re-hits GitHub
 * once the cache is older than that many seconds — so this never blocks a
 * page on GitHub per-visitor, and a new release shows up on its own within
 * the hour, no redeploy needed.
 */
export async function fetchReleases(): Promise<GithubRelease[]> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/releases`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return (await res.json()) as GithubRelease[];
  } catch {
    return [];
  }
}

/** The newest published release, or null if the API is unreachable or the repo has none. */
export async function fetchLatestRelease(): Promise<GithubRelease | null> {
  const releases = await fetchReleases();
  return releases[0] ?? null;
}

/**
 * Noise a commit-based changelog shouldn't repeat back to the user: the
 * release's own version-bump commit and merge commits. Matches both
 * "chore: bump version to X.Y.Z" (current convention) and the earlier
 * "chore: bump to X.Y.Z" — mirrors BUMP_COMMIT_RE in the OBScure app's own
 * src/main/whatsNew.ts.
 */
const BUMP_COMMIT_RE = /^chore:\s*bump(?:\s+version)?\s+to\s+\d/i;

interface GithubCompare {
  commits: { commit: { message: string } }[];
}

/**
 * Commit subjects (first line of each commit message) between two tags, in
 * the order GitHub returns them (oldest first). This repo pushes straight to
 * main instead of going through PRs, so a release's own `body` is never the
 * real changelog here — the automation that cuts a release only ever fills
 * it with a bare "Full Changelog: .../compare/vX...vY" link — these commit
 * subjects are. Mirrors commitSubjectsBetween in the OBScure app's own
 * src/main/whatsNew.ts, so the website shows the exact same notes the app's
 * own "What's new" dialog does.
 */
export async function fetchCommitSubjectsBetween(base: string, head: string): Promise<string[]> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/compare/${base}...${head}`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as GithubCompare;
    return data.commits
      .map((commit) => commit.commit.message.split('\n')[0].trim())
      .filter((subject) => subject && !subject.startsWith('Merge ') && !BUMP_COMMIT_RE.test(subject));
  } catch {
    return [];
  }
}

export interface GithubReleaseWithNotes extends GithubRelease {
  /** Commit-subject changelog since the previous release — see fetchCommitSubjectsBetween. Empty for the oldest release fetched (nothing to diff against) or if the compare call failed. */
  notes: string[];
}

/**
 * `fetchReleases()` plus each release's own real changelog — kept as a
 * separate call (not folded into `fetchReleases()` itself) since it costs
 * one extra GitHub API request per release: `fetchLatestRelease()`/the docs
 * version badge only ever need a bare tag name and shouldn't pay for that,
 * only the homepage's full release list does.
 */
export async function fetchReleasesWithNotes(): Promise<GithubReleaseWithNotes[]> {
  const releases = await fetchReleases();
  return Promise.all(
    releases.map(async (release, index) => {
      // GitHub returns releases newest-first, so the next item is always the
      // tag immediately before this one — exactly the base a per-release
      // commit diff needs.
      const previousTag = releases[index + 1]?.tag_name;
      const notes = previousTag ? await fetchCommitSubjectsBetween(previousTag, release.tag_name) : [];
      return { ...release, notes };
    }),
  );
}
