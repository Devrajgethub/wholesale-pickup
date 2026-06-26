import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP, sendOTPSMS, getRateLimitInfo, ensureOtpTable } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    // Ensure Otp table exists in Turso
    await ensureOtpTable();

    const { mobile } = await req.json();

    if (!mobile || mobile.length < 10) {
      return NextResponse.json({ error: 'Valid mobile number is required' }, { status: 400 });
    }

    // Check rate limit
    const rateLimit = await getRateLimitInfo(mobile);
    if (!rateLimit.canSend) {
      return NextResponse.json({
        error: `Please wait ${rateLimit.waitSeconds} seconds before requesting a new OTP`,
        waitSeconds: rateLimit.waitSeconds,
      }, { status: 429 });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(mobile, otp);

    // Send OTP via SMS (demo mode: OTP is 1234)
    const result = await sendOTPSMS(mobile, otp);

    console.log(`[OTP SEND] Mobile: ${mobile}, Sent: ${result.sent}`);

    return NextResponse.json({
      success: true,
      message: result.message,
      demo: result.message.includes('Demo mode'),
    });
  } catch (error: any) {
    console.error('[API /otp/send] Error:', error?.message || error);
    return NextResponse.json({
      error: 'Failed to send OTP',
      detail: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}