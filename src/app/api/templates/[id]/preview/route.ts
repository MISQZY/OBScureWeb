import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { getTemplate, templatePreviewPath } from '@/lib/templates/store';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getTemplate(id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let content: Buffer;
  try {
    content = await fs.readFile(templatePreviewPath(id));
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(content), {
    headers: {
      'Content-Type': record.previewMime,
      // Previews are never edited in place — a re-upload deletes the record and creates a new id — so this can be cached forever.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
