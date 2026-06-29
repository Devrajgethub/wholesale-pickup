'use client';

import { useNavStore, useCartStore, useDataStore, useLanguageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const { t } = useLanguageStore();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [pickupDate, setPickupDate] = useState<Date>();
  const [paymentMethod, setPaymentMethod] = useState('Cash at Shop');
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

    if (!name.trim()) { setError(t('checkout.errorName')); return; }
    if (!mobile.trim() || mobile.length < 10) { setError(t('checkout.errorMobile')); return; }
    if (items.length === 0) { setError(t('checkout.errorCart')); return; }

    setLoading(true);

    try {
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
          paymentMethod,
          specialNote,
          pickupDate: pickupDate ? format(pickupDate, 'yyyy-MM-dd') : '',
          userId: null,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || t('checkout.errorFailed'));
      }

      const orderData = await orderRes.json();
      setPlacedOrderId(orderData.orderId);
      setOrderPlaced(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || t('checkout.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="h-10 w-10 text-[#0C831F]" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">{t('checkout.success')}</h2>
          <p className="text-sm text-gray-500 mt-2">
            {t('checkout.successMsg')}
          </p>
          <div className="bg-white rounded-xl p-4 mt-6 shadow-sm">
            <p className="text-sm text-gray-500">{t('checkout.orderId')}</p>
            <p className="text-2xl font-extrabold text-[#0C831F] mt-1">{placedOrderId}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 mt-3 text-left">
            <p className="text-sm text-yellow-800">
              <strong>{t('checkout.nextStep')}</strong> {t('checkout.nextStepMsg')}
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate('my-orders')}>{t('checkout.myOrders')}</Button>
            <Button className="flex-1 bg-[#0C831F] text-white rounded-xl" onClick={() => navigate('home')}>{t('checkout.continueShopping')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('checkout.title')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">{t('checkout.yourDetails')}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('checkout.fullName')}</Label>
                <Input id="name" placeholder={t('checkout.fullNamePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="mobile">{t('checkout.mobileNumber')}</Label>
                <Input id="mobile" type="tel" placeholder={t('checkout.mobilePlaceholder')} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="business">{t('checkout.businessName')}</Label>
                <Input id="business" placeholder={t('checkout.businessPlaceholder')} value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>{t('checkout.pickupDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal mt-1.5', !pickupDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupDate ? format(pickupDate, 'PPP') : t('checkout.selectPickupDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} disabled={(date) => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">{t('checkout.paymentMethod')}</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="Cash at Shop" id="cash" />
                <Label htmlFor="cash" className="cursor-pointer flex-1">
                  <div className="font-medium text-sm">{t('checkout.payAtShop')}</div>
                  <div className="text-xs text-gray-500">{t('checkout.payAtShopDesc')}</div>
                </Label>
                <span className="text-xl">💵</span>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="Online Paid" id="online" />
                <Label htmlFor="online" className="cursor-pointer flex-1">
                  <div className="font-medium text-sm">{t('checkout.payOnline')}</div>
                  <div className="text-xs text-gray-500">{t('checkout.payOnlineDesc')}</div>
                </Label>
                <span className="text-xl">📱</span>
              </div>
            </RadioGroup>
          </div>

          {/* Special Note */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">{t('checkout.specialNote')}</h3>
            <Textarea placeholder={t('checkout.specialNotePlaceholder')} value={specialNote} onChange={(e) => setSpecialNote(e.target.value)} rows={3} />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">{t('checkout.orderSummary')}</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-4">{item.productName} x {item.quantity}</span>
                  <span className="font-medium whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
              <span>{t('checkout.total')}</span>
              <span className="text-[#0C831F]">₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-14 rounded-2xl text-base"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {t('checkout.placeOrder')} - ₹{total.toLocaleString()}
          </Button>
        </form>
        <div className="h-4" />
      </div>
    </div>
  );
}
