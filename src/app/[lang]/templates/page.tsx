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
import { listTemplates, pickLocalized } from '@/lib/templates/store';
import { fetchLatestAppVersion, compareVersions } from '@/lib/app-version';

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

export default async function TemplatesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const [templates, latestVersion] = await Promise.all([listTemplates(), fetchLatestAppVersion()]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="mx-auto mb-10 flex max-w-xl flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{dict.templates.title}</h1>
          <p className="text-muted-foreground">{dict.templates.description}</p>
        </div>

        {templates.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{dict.templates.empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const outdated = compareVersions(latestVersion, template.appVersion) > 0;
              const name = pickLocalized(template.name, lang);
              const description = pickLocalized(template.description, lang);
              return (
                <Card key={template.id} className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/templates/${template.id}/preview`}
                    alt={name}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                  <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Badge variant={outdated ? 'outline' : 'secondary'} className="w-fit">
                      {dict.templates.forVersion.replace('{version}', template.appVersion)}
                    </Badge>
                    {outdated && <p className="text-xs text-muted-foreground">{dict.templates.outdatedHint}</p>}
                  </CardContent>
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
      </main>
      <SiteFooter lang={lang as Locale} footer={dict.footer} />
    </div>
  );
}
