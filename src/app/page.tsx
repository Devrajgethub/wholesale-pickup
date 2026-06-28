'use client';

import { useNavStore, useDataStore } from '@/lib/store';
import Header from '@/components/customer/Header';
import HomePage from '@/components/customer/HomePage';
import CategoriesPage from '@/components/customer/CategoriesPage';
import ProductsPage from '@/components/customer/ProductsPage';
import ProductDetailPage from '@/components/customer/ProductDetailPage';
import CartPage from '@/components/customer/CartPage';
import CheckoutPage from '@/components/customer/CheckoutPage';
import MyOrdersPage from '@/components/customer/MyOrdersPage';
import AdminLoginPage from '@/components/customer/AdminLoginPage';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminAddProduct from '@/components/admin/AdminAddProduct';
import AdminEditProduct from '@/components/admin/AdminEditProduct';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminOrderDetail from '@/components/admin/AdminOrderDetail';
import AdminMonthlyReport from '@/components/admin/AdminMonthlyReport';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-sm">🏪</span>
              </div>
              <span className="font-bold text-white text-lg">Mitra Bros Mart</span>
            </div>
            <p className="text-sm leading-relaxed">Your trusted wholesale partner. Order online, pick up at shop. Best prices guaranteed on all bulk orders.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
              <li className="hover:text-white cursor-pointer transition-colors">Terms & Conditions</li>
              <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="font-medium text-white">Mitra Bros Mart</li>
              <li className="flex items-center gap-2"><span>📞</span> <a href="tel:+917908117295" className="hover:text-white transition-colors">+91 79081 17295</a></li>
              <li>Hours: 8:00 AM - 9:00 PM</li>
              <li>Mon - Sat</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-4 text-center text-xs">
          <p>&copy; 2026 Mitra Bros Mart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="h-16 bg-[#0C831F]">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <Skeleton className="h-8 w-32 bg-white/20" />
          <Skeleton className="h-10 w-64 bg-white/20 ml-auto rounded-full" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-4 flex-1">
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square rounded-xl mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-1" />
              <Skeleton className="h-8 w-full rounded-lg mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageRouter() {
  const { currentPage } = useNavStore();

  const pages: Record<string, React.ReactNode> = {
    'home': <HomePage />,
    'categories': <CategoriesPage />,
    'products': <ProductsPage />,
    'product-detail': <ProductDetailPage />,
    'cart': <CartPage />,
    'checkout': <CheckoutPage />,
    'order-success': <CheckoutPage />,
    'my-orders': <MyOrdersPage />,
    'login': <AdminLoginPage />,
    'admin-dashboard': <AdminDashboard />,
    'admin-products': <AdminProducts />,
    'admin-add-product': <AdminAddProduct />,
    'admin-edit-product': <AdminEditProduct />,
    'admin-orders': <AdminOrders />,
    'admin-order-detail': <AdminOrderDetail />,
    'admin-monthly-report': <AdminMonthlyReport />,
  };

  return pages[currentPage] || <HomePage />;
}

export default function App() {
  const { fetchCategories, categories } = useDataStore();

  useEffect(() => {
    fetchCategories();
    // Seed database on first load
    fetch('/api/seed', { method: 'POST' }).then(() => {
      fetchCategories();
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <PageRouter />
      </main>
      <Footer />
    </div>
  );
}