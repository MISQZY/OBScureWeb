'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
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
            className="flex items-center gap-2 font-heading font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            <Image src="/logo.png" alt="" width={24} height={24} className="size-6" priority />
            OBScure
          </Link>
        </div>

        <NavigationMenu className="hidden md:flex">
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

        <div className="ml-auto hidden items-center gap-1 md:flex">
          {lang && <LangSwitcher currentLang={lang} />}
          <div className="h-4 w-px bg-border mx-1" />
          <ThemeToggle />
        </div>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Toggle menu" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-3/4 sm:max-w-xs">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image src="/logo.png" alt="" width={20} height={20} className="size-5" />
                  OBScure
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-4">
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href={docsHref}
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted',
                        pathname.includes('/docs') && 'bg-muted font-semibold',
                      )}
                    />
                  }
                >
                  {nav?.documentation ?? 'Documentation'}
                </SheetClose>

                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href={templatesHref}
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted',
                        pathname.includes('/templates') && 'bg-muted font-semibold',
                      )}
                    />
                  }
                >
                  {nav?.templates ?? 'Templates'}
                </SheetClose>
              </nav>

              {lang && (
                <div className="mt-auto flex items-center justify-between border-t px-4 py-4">
                  <LangSwitcher currentLang={lang} />
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}