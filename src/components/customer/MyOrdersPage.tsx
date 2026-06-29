'use client';

import { useNavStore, useDataStore, useLanguageStore, Order } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Package, Search, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const statusConfig: Record<string, { color: string; icon: any; bg: string; darkBg?: string; darkColor?: string }> = {
  'Pending': { color: 'text-yellow-700 dark:text-yellow-300', icon: Clock, bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
  'Accepted': { color: 'text-blue-700 dark:text-blue-300', icon: Clock, bg: 'bg-blue-50 dark:bg-blue-900/30' },
  'Packing': { color: 'text-orange-700 dark:text-orange-300', icon: Package, bg: 'bg-orange-50 dark:bg-orange-900/30' },
  'Ready for Pickup': { color: 'text-green-700 dark:text-green-300', icon: CheckCircle, bg: 'bg-green-50 dark:bg-green-900/30' },
  'Completed': { color: 'text-green-700 dark:text-green-300', icon: CheckCircle, bg: 'bg-green-50 dark:bg-green-900/40' },
  'Cancelled': { color: 'text-red-700 dark:text-red-300', icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/30' },
};

const statusTranslationKeys: Record<string, string> = {
  'Pending': 'status.pending',
  'Accepted': 'status.accepted',
  'Packing': 'status.packing',
  'Ready for Pickup': 'status.readyForPickup',
  'Completed': 'status.completed',
  'Cancelled': 'status.cancelled',
};

export default function MyOrdersPage() {
  const { navigate } = useNavStore();
  const { orders, fetchOrders } = useDataStore();
  const { t } = useLanguageStore();
  const [mobileInput, setMobileInput] = useState('');
  const [searched, setSearched] = useState(false);

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
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('orders.myOrders')}</h2>

        {/* Search - always visible */}
        <form onSubmit={handleSearch} className="mb-6">
          <Label>{t('orders.mobileHint')}</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              type="tel"
              placeholder={t('checkout.mobilePlaceholder')}
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="flex-1"
            />
            <Button type="submit" className="bg-[#0C831F] text-white">{t('orders.search')}</Button>
          </div>
        </form>

        {/* Orders List */}
        {searched && orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">{t('orders.noOrders')}</h3>
            <p className="text-sm text-gray-400 mt-1">{t('orders.noOrdersHint')}</p>
            <Button className="mt-4 bg-[#0C831F] text-white" onClick={() => navigate('home')}>{t('orders.startShopping')}</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: Order) => {
              const status = statusConfig[order.orderStatus] || statusConfig['Pending'];
              const StatusIcon = status.icon;
              const statusKey = statusTranslationKeys[order.orderStatus] || 'status.pending';

              return (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">#{order.orderId}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {t(statusKey as any)}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <span key={i}>
                        {item.productName} x{item.quantity}
                        {i < Math.min(order.items.length, 3) - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {order.items.length > 3 && <span className="text-gray-400"> +{order.items.length - 3} {t('orders.more')}</span>}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <span className="font-bold text-lg text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                      <Badge variant="secondary" className="ml-2 text-[10px]">{order.paymentMethod}</Badge>
                    </div>
                    {order.orderStatus === 'Ready for Pickup' && (
                      <div className="text-xs text-[#0C831F] font-medium flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        {t('orders.visitShop')}
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