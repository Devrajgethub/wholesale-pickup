'use client';

import { useNavStore, useCartStore, useAuthStore, useDataStore } from '@/lib/store';
import { Search, ShoppingCart, User, Menu, X, Package, ArrowLeft, ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function Header() {
  const { currentPage, navigate, setSearch, searchQuery } = useNavStore();
  const { items } = useCartStore();
  const { isAdmin, adminName, adminLogout } = useAuthStore();
  const { fetchProducts } = useDataStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const isCustomerPage = !currentPage.startsWith('admin');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchProducts({ search: searchQuery });
      navigate('products');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0C831F] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Back */}
          <div className="flex items-center gap-3">
            {currentPage !== 'home' && isCustomerPage && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 md:hidden" onClick={() => navigate('home')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <button onClick={() => { if (isAdmin && !isCustomerPage) { navigate('admin-dashboard'); } else { navigate('home'); } }} className="flex items-center gap-2">
              <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-green-900" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-tight">Mitra Bros Mart</h1>
                <p className="text-[10px] text-green-200 leading-tight">Order Online, Pick at Shop</p>
              </div>
            </button>
          </div>

          {/* Center: Search (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search wholesale products..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/95 text-gray-900 border-0 rounded-full placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-yellow-400"
              />
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile Search Toggle */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart (customer pages only) */}
            {isCustomerPage && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative" onClick={() => navigate('cart')}>
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-yellow-400 text-green-900 text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] flex items-center justify-center">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* My Orders (customer pages) */}
            {isCustomerPage && (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 text-xs" onClick={() => navigate('my-orders')}>
                <Package className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">My Orders</span>
              </Button>
            )}

            {/* Admin Login / Admin Logout */}
            {isAdmin ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-yellow-300 hidden sm:block px-2">
                  <ShieldCheck className="h-3.5 w-3.5 inline mr-1" />
                  {adminName}
                </span>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => { adminLogout(); navigate('home'); }}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => navigate('admin-login')}>
                <ShieldCheck className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline text-xs">Admin</span>
              </Button>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/95 text-gray-900 border-0 rounded-full placeholder:text-gray-400"
                autoFocus
              />
            </div>
          </form>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="pb-3 md:hidden border-t border-white/10">
            <div className="flex flex-col gap-1 pt-2">
              <Button variant="ghost" className="justify-start text-white hover:bg-white/10" onClick={() => { navigate('my-orders'); setMobileMenuOpen(false); }}>
                <Package className="h-4 w-4 mr-2" /> My Orders
              </Button>
              {isAdmin ? (
                <Button variant="ghost" className="justify-start text-white hover:bg-white/10" onClick={() => { adminLogout(); navigate('home'); setMobileMenuOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout Admin
                </Button>
              ) : (
                <Button variant="ghost" className="justify-start text-white hover:bg-white/10" onClick={() => { navigate('admin-login'); setMobileMenuOpen(false); }}>
                  <ShieldCheck className="h-4 w-4 mr-2" /> Admin Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin Navigation Bar */}
      {isAdmin && (
        <div className="bg-green-900 border-t border-green-800">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {[
              { label: 'Dashboard', page: 'admin-dashboard' as const },
              { label: 'Products', page: 'admin-products' as const },
              { label: 'Add Product', page: 'admin-add-product' as const },
              { label: 'Orders', page: 'admin-orders' as const },
              { label: 'Monthly Report', page: 'admin-monthly-report' as const },
            ].map((item) => (
              <button
                key={item.page}
                onClick={() => navigate(item.page)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${currentPage === item.page ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-green-200 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}