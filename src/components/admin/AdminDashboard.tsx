'use client';

import { useDataStore, useLanguageStore, Order } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';
import { Package, ShoppingCart, IndianRupee, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const statusTranslationKeys: Record<string, string> = {
  'Pending': 'status.pending',
  'Accepted': 'status.accepted',
  'Packing': 'status.packing',
  'Ready for Pickup': 'status.readyForPickup',
  'Completed': 'status.completed',
  'Cancelled': 'status.cancelled',
};

export default function AdminDashboard() {
  const { orders, products, categories, fetchOrders, fetchProducts, fetchCategories } = useDataStore();
  const { t } = useLanguageStore();

  useEffect(() => {
    fetchOrders();
    fetchProducts({ all: true });
    fetchCategories();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const readyOrders = orders.filter(o => o.pickupStatus === 'Ready').length;
  const completedOrders = orders.filter(o => o.orderStatus === 'Completed').length;
  const todayOrders = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.createdAt).toDateString() === today;
  });

  const stats = [
    { label: t('dashboard.totalRevenue'), value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: t('dashboard.totalOrders'), value: orders.length.toString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: t('dashboard.pendingOrders'), value: pendingOrders.toString(), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { label: t('dashboard.readyForPickup'), value: readyOrders.toString(), icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
    { label: t('dashboard.totalProducts'), value: products.length.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: t('dashboard.categories'), value: categories.length.toString(), icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  ];

  const recentOrders = orders.slice(0, 5);

  const statusColor: Record<string, string> = {
    'Pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    'Accepted': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    'Packing': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    'Ready for Pickup': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    'Completed': 'bg-green-200 dark:bg-green-900/40 text-green-900 dark:text-green-300',
    'Cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.welcome')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`${stat.bg} ${stat.border} border`}>
                <CardContent className="p-4">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                  <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Today Summary */}
        <div className="bg-gradient-to-r from-[#0C831F] to-[#0fa828] rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">{t('dashboard.todaysOrders')}</p>
              <p className="text-3xl font-extrabold mt-1">{todayOrders.length}</p>
            </div>
            <div className="text-right">
              <p className="text-green-200 text-sm">{t('dashboard.todaysRevenue')}</p>
              <p className="text-3xl font-extrabold mt-1">₹{todayOrders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('dashboard.recentOrders')}</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-600">{t('dashboard.orderId')}</th>
                      <th className="text-left p-3 font-medium text-gray-600">{t('dashboard.customer')}</th>
                      <th className="text-left p-3 font-medium text-gray-600 hidden md:table-cell">{t('dashboard.items')}</th>
                      <th className="text-left p-3 font-medium text-gray-600">{t('dashboard.total')}</th>
                      <th className="text-left p-3 font-medium text-gray-600">{t('dashboard.status')}</th>
                      <th className="text-left p-3 font-medium text-gray-600">{t('dashboard.payment')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order: Order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3 font-bold text-[#0C831F]">#{order.orderId}</td>
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-xs text-gray-500">{order.mobile}</div>
                        </td>
                        <td className="p-3 hidden md:table-cell">{order.items.length} {t('dashboard.items').toLowerCase()}</td>
                        <td className="p-3 font-bold">₹{order.totalAmount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.orderStatus] || 'bg-gray-100'}`}>
                            {t(statusTranslationKeys[order.orderStatus] as any)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-medium ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-400">{t('dashboard.noOrders')}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}