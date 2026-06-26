import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL || 'NOT SET';
    const isTurso = databaseUrl.startsWith('libsql://');
    const hasToken = !!process.env.DATABASE_AUTH_TOKEN;

    // Test actual DB connection
    let dbStatus = 'not_tested';
    let categoryCount = 0;
    let productCount = 0;
    let error = '';

    try {
      categoryCount = await db.category.count();
      productCount = await db.product.count();
      dbStatus = 'connected';
    } catch (e: any) {
      dbStatus = 'error';
      error = e?.message || String(e);
    }

    return NextResponse.json({
      status: 'ok',
      database: {
        url_prefix: databaseUrl.substring(0, 30) + '...',
        is_turso: isTurso,
        has_auth_token: hasToken,
        connection_status: dbStatus,
        category_count: categoryCount,
        product_count: productCount,
        error: error || null,
      },
      env: {
        node_env: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || 'N/A',
      },
    });
  } catch (e: any) {
    return NextResponse.json({
      status: 'error',
      error: e?.message || String(e),
    }, { status: 500 });
  }
}
