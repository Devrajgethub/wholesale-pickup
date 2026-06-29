'use client';

import { useNavStore, useCartStore, useDataStore, useLanguageStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { setProduct } = useNavStore();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const { t } = useLanguageStore();
  const cartItem = items.find(i => i.productId === product.id);

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

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

  if (cartItem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-[#0C831F] rounded-xl p-3 bg-[#0C831F]/5 flex flex-col h-full"
      >
        <div className="cursor-pointer" onClick={() => setProduct(product.id)}>
          <div className="aspect-square bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</p>
          <p className="text-xs text-gray-500 mt-1">{product.unit}</p>
        </div>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center justify-between bg-[#0C831F] rounded-lg">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9" onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}>
              {cartItem.quantity <= 1 ? <ShoppingCart className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            </Button>
            <span className="text-white font-bold text-sm">{cartItem.quantity}</span>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9" onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="border border-gray-100 rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <div className="cursor-pointer" onClick={() => setProduct(product.id)}>
        <div className="aspect-square bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-green-900 text-[10px] font-bold px-1.5 py-0.5 rounded">{discount}% {t('detail.off')}</span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{t('card.lowStock')}</span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</p>
        <p className="text-xs text-gray-500 mt-1">{product.unit}</p>
      </div>
      <div className="mt-auto pt-2">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-base font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
          )}
        </div>
        {product.stock > 0 ? (
          <Button
            className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold text-sm h-10 rounded-lg"
            onClick={handleAdd}
          >
            {t('card.add')}
          </Button>
        ) : (
          <Button className="w-full bg-gray-200 text-gray-500 font-bold text-sm h-10 rounded-lg cursor-not-allowed" disabled>
            {t('card.outOfStock')}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
