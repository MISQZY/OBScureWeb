import { notFound } from 'next/navigation';

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
  ru: () => import('@/dictionaries/ru.json').then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;
export const locales: Locale[] = ['en', 'ru'];

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: string) => {
  if (!hasLocale(locale)) notFound();
  return dictionaries[locale]();
};