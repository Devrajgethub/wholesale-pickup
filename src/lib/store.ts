import { create } from 'zustand';

// ============ TYPES ============
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  mrp: number;
  unit: string;
  quantity: number;
  image: string;
  minQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
  minQuantity: number;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSelling: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  productId: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  mobile: string;
  businessName: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  pickupStatus: string;
  specialNote: string;
  pickupDate: string;
  userId: string | null;
  items: OrderItem[];
  createdAt: string;
  user?: { id: string; name: string; mobile: string };
}

export type PageName =
  | 'home'
  | 'categories'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'my-orders'
  | 'order-status'
  | 'login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-add-product'
  | 'admin-edit-product'
  | 'admin-orders'
  | 'admin-order-detail'
  | 'admin-monthly-report';

// ============ NAVIGATION STORE ============
interface NavState {
  currentPage: PageName;
  selectedCategory: string;
  selectedProductId: string;
  selectedOrderId: string;
  searchQuery: string;
  navigate: (page: PageName) => void;
  setCategory: (slug: string) => void;
  setProduct: (id: string) => void;
  setSelectedProductId: (id: string) => void;
  setOrder: (id: string) => void;
  setSearch: (q: string) => void;
}

export const useNavStore = create<NavState>((set) => ({
  currentPage: 'login',
  selectedCategory: '',
  selectedProductId: '',
  selectedOrderId: '',
  searchQuery: '',
  navigate: (page) => set({ currentPage: page }),
  setCategory: (slug) => set({ selectedCategory: slug, currentPage: 'products' }),
  setProduct: (id) => set({ selectedProductId: id, currentPage: 'product-detail' }),
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  setOrder: (id) => set({ selectedOrderId: id, currentPage: 'admin-order-detail' }),
  setSearch: (q) => set({ searchQuery: q }),
}));

// ============ CART STORE ============
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.productId === item.productId);
    if (existing) {
      return {
        items: state.items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      };
    }
    return { items: [...state.items, { ...item, quantity: Math.max(item.minQuantity, 1) }] };
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(i => i.productId !== productId),
  })),
  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(i => i.productId !== productId) };
    }
    return {
      items: state.items.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    };
  }),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

// ============ AUTH STORE (Combined login) ============
interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  adminName: string;
  customerName: string;
  customerMobile: string;
  login: (name: string, mobile: string, isAdmin?: boolean) => void;
  adminLogin: (name: string) => void;
  setCustomer: (name: string, mobile: string) => void;
  logout: () => void;
  adminLogout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isAdmin: false,
  adminName: '',
  customerName: '',
  customerMobile: '',
  login: (name, mobile, isAdmin = false) => set({ isLoggedIn: true, isAdmin, customerName: name, customerMobile: mobile, adminName: isAdmin ? name : '' }),
  adminLogin: (name) => set({ isAdmin: true, isLoggedIn: true, adminName: name }),
  setCustomer: (name, mobile) => set({ customerName: name, customerMobile: mobile }),
  logout: () => set({ isLoggedIn: false, isAdmin: false, adminName: '', customerName: '', customerMobile: '' }),
  adminLogout: () => set({ isAdmin: false, adminName: '', isLoggedIn: false, customerName: '', customerMobile: '' }),
}));

// ============ DATA STORE ============
interface DataState {
  products: Product[];
  categories: Category[];
  orders: Order[];
  featuredProducts: Product[];
  bestSellingProducts: Product[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  fetchProducts: (params?: { category?: string; search?: string; all?: boolean }) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchBestSellingProducts: () => Promise<void>;
  fetchOrders: (params?: { mobile?: string; status?: string }) => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  products: [],
  categories: [],
  orders: [],
  featuredProducts: [],
  bestSellingProducts: [],
  loading: false,

  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      set({ categories: data });
    } catch (e) { console.error('Fetch categories error:', e); }
  },

  fetchProducts: async (params) => {
    set({ loading: true });
    try {
      const url = new URL('/api/products', window.location.origin);
      if (params?.category) url.searchParams.set('category', params.category);
      if (params?.search) url.searchParams.set('search', params.search);
      if (params?.all) url.searchParams.set('all', 'true');
      const res = await fetch(url.toString());
      const data = await res.json();
      set({ products: data, loading: false });
    } catch (e) { console.error('Fetch products error:', e); set({ loading: false }); }
  },

  fetchFeaturedProducts: async () => {
    try {
      const res = await fetch('/api/products?featured=true');
      const data = await res.json();
      set({ featuredProducts: data });
    } catch (e) { console.error('Fetch featured error:', e); }
  },

  fetchBestSellingProducts: async () => {
    try {
      const res = await fetch('/api/products?bestSelling=true');
      const data = await res.json();
      set({ bestSellingProducts: data });
    } catch (e) { console.error('Fetch best selling error:', e); }
  },

  fetchOrders: async (params) => {
    try {
      const url = new URL('/api/orders', window.location.origin);
      if (params?.mobile) url.searchParams.set('mobile', params.mobile);
      if (params?.status) url.searchParams.set('status', params.status);
      const res = await fetch(url.toString());
      const data = await res.json();
      set({ orders: data });
    } catch (e) { console.error('Fetch orders error:', e); }
  },
}));