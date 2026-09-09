import { CircleAlert, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchLatestAppVersion, compareVersions } from '@/lib/app-version';
import type { Locale } from '@/app/[lang]/dictionaries';

const STRINGS: Record<Locale, { current: (v: string) => string; outdated: (v: string, c: string) => string }> = {
  en: {
    current: (v) => `Verified for OBScure v${v}`,
    outdated: (v, c) => `Written for OBScure v${v} — current release is v${c}. Some details may be out of date.`,
  },
  ru: {
    current: (v) => `Актуально для OBScure v${v}`,
    outdated: (v, c) => `Написано для OBScure v${v} — текущий релиз v${c}. Часть информации может быть устаревшей.`,
  },
};

export async function VersionBadge({ version, lang }: { version: string; lang: Locale }) {
  const currentVersion = await fetchLatestAppVersion();
  const isOutdated = compareVersions(version, currentVersion) < 0;
  const t = STRINGS[lang] ?? STRINGS.en;

  return (
    <div
      className={cn(
        'mb-6 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs',
        isOutdated
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
          : 'border-border bg-muted/50 text-muted-foreground',
      )}
    >
      {isOutdated ? <CircleAlert className="size-3.5 shrink-0" /> : <CircleCheck className="size-3.5 shrink-0" />}
      <span>{isOutdated ? t.outdated(version, currentVersion) : t.current(version)}</span>
    </div>
  );
}
