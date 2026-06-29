'use client';

import { useNavStore, useDataStore, useCartStore, useLanguageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, ShieldCheck, Percent } from 'lucide-react';
import { useEffect } from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

const categoryEmojis: Record<string, string> = {
  'cooking-oil': '🫗',
  'rice-grains': '🍚',
  'spices-masala': '🌶️',
  'flour-atta': '🌾',
  'pulses-dal': '🫘',
  'sugar-salt': '🧂',
  'snacks-namkeen': '🍿',
  'cleaning': '🧹',
};

export default function HomePage() {
  const { categories, featuredProducts, bestSellingProducts, fetchCategories, fetchFeaturedProducts, fetchBestSellingProducts } = useDataStore();
  const { setCategory } = useNavStore();
  const { items, getTotal } = useCartStore();
  const { t } = useLanguageStore();

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    fetchBestSellingProducts();
  }, []);

  const cartTotal = getTotal();
  const hasCartItems = items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0C831F] to-[#0fa828] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight"
              >
                {t('home.heroTitle')}
                <br />
                <span className="text-yellow-300">{t('home.heroHighlight')}</span>
              </motion.h1>
              <p className="mt-3 text-green-100 text-sm md:text-base max-w-lg">
                {t('home.heroSubtitle')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="bg-yellow-400 text-green-900 hover:bg-yellow-300 font-bold rounded-full px-6" onClick={() => setCategory('cooking-oil')}>
                  {t('home.shopNow')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-6" onClick={() => useNavStore.getState().navigate('categories')}>
                  {t('home.browseCategories')}
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="w-40 h-40 md:w-52 md:h-52 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <span className="text-5xl md:text-6xl block mb-2">🏪</span>
                  <p className="text-xs font-medium text-green-200">{t('home.bulkOrders')}</p>
                  <p className="text-xs text-green-200">{t('home.bestPrices')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Truck, text: t('home.freePickup'), color: 'text-[#0C831F]' },
              { icon: ShieldCheck, text: t('home.genuine'), color: 'text-blue-600' },
              { icon: Percent, text: t('home.wholesalePrices'), color: 'text-orange-500' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 justify-center">
                <f.icon className={`h-5 w-5 ${f.color}`} />
                <span className="text-xs md:text-sm font-medium text-gray-700">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('home.shopByCategory')}</h2>
            <Button variant="link" className="text-[#0C831F] text-sm" onClick={() => useNavStore.getState().navigate('categories')}>
              {t('home.seeAll')}
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat.slug)}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all w-20"
              >
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100">
                  <span className="text-2xl">{categoryEmojis[cat.slug] || '📦'}</span>
                </div>
                <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('home.featuredProducts')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featuredProducts.slice(0, 10).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Best Selling */}
      {bestSellingProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('home.bestSelling')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {bestSellingProducts.slice(0, 10).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Floating Cart Bar */}
      {hasCartItems && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
        >
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <Button
              className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-14 rounded-2xl shadow-xl flex items-center justify-between px-6 text-base"
              onClick={() => useNavStore.getState().navigate('cart')}
            >
              <div className="flex items-center gap-3">
                <span className="bg-yellow-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded">{items.length} {items.length > 1 ? t('home.items') : t('home.item')}</span>
                <span>{t('home.viewCart')}</span>
              </div>
              <span>₹{cartTotal.toLocaleString()}</span>
            </Button>
          </div>
        </motion.div>
      )}

      <div className="h-20" />
    </div>
  );
}