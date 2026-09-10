'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { createTemplateAction, type TemplateFormState } from '@/app/[lang]/admin/actions';
import type { Dictionary } from '@/app/[lang]/dictionaries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FileInput } from '@/components/ui/file-input';
import { LocalizedFields, type LocalizedFieldsHandle } from '@/components/admin/localized-fields';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

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

export function TemplateForm({
  lang,
  dict,
  versions,
}: {
  lang: string;
  dict: Dictionary['admin']['template'];
  versions: string[];
}) {
  const boundCreateTemplateAction = useMemo(() => createTemplateAction.bind(null, lang), [lang]);
  const [state, formAction, isPending] = useActionState(boundCreateTemplateAction, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const localizedFieldsRef = useRef<LocalizedFieldsHandle>(null);
  const [handledState, setHandledState] = useState(state);

  // The template's exported version might not be one of this build's known
  // releases (an older/removed tag) — keep it selectable anyway, same
  // reasoning as EditTemplateDialog's own versionOptions.
  const versionOptions =
    selectedVersion && !versions.includes(selectedVersion) ? [selectedVersion, ...versions] : versions;

  // Clearing the preview is adjusting state in response to the action's
  // result, not synchronizing with anything external, so it happens during
  // render (compared against the last state already reacted to) rather than
  // in an effect — see https://react.dev/learn/you-might-not-need-an-effect.
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) {
      setPreviewUrl(null);
      setSelectedVersion('');
    }
  }

  // Resetting the native <form> (its file inputs in particular) is a real
  // DOM side effect, so unlike the preview/version state above, this does
  // belong in an effect.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.formTitle}</CardTitle>
      </CardHeader>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          if (!localizedFieldsRef.current?.validate()) e.preventDefault();
        }}
      >
        <CardContent className="flex flex-col gap-4">
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="text-sm text-muted-foreground">{dict.added}</p>}

          <LocalizedFields
            ref={localizedFieldsRef}
            idPrefix="create"
            nameLabel={dict.fields.name}
            descriptionLabel={dict.fields.description}
            requiredError={dict.errors.nameRequired}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appVersion">{dict.fields.appVersion}</Label>
            <Select
              name="appVersion"
              required
              value={selectedVersion}
              onValueChange={(value) => setSelectedVersion(value ?? '')}
            >
              <SelectTrigger id="appVersion">
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
            <Label htmlFor="jsonFile">{dict.fields.jsonFile}</Label>
            <FileInput
              id="jsonFile"
              name="jsonFile"
              accept="application/json"
              required
              chooseLabel={dict.chooseFile}
              placeholder={dict.noFileChosen}
              onFileChange={(file) => {
                if (!file) return;
                void readAppVersionFromJsonFile(file).then((version) => {
                  if (version) setSelectedVersion(version);
                });
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="previewFile">{dict.fields.previewFile}</Label>
            <FileInput
              id="previewFile"
              name="previewFile"
              accept="image/*"
              required
              chooseLabel={dict.chooseFile}
              placeholder={dict.noFileChosen}
              onFileChange={(file) => setPreviewUrl(file ? URL.createObjectURL(file) : null)}
            />
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="mt-2 h-32 w-auto rounded-lg object-cover ring-1 ring-foreground/10"
              />
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? dict.submitting : dict.submit}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
