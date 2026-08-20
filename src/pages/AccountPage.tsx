import { useState, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { useRouter, Link } from '@/store/router';
import { fetchUserOrders, getLocalOrders } from '@/services/orders';
import type { Order } from '@/types';
import { formatDate } from '@/utils/helpers';
import { useCurrency } from '@/store/currency';
import {
  Package, Truck, LogOut, User, ChevronRight, Heart, ShoppingBag, Loader2,
} from 'lucide-react';

export function AccountPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth');
      return;
    }
    if (!user) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      // Start with local orders for instant display
      const local = getLocalOrders();
      if (!cancelled) setOrders(local);

      const fetched = await fetchUserOrders(user.id);
      if (!cancelled) {
        // Merge: prefer fetched orders, add any local-only ones
        const fetchedIds = new Set(fetched.map((o) => o.id));
        const localOnly = local.filter((o) => !fetchedIds.has(o.id) && o.customerId === user.id);
        setOrders([...fetched, ...localOnly]);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user, authLoading, navigate]);

  if (authLoading || (!user && authLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
      </div>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Sneakerhead';
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="pt-24 animate-fade-in">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-400 font-display text-lg font-bold text-ink-950 transition-transform hover:scale-110">
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Overview</p>
              <h1 className="font-display text-2xl font-bold text-ink-100">Welcome back, {userName}.</h1>
            </div>
          </div>
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="flex items-center gap-2 rounded-full border border-ink-700 px-4 py-2.5 text-sm font-medium text-ink-300 hover:text-ink-100 hover:bg-ink-800"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5 animate-fade-in-up" style={{ animationDelay: '80ms', opacity: 0 }}>
            <Package className="h-5 w-5 text-accent-400" />
            <p className="mt-3 font-display text-2xl font-bold text-ink-100">{orders.length}</p>
            <p className="text-xs text-ink-400">Orders</p>
          </div>
          <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5 animate-fade-in-up" style={{ animationDelay: '160ms', opacity: 0 }}>
            <ShoppingBag className="h-5 w-5 text-accent-400" />
            <p className="mt-3 font-display text-2xl font-bold text-ink-100">{formatPrice(totalSpent)}</p>
            <p className="text-xs text-ink-400">Total Spent</p>
          </div>
          <Link to="/wishlist" className="rounded-2xl border border-ink-700 bg-ink-900 p-5 transition-all duration-300 hover:border-ink-600 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '240ms', opacity: 0 }}>
            <Heart className="h-5 w-5 text-accent-400" />
            <p className="mt-3 font-display text-2xl font-bold text-ink-100">Wishlist</p>
            <p className="text-xs text-ink-400">View saved items</p>
          </Link>
        </div>

        {/* Orders */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink-100">My Orders</h2>

          {loading ? (
            <div className="mt-6 flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent-400" />
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-ink-700 bg-ink-900 p-12 text-center animate-scale-in">
              <Package className="h-10 w-10 text-ink-600" />
              <p className="mt-4 text-sm text-ink-400">No orders yet.</p>
              <Link to="/shop" className="mt-4 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950">
                START SHOPPING
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {orders.map((order, i) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-5 transition-all duration-300 hover:border-ink-600 animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
                >
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-full border-2 border-ink-900 object-cover"
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-bold text-ink-100">{order.id}</p>
                    <p className="text-xs text-ink-400">{formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-ink-100">{formatPrice(order.total)}</p>
                    <p className="text-xs font-semibold text-accent-400">
                      {order.status === 'placed' ? 'PROCESSING' : order.status === 'delivered' ? 'DELIVERED' : 'IN TRANSIT'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/track/${order.id}`)}
                      className="flex items-center gap-1 rounded-full border border-ink-600 px-4 py-2 text-xs font-bold text-ink-100 hover:bg-ink-800"
                    >
                      <Truck className="h-3.5 w-3.5" /> TRACK
                    </button>
                    <button
                      onClick={() => navigate(`/account/orders/${order.id}`)}
                      className="flex items-center gap-1 rounded-full bg-accent-400 px-4 py-2 text-xs font-bold text-ink-950"
                    >
                      VIEW ORDER <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
