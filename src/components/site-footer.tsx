import Link from 'next/link';
import { GithubIcon as Github } from '@/components/github-icon';
import { GITHUB_REPO_URL } from '@/lib/github';
import type { Locale } from '@/app/[lang]/dictionaries';

interface FooterDict {
  documentation: string;
  templates: string;
  github: string;
  tagline: string;
}

interface SiteFooterProps {
  lang?: Locale;
  footer?: FooterDict;
}

export function SiteFooter({ lang, footer }: SiteFooterProps) {
  const docsHref = lang ? `/${lang}/docs` : '/docs';
  const templatesHref = lang ? `/${lang}/templates` : '/templates';
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-heading font-bold text-lg tracking-tight">OBScure</span>
          <p className="text-sm text-muted-foreground">
            {footer?.tagline ?? 'A powerful control panel for streamers.'}
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href={docsHref} className="hover:text-foreground transition-colors">
            {footer?.documentation ?? 'Documentation'}
          </Link>
          <Link href={templatesHref} className="hover:text-foreground transition-colors">
            {footer?.templates ?? 'Templates'}
          </Link>
          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="size-4" />
            {footer?.github ?? 'GitHub'}
          </Link>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-4 text-center text-xs text-muted-foreground">
        © {year} OBScure
      </div>
    </footer>
  );
}
