import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function generateOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ORD${num}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (mobile) where.mobile = mobile;
    if (status) where.orderStatus = status;

    const orders = await db.order.findMany({
      where,
      include: { items: true, user: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('[API /orders GET] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to fetch orders', detail: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, mobile, businessName, items, paymentMethod, specialNote, pickupDate, userId } = body;

    if (!customerName || !mobile || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum: number, item: { quantity: number; price: number }) => sum + (item.quantity * item.price), 0);

    // Generate unique order ID
    let orderId = generateOrderId();
    let exists = await db.order.findUnique({ where: { orderId } });
    while (exists) {
      orderId = generateOrderId();
      exists = await db.order.findUnique({ where: { orderId } });
    }

    const order = await db.order.create({
      data: {
        orderId,
        customerName,
        mobile,
        businessName: businessName || '',
        totalAmount,
        paymentMethod: paymentMethod || 'Cash at Shop',
        paymentStatus: paymentMethod === 'Online Paid' ? 'Paid' : 'Pending',
        orderStatus: 'Pending',
        pickupStatus: 'Not Ready',
        specialNote: specialNote || '',
        pickupDate: pickupDate || '',
        userId: userId || null,
        items: {
          create: items.map((item: { productName: string; quantity: number; price: number; productId: string }) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
            productId: item.productId,
          })),
        },
      },
      include: { items: true },
    });

    // Update stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('[API /orders POST] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to create order', detail: error?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, orderStatus, paymentStatus, pickupStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (orderStatus !== undefined) updateData.orderStatus = orderStatus;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (pickupStatus !== undefined) {
      updateData.pickupStatus = pickupStatus;
      if (pickupStatus === 'Ready') {
        updateData.orderStatus = 'Ready for Pickup';
      }
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: true, user: true },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('[API /orders PUT] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to update order', detail: error?.message }, { status: 500 });
  }
}