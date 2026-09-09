import { Download, Archive } from 'lucide-react';
import { GithubIcon as Github } from '@/components/github-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getDictionary } from '@/app/[lang]/dictionaries';
import type { Locale } from '@/app/[lang]/dictionaries';
import { ChangelogDialog } from '@/components/changelog-dialog';
import { fetchReleasesWithNotes, type GithubReleaseAsset } from '@/lib/github';

export async function ReleasesSection({ lang }: { lang: Locale }) {
  const dict = await getDictionary(lang);
  const releases = await fetchReleasesWithNotes();

  if (!releases || releases.length === 0) return null;

  const latest = releases[0];
  const previous = releases.slice(1);

  const getInstallerUrl = (assets: GithubReleaseAsset[]) => {
    return assets.find(a => a.name.includes('installer') || a.name.endsWith('.exe') && !a.name.includes('portable'))?.browser_download_url;
  };

  const getPortableUrl = (assets: GithubReleaseAsset[]) => {
    return assets.find(a => a.name.includes('portable'))?.browser_download_url;
  };

  const latestInstaller = getInstallerUrl(latest.assets);
  const latestPortable = getPortableUrl(latest.assets);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-12 py-12 px-4 relative z-10">
      <Card className="relative w-full bg-background/60 backdrop-blur-md border-border/50 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <Badge variant="default" className="mb-2 bg-primary/20 text-primary hover:bg-primary/30">{dict.home.latestVersion}</Badge>
              <CardTitle className="text-3xl font-bold">{latest.name || latest.tag_name}</CardTitle>
              <CardDescription className="text-base mt-1">
                {new Date(latest.published_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ChangelogDialog 
                version={latest.tag_name} 
                notes={latest.notes} 
                buttonText={dict.home.viewChangelog}
                titleText={dict.home.changelogTitle}
                emptyText={dict.home.noReleaseNotes}
              />
              <Link href={latest.html_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
                  {dict.home.viewOnGithub}
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mt-2 max-w-2xl">
            {lang === 'ru' 
              ? 'Новая версия OBScure доступна для скачивания. Выберите подходящий формат для вашей системы.'
              : 'A new version of OBScure is available to download. Choose the format that suits your system.'}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-4 pt-6 border-t border-border/40 bg-muted/20">
          {latestInstaller && (
            <Link href={latestInstaller}>
              <Button size="lg" className="gap-2 font-semibold shadow-lg">
                <Download className="w-5 h-5" />
                {dict.home.downloadInstaller}
              </Button>
            </Link>
          )}
          {latestPortable && (
            <Link href={latestPortable}>
              <Button size="lg" variant="secondary" className="gap-2 shadow-md">
                <Archive className="w-5 h-5" />
                {dict.home.downloadPortable}
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      {previous.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold tracking-tight px-2">{dict.home.previousVersions}</h3>
          <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-border/50 flex flex-col overflow-hidden max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border">
            {previous.map((release, i) => (
              <div 
                key={release.id} 
                className={`flex items-center justify-between flex-wrap gap-4 p-4 hover:bg-muted/30 transition-colors ${i !== previous.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{release.name || release.tag_name}</span>
                    <Badge variant="outline" className="text-xs font-normal">
                      {new Date(release.published_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <ChangelogDialog 
                    version={release.tag_name} 
                    notes={release.notes} 
                    buttonText={dict.home.viewChangelog}
                    titleText={dict.home.changelogTitle}
                    emptyText={dict.home.noReleaseNotes}
                  />
                  {getInstallerUrl(release.assets) && (
                    <Link href={getInstallerUrl(release.assets)!}>
                      <Button variant="ghost" size="sm" className="gap-2 h-8">
                        <Download className="w-4 h-4" />
                        Installer
                      </Button>
                    </Link>
                  )}
                  {getPortableUrl(release.assets) && (
                    <Link href={getPortableUrl(release.assets)!}>
                      <Button variant="ghost" size="sm" className="gap-2 h-8">
                        <Archive className="w-4 h-4" />
                        Portable
                      </Button>
                    </Link>
                  )}
                  <Link href={release.html_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" title="GitHub">
                      <Github className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}