import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, ensureOtpTable } from '@/lib/otp';
import { db } from '@/lib/db';

const hasFirebase = !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

export async function POST(req: NextRequest) {
  try {
    // Skip Otp table setup if Firebase is configured
    if (!hasFirebase) {
      try {
        await ensureOtpTable();
      } catch (tableErr: any) {
        console.error('[OTP VERIFY] Otp table setup failed (non-fatal):', tableErr?.message);
      }
    }

    const { mobile, otp, name, businessName } = await req.json();

    if (!mobile || !otp) {
      return NextResponse.json({ error: 'Mobile and OTP are required' }, { status: 400 });
    }

    // Verify OTP
    const result = await verifyOTP(mobile, otp);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // OTP verified - find or create user
    let user = await db.user.findUnique({ where: { mobile } });

    if (!user) {
      if (!name) {
        return NextResponse.json({ error: 'Name is required for new users' }, { status: 400 });
      }
      user = await db.user.create({
        data: {
          name,
          mobile,
          businessName: businessName || '',
        },
      });
    } else if (name) {
      user = await db.user.update({
        where: { id: user.id },
        data: { name, businessName: businessName || user.businessName },
      });
    }

    console.log(`[OTP VERIFY] Mobile: ${mobile}, User: ${user.name}`);

    return NextResponse.json({
      success: true,
      message: 'OTP verified!',
      user,
    });
  } catch (error: any) {
    console.error('[API /otp/verify] Error:', error?.message || error);
    return NextResponse.json({
      error: 'Verification failed',
      detail: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}