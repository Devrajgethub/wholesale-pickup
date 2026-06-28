import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();

    if (!images || typeof images !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    let updated = 0;
    for (const [id, url] of Object.entries(images)) {
      await db.product.update({
        where: { id },
        data: { image: url as string },
      });
      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error('[API /admin/update-images] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to update images', detail: error?.message }, { status: 500 });
  }
}