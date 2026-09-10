import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { hasValidSession } from '@/lib/auth/session';
import { loginAction } from '@/app/[lang]/admin/actions';
import { hasLocale, getDictionary } from '@/app/[lang]/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  if (await hasValidSession()) redirect(`/${lang}/admin/template`);
  const { error } = await searchParams;
  const dict = (await getDictionary(lang)).admin.login;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{dict.title}</CardTitle>
          <CardDescription>{dict.description}</CardDescription>
        </CardHeader>
        <form action={loginAction.bind(null, lang)}>
          <CardContent className="flex flex-col gap-4">
            {error && <p className="text-sm text-destructive">{dict.invalidCredentials}</p>}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">{dict.username}</Label>
              <Input id="username" name="username" autoComplete="username" required autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{dict.password}</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              {dict.submit}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
