'use client';

import { useDataStore, useNavStore, Order } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Eye, MessageCircle, Search, Package, CheckCircle, Clock, XCircle, Truck, Printer } from 'lucide-react';
import { motion } from 'framer-motion';

const statusFlow = ['Pending', 'Accepted', 'Packing', 'Ready for Pickup', 'Completed'];
const statusColor: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Accepted': 'bg-blue-100 text-blue-800',
  'Packing': 'bg-orange-100 text-orange-800',
  'Ready for Pickup': 'bg-green-100 text-green-800',
  'Completed': 'bg-green-200 text-green-900',
  'Cancelled': 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const { orders, fetchOrders } = useDataStore();
  const { setOrder } = useNavStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o: Order) => {
    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchSearch = !search ||
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.mobile.includes(search);
    return matchStatus && matchSearch;
  });

  const updateStatus = async (orderId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, orderStatus: newStatus }),
      });
      if (res.ok) fetchOrders();
    } catch (err) { console.error(err); }
  };

  const markReady = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, orderStatus: 'Ready for Pickup', pickupStatus: 'Ready' }),
      });
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const sendWhatsApp = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const shopName = 'Mitra Bros Mart';
    const message = `Hello ${order.customerName},\n\nAapka order #${order.orderId} ready hai.\n\nPlease shop par aakar apna naam ya order ID batayein.\nShop: ${shopName}\nPayment: Cash at Shop\n\nThank you.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/91${order.mobile}?text=${encoded}`, '_blank');
  };

  const handlePrint = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const printContent = `
      <html><body style="font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px;">
        <h2 style="text-align:center;">Mitra Bros Mart</h2>
        <hr/>
        <p><strong>Order:</strong> #${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Mobile:</strong> ${order.mobile}</p>
        ${order.businessName ? `<p><strong>Business:</strong> ${order.businessName}</p>` : ''}
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        <hr/>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #ccc;"><th style="text-align:left;">Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
          ${order.items.map(item => `<tr style="border-bottom:1px solid #eee;"><td>${item.productName}</td><td style="text-align:center;">${item.quantity}</td><td style="text-align:right;">₹${item.price}</td><td style="text-align:right;">₹${item.total}</td></tr>`).join('')}
        </table>
        <hr/>
        <p style="text-align:right;font-size:18px;font-weight:bold;">Total: ₹${order.totalAmount.toLocaleString()}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        <p style="text-align:center;margin-top:20px;">Thank you for your order!</p>
      </body></html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by Order ID, Name, Mobile..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Packing">Packing</SelectItem>
              <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {['all', 'Pending', 'Accepted', 'Packing', 'Ready for Pickup', 'Completed'].map(s => {
            const count = s === 'all' ? orders.length : orders.filter((o: Order) => o.orderStatus === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`p-2 rounded-lg text-xs font-medium text-center transition-colors ${statusFilter === s ? 'bg-[#0C831F] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
                {s === 'all' ? 'All' : s}
                <div className={`text-lg font-extrabold ${statusFilter === s ? 'text-white' : 'text-gray-900'}`}>{count}</div>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filtered.map((order: Order, i: number) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-extrabold text-[#0C831F] text-lg">#{order.orderId}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[order.orderStatus] || 'bg-gray-100'}`}>
                          {order.orderStatus}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {order.paymentMethod}
                        </Badge>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Customer</p>
                        <p className="font-medium">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Mobile</p>
                        <p className="font-medium">{order.mobile}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Items</p>
                        <p className="font-medium">{order.items.length} items</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Total</p>
                        <p className="font-extrabold text-lg">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="text-xs text-gray-600 mb-3 line-clamp-1">
                      {order.items.map((item, i) => `${item.productName} x${item.quantity}`).join(' | ')}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); setOrder(order.id); }}>
                        <Eye className="h-3 w-3 mr-1" /> Details
                      </Button>

                      {order.orderStatus !== 'Completed' && order.orderStatus !== 'Cancelled' && (
                        <>
                          {/* Quick Status Buttons */}
                          <div className="flex gap-1">
                            {order.orderStatus !== 'Ready for Pickup' && (
                              <Button size="sm" className="h-8 text-xs bg-[#0C831F] text-white hover:bg-[#0a6e1a]"
                                onClick={(e) => markReady(order, e)}>
                                <CheckCircle className="h-3 w-3 mr-1" /> Mark Ready
                              </Button>
                            )}
                          </div>

                          {/* Status Dropdown */}
                          <Select onValueChange={(val) => {
                            fetch('/api/orders', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: order.id, orderStatus: val }),
                            }).then(() => fetchOrders());
                          }}>
                            <SelectTrigger className="h-8 w-36 text-xs">
                              <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusFlow.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      {/* WhatsApp */}
                      <Button variant="outline" size="sm" className="h-8 text-xs text-green-600 border-green-300 hover:bg-green-50"
                        onClick={(e) => sendWhatsApp(order, e)}>
                        <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                      </Button>

                      {/* Print Invoice */}
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={(e) => handlePrint(order, e)}>
                        <Printer className="h-3 w-3 mr-1" /> Print
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">No orders found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}