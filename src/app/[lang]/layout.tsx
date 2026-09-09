import { I18nProvider } from 'fumadocs-ui/contexts/i18n';
import { locales } from './dictionaries';
import { i18nUI } from '@/lib/i18n';

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: { children: React.ReactNode, params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  return (
    <I18nProvider {...i18nUI.provider(lang)}>
      {children}
    </I18nProvider>
  );
}