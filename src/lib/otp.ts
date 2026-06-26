import { db } from './db';
import { createClient } from '@libsql/client';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MS = 60000; // 60 seconds between OTPs

// Real mode when FAST2SMS_API_KEY is set. Otherwise demo mode.
const HAS_SMS_KEY = !!process.env.FAST2SMS_API_KEY;
const DEMO_MODE = !HAS_SMS_KEY;

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

  // Success - delete the OTP
  await db.otp.delete({ where: { id: record.id } });
  return { success: true, message: 'OTP verified successfully!' };
}

// ===== REAL SMS via Fast2SMS =====
async function sendFast2SMS(mobile: string, otp: string): Promise<{ sent: boolean; message: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    console.error('[OTP] FAST2SMS_API_KEY not set');
    return { sent: false, message: 'SMS service not configured' };
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: mobile,
        flash: 0,
      }),
    });

    const data = await response.json();
    console.log('[OTP] Fast2SMS response:', JSON.stringify(data));

    if (data.return === true) {
      return { sent: true, message: 'OTP sent successfully!' };
    } else {
      console.error('[OTP] Fast2SMS error:', data.message);
      return { sent: false, message: data.message || 'Failed to send SMS' };
    }
  } catch (e: any) {
    console.error('[OTP] Fast2SMS request failed:', e?.message);
    return { sent: false, message: 'SMS service error' };
  }
}

export async function sendOTPSMS(mobile: string, otp: string): Promise<{ sent: boolean; message: string }> {
  if (DEMO_MODE) {
    console.log(`[OTP DEMO] Mobile: ${mobile}, OTP: ${otp}`);
    return { sent: true, message: 'Demo mode: OTP is 1234' };
  }

  // Real mode - send via Fast2SMS
  return sendFast2SMS(mobile, otp);
}

export function isDemoMode(): boolean {
  return DEMO_MODE;
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

// Create Otp table directly via @libsql/client (Prisma adapter doesn't support DDL)
// NOTE: No in-memory caching - Vercel serverless creates new instances per request

export async function ensureOtpTable(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL || '';

  if (!databaseUrl) {
    console.error('[OTP] FATAL: DATABASE_URL is not set. Cannot create OTP table.');
    throw new Error('DATABASE_URL environment variable is not configured. Please add it in Vercel → Settings → Environment Variables.');
  }

  if (!databaseUrl.startsWith('libsql://')) {
    // Local SQLite - table already exists via prisma db push
    return;
  }

  try {
    // Try Prisma first (table might already exist)
    await db.otp.count();
    console.log('[OTP] Otp table exists');
    return;
  } catch {
    // Table doesn't exist - create it via direct libsql client
    console.log('[OTP] Creating Otp table via direct libsql client...');
  }

  try {
    const client = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || '',
    });

    await client.execute(`
      CREATE TABLE IF NOT EXISTS "Otp" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "mobile" TEXT NOT NULL,
        "otp" TEXT NOT NULL,
        "verified" BOOLEAN NOT NULL DEFAULT 0,
        "expiresAt" DATETIME NOT NULL,
        "attempts" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`CREATE INDEX IF NOT EXISTS "Otp_mobile_idx" ON "Otp"("mobile")`);

    console.log('[OTP] Otp table created successfully');
  } catch (e: any) {
    console.error('[OTP] Failed to create Otp table:', e?.message);
    throw new Error('Failed to create OTP table: ' + (e?.message || 'Unknown error'));
  }
}