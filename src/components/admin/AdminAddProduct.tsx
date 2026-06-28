'use client';

import { useDataStore, useNavStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function AdminAddProduct() {
  const { categories, fetchCategories, fetchProducts } = useDataStore();
  const { navigate } = useNavStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '', unit: '', price: '', mrp: '', stock: '', minQuantity: '1',
    description: '', categoryId: '', isAvailable: true, isFeatured: false, isBestSelling: false,
  });

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        fetchProducts({ all: true });
        setTimeout(() => navigate('admin-products'), 1000);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const update = (key: string, value: string | boolean) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111827] dark:bg-[#111827]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Button variant="ghost" className="mb-4 text-gray-600 dark:text-gray-400" onClick={() => navigate('admin-products')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-[#0C831F] mx-auto mb-3" />
                <p className="font-bold text-gray-900 dark:text-gray-100">Product added successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input placeholder="e.g. Fortune Mustard Oil" value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select value={form.categoryId} onValueChange={(v) => update('categoryId', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input placeholder="e.g. 1 Box - 10 Packets" value={form.unit} onChange={(e) => update('unit', e.target.value)} className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Wholesale Price *</Label>
                    <Input type="number" placeholder="1450" value={form.price} onChange={(e) => update('price', e.target.value)} className="mt-1.5" required />
                  </div>
                  <div>
                    <Label>MRP</Label>
                    <Input type="number" placeholder="1550" value={form.mrp} onChange={(e) => update('mrp', e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input type="number" placeholder="25" value={form.stock} onChange={(e) => update('stock', e.target.value)} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Min Order Quantity</Label>
                  <Input type="number" placeholder="1" value={form.minQuantity} onChange={(e) => update('minQuantity', e.target.value)} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Product description..." value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="mt-1.5" />
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.isAvailable} onCheckedChange={(v) => update('isAvailable', v)} />
                    <Label className="text-sm">Available</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.isFeatured} onCheckedChange={(v) => update('isFeatured', v)} />
                    <Label className="text-sm">Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.isBestSelling} onCheckedChange={(v) => update('isBestSelling', v)} />
                    <Label className="text-sm">Best Selling</Label>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-12" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Add Product'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}