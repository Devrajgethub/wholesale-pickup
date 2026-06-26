'use client';

import { useNavStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
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

const categoryColors: Record<string, string> = {
  'cooking-oil': 'bg-amber-50 border-amber-200',
  'rice-grains': 'bg-orange-50 border-orange-200',
  'spices-masala': 'bg-red-50 border-red-200',
  'flour-atta': 'bg-yellow-50 border-yellow-200',
  'pulses-dal': 'bg-lime-50 border-lime-200',
  'sugar-salt': 'bg-sky-50 border-sky-200',
  'snacks-namkeen': 'bg-purple-50 border-purple-200',
  'cleaning': 'bg-cyan-50 border-cyan-200',
};

export default function CategoriesPage() {
  const { categories, fetchCategories } = useDataStore();
  const { setCategory } = useNavStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Categories</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCategory(cat.slug)}
              className={`p-5 rounded-2xl border-2 ${categoryColors[cat.slug] || 'bg-gray-50 border-gray-200'} hover:shadow-lg transition-shadow text-left`}
            >
              <span className="text-4xl block mb-3">{categoryEmojis[cat.slug] || '📦'}</span>
              <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{cat._count?.products || 0} products</p>
              <div className="flex items-center gap-1 mt-3 text-[#0C831F]">
                <span className="text-xs font-medium">Browse</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}