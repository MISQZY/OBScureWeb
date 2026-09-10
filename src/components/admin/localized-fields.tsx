'use client';

import { useState } from 'react';
import { locales, type Locale } from '@/app/[lang]/dictionaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', ru: 'RU' };

/**
 * Name + description, one pair of inputs per site locale, with a small
 * toggle to switch which pair is visible. All locales' inputs are always
 * present in the DOM (just `hidden`, never unmounted) so every locale's
 * value is included in the form's FormData on submit regardless of which
 * one was showing last — a locale you never clicked into still submits
 * whatever its defaultValue was (typically empty on create, the existing
 * translation on edit).
 */
export function LocalizedFields({
  idPrefix,
  nameLabel,
  descriptionLabel,
  defaultName,
  defaultDescription,
}: {
  idPrefix: string;
  nameLabel: string;
  descriptionLabel: string;
  defaultName?: Partial<Record<Locale, string>>;
  defaultDescription?: Partial<Record<Locale, string>>;
}) {
  const [active, setActive] = useState<Locale>(locales[0]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {locales.map((locale) => (
          <Button
            key={locale}
            type="button"
            size="xs"
            variant={active === locale ? 'default' : 'outline'}
            onClick={() => setActive(locale)}
          >
            {LOCALE_LABELS[locale]}
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
              defaultValue={defaultName?.[locale] ?? ''}
              required
            />
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
}
