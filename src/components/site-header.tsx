'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { LangSwitcher } from '@/components/lang-switcher';
import type { Locale } from '@/app/[lang]/dictionaries';

interface NavDict {
  documentation: string;
  templates: string;
}

interface SiteHeaderProps {
  lang?: Locale;
  nav?: NavDict;
}

export function SiteHeader({ lang, nav }: SiteHeaderProps) {
  const pathname = usePathname();

  const docsHref = lang ? `/${lang}/docs` : '/docs';
  const templatesHref = lang ? `/${lang}/templates` : '/templates';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-6 flex items-center">
          <Link
            href={lang ? `/${lang}` : '/'}
            className="font-heading font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            OBScure
          </Link>
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                href={docsHref}
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname.includes('/docs') && 'bg-muted font-semibold',
                )}
              >
                {nav?.documentation ?? 'Documentation'}
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                href={templatesHref}
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname.includes('/templates') && 'bg-muted font-semibold',
                )}
              >
                {nav?.templates ?? 'Templates'}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-1">
          {lang && <LangSwitcher currentLang={lang} />}
          <div className="h-4 w-px bg-border mx-1" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}