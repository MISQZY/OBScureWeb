import Link from 'next/link';
import { Download } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { Metadata } from 'next';
import { getDictionary } from '@/app/[lang]/dictionaries';
import type { Locale } from '@/app/[lang]/dictionaries';
import { listTemplates, pickLocalized, type TemplateRecord } from '@/lib/templates/store';
import { fetchLatestAppVersion, compareVersions } from '@/lib/app-version';
import { cn } from '@/lib/utils';
import { TemplatesSort } from '@/components/templates-sort';
import { TemplatesFilter } from '@/components/templates-filter';
import { isSortValue, type SortValue } from '@/lib/templates/sort';

function sortTemplates(templates: TemplateRecord[], sort: SortValue): TemplateRecord[] {
  if (sort === 'newest') return templates;
  const sorted = [...templates].sort((a, b) => compareVersions(a.appVersion, b.appVersion));
  return sort === 'version-desc' ? sorted.reverse() : sorted;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    title: dict.templates.title,
    description: dict.templates.description,
  };
}

export default async function TemplatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ sort?: string; onlyCurrent?: string }>;
}) {
  const { lang } = await params;
  const { sort: sortParam, onlyCurrent: onlyCurrentParam } = await searchParams;
  const sort: SortValue = isSortValue(sortParam ?? null) ? (sortParam as SortValue) : 'newest';
  const onlyCurrent = onlyCurrentParam === '1';
  const dict = await getDictionary(lang);
  const [allTemplates, latestVersion] = await Promise.all([listTemplates(), fetchLatestAppVersion()]);
  const isOutdated = (template: TemplateRecord) => compareVersions(latestVersion, template.appVersion) > 0;
  const filtered = onlyCurrent ? allTemplates.filter((template) => !isOutdated(template)) : allTemplates;
  const templates = sortTemplates(filtered, sort);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="mx-auto mb-10 flex max-w-xl flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{dict.templates.title}</h1>
          <p className="text-muted-foreground">{dict.templates.description}</p>
        </div>

        {allTemplates.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{dict.templates.empty}</p>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <TemplatesFilter onlyCurrent={onlyCurrent} label={dict.templates.onlyCurrent} />
              <TemplatesSort sort={sort} dict={dict.templates.sort} />
            </div>
            {templates.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">{dict.templates.noMatches}</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => {
                  const outdated = isOutdated(template);
                  const name = pickLocalized(template.name, lang);
                  const description = pickLocalized(template.description, lang);
                  return (
                    <Card key={template.id} className="relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/templates/${template.id}/preview`}
                        alt={name}
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                      <Badge
                        className={cn(
                          'absolute top-2 right-2 z-10 border-white/20 bg-black/60 text-white backdrop-blur-sm',
                          outdated && 'border-amber-400/40 text-amber-300',
                        )}
                      >
                        v{template.appVersion}
                      </Badge>
                      <CardHeader>
                        <CardTitle>{name}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                      </CardHeader>
                      {outdated && (
                        <CardContent>
                          <p className="text-xs text-muted-foreground">{dict.templates.outdatedHint}</p>
                        </CardContent>
                      )}
                      <CardFooter>
                        <Link href={`/api/templates/${template.id}/file`} className="w-full">
                          <Button className="w-full gap-2">
                            <Download className="size-4" />
                            {dict.templates.download}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter lang={lang as Locale} footer={dict.footer} />
    </div>
  );
}
