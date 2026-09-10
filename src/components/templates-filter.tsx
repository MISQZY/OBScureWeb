'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';

export function TemplatesFilter({ onlyCurrent, label }: { onlyCurrent: boolean; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) params.set('onlyCurrent', '1');
    else params.delete('onlyCurrent');
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <Checkbox checked={onlyCurrent} onCheckedChange={handleChange} />
      {label}
    </label>
  );
}
