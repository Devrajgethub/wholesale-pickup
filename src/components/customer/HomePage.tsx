'use client';

import { useNavStore, useDataStore, useCartStore } from '@/lib/store';
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

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    fetchBestSellingProducts();
  }, []);

  const cartTotal = getTotal();
  const hasCartItems = items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111827] dark:bg-[#111827]">
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
                Wholesale Items at
                <br />
                <span className="text-yellow-300">Best Price</span>
              </motion.h1>
              <p className="mt-3 text-green-100 text-sm md:text-base max-w-lg">
                Order online from your favorite wholesale store. Pick up at shop when ready. No delivery charges!
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="bg-yellow-400 text-green-900 hover:bg-yellow-300 font-bold rounded-full px-6" onClick={() => setCategory('cooking-oil')}>
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-6" onClick={() => useNavStore.getState().navigate('categories')}>
                  Browse Categories
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-44 h-44 md:w-56 md:h-56">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-[spin_20s_linear_infinite]" />
                {/* Middle ring with gradient */}
                <div className="absolute inset-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center">
                  {/* Inner glowing circle */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-yellow-400/20 to-green-300/20 border border-white/30 flex flex-col items-center justify-center gap-2">
                    {/* Shop SVG Icon */}
                    <svg viewBox="0 0 64 64" className="w-14 h-14 md:w-16 md:h-16 drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Shop body */}
                      <rect x="8" y="28" width="48" height="28" rx="3" fill="white" fill-opacity="0.95"/>
                      {/* Awning */}
                      <path d="M4 28 L8 28 L8 14 C8 12 9 10 12 10 L20 10 L20 14 C20 17 22 19 25 19 C28 19 30 17 30 14 L30 10 L34 10 L34 14 C34 17 36 19 39 19 C42 19 44 17 44 14 L44 10 L52 10 C55 10 56 12 56 14 L56 28 L60 28" fill="#FFD700" stroke="white" stroke-width="1.5"/>
                      {/* Door */}
                      <rect x="24" y="36" width="16" height="20" rx="2" fill="#0C831F"/>
                      <circle cx="37" cy="47" r="1.5" fill="#FFD700"/>
                      {/* Window left */}
                      <rect x="12" y="34" width="8" height="8" rx="1" fill="#87CEEB" fill-opacity="0.8"/>
                      <line x1="16" y1="34" x2="16" y2="42" stroke="white" stroke-width="0.8"/>
                      <line x1="12" y1="38" x2="20" y2="38" stroke="white" stroke-width="0.8"/>
                      {/* Window right */}
                      <rect x="44" y="34" width="8" height="8" rx="1" fill="#87CEEB" fill-opacity="0.8"/>
                      <line x1="48" y1="34" x2="48" y2="42" stroke="white" stroke-width="0.8"/>
                      <line x1="44" y1="38" x2="52" y2="38" stroke="white" stroke-width="0.8"/>
                      {/* Open sign glow */}
                      <rect x="27" y="40" width="10" height="4" rx="1" fill="#FFD700"/>
                    </svg>
                    {/* Text below icon */}
                    <div className="text-center -mt-1">
                      <p className="text-[11px] md:text-xs font-bold text-white tracking-wide">BULK ORDERS</p>
                      <div className="w-8 h-[1px] bg-yellow-400/60 mx-auto my-1" />
                      <p className="text-[10px] md:text-[11px] font-medium text-green-100 tracking-wider">BEST PRICES</p>
                    </div>
                    {/* Sparkle decorations */}
                    <div className="absolute -top-1 -right-1 w-4 h-4">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse opacity-80" />
                    </div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Truck, text: 'Free Shop Pickup', color: 'text-[#0C831F]' },
              { icon: ShieldCheck, text: '100% Genuine', color: 'text-blue-600' },
              { icon: Percent, text: 'Wholesale Prices', color: 'text-orange-500' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 justify-center">
                <f.icon className={`h-5 w-5 ${f.color}`} />
                <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">Shop by Category</h2>
            <Button variant="link" className="text-[#0C831F] text-sm" onClick={() => useNavStore.getState().navigate('categories')}>
              See All
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat.slug)}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white hover:shadow-lg dark:hover:shadow-gray-900/40 transition-all w-20"
              >
                <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center border-2 border-green-100 dark:border-green-800">
                  <span className="text-2xl">{categoryEmojis[cat.slug] || '📦'}</span>
                </div>
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">Featured Products</h2>
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
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">Best Selling</h2>
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
                <span className="bg-yellow-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded">{items.length} item{items.length > 1 ? 's' : ''}</span>
                <span>View Cart</span>
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