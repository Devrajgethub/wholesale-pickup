import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { db } from '@/lib/db';

// Google's JWKS endpoint for Firebase Auth token verification
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export async function POST(req: NextRequest) {
  try {
    const { token, name, businessName, mobile: clientMobile } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Firebase token is required' }, { status: 400 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: 'Firebase not configured on server' }, { status: 500 });
    }

    // Verify Firebase ID token using jose (no firebase-admin needed!)
    let payload: any;
    try {
      const { payload: p } = await jwtVerify(token, GOOGLE_JWKS, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      });
      payload = p;
    } catch (e: any) {
      console.error('[Firebase Login] Token verification failed:', e?.message);
      return NextResponse.json({ error: 'Invalid or expired token', detail: e?.message }, { status: 401 });
    }

    // Extract phone number from verified Firebase token
    const phone = payload.phone_number as string | undefined;
    if (!phone) {
      return NextResponse.json({ error: 'Phone number not found in Firebase token. Use Phone Auth only.' }, { status: 400 });
    }

    // Extract 10-digit mobile (remove +91 prefix)
    const mobile = phone.replace(/^\+91/, '').replace(/^91/, '');

    console.log(`[Firebase Login] Verified phone: ${mobile}, UID: ${payload.sub}`);

    // Find or create user in our database
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
      console.log(`[Firebase Login] Created new user: ${mobile}`);
    } else if (name) {
      // Update name/business if provided
      user = await db.user.update({
        where: { id: user.id },
        data: { name, businessName: businessName || user.businessName },
      });
      console.log(`[Firebase Login] Updated user: ${mobile}`);
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('[Firebase Login] Error:', error?.message || error);
    return NextResponse.json({
      error: 'Login failed',
      detail: error?.message,
    }, { status: 500 });
  }
}