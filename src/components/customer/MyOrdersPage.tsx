'use client';

import { useNavStore, useAuthStore, useDataStore, Order } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Package, Search, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const statusConfig: Record<string, { color: string; icon: any; bg: string }> = {
  'Pending': { color: 'text-yellow-700', icon: Clock, bg: 'bg-yellow-50' },
  'Accepted': { color: 'text-blue-700', icon: Clock, bg: 'bg-blue-50' },
  'Packing': { color: 'text-orange-700', icon: Package, bg: 'bg-orange-50' },
  'Ready for Pickup': { color: 'text-green-700', icon: CheckCircle, bg: 'bg-green-50' },
  'Completed': { color: 'text-green-700', icon: CheckCircle, bg: 'bg-green-50' },
  'Cancelled': { color: 'text-red-700', icon: XCircle, bg: 'bg-red-50' },
};

export default function MyOrdersPage() {
  const { navigate } = useNavStore();
  const { user, isLoggedIn } = useAuthStore();
  const { orders, fetchOrders } = useDataStore();
  const [mobileInput, setMobileInput] = useState(user?.mobile || '');
  const [searched, setSearched] = useState(!!user?.mobile);

  useEffect(() => {
    if (user?.mobile) {
      fetchOrders({ mobile: user.mobile });
    }
  }, [user?.mobile]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileInput.length >= 10) {
      fetchOrders({ mobile: mobileInput });
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Orders</h2>

        {/* Search */}
        {!isLoggedIn && (
          <form onSubmit={handleSearch} className="mb-6">
            <Label>Enter your mobile number to find orders</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1"
              />
              <Button type="submit" className="bg-[#0C831F] text-white">Search</Button>
            </div>
          </form>
        )}

        {/* Orders List */}
        {searched && orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No orders found</h3>
            <p className="text-sm text-gray-400 mt-1">Place your first order to see it here</p>
            <Button className="mt-4 bg-[#0C831F] text-white" onClick={() => navigate('home')}>Start Shopping</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: Order) => {
              const status = statusConfig[order.orderStatus] || statusConfig['Pending'];
              const StatusIcon = status.icon;

              return (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">#{order.orderId}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {order.orderStatus}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <span key={i}>
                        {item.productName} x{item.quantity}
                        {i < Math.min(order.items.length, 3) - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {order.items.length > 3 && <span className="text-gray-400"> +{order.items.length - 3} more</span>}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <span className="font-bold text-lg text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                      <Badge variant="secondary" className="ml-2 text-[10px]">{order.paymentMethod}</Badge>
                    </div>
                    {order.orderStatus === 'Ready for Pickup' && (
                      <div className="text-xs text-[#0C831F] font-medium flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        Visit shop to collect
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}