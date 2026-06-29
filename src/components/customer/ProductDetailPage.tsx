'use client';

import { useNavStore, useDataStore, useCartStore, useLanguageStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Minus, Plus, ShoppingCart, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const { selectedProductId, navigate } = useNavStore();
  const { products, fetchProducts } = useDataStore();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const { t } = useLanguageStore();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const product = products.find((p: Product) => p.id === selectedProductId);
  const cartItem = items.find(i => i.productId === selectedProductId);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">{t('detail.productNotFound')}</h3>
          <Button className="mt-4 bg-[#0C831F] text-white" onClick={() => navigate('home')}>{t('detail.goHome')}</Button>
        </div>
      </div>
    );
  }

  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const savings = (product.mrp - product.price) * quantity;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      mrp: product.mrp,
      unit: product.unit,
      quantity: 1,
      image: product.image,
      minQuantity: product.minQuantity,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-600" onClick={() => navigate('products')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-medium text-gray-900 text-sm truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Image */}
          <div className="aspect-square bg-gray-50 flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">📦</span>
            )}
          </div>

          {/* Details */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{product.unit}</p>
              </div>
              {discount > 0 && (
                <span className="bg-green-100 text-[#0C831F] text-xs font-bold px-2 py-1 rounded-lg">{discount}% {t('detail.off')}</span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-extrabold text-gray-900">₹{product.price.toLocaleString()}</span>
              {product.mrp > product.price && (
                <span className="text-lg text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-sm text-[#0C831F] font-medium mt-1">{t('detail.youSave')} ₹{savings.toLocaleString()} {t('detail.onThisOrder')}</p>
            )}

            {/* Info */}
            <div className="mt-6 space-y-3 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('detail.stockAvailable')}</span>
                <span className={`font-medium ${product.stock > 5 ? 'text-[#0C831F]' : 'text-red-500'}`}>{product.stock} {t('cart.units')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('detail.minimumOrder')}</span>
                <span className="font-medium text-gray-900">{product.minQuantity} {product.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('detail.category')}</span>
                <span className="font-medium text-gray-900">{product.category?.name}</span>
              </div>
            </div>

            {/* Quantity + Add */}
            <div className="mt-6 pt-4 border-t">
              {cartItem ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 border-2 border-[#0C831F] rounded-xl px-4 py-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      if (cartItem.quantity <= product.minQuantity) removeItem(product.id);
                      else updateQuantity(product.id, cartItem.quantity - 1);
                    }}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">{cartItem.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button className="w-full bg-yellow-400 text-green-900 hover:bg-yellow-300 font-bold h-12 rounded-xl" onClick={() => navigate('cart')}>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {t('detail.goToCart')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-14 rounded-xl text-lg"
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                >
                  {product.stock > 0 ? t('detail.addToCart') : t('detail.outOfStock')}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
