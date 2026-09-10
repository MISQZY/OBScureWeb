'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteTemplateAction } from '@/app/[lang]/admin/actions';
import type { Dictionary } from '@/app/[lang]/dictionaries';

export function DeleteTemplateButton({
  id,
  name,
  lang,
  dict,
}: {
  id: string;
  name: string;
  lang: string;
  dict: Pick<Dictionary['admin']['template'], 'delete' | 'deleteTitle' | 'deleteConfirm'>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon-sm"
      disabled={isPending}
      title={dict.deleteTitle.replace('{name}', name)}
      onClick={() => {
        if (!window.confirm(dict.deleteConfirm.replace('{name}', name))) return;
        startTransition(() => {
          void deleteTemplateAction(lang, id);
        });
      }}
    >
      <Trash2 />
      <span className="sr-only">{dict.delete}</span>
    </Button>
  );
}
