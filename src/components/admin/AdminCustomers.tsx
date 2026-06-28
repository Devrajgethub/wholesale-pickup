'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useNavStore } from '@/lib/store';
import { Search, Users, Loader2, ChevronRight, IndianRupee, Clock, Package } from 'lucide-react';

interface CustomerSummary {
  name: string;
  mobile: string;
  businessName: string;
  totalOrders: number;
  totalItems: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  lastOrderDate: string;
}

export default function AdminCustomers() {
  const { setCustomerMobile } = useNavStore();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search) ||
    (c.businessName && c.businessName.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPending = customers.reduce((s, c) => s + c.totalPending, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500">{customers.length} registered customers</p>
          </div>
          {totalPending > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
              <p className="text-xs text-orange-600">Total Pending</p>
              <p className="text-lg font-extrabold text-orange-700">₹{totalPending.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#0C831F]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">{search ? 'No customers found' : 'No customers yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cust) => (
              <Card
                key={cust.mobile}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCustomerMobile(cust.mobile)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0C831F] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">{cust.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{cust.name}</p>
                        <p className="text-xs text-gray-500">{cust.mobile}</p>
                        {cust.businessName && <p className="text-xs text-gray-400">{cust.businessName}</p>}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Package className="h-3 w-3" /> {cust.totalOrders} orders
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <IndianRupee className="h-3 w-3" /> {cust.totalItems} items
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {cust.totalPaid > 0 && (
                            <span className="text-[10px] text-green-600 font-medium">Paid: ₹{cust.totalPaid.toLocaleString()}</span>
                          )}
                          {cust.totalPending > 0 && (
                            <span className="text-[10px] text-orange-600 font-medium">Pending: ₹{cust.totalPending.toLocaleString()}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" /> {new Date(cust.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}