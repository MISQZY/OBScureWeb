import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { getTemplate, templateFilePath } from '@/lib/templates/store';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getTemplate(id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let content: Buffer;
  try {
    content = await fs.readFile(templateFilePath(id));
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const asciiFallback = record.fileName.replace(/[^\x20-\x7E]/g, '_');
  return new NextResponse(new Uint8Array(content), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(record.fileName)}`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
