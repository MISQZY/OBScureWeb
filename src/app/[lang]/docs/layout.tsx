import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { hasLocale } from '../dictionaries';
import { DocsThemeSwitch } from '@/components/theme-toggle';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <DocsLayout
      tree={source.pageTree[lang]}
      nav={{
        enabled: false,
        title: <span className="font-heading font-bold text-xl tracking-tight">OBScure</span>,
        url: `/${lang}`,
      }}
      slots={{ themeSwitch: DocsThemeSwitch }}
    >
      {children}
    </DocsLayout>
  );
}
