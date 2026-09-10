import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { listTemplates, pickLocalized } from '@/lib/templates/store';
import { fetchAvailableAppVersions } from '@/lib/app-version';
import { logoutAction } from '@/app/[lang]/admin/actions';
import { hasLocale, getDictionary } from '@/app/[lang]/dictionaries';
import { TemplateForm } from '@/components/admin/template-form';
import { EditTemplateDialog } from '@/components/admin/edit-template-dialog';
import { DeleteTemplateButton } from '@/components/admin/delete-template-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    title: dict.admin.template.heading,
    robots: { index: false, follow: false },
  };
}

export default async function AdminTemplatePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  await requireAdmin(lang);
  const [templates, dict, versions] = await Promise.all([
    listTemplates(),
    getDictionary(lang).then((d) => d.admin.template),
    fetchAvailableAppVersions(),
  ]);

  return (
    <div className="container mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{dict.heading}</h1>
        <form action={logoutAction.bind(null, lang)}>
          <Button type="submit" variant="outline" size="sm">
            {dict.signOut}
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <TemplateForm lang={lang} dict={dict} versions={versions} />

        <Card>
          <CardHeader>
            <CardTitle>{dict.existing.replace('{count}', String(templates.length))}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {templates.length === 0 && <p className="text-sm text-muted-foreground">{dict.empty}</p>}
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/templates/${template.id}/preview`}
                    alt=""
                    className="h-12 w-20 shrink-0 rounded-md object-cover ring-1 ring-foreground/10"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{pickLocalized(template.name, lang)}</p>
                    <Badge variant="secondary" className="mt-1">
                      v{template.appVersion}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <EditTemplateDialog
                    id={template.id}
                    name={template.name}
                    description={template.description}
                    appVersion={template.appVersion}
                    lang={lang}
                    dict={dict}
                    versions={versions}
                  />
                  <DeleteTemplateButton
                    id={template.id}
                    name={pickLocalized(template.name, lang)}
                    lang={lang}
                    dict={dict}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
