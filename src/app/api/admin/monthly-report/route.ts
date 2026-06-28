import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // Format: "2026-06"

    // Default to current month
    const now = new Date();
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [year, mon] = targetMonth.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 1);

    // Get all orders for the month
    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
        orderStatus: { not: 'Cancelled' },
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    // Group by customer (mobile)
    const customerMap = new Map<string, {
      name: string;
      mobile: string;
      businessName: string;
      orderCount: number;
      totalItems: number;
      totalPayment: number;
      orders: typeof orders;
    }>();

    for (const order of orders) {
      const key = order.mobile;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: order.customerName,
          mobile: order.mobile,
          businessName: order.businessName,
          orderCount: 0,
          totalItems: 0,
          totalPayment: 0,
          orders: [],
        });
      }
      const cust = customerMap.get(key)!;
      cust.orderCount++;
      cust.totalItems += order.items.reduce((s, i) => s + i.quantity, 0);
      cust.totalPayment += order.totalAmount;
      cust.orders.push(order);
    }

    const customers = Array.from(customerMap.values()).sort((a, b) => b.totalPayment - a.totalPayment);

    // Summary stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalItems = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);

    return NextResponse.json({
      month: targetMonth,
      totalOrders,
      totalRevenue,
      totalItems,
      customers,
    });
  } catch (error: any) {
    console.error('[API /admin/monthly-report] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to fetch report', detail: error?.message }, { status: 500 });
  }
}