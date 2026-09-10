import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import type { Metadata } from 'next';
import { getDictionary, hasLocale } from './dictionaries';
import { NodeBackground } from '@/components/node-background';
import { ReleasesSection } from '@/components/releases';

export async function generateMetadata({
  params,
}: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    description: dict.home.description,
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
        
        <section className="container relative z-10 mx-auto flex flex-col items-center gap-8 px-4 pt-32 pb-16 text-center">
          {/* Subtle glow/blur backdrop behind the text to ensure readability against the moving nodes */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="w-[80vw] max-w-200 h-[50vh] bg-background/80 blur-[80px] rounded-full" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md whitespace-pre-line leading-tight">
            {dict.home.title}
          </h1>
          <p className="max-w-2xl text-lg text-foreground/80 sm:text-xl font-medium drop-shadow-sm leading-relaxed">
            {dict.home.description}
          </p>
        </section>

        {/* Releases Section (Latest Card + Previous Versions) */}
        <section className="w-full pb-32">
          <ReleasesSection lang={lang} />
        </section>
      </main>
      <SiteFooter lang={lang} footer={dict.footer} />
    </div>
  );
}