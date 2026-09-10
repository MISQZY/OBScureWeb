'use client';

import { useActionState, useMemo, useRef, useState } from 'react';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FileInput } from '@/components/ui/file-input';
import { LocalizedFields, type LocalizedFieldsHandle } from '@/components/admin/localized-fields';

const initialState: TemplateFormState = {};

/** Returns the trimmed `appVersion` string from a template export, or `null` if the file isn't parseable JSON or doesn't carry one. */
async function readAppVersionFromJsonFile(file: File): Promise<string | null> {
  try {
    const parsed = JSON.parse(await file.text());
    const version = typeof parsed?.appVersion === 'string' ? parsed.appVersion.trim() : '';
    return version || null;
  } catch {
    return null;
  }
}

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
  const [selectedVersion, setSelectedVersion] = useState(appVersion);
  const boundAction = useMemo(() => updateTemplateAction.bind(null, lang, id), [lang, id]);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [handledState, setHandledState] = useState(state);
  const localizedFieldsRef = useRef<LocalizedFieldsHandle>(null);

  // Same render-time pattern as TemplateForm's preview reset — closing the
  // dialog on success is adjusting UI state in response to the action's
  // result, not an external synchronization, so it belongs in render rather
  // than an effect (see template-form.tsx for the longer version of this note).
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setOpen(false);
  }

  // The selected version might not be in this build's fetched release list
  // (the template's existing tag, or one just parsed from a replacement
  // file, could be an older/removed one) — keep it selectable anyway so
  // opening the dialog never silently changes the version out from under it.
  const versionOptions =
    selectedVersion && !versions.includes(selectedVersion) ? [selectedVersion, ...versions] : versions;

  // This component (and its state) stays mounted for as long as the row
  // does — the dialog itself just hides/shows — so a version parsed from a
  // file picked during an edit that got cancelled would otherwise still be
  // sitting there the next time the dialog opens.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setSelectedVersion(appVersion);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" size="icon-sm" title={dict.edit} />}>
        <Pencil />
        <span className="sr-only">{dict.edit}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.editTitle}</DialogTitle>
          <DialogDescription>{dict.editDescription}</DialogDescription>
        </DialogHeader>
        <form
          action={formAction}
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            if (!localizedFieldsRef.current?.validate()) e.preventDefault();
          }}
        >
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <LocalizedFields
            ref={localizedFieldsRef}
            idPrefix={`edit-${id}`}
            nameLabel={dict.fields.name}
            descriptionLabel={dict.fields.description}
            requiredError={dict.errors.nameRequired}
            defaultName={name}
            defaultDescription={description}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-appVersion-${id}`}>{dict.fields.appVersion}</Label>
            <Select
              name="appVersion"
              value={selectedVersion}
              onValueChange={(value) => setSelectedVersion(value ?? '')}
              required
            >
              <SelectTrigger id={`edit-appVersion-${id}`}>
                <SelectValue placeholder={dict.selectVersion} />
              </SelectTrigger>
              <SelectContent>
                {versionOptions.map((version) => (
                  <SelectItem key={version} value={version}>
                    {version}
                  </SelectItem>
                ))}
              </SelectContent>
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
              onFileChange={(file) => {
                if (!file) return;
                void readAppVersionFromJsonFile(file).then((version) => {
                  if (version) setSelectedVersion(version);
                });
              }}
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
