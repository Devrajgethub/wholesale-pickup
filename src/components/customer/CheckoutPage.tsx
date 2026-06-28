'use client';

import { useNavStore, useCartStore, useDataStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { CalendarIcon, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const { navigate } = useNavStore();
  const { items, getTotal, clearCart } = useCartStore();
  const { fetchOrders } = useDataStore();
  const { customerName, customerMobile } = useAuthStore();

  const [name, setName] = useState(customerName || '');
  const [mobile, setMobile] = useState(customerMobile || '');
  const [pickupDate, setPickupDate] = useState<Date>();

  const [specialNote, setSpecialNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [businessName, setBusinessName] = useState('');

  const total = getTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!mobile.trim() || mobile.length < 10) { setError('Please enter valid mobile number'); return; }
    if (items.length === 0) { setError('Cart is empty'); return; }

    setLoading(true);

    try {
      // Create order directly (no login required)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          mobile,
          businessName,
          items: items.map(i => ({
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
            productId: i.productId,
          })),
          specialNote,
          pickupDate: pickupDate ? format(pickupDate, 'yyyy-MM-dd') : '',
          userId: null,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Failed to place order');
      }

      const orderData = await orderRes.json();
      setPlacedOrderId(orderData.orderId);
      setOrderPlaced(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111827] dark:bg-[#111827] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="h-10 w-10 text-[#0C831F]" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Order Placed!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            We will notify you when your order is ready for pickup.
          </p>
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl p-4 mt-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
            <p className="text-2xl font-extrabold text-[#0C831F] mt-1">{placedOrderId}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mt-3 text-left">
            <p className="text-sm text-yellow-800">
              <strong>Next Step:</strong> Visit the shop with your Order ID when you receive the &quot;Ready for Pickup&quot; message.
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate('my-orders')}>My Orders</Button>
            <Button className="flex-1 bg-[#0C831F] text-white rounded-xl" onClick={() => navigate('home')}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111827] dark:bg-[#111827]">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Checkout</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Your Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input id="mobile" type="tel" placeholder="10-digit mobile number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="business">Business / Shop Name</Label>
                <Input id="business" placeholder="Your shop or business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Pickup Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal mt-1.5', !pickupDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupDate ? format(pickupDate, 'PPP') : 'Select pickup date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} disabled={(date) => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Payment Method</h3>
            <div className="flex items-center space-x-3 p-3 border rounded-xl bg-gray-50 dark:bg-[#111827]">
              <span className="text-xl">💵</span>
              <div>
                <div className="font-medium text-sm">Cash at Shop</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pay when you pick up your order</div>
              </div>
            </div>
          </div>

          {/* Special Note */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Special Note</h3>
            <Textarea placeholder="Any special instructions for your order..." value={specialNote} onChange={(e) => setSpecialNote(e.target.value)} rows={3} />
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Order Summary</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 truncate mr-4">{item.productName} x {item.quantity}</span>
                  <span className="font-medium whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-[#0C831F]">₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-3 rounded-xl">{error}</div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-14 rounded-2xl text-base"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Place Pickup Order - ₹{total.toLocaleString()}
          </Button>
        </form>
        <div className="h-4" />
      </div>
    </div>
  );
}