import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile');

    if (mobile) {
      // Single customer detail with all orders
      const orders = await db.order.findMany({
        where: { mobile },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      if (orders.length === 0) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const customer = {
        name: orders[0].customerName,
        mobile: orders[0].mobile,
        businessName: orders[0].businessName,
        totalOrders: orders.length,
        totalItems: orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0),
        totalAmount: orders.reduce((s, o) => s + o.totalAmount, 0),
        totalPaid: orders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + o.totalAmount, 0),
        totalPending: orders.filter(o => o.paymentStatus === 'Pending').reduce((s, o) => s + o.totalAmount, 0),
        firstOrderDate: orders[orders.length - 1].createdAt,
        lastOrderDate: orders[0].createdAt,
        orders: orders.map(o => ({
          id: o.id,
          orderId: o.orderId,
          totalAmount: o.totalAmount,
          paymentStatus: o.paymentStatus,
          orderStatus: o.orderStatus,
          pickupStatus: o.pickupStatus,
          createdAt: o.createdAt,
          items: o.items,
        })),
      };

      return NextResponse.json(customer);
    }

    // List all unique customers
    const allOrders = await db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const customerMap = new Map<string, {
      name: string;
      mobile: string;
      businessName: string;
      totalOrders: number;
      totalItems: number;
      totalAmount: number;
      totalPaid: number;
      totalPending: number;
      lastOrderDate: string;
    }>();

    for (const order of allOrders) {
      const key = order.mobile;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: order.customerName,
          mobile: order.mobile,
          businessName: order.businessName || '',
          totalOrders: 0,
          totalItems: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalPending: 0,
          lastOrderDate: order.createdAt,
        });
      }
      const cust = customerMap.get(key)!;
      cust.totalOrders++;
      cust.totalItems += order.items.reduce((s, i) => s + i.quantity, 0);
      cust.totalAmount += order.totalAmount;
      if (order.paymentStatus === 'Paid') {
        cust.totalPaid += order.totalAmount;
      } else {
        cust.totalPending += order.totalAmount;
      }
    }

    const customers = Array.from(customerMap.values()).sort((a, b) => {
      // Sort by last order date descending
      return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('[API /admin/customers] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to fetch customers', detail: error?.message }, { status: 500 });
  }
}