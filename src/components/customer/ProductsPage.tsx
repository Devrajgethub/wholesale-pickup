'use client';

import { useNavStore, useDataStore, useCartStore } from '@/lib/store';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect } from 'react';

export default function ProductsPage() {
  const { products, categories, loading, fetchProducts, fetchCategories } = useDataStore();
  const { selectedCategory, searchQuery, navigate, setCategory } = useNavStore();
  const { items, getTotal } = useCartStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params: { category?: string; search?: string } = {};
    if (selectedCategory) params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;
    fetchProducts(params);
  }, [selectedCategory, searchQuery]);

  const currentCategory = categories.find(c => c.slug === selectedCategory);
  const cartTotal = getTotal();
  const hasCartItems = items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111827] dark:bg-[#111827]">
      {/* Category Filter Bar */}
      <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => { useNavStore.setState({ selectedCategory: '', searchQuery: '' }); }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedCategory && !searchQuery ? 'bg-[#0C831F] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:bg-gray-700'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.slug)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat.slug ? 'bg-[#0C831F] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:bg-gray-700'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {searchQuery ? `Search: "${searchQuery}"` : currentCategory?.name || 'All Products'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{products.length} products found</p>
          </div>
          {(selectedCategory || searchQuery) && (
            <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400" onClick={() => { useNavStore.setState({ selectedCategory: '', searchQuery: '' }); navigate('home'); }}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border rounded-xl p-3 bg-white">
                <Skeleton className="aspect-square rounded-lg mb-2" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <SlidersHorizontal className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No products found</h3>
            <p className="text-sm text-gray-400 mt-1">Try a different category or search term</p>
            <Button className="mt-4 bg-[#0C831F] hover:bg-[#0a6e1a] text-white" onClick={() => navigate('home')}>
              Browse All Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {hasCartItems && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <Button
              className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-14 rounded-2xl shadow-xl flex items-center justify-between px-6 text-base"
              onClick={() => navigate('cart')}
            >
              <div className="flex items-center gap-3">
                <span className="bg-yellow-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded">{items.length} item{items.length > 1 ? 's' : ''}</span>
                <span>View Cart</span>
              </div>
              <span>₹{cartTotal.toLocaleString()}</span>
            </Button>
          </div>
        </div>
      )}
      <div className="h-20" />
    </div>
  );
}