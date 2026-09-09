import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { getDictionary, hasLocale } from './dictionaries';
import { NodeBackground } from '@/components/node-background';

export async function generateMetadata({
  params,
}: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'ru' ? 'OBScure — Документация' : 'OBScure Documentation',
    description:
      lang === 'ru'
        ? 'Документация для Electron-приложения OBScure.'
        : 'Documentation for the OBScure Electron application.',
  };
}

export default async function LocalizedHomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader lang={lang} nav={dict.nav} />
      <main className="flex-1 relative">
        <NodeBackground />
        <section className="container mx-auto flex flex-col items-center gap-6 px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {dict.home.title}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {dict.home.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${lang}/docs`} className={cn(buttonVariants({ size: 'lg' }))}>
              {dict.home.getStarted}
            </Link>
            <span
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'pointer-events-none opacity-60',
              )}
            >
              {dict.home.templates}
              <Badge variant="secondary" className="ml-2">
                {dict.home.comingSoon}
              </Badge>
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}