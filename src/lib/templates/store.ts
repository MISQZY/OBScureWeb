import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Locale } from '@/app/[lang]/dictionaries';

export interface TemplateRecord {
  id: string;
  /** One string per site locale — see pickLocalized for how a reader (public gallery, admin list) resolves this down to a single display string. */
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  appVersion: string;
  fileName: string;
  previewMime: string;
  createdAt: string;
}

interface CreateTemplateInput {
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  appVersion: string;
  fileName: string;
  jsonContent: string;
  previewBuffer: Buffer;
  previewMime: string;
}

interface UpdateTemplateInput {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  appVersion: string;
  /** Only present when the admin picked a new file — omitted means "keep the existing one". */
  fileName?: string;
  jsonContent?: string;
  previewBuffer?: Buffer;
  previewMime?: string;
}

/**
 * A record's `name`/`description` always has one entry per locale (the admin
 * form requires every locale's name before it submits), so this only has to
 * fall back for hand-edited/legacy data: try the requested locale, then any
 * locale that actually has content, then give up with an empty string.
 */
export function pickLocalized(value: Record<Locale, string>, lang: string): string {
  return value[lang as Locale] || Object.values(value).find(Boolean) || '';
}

/**
 * Everything this feature writes lives under one directory so a single
 * volume mount (Docker) covers all of it. Defaults to a local, gitignored
 * folder for `next dev` — production always sets TEMPLATES_DATA_DIR to the
 * mounted volume path (see docker-compose.yml).
 */
function dataDir(): string {
  return process.env.TEMPLATES_DATA_DIR ?? path.join(process.cwd(), '.data', 'templates');
}

function filesDir(): string {
  return path.join(dataDir(), 'files');
}

function previewsDir(): string {
  return path.join(dataDir(), 'previews');
}

function indexPath(): string {
  return path.join(dataDir(), 'index.json');
}

async function ensureDirs(): Promise<void> {
  await fs.mkdir(filesDir(), { recursive: true });
  await fs.mkdir(previewsDir(), { recursive: true });
}

async function readIndex(): Promise<TemplateRecord[]> {
  try {
    const raw = await fs.readFile(indexPath(), 'utf-8');
    return JSON.parse(raw) as TemplateRecord[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

/**
 * Write-to-temp-then-rename so a crash mid-write can never leave `index.json`
 * truncated/corrupt — `rename` on the same filesystem is atomic. No locking
 * beyond that: writes only ever come from the one admin, one at a time.
 */
async function writeIndex(records: TemplateRecord[]): Promise<void> {
  await ensureDirs();
  const tmpPath = path.join(dataDir(), `index.json.tmp-${process.pid}-${Date.now()}`);
  await fs.writeFile(tmpPath, JSON.stringify(records, null, 2), 'utf-8');
  await fs.rename(tmpPath, indexPath());
}

export function templateFilePath(id: string): string {
  return path.join(filesDir(), `${id}.json`);
}

export function templatePreviewPath(id: string): string {
  return path.join(previewsDir(), id);
}

/** Newest first, for the public gallery and the admin list. */
export async function listTemplates(): Promise<TemplateRecord[]> {
  const records = await readIndex();
  return [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Looking a template up by id here is also what makes the file/preview API
 * routes safe against path traversal: they only ever build a filesystem path
 * from an `id` that's already been confirmed to equal one of our own
 * `crypto.randomUUID()` values, never straight from the request.
 */
export async function getTemplate(id: string): Promise<TemplateRecord | null> {
  const records = await readIndex();
  return records.find((r) => r.id === id) ?? null;
}

export async function createTemplate(input: CreateTemplateInput): Promise<TemplateRecord> {
  const id = crypto.randomUUID();
  await ensureDirs();
  await fs.writeFile(templateFilePath(id), input.jsonContent, 'utf-8');
  await fs.writeFile(templatePreviewPath(id), input.previewBuffer);

  const record: TemplateRecord = {
    id,
    name: input.name,
    description: input.description,
    appVersion: input.appVersion,
    fileName: input.fileName,
    previewMime: input.previewMime,
    createdAt: new Date().toISOString(),
  };

  const records = await readIndex();
  records.push(record);
  await writeIndex(records);
  return record;
}

/**
 * Metadata is always overwritten; the json/preview files only get rewritten
 * when the caller actually included a replacement (see UpdateTemplateInput) —
 * an edit that doesn't touch the file inputs must leave the existing files
 * untouched rather than deleting them.
 */
export async function updateTemplate(input: UpdateTemplateInput): Promise<TemplateRecord | null> {
  const records = await readIndex();
  const index = records.findIndex((r) => r.id === input.id);
  if (index === -1) return null;

  if (input.jsonContent !== undefined) {
    await fs.writeFile(templateFilePath(input.id), input.jsonContent, 'utf-8');
  }
  if (input.previewBuffer !== undefined) {
    await fs.writeFile(templatePreviewPath(input.id), input.previewBuffer);
  }

  const updated: TemplateRecord = {
    ...records[index],
    name: input.name,
    description: input.description,
    appVersion: input.appVersion,
    fileName: input.fileName ?? records[index].fileName,
    previewMime: input.previewMime ?? records[index].previewMime,
  };
  records[index] = updated;
  await writeIndex(records);
  return updated;
}

export async function deleteTemplate(id: string): Promise<void> {
  const records = await readIndex();
  const record = records.find((r) => r.id === id);
  if (!record) return;

  await writeIndex(records.filter((r) => r.id !== id));
  await fs.rm(templateFilePath(id), { force: true });
  await fs.rm(templatePreviewPath(id), { force: true });
}
