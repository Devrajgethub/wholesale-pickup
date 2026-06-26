import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { mobile, name, businessName } = await req.json();

    if (!mobile || !name) {
      return NextResponse.json({ error: 'Mobile and name are required' }, { status: 400 });
    }

    let user = await db.user.findUnique({ where: { mobile } });

    if (!user) {
      user = await db.user.create({
        data: {
          name,
          mobile,
          businessName: businessName || '',
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: { name, businessName: businessName || user.businessName },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');

    if (!mobile) {
      return NextResponse.json({ error: 'Mobile number required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { mobile },
      include: { orders: { include: { items: true }, orderBy: { createdAt: 'desc' } } },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}