import { db } from './db';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MS = 60000; // 60 seconds between OTPs

// Demo mode: OTP is always 1234 for testing
const DEMO_MODE = process.env.DEMO_MODE !== 'false';

export function generateOTP(): string {
  if (DEMO_MODE) return '1234';
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function storeOTP(mobile: string, otp: string): Promise<void> {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  // Delete any existing OTPs for this mobile
  await db.otp.deleteMany({ where: { mobile } });

  // Create new OTP record
  await db.otp.create({
    data: {
      mobile,
      otp,
      expiresAt,
      attempts: 0,
    },
  });
}

export async function verifyOTP(mobile: string, inputOtp: string): Promise<{ success: boolean; message: string }> {
  const record = await db.otp.findFirst({
    where: { mobile, verified: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return { success: false, message: 'OTP not found. Please request a new OTP.' };
  }

  // Check expiry
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    await db.otp.delete({ where: { id: record.id } });
    return { success: false, message: 'OTP has expired. Please request a new OTP.' };
  }

  // Check attempts
  const newAttempts = record.attempts + 1;
  if (newAttempts > MAX_ATTEMPTS) {
    await db.otp.delete({ where: { id: record.id } });
    return { success: false, message: 'Too many attempts. Please request a new OTP.' };
  }

  // Update attempts count
  await db.otp.update({
    where: { id: record.id },
    data: { attempts: newAttempts },
  });

  if (record.otp !== inputOtp) {
    return { success: false, message: `Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempts remaining.` };
  }

  // Success - mark as verified and delete
  await db.otp.delete({ where: { id: record.id } });
  return { success: true, message: 'OTP verified successfully!' };
}

export async function sendOTPSMS(mobile: string, otp: string): Promise<{ sent: boolean; message: string }> {
  const fullMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  if (DEMO_MODE) {
    console.log(`[OTP DEMO] Mobile: ${fullMobile}, OTP: ${otp}`);
    return { sent: true, message: 'Demo mode: OTP is 1234' };
  }

  // Real SMS integration - uncomment and configure one:
  // MSG91 / Fast2SMS / Twilio code here (see previous version)

  return { sent: false, message: 'No SMS service configured' };
}

export async function getRateLimitInfo(mobile: string): Promise<{ canSend: boolean; waitSeconds: number }> {
  const record = await db.otp.findFirst({
    where: { mobile },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return { canSend: true, waitSeconds: 0 };

  const timeSinceLastOtp = Date.now() - new Date(record.createdAt).getTime();
  if (timeSinceLastOtp < RATE_LIMIT_MS) {
    return { canSend: false, waitSeconds: Math.ceil((RATE_LIMIT_MS - timeSinceLastOtp) / 1000) };
  }

  return { canSend: true, waitSeconds: 0 };
}

// Create Otp table in Turso if it doesn't exist (for Vercel)
export async function ensureOtpTable(): Promise<void> {
  try {
    await db.otp.count();
    console.log('[OTP] Otp table exists');
  } catch {
    console.log('[OTP] Otp table missing, creating...');
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Otp" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "mobile" TEXT NOT NULL,
        "otp" TEXT NOT NULL,
        "verified" BOOLEAN NOT NULL DEFAULT 0,
        "expiresAt" DATETIME NOT NULL,
        "attempts" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "Otp_mobile_idx" ON "Otp"("mobile");
    `);
    console.log('[OTP] Otp table created');
  }
}