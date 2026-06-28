'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavStore } from '@/lib/store';
import { ChevronLeft, IndianRupee, Package, Clock, CheckCircle, AlertTriangle, Loader2, Phone, Building2 } from 'lucide-react';

interface CustomerDetail {
  name: string;
  mobile: string;
  businessName: string;
  totalOrders: number;
  totalItems: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: {
    id: string;
    orderId: string;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    pickupStatus: string;
    createdAt: string;
    items: { productName: string; quantity: number; price: number; total: number }[];
  }[];
}

export default function AdminCustomerDetail() {
  const { selectedCustomerMobile, setOrder } = useNavStore();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCustomerMobile) {
      fetchCustomer();
    }
  }, [selectedCustomerMobile]);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?mobile=${selectedCustomerMobile}`);
      if (!res.ok) {
        setCustomer(null);
        return;
      }
      const data = await res.json();
      setCustomer(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#0C831F]" /></div>;
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Button variant="ghost" className="mb-3" onClick={() => useNavStore.getState().navigate('admin-customers')}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Customers
        </Button>

        {/* Customer Info Card */}
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#0C831F] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">{customer.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">{customer.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Phone className="h-3.5 w-3.5" /> {customer.mobile}
                  </p>
                  {customer.businessName && (
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3.5 w-3.5" /> {customer.businessName}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    First order: {new Date(customer.firstOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' — '}
                    Last: {new Date(customer.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-extrabold text-gray-900">{customer.totalOrders}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <IndianRupee className="h-5 w-5 text-gray-500 mx-auto mb-1" />
              <p className="text-2xl font-extrabold text-gray-900">{customer.totalItems}</p>
              <p className="text-xs text-gray-500">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-extrabold text-green-600">₹{customer.totalPaid.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-extrabold text-orange-600">₹{customer.totalPending.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Grand Total */}
        <Card className="mb-4 border-2 border-[#0C831F]">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="font-bold text-gray-700">Grand Total (All Orders)</span>
            <span className="text-2xl font-extrabold text-[#0C831F]">₹{customer.totalAmount.toLocaleString()}</span>
          </CardContent>
        </Card>

        {/* Orders List */}
        <h3 className="font-bold text-gray-900 mb-3">Order History ({customer.orders.length})</h3>
        <div className="space-y-3">
          {customer.orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setOrder(order.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">#{order.orderId}</p>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {order.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">{order.orderStatus}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' '}
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {order.items.map((i, idx) => (
                        <span key={idx}>{i.productName} x{i.quantity}{idx < order.items.length - 1 ? ', ' : ''}</span>
                      ))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                    <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180 mt-1 ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}