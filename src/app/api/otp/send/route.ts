import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP, sendOTPSMS, getRateLimitInfo, ensureOtpTable, isDemoMode } from '@/lib/otp';

// Check if Firebase Phone Auth is available (env vars set on server)
const hasFirebase = !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

export async function POST(req: NextRequest) {
  try {
    // Skip Otp table setup if Firebase is configured (Firebase handles OTP)
    if (!hasFirebase) {
      // Ensure Otp table exists in Turso (non-fatal)
      try {
        await ensureOtpTable();
      } catch (tableErr: any) {
        console.error('[OTP SEND] Otp table setup failed (non-fatal):', tableErr?.message);
      }
    }

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

    // Send OTP via SMS
    const result = await sendOTPSMS(mobile, otp);

    console.log(`[OTP SEND] Mobile: ${mobile}, Sent: ${result.sent}, Demo: ${isDemoMode()}`);

    // If SMS failed in real mode, still return success (OTP is stored, user can try again)
    // But log a warning
    if (!result.sent && !isDemoMode()) {
      console.error(`[OTP SEND] SMS failed for ${mobile}: ${result.message}`);
      // Still return success so user gets to OTP screen - they can resend if needed
      return NextResponse.json({
        success: true,
        message: 'OTP generated. If you did not receive SMS, please resend.',
        demo: false,
        smsFailed: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      demo: isDemoMode(),
    });
  } catch (error: any) {
    console.error('[API /otp/send] Error:', error?.message || error);
    return NextResponse.json({
      error: 'Failed to send OTP',
      detail: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}

// Health check for debugging
export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const hasToken = !!process.env.DATABASE_AUTH_TOKEN;
    const firebaseReady = hasFirebase;
    return NextResponse.json({
      database_url_prefix: dbUrl.substring(0, 25) + '...',
      has_auth_token: hasToken,
      firebase_ready: firebaseReady,
      demo_mode: isDemoMode(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}