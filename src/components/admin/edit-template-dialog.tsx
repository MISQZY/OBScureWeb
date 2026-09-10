'use client';

import { useActionState, useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { updateTemplateAction, type TemplateFormState } from '@/app/[lang]/admin/actions';
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { FileInput } from '@/components/ui/file-input';
import { LocalizedFields } from '@/components/admin/localized-fields';

const initialState: TemplateFormState = {};

export function EditTemplateDialog({
  id,
  name,
  description,
  appVersion,
  lang,
  dict,
  versions,
}: {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  appVersion: string;
  lang: string;
  dict: Dictionary['admin']['template'];
  versions: string[];
}) {
  const [open, setOpen] = useState(false);
  const boundAction = useMemo(() => updateTemplateAction.bind(null, lang, id), [lang, id]);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [handledState, setHandledState] = useState(state);

  // Same render-time pattern as TemplateForm's preview reset — closing the
  // dialog on success is adjusting UI state in response to the action's
  // result, not an external synchronization, so it belongs in render rather
  // than an effect (see template-form.tsx for the longer version of this note).
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setOpen(false);
  }

  // The template's own current version might not be in this build's fetched
  // release list (an older/removed tag) — keep it selectable anyway so
  // opening the dialog never silently changes the version out from under it.
  const versionOptions = versions.includes(appVersion) ? versions : [appVersion, ...versions];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="icon-sm" title={dict.edit} />}>
        <Pencil />
        <span className="sr-only">{dict.edit}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.editTitle}</DialogTitle>
          <DialogDescription>{dict.editDescription}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <LocalizedFields
            idPrefix={`edit-${id}`}
            nameLabel={dict.fields.name}
            descriptionLabel={dict.fields.description}
            defaultName={name}
            defaultDescription={description}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-appVersion-${id}`}>{dict.fields.appVersion}</Label>
            <Select id={`edit-appVersion-${id}`} name="appVersion" defaultValue={appVersion} required>
              {versionOptions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-jsonFile-${id}`}>{dict.fields.jsonFile}</Label>
            <FileInput
              id={`edit-jsonFile-${id}`}
              name="jsonFile"
              accept="application/json"
              chooseLabel={dict.chooseFile}
              placeholder={dict.keepCurrentFile}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-previewFile-${id}`}>{dict.fields.previewFile}</Label>
            <FileInput
              id={`edit-previewFile-${id}`}
              name="previewFile"
              accept="image/*"
              chooseLabel={dict.chooseFile}
              placeholder={dict.keepCurrentFile}
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>{dict.cancel}</DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? dict.submitting : dict.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
