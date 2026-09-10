'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { SortValue } from '@/lib/templates/sort';

export function TemplatesSort({
  sort,
  dict,
}: {
  sort: SortValue;
  dict: { label: string; newest: string; versionDesc: string; versionAsc: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'newest') params.delete('sort');
    else params.set('sort', value);
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  };

  const labels: Record<SortValue, string> = {
    newest: dict.newest,
    'version-desc': dict.versionDesc,
    'version-asc': dict.versionAsc,
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="templates-sort" className="text-muted-foreground">
        {dict.label}
      </Label>
      <Select value={sort} onValueChange={handleChange}>
        <SelectTrigger id="templates-sort" size="sm" className="w-auto">
          {/* Without this, Select.Value shows the raw value (e.g. "version-desc") until its SelectItem registers client-side, since it can't know the label any earlier. */}
          <SelectValue>{(value: SortValue) => labels[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{dict.newest}</SelectItem>
          <SelectItem value="version-desc">{dict.versionDesc}</SelectItem>
          <SelectItem value="version-asc">{dict.versionAsc}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
