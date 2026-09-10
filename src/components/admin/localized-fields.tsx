'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { locales, type Locale } from '@/app/[lang]/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', ru: 'RU' };

export interface LocalizedFieldsHandle {
  /**
   * Switches to (and flags) the first locale whose name is empty. Every
   * locale's name is `required`, but a `hidden` input is excluded from
   * native constraint validation — so the browser happily submits a form
   * whose *inactive* locale tab was never filled in, silently. This is the
   * one place that gap actually gets caught before the form submits.
   */
  validate(): boolean;
}

/**
 * Name + description, one pair of inputs per site locale, with a small
 * toggle to switch which pair is visible. All locales' inputs are always
 * present in the DOM (just `hidden`, never unmounted) so every locale's
 * value is included in the form's FormData on submit regardless of which
 * one was showing last — a locale you never clicked into still submits
 * whatever its defaultValue was (typically empty on create, the existing
 * translation on edit).
 */
export const LocalizedFields = forwardRef<
  LocalizedFieldsHandle,
  {
    idPrefix: string;
    nameLabel: string;
    descriptionLabel: string;
    requiredError: string;
    defaultName?: Partial<Record<Locale, string>>;
    defaultDescription?: Partial<Record<Locale, string>>;
  }
>(function LocalizedFields(
  { idPrefix, nameLabel, descriptionLabel, requiredError, defaultName, defaultDescription },
  ref,
) {
  const [active, setActive] = useState<Locale>(locales[0]);
  const [invalidLocales, setInvalidLocales] = useState<ReadonlySet<Locale>>(new Set());
  const nameInputs = useRef<Partial<Record<Locale, HTMLInputElement>>>({});

  useImperativeHandle(ref, () => ({
    validate() {
      const empty = locales.filter((locale) => !nameInputs.current[locale]?.value.trim());
      setInvalidLocales(new Set(empty));
      if (empty.length > 0) setActive(empty[0]);
      return empty.length === 0;
    },
  }));

  // Switching tabs to the first invalid locale (above) only takes effect
  // once React re-renders it visible — focusing has to wait for that.
  useEffect(() => {
    if (invalidLocales.has(active)) nameInputs.current[active]?.focus();
  }, [active, invalidLocales]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {locales.map((locale) => (
          <Button
            key={locale}
            type="button"
            size="xs"
            variant={active === locale ? 'default' : 'outline'}
            aria-invalid={invalidLocales.has(locale)}
            onClick={() => setActive(locale)}
          >
            {LOCALE_LABELS[locale]}
            {invalidLocales.has(locale) && <span className="text-destructive">*</span>}
          </Button>
        ))}
      </div>
      {locales.map((locale) => (
        <div key={locale} hidden={locale !== active} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-name-${locale}`}>{nameLabel}</Label>
            <Input
              id={`${idPrefix}-name-${locale}`}
              name={`name_${locale}`}
              ref={(el) => {
                nameInputs.current[locale] = el ?? undefined;
              }}
              defaultValue={defaultName?.[locale] ?? ''}
              aria-invalid={invalidLocales.has(locale)}
              onChange={(e) => {
                if (invalidLocales.has(locale) && e.target.value.trim()) {
                  setInvalidLocales((prev) => {
                    const next = new Set(prev);
                    next.delete(locale);
                    return next;
                  });
                }
              }}
              required
            />
            {invalidLocales.has(locale) && <p className="text-sm text-destructive">{requiredError}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-description-${locale}`}>{descriptionLabel}</Label>
            <Textarea
              id={`${idPrefix}-description-${locale}`}
              name={`description_${locale}`}
              defaultValue={defaultDescription?.[locale] ?? ''}
              rows={3}
            />
          </div>
        </div>
      ))}
    </div>
  );
});
