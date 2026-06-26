// In-memory OTP store (in production, use Redis or Turso table)
// On Vercel serverless, this works within a single function instance's lifetime
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

// Demo mode: OTP is always 1234 for testing
// Set DEMO_MODE=false and add SMS_SERVICE env vars to use real SMS
const DEMO_MODE = process.env.DEMO_MODE !== 'false';

export function generateOTP(): string {
  if (DEMO_MODE) return '1234';
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function storeOTP(mobile: string, otp: string): void {
  // Remove any existing OTP for this mobile
  otpStore.delete(mobile);

  otpStore.set(mobile, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });
}

export function verifyOTP(mobile: string, inputOtp: string): { success: boolean; message: string } {
  const record = otpStore.get(mobile);

  if (!record) {
    return { success: false, message: 'OTP not found. Please request a new OTP.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(mobile);
    return { success: false, message: 'OTP has expired. Please request a new OTP.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(mobile);
    return { success: false, message: 'Too many attempts. Please request a new OTP.' };
  }

  if (record.otp !== inputOtp) {
    record.attempts++;
    return { success: false, message: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.` };
  }

  // Success - remove the OTP
  otpStore.delete(mobile);
  return { success: true, message: 'OTP verified successfully!' };
}

export async function sendOTPSMS(mobile: string, otp: string): Promise<{ sent: boolean; message: string }> {
  const fullMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  if (DEMO_MODE) {
    console.log(`[OTP DEMO] Mobile: ${fullMobile}, OTP: ${otp}`);
    return { sent: true, message: 'Demo mode: OTP is 1234' };
  }

  // Real SMS integration (uncomment and configure one of these):
  
  // === OPTION 1: MSG91 ===
  // const response = await fetch(`https://api.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=${fullMobile}&authkey=${process.env.MSG91_AUTH_KEY}&otp=${otp}`);
  // const data = await response.json();
  // return { sent: data.type === 'success', message: data.message || 'OTP sent' };

  // === OPTION 2: Fast2SMS ===
  // const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
  //   method: 'POST',
  //   headers: { 'authorization': process.env.FAST2SMS_API_KEY || '' },
  //   body: JSON.stringify({
  //     route: 'otp',
  //     variables_values: otp,
  //     numbers: mobile,
  //     flash: 0,
  //   }),
  // });
  // const data = await response.json();
  // return { sent: data.return === true, message: data.message || 'OTP sent' };

  // === OPTION 3: Twilio ===
  // const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  // await twilio.messages.create({
  //   body: `Your WholesalePickup OTP is ${otp}. Valid for 5 minutes.`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: fullMobile,
  // });
  // return { sent: true, message: 'OTP sent' };

  return { sent: false, message: 'No SMS service configured' };
}

export function getRateLimitInfo(mobile: string): { canSend: boolean; waitSeconds: number } {
  const record = otpStore.get(mobile);
  if (!record) return { canSend: true, waitSeconds: 0 };

  // Rate limit: 1 OTP per 60 seconds
  const timeSinceLastOtp = Date.now() - (record.expiresAt - OTP_EXPIRY_MS);
  if (timeSinceLastOtp < 60000) {
    return { canSend: false, waitSeconds: Math.ceil((60000 - timeSinceLastOtp) / 1000) };
  }

  return { canSend: true, waitSeconds: 0 };
}