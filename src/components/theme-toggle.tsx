'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme);
        });
      });
    } else {
      setTheme(newTheme);
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={cn("w-8 px-0", className)} aria-label="Toggle theme" {...props} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("w-8 px-0", className)}
      onClick={() => handleThemeChange(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      {...props}
    >
      {isDark ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  );
}

/**
 * Adapter for fumadocs' `DocsLayout` `slots.themeSwitch` — that slot expects
 * a component shaped like `ComponentProps<'div'>` (className/mode), not our
 * button-shaped `ThemeToggle`. Needs its own named export from this 'use
 * client' module (not an inline arrow function in the server-rendered
 * layout) since a Server Component can only pass a Client Component
 * *reference* across the boundary, never a freshly-created closure.
 */
export function DocsThemeSwitch({ className }: React.ComponentProps<'div'>) {
  return <ThemeToggle className={className} />;
}