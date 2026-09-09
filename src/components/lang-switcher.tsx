'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/app/[lang]/dictionaries';

interface LangSwitcherProps {
  currentLang: Locale;
}

export function LangSwitcher({ currentLang }: LangSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = () => {
    const nextLang: Locale = currentLang === 'en' ? 'ru' : 'en';
    const newPath = pathname.replace(new RegExp('^/' + currentLang), '/' + nextLang);
    router.push(newPath);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleSwitch} aria-label="Switch language">
      {currentLang === 'en' ? 'EN' : 'RU'}
    </Button>
  );
}