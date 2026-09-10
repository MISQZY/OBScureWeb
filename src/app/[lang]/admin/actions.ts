'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { verifyCredentials, createSession, destroySession, requireAdmin } from '@/lib/auth/session';
import { createTemplate, updateTemplate, deleteTemplate, pickLocalized } from '@/lib/templates/store';
import { locales, getDictionary, type Locale } from '@/app/[lang]/dictionaries';

const MAX_JSON_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** Reads `${prefix}_en`, `${prefix}_ru`, ... (see LocalizedFields, which names its inputs this way) into one Record<Locale, string>. */
function readLocalizedField(formData: FormData, prefix: string): Record<Locale, string> {
  const result = {} as Record<Locale, string>;
  for (const locale of locales) {
    result[locale] = String(formData.get(`${prefix}_${locale}`) ?? '').trim();
  }
  return result;
}

/** Every admin Server Action is bound to the current locale (`fn.bind(null, lang)`) at the call site — see the login/template pages — so redirects and cache invalidation always target the right `/[lang]/admin/...` route instead of assuming a default. */
export async function loginAction(lang: string, formData: FormData): Promise<void> {
  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!verifyCredentials(username, password)) {
    redirect(`/${lang}/admin/login?error=1`);
  }

  await createSession();
  redirect(`/${lang}/admin/template`);
}

export async function logoutAction(lang: string): Promise<void> {
  await destroySession();
  redirect(`/${lang}/admin/login`);
}

function revalidateTemplatePages(lang: string): void {
  revalidatePath(`/${lang}/admin/template`);
  for (const locale of locales) revalidatePath(`/${locale}/templates`);
}

export interface TemplateFormState {
  error?: string;
  success?: boolean;
}

export async function createTemplateAction(
  lang: string,
  _prevState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  await requireAdmin(lang);
  const errors = (await getDictionary(lang)).admin.template.errors;

  const name = readLocalizedField(formData, 'name');
  const description = readLocalizedField(formData, 'description');
  const appVersion = String(formData.get('appVersion') ?? '').trim();
  const jsonFile = formData.get('jsonFile');
  const previewFile = formData.get('previewFile');

  if (locales.some((locale) => !name[locale])) return { error: errors.nameRequired };
  if (!appVersion) return { error: errors.appVersionRequired };
  if (!(jsonFile instanceof File) || jsonFile.size === 0) return { error: errors.jsonRequired };
  if (!(previewFile instanceof File) || previewFile.size === 0) return { error: errors.previewRequired };
  if (!previewFile.type.startsWith('image/')) return { error: errors.previewMustBeImage };
  if (jsonFile.size > MAX_JSON_SIZE) return { error: errors.jsonTooLarge };
  if (previewFile.size > MAX_IMAGE_SIZE) return { error: errors.previewTooLarge };

  const jsonContent = await jsonFile.text();
  try {
    JSON.parse(jsonContent);
  } catch {
    return { error: errors.invalidJson };
  }

  await createTemplate({
    name,
    description,
    appVersion,
    fileName: jsonFile.name || `${pickLocalized(name, lang)}.json`,
    jsonContent,
    previewBuffer: Buffer.from(await previewFile.arrayBuffer()),
    previewMime: previewFile.type,
  });

  revalidateTemplatePages(lang);
  return { success: true };
}

/** Bound as `updateTemplateAction.bind(null, lang, id)` from the edit dialog, same pattern as createTemplateAction's `lang` binding — id just needs to be fixed a step earlier since it isn't a form field. */
export async function updateTemplateAction(
  lang: string,
  id: string,
  _prevState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  await requireAdmin(lang);
  const errors = (await getDictionary(lang)).admin.template.errors;

  const name = readLocalizedField(formData, 'name');
  const description = readLocalizedField(formData, 'description');
  const appVersion = String(formData.get('appVersion') ?? '').trim();
  const jsonFile = formData.get('jsonFile');
  const previewFile = formData.get('previewFile');

  if (locales.some((locale) => !name[locale])) return { error: errors.nameRequired };
  if (!appVersion) return { error: errors.appVersionRequired };

  let jsonContent: string | undefined;
  let fileName: string | undefined;
  if (jsonFile instanceof File && jsonFile.size > 0) {
    if (jsonFile.size > MAX_JSON_SIZE) return { error: errors.jsonTooLarge };
    jsonContent = await jsonFile.text();
    try {
      JSON.parse(jsonContent);
    } catch {
      return { error: errors.invalidJson };
    }
    fileName = jsonFile.name || `${pickLocalized(name, lang)}.json`;
  }

  let previewBuffer: Buffer | undefined;
  let previewMime: string | undefined;
  if (previewFile instanceof File && previewFile.size > 0) {
    if (!previewFile.type.startsWith('image/')) return { error: errors.previewMustBeImage };
    if (previewFile.size > MAX_IMAGE_SIZE) return { error: errors.previewTooLarge };
    previewBuffer = Buffer.from(await previewFile.arrayBuffer());
    previewMime = previewFile.type;
  }

  const updated = await updateTemplate({ id, name, description, appVersion, fileName, jsonContent, previewBuffer, previewMime });
  if (!updated) return { error: errors.notFound };

  revalidateTemplatePages(lang);
  return { success: true };
}

export async function deleteTemplateAction(lang: string, id: string): Promise<void> {
  await requireAdmin(lang);
  await deleteTemplate(id);
  revalidateTemplatePages(lang);
}
