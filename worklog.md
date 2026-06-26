---
Task ID: 1
Agent: Main Agent
Task: Fix all bugs and prepare for Vercel deployment

Work Log:
- Read all project files to identify bugs
- Fixed Bug 1: AdminProducts edit button was directly mutating Zustand state (`useNavStore.getState().selectedProductId = product.id`) — replaced with proper `setSelectedProductId` action
- Fixed Bug 2: Products API had hardcoded `isAvailable: true` filter — added `all=true` query parameter support so admin can see inactive products
- Fixed Bug 3: ProductDetailPage back button used invalid `navigate(-1 as any || 'home')` — replaced with `navigate('products')`
- Fixed Bug 4: CartPage and ProductDetailPage quantity controls didn't respect `minQuantity` — now uses `item.minQuantity` instead of hardcoded `1`
- Fixed Bug 5: Added `setSelectedProductId` action to NavStore for admin edit flow (sets ID without navigating)
- Fixed Bug 6: LoginPage destructured non-existent `navigate` from `useAuthStore` — removed unused destructuring
- Updated AdminProducts, AdminEditProduct, AdminAddProduct, AdminDashboard to fetch products with `all=true`
- Updated `.env.example` to remove unnecessary `DIRECT_DATABASE_URL`
- Final build passes successfully

Stage Summary:
- 7 bugs fixed across 9 files
- Build passes cleanly
- Ready for Vercel deployment with Turso
