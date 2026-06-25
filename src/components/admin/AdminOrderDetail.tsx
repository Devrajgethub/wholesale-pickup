'use client';

import { useDataStore, useNavStore, Order } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';
import { ArrowLeft, MessageCircle, Printer, MapPin, Phone, User, Building } from 'lucide-react';

const statusColor: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Accepted': 'bg-blue-100 text-blue-800',
  'Packing': 'bg-orange-100 text-orange-800',
  'Ready for Pickup': 'bg-green-100 text-green-800',
  'Completed': 'bg-green-200 text-green-900',
  'Cancelled': 'bg-red-100 text-red-800',
};

export default function AdminOrderDetail() {
  const { orders, fetchOrders } = useDataStore();
  const { selectedOrderId, navigate } = useNavStore();

  useEffect(() => {
    fetchOrders();
  }, [selectedOrderId]);

  const order = orders.find((o: Order) => o.id === selectedOrderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Order not found</p>
          <Button className="mt-4 bg-[#0C831F] text-white" onClick={() => navigate('admin-orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const sendWhatsApp = () => {
    const shopName = 'ABC Wholesale Store';
    const payment = order.paymentMethod === 'Cash at Shop' ? 'Payment: Cash at Shop' : 'Payment: Online Paid';
    const message = `Hello ${order.customerName},\n\nAapka order #${order.orderId} ready hai.\n\nPlease shop par aakar apna naam ya order ID batayein.\nShop: ${shopName}\n${payment}\n\nThank you.`;
    window.open(`https://wa.me/91${order.mobile}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const updateStatus = async (status: string, pickup?: string) => {
    const body: Record<string, string> = { id: order.id, orderStatus: status };
    if (pickup) body.pickupStatus = pickup;
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <Button variant="ghost" className="mb-4 text-gray-600" onClick={() => navigate('admin-orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>

        {/* Order Header */}
        <div className="bg-gradient-to-r from-[#0C831F] to-[#0fa828] rounded-2xl p-5 text-white mb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-200 text-sm">Order</p>
              <p className="text-3xl font-extrabold">#{order.orderId}</p>
              <p className="text-green-200 text-sm mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold">₹{order.totalAmount.toLocaleString()}</p>
              <Badge className="mt-2 bg-white/20 text-white hover:bg-white/30">{order.paymentMethod}</Badge>
            </div>
          </div>
        </div>

        {/* Status */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Order Status</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[order.orderStatus]}`}>
                {order.orderStatus}
              </span>
            </div>
            {/* Status Flow */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {['Pending', 'Accepted', 'Packing', 'Ready for Pickup', 'Completed'].map((s, i, arr) => {
                const currentIndex = arr.indexOf(order.orderStatus);
                const isActive = i <= currentIndex && order.orderStatus !== 'Cancelled';
                const isCurrent = s === order.orderStatus;
                return (
                  <div key={s} className="flex items-center flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? 'bg-[#0C831F] text-white' : isActive ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                      {isActive && s !== order.orderStatus ? '✓' : i + 1}
                    </div>
                    <span className={`ml-1 text-[10px] ${isCurrent ? 'text-[#0C831F] font-bold' : 'text-gray-500'}`}>{s}</span>
                    {i < arr.length - 1 && <div className={`w-4 h-0.5 mx-1 ${isActive ? 'bg-green-300' : 'bg-gray-200'}`} />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">Customer Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><div><p className="text-gray-500 text-xs">Name</p><p className="font-medium">{order.customerName}</p></div></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><div><p className="text-gray-500 text-xs">Mobile</p><p className="font-medium">{order.mobile}</p></div></div>
              {order.businessName && <div className="flex items-center gap-2 col-span-2"><Building className="h-4 w-4 text-gray-400" /><div><p className="text-gray-500 text-xs">Business</p><p className="font-medium">{order.businessName}</p></div></div>}
              {order.pickupDate && <div className="flex items-center gap-2 col-span-2"><MapPin className="h-4 w-4 text-gray-400" /><div><p className="text-gray-500 text-xs">Pickup Date</p><p className="font-medium">{order.pickupDate}</p></div></div>}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-500">₹{item.price} x {item.quantity}</p>
                  </div>
                  <p className="font-bold">₹{item.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-extrabold text-lg">
              <span>Total</span>
              <span className="text-[#0C831F]">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {order.specialNote && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-bold text-gray-900 mb-2">Special Note</h3>
              <p className="text-sm text-gray-600">{order.specialNote}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pb-8">
          {order.orderStatus !== 'Completed' && order.orderStatus !== 'Cancelled' && (
            <Button className="bg-[#0C831F] text-white font-bold" onClick={() => updateStatus('Ready for Pickup', 'Ready')}>
              Mark Ready for Pickup
            </Button>
          )}
          <Button variant="outline" className="text-green-600 border-green-300" onClick={sendWhatsApp}>
            <MessageCircle className="h-4 w-4 mr-2" /> Send WhatsApp Message
          </Button>
          <Button variant="outline" onClick={() => {
            const win = window.open('', '_blank');
            if (win) {
              win.document.write(`<html><body style="font-family:monospace;max-width:300px;margin:0 auto;padding:20px;"><h2 style="text-align:center;">ABC Wholesale Store</h2><hr/><p><strong>Order:</strong> #${order.orderId}</p><p><strong>Customer:</strong> ${order.customerName}</p><p><strong>Mobile:</strong> ${order.mobile}</p><p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p><hr/><table style="width:100%;border-collapse:collapse;"><tr style="border-bottom:1px solid #ccc;"><th style="text-align:left;">Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>${order.items.map(item => `<tr style="border-bottom:1px solid #eee;"><td>${item.productName}</td><td style="text-align:center;">${item.quantity}</td><td style="text-align:right;">₹${item.price}</td><td style="text-align:right;">₹${item.total}</td></tr>`).join('')}</table><hr/><p style="text-align:right;font-size:18px;font-weight:bold;">Total: ₹${order.totalAmount.toLocaleString()}</p><p><strong>Payment:</strong> ${order.paymentMethod}</p></body></html>`);
              win.document.close(); win.print();
            }
          }}>
            <Printer className="h-4 w-4 mr-2" /> Print Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}