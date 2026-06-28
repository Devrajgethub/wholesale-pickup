'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavStore } from '@/lib/store';
import { ChevronLeft, ChevronRight, Users, ShoppingCart, IndianRupee, Package, AlertTriangle, Loader2 } from 'lucide-react';

interface CustomerSummary {
  name: string;
  mobile: string;
  businessName: string;
  orderCount: number;
  totalItems: number;
  totalPayment: number;
  orders: any[];
}

interface ReportData {
  month: string;
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  customers: CustomerSummary[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AdminMonthlyReport() {
  const { navigate, setOrder } = useNavStore();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  // Month navigation
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    fetchReport();
  }, [monthStr]);

  const fetchReport = async () => {
    setLoading(true);
    setSelectedCustomer(null);
    try {
      const res = await fetch(`/api/admin/monthly-report?month=${monthStr}`);
      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else { setMonth(month - 1); }
  };

  const nextMonth = () => {
    const nowDate = new Date();
    // Don't go beyond current month
    if (year === nowDate.getFullYear() && month === nowDate.getMonth()) return;
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else { setMonth(month + 1); }
  };

  const savings = report ? report.customers.reduce((s, c) => {
    // Calculate original amount vs what they actually paid
    const original = c.orders.reduce((os: number, o: any) => {
      return os + o.items.reduce((is: number, i: any) => is + (i.price * i.quantity), 0);
    }, 0);
    return s + (original - c.totalPayment);
  }, 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111827] dark:bg-[#111827]">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Monthly Report</h2>

        {/* Month Navigator */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm mb-4">
          <Button variant="outline" size="sm" onClick={prevMonth} disabled={year === now.getFullYear() && month === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{MONTHS[month]} {year}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customer Order Summary</p>
          </div>
          <Button variant="outline" size="sm" onClick={nextMonth} disabled={year === now.getFullYear() && month === now.getMonth()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#0C831F]" /></div>
        ) : !report ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">Failed to load report</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{report.customers.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{report.totalOrders}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <IndianRupee className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">₹{report.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{report.totalItems}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
                </CardContent>
              </Card>
            </div>

            {savings > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm text-orange-700">
                  <strong>Bargaining Discount Given:</strong> ₹{savings.toLocaleString()} this month
                </p>
              </div>
            )}

            {report.customers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No orders this month</p>
              </div>
            ) : selectedCustomer ? (
              /* Customer Detail View */
              <div>
                <Button variant="ghost" className="mb-3" onClick={() => setSelectedCustomer(null)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back to all customers
                </Button>
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{selectedCustomer.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.mobile}</p>
                        {selectedCustomer.businessName && <p className="text-sm text-gray-400">{selectedCustomer.businessName}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-extrabold text-[#0C831F]">₹{selectedCustomer.totalPayment.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.orderCount} orders</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{selectedCustomer.totalItems} items ordered</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer's Orders */}
                <div className="space-y-3">
                  {selectedCustomer.orders.map((order: any) => (
                    <Card key={order.id} className="cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/40 transition-shadow" onClick={() => { setOrder(order.id); navigate('admin-order-detail'); }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">#{order.orderId}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {order.items.map((i: any, idx: number) => (
                                <span key={idx}>{i.productName} x{i.quantity}{idx < order.items.length - 1 ? ', ' : ''}</span>
                              ))}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-gray-100">₹{order.totalAmount.toLocaleString()}</p>
                            <Badge variant="secondary" className="text-[10px] mt-1">{order.orderStatus}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              /* Customer List */
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50 dark:bg-gray-800/50 dark:bg-[#111827]">
                          <th className="text-left p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                          <th className="text-center p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Orders</th>
                          <th className="text-center p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Items</th>
                          <th className="text-right p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total Payment</th>
                          <th className="text-right p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Last Order</th>
                          <th className="p-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.customers.map((cust, idx) => (
                          <tr key={cust.mobile} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-[#111827] cursor-pointer" onClick={() => setSelectedCustomer(cust)}>
                            <td className="p-3">
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{cust.name}</p>
                              <p className="text-xs text-gray-400">{cust.mobile}</p>
                              {cust.businessName && <p className="text-xs text-gray-400">{cust.businessName}</p>}
                            </td>
                            <td className="text-center p-3">
                              <span className="text-sm font-bold">{cust.orderCount}</span>
                            </td>
                            <td className="text-center p-3">
                              <span className="text-sm font-bold">{cust.totalItems}</span>
                            </td>
                            <td className="text-right p-3">
                              <span className="text-sm font-extrabold text-[#0C831F]">₹{cust.totalPayment.toLocaleString()}</span>
                            </td>
                            <td className="text-right p-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(cust.orders[0]?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                              <p className="text-[10px] text-gray-400">{new Date(cust.orders[0]?.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                            </td>
                            <td className="p-3 text-right">
                              <ChevronRight className="h-4 w-4 text-gray-400 inline" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}