import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  tags: z.array(z.string().min(1)).min(1).max(20),
});

/**
 * API'den gelen içerik değişikliği bildirimi — cache tag'lerini düşürür.
 * Ortak sır REVALIDATE_SECRET ile korunur.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Yetkisiz' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: 'Geçersiz istek gövdesi' }, { status: 400 });
  }

  for (const tag of parsed.data.tags) {
    revalidateTag(tag);
  }
  return NextResponse.json({ revalidated: true, tags: parsed.data.tags });
}
