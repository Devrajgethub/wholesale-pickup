import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { mobile, otp, name, businessName } = await req.json();

    if (!mobile || !otp) {
      return NextResponse.json({ error: 'Mobile and OTP are required' }, { status: 400 });
    }

    // Verify OTP
    const result = verifyOTP(mobile, otp);
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
      // Update name if provided
      user = await db.user.update({
        where: { id: user.id },
        data: { name, businessName: businessName || user.businessName },
      });
    }

    console.log(`[OTP VERIFY] Mobile: ${mobile}, User: ${user.name}, isAdmin: ${user.isAdmin}`);

    return NextResponse.json({
      success: true,
      message: 'OTP verified!',
      user,
    });
  } catch (error: any) {
    console.error('[API /otp/verify] Error:', error?.message || error);
    return NextResponse.json({ error: 'Verification failed', detail: error?.message }, { status: 500 });
  }
}