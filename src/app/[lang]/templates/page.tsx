import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';
import { getDictionary } from '@/app/[lang]/dictionaries';
import type { Locale } from '@/app/[lang]/dictionaries';

export const metadata: Metadata = {
  title: 'Templates',
  description: 'Ready-made configuration templates for OBScure — coming soon.',
};

export default async function TemplatesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader lang={lang as Locale} nav={dict.nav} />
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <Badge variant="secondary" className="text-sm">
          {dict.home.comingSoon}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">{dict.nav.templates}</h1>
        <p className="max-w-md text-muted-foreground">
          Ready-made configuration templates for OBScure are on their way.
          Check back soon.
        </p>
      </main>
    </div>
  );
}