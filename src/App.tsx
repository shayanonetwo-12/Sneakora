import { useState, useMemo, useEffect } from 'react';
import { RouterProvider, useRouter } from '@/store/router';
import { CartProvider } from '@/store/cart';
import { AuthProvider } from '@/store/auth';
import { CurrencyProvider } from '@/store/currency';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ScrollProgress } from '@/components/ScrollProgress';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ConfirmationPage } from '@/pages/ConfirmationPage';
import { TrackPage } from '@/pages/TrackPage';
import { AuthPage } from '@/pages/AuthPage';
import { AccountPage } from '@/pages/AccountPage';
import { OrderDetailsPage } from '@/pages/OrderDetailsPage';
import { CollectionsPage } from '@/pages/CollectionsPage';
import { WishlistPage } from '@/pages/WishlistPage';

function AppContent() {
  const { path } = useRouter();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [path]);

  const route = useMemo(() => {
    const cleanPath = path.split('?')[0];
    const segments = cleanPath.split('/').filter(Boolean);

    if (segments.length === 0) return { page: 'home' as const };
    if (segments[0] === 'shop') return { page: 'shop' as const };
    if (segments[0] === 'product' && segments[1]) return { page: 'product' as const, slug: segments[1] };
    if (segments[0] === 'cart') return { page: 'cart' as const };
    if (segments[0] === 'checkout') return { page: 'checkout' as const };
    if (segments[0] === 'confirmation' && segments[1]) return { page: 'confirmation' as const, orderId: segments[1] };
    if (segments[0] === 'track') return { page: 'track' as const, orderId: segments[1] };
    if (segments[0] === 'auth') return { page: 'auth' as const };
    if (segments[0] === 'account') {
      if (segments[1] === 'orders' && segments[2]) return { page: 'order-details' as const, orderId: segments[2] };
      return { page: 'account' as const };
    }
    if (segments[0] === 'collections') return { page: 'collections' as const };
    if (segments[0] === 'wishlist') return { page: 'wishlist' as const };
    return { page: 'home' as const };
  }, [path]);

  // Auth and track pages have no header/footer
  const isStandalone = route.page === 'auth';

  return (
    <div className="min-h-screen bg-ink-950">
      {!isStandalone && <ScrollProgress />}
      {!isStandalone && <Header onCartClick={() => setCartOpen(true)} />}

      <main key={path} className="view-transition">
        {route.page === 'home' && <HomePage />}
        {route.page === 'shop' && <ShopPage />}
        {route.page === 'product' && <ProductPage slug={route.slug} />}
        {route.page === 'cart' && <CartPage />}
        {route.page === 'checkout' && <CheckoutPage />}
        {route.page === 'confirmation' && <ConfirmationPage orderId={route.orderId} />}
        {route.page === 'track' && <TrackPage orderId={route.orderId} />}
        {route.page === 'auth' && <AuthPage />}
        {route.page === 'account' && <AccountPage />}
        {route.page === 'order-details' && <OrderDetailsPage orderId={route.orderId} />}
        {route.page === 'collections' && <CollectionsPage />}
        {route.page === 'wishlist' && <WishlistPage />}
      </main>

      {!isStandalone && <Footer />}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
