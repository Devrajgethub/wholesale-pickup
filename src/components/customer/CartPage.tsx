'use client';

import { useNavStore, useCartStore, useLanguageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { navigate } = useNavStore();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { t } = useLanguageStore();

  const total = getTotal();
  const mrpTotal = items.reduce((sum, i) => sum + i.mrp * i.quantity, 0);
  const savings = mrpTotal - total;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10 text-[#0C831F]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('cart.empty')}</h2>
          <p className="text-sm text-gray-500 mt-2">{t('cart.emptyHint')}</p>
          <Button className="mt-6 bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold rounded-xl px-8" onClick={() => navigate('home')}>
            {t('cart.startShopping')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('cart.myCart')} ({items.length})</h2>
          <Button variant="ghost" size="sm" className="text-red-500 text-xs" onClick={clearCart}>{t('cart.clearAll')}</Button>
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h3>
                    <p className="text-xs text-gray-500">{item.unit}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                      {item.mrp > item.price && (
                        <span className="text-xs text-gray-400 line-through">₹{item.mrp.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500 h-8 w-8 flex-shrink-0" onClick={() => removeItem(item.productId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-3 border border-gray-200 rounded-lg">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      if (item.quantity <= item.minQuantity) removeItem(item.productId);
                      else updateQuantity(item.productId, item.quantity - 1);
                    }}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-xl p-5 mt-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">{t('cart.billDetails')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('cart.mrpTotal')}</span>
              <span className="text-gray-400">₹{mrpTotal.toLocaleString()}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-[#0C831F]">
                <span>{t('cart.wholesaleDiscount')}</span>
                <span>- ₹{savings.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>{t('cart.grandTotal')}</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="mt-4 pb-4">
          <Button
            className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-14 rounded-2xl text-base flex items-center justify-center gap-2"
            onClick={() => navigate('checkout')}
          >
            {t('cart.placePickupOrder')}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}