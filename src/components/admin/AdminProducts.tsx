'use client';

import { useDataStore, useNavStore, useLanguageStore, Product, Category } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProducts() {
  const { products, categories, fetchProducts, fetchCategories } = useDataStore();
  const { navigate, setSelectedProductId } = useNavStore();
  const { t } = useLanguageStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts({ all: true });
    fetchCategories();
  }, []);

  const filtered = products.filter((p: Product) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || p.categoryId === filterCategory;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      fetchProducts({ all: true });
      setDeleteConfirm(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{t('adminProducts.title')}</h1>
            <p className="text-sm text-gray-500">{products.length} {t('adminProducts.totalProducts')}</p>
          </div>
          <Button className="bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold" onClick={() => navigate('admin-add-product')}>
            <Plus className="h-4 w-4 mr-2" /> {t('adminProducts.addProduct')}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder={t('adminProducts.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t('adminProducts.allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('adminProducts.allCategories')}</SelectItem>
              {categories.map((cat: Category) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-600">{t('adminProducts.product')}</th>
                    <th className="text-left p-3 font-medium text-gray-600 hidden md:table-cell">{t('adminProducts.category')}</th>
                    <th className="text-left p-3 font-medium text-gray-600">{t('adminProducts.unit')}</th>
                    <th className="text-left p-3 font-medium text-gray-600">{t('adminProducts.price')}</th>
                    <th className="text-left p-3 font-medium text-gray-600 hidden sm:table-cell">{t('adminProducts.mrp')}</th>
                    <th className="text-left p-3 font-medium text-gray-600">{t('adminProducts.stock')}</th>
                    <th className="text-left p-3 font-medium text-gray-600 hidden lg:table-cell">Status</th>
                    <th className="text-right p-3 font-medium text-gray-600">{t('adminProducts.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((product: Product) => (
                      <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">📦</span>
                            </div>
                            <div className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</div>
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell text-gray-600">{product.category?.name}</td>
                        <td className="p-3 text-gray-600 text-xs">{product.unit}</td>
                        <td className="p-3 font-bold text-gray-900">₹{product.price.toLocaleString()}</td>
                        <td className="p-3 text-gray-400 line-through hidden sm:table-cell">₹{product.mrp.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`font-medium ${product.stock <= 5 ? 'text-red-500' : product.stock <= 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-3 hidden lg:table-cell">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.isAvailable ? t('adminProducts.active') : t('adminProducts.inactive')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedProductId(product.id); navigate('admin-edit-product'); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {deleteConfirm === product.id ? (
                              <div className="flex items-center gap-1">
                                <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={() => handleDelete(product.id)}>{t('adminProducts.yes')}</Button>
                                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDeleteConfirm(null)}>{t('adminProducts.no')}</Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => setDeleteConfirm(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-gray-400">{t('adminProducts.noProducts')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}