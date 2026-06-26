import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Admin phone numbers - single source of truth
const ADMIN_USERS = [
  { name: 'Admin - Devraj', mobile: '9682022501', businessName: 'Mitra Bros Mart' },
  { name: 'Admin - Partner', mobile: '7908117295', businessName: 'Mitra Bros Mart' },
];

export async function POST() {
  try {
    console.log('[SETUP] Ensuring admin users...');
    const results: { mobile: string; status: string; action: string }[] = [];

    for (const admin of ADMIN_USERS) {
      try {
        const existing = await db.user.findUnique({ where: { mobile: admin.mobile } });

        if (existing) {
          if (!existing.isAdmin) {
            await db.user.update({
              where: { id: existing.id },
              data: { isAdmin: true, name: admin.name, businessName: admin.businessName },
            });
            results.push({ mobile: admin.mobile, status: 'updated', action: 'Set isAdmin=true' });
            console.log(`[SETUP] Updated ${admin.mobile} to admin`);
          } else {
            results.push({ mobile: admin.mobile, status: 'ok', action: 'Already admin' });
            console.log(`[SETUP] ${admin.mobile} already admin`);
          }
        } else {
          await db.user.create({
            data: {
              name: admin.name,
              mobile: admin.mobile,
              businessName: admin.businessName,
              isAdmin: true,
            },
          });
          results.push({ mobile: admin.mobile, status: 'created', action: 'New admin user created' });
          console.log(`[SETUP] Created admin ${admin.mobile}`);
        }
      } catch (e: any) {
        results.push({ mobile: admin.mobile, status: 'error', action: e?.message || 'Unknown error' });
        console.error(`[SETUP] Error for ${admin.mobile}:`, e?.message);
      }
    }

    // Also list all current admins
    const allAdmins = await db.user.findMany({ where: { isAdmin: true }, select: { id: true, name: true, mobile: true, isAdmin: true } });

    return NextResponse.json({
      success: true,
      message: 'Admin setup complete',
      results,
      allAdmins: allAdmins.map(a => ({ mobile: a.mobile, name: a.name })),
    });
  } catch (error: any) {
    console.error('[SETUP] Error:', error?.message || error);
    return NextResponse.json({
      success: false,
      error: 'Setup failed',
      detail: error?.message,
    }, { status: 500 });
  }
}

export async function GET() {
  // List current admin users
  try {
    const admins = await db.user.findMany({
      where: { isAdmin: true },
      select: { id: true, name: true, mobile: true, businessName: true, isAdmin: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      admins,
      count: admins.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to list admins',
      detail: error?.message,
    }, { status: 500 });
  }
}
