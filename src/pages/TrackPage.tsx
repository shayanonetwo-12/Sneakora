import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/store/router';
import { fetchOrderById, getLocalOrderById } from '@/services/orders';
import type { Order, OrderStatus } from '@/types';
import { formatDate, formatDateRange, shippingLabel } from '@/utils/helpers';
import { Search, Truck, CheckCircle2, Circle, Loader2, Package, Clock, MapPin } from 'lucide-react';

export function TrackPage({ orderId }: { orderId?: string }) {
  const { navigate } = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [searchId, setSearchId] = useState(orderId ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = async (id: string) => {
    setLoading(true);
    setError(null);
    const local = getLocalOrderById(id);
    if (local) {
      setOrder(local);
      setLoading(false);
      return;
    }
    const fetched = await fetchOrderById(id);
    if (fetched) {
      setOrder(fetched);
    } else {
      setError('Order not found. Please check your order number.');
      setOrder(null);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    const id = searchId.trim().toUpperCase();
    if (!id) return;
    navigate(`/track/${id}`);
  };

  return (
    <div className="pt-24 animate-fade-in">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-ink-100 animate-fade-in-up">Track Your Order</h1>
        <p className="mt-2 text-ink-400 animate-fade-in-up" style={{ animationDelay: '80ms', opacity: 0 }}>Enter your order number to see the latest tracking updates.</p>

        {/* Search */}
        <div className="mt-6 flex gap-2 animate-fade-in-up" style={{ animationDelay: '160ms', opacity: 0 }}>
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 px-4 py-3.5">
            <Search className="h-5 w-5 text-ink-400" />
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="SNK-2026-48291"
              className="flex-1 bg-transparent text-sm uppercase text-ink-100 placeholder:text-ink-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-xl bg-accent-400 px-6 py-3.5 text-sm font-bold text-ink-950 transition-transform hover:scale-105"
          >
            TRACK
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
          </div>
        )}

        {order && !loading && <TrackingDetails order={order} />}

        {!order && !loading && !error && (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-ink-700 bg-ink-900 p-12 text-center animate-scale-in">
            <Truck className="h-12 w-12 text-ink-600" />
            <p className="mt-4 text-sm text-ink-400">Enter your order number above to start tracking.</p>
            <p className="mt-1 text-xs text-ink-500">Example: SNK-2026-48291</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackingDetails({ order }: { order: Order }) {
  // Demo: determine progress based on time since order placed
  const createdAt = new Date(order.createdAt);
  const hoursSinceOrder = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

  // Demo statuses advance over time (in demo, we simulate progress)
  const statusOrder: OrderStatus[] = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];
  const currentStatusIdx = Math.min(
    Math.floor(hoursSinceOrder / 0.1) + 1, // Fast demo progression
    statusOrder.length - 1
  );

  const trackingSteps = [
    { label: 'Order placed', desc: 'Your order has been received.', status: 'placed' },
    { label: 'Processing', desc: 'Order confirmed and being prepared.', status: 'confirmed' },
    { label: 'Packed', desc: 'Your sneakers are packed.', status: 'packed' },
    { label: 'Shipped', desc: 'Your order is on the way.', status: 'shipped' },
    { label: 'Out for delivery', desc: 'Your order is out for delivery today.', status: 'shipped' },
    { label: 'Delivered', desc: 'Enjoy your Sneakora sneakers.', status: 'delivered' },
  ];

  const getStatusState = (idx: number): 'done' | 'current' | 'pending' => {
    if (idx < currentStatusIdx) return 'done';
    if (idx === currentStatusIdx) return 'current';
    return 'pending';
  };

  // Map status for tracking display
  const stepStates = [
    getStatusState(0), // placed
    getStatusState(1), // processing
    getStatusState(2), // packed
    getStatusState(3), // shipped
    currentStatusIdx >= 4 ? 'done' : currentStatusIdx === 3 ? 'current' : 'pending', // out for delivery
    currentStatusIdx >= 4 ? 'done' : 'pending', // delivered
  ];

  const currentStatusLabel = order.status === 'placed' ? 'IN TRANSIT' : order.status === 'delivered' ? 'DELIVERED' : 'IN TRANSIT';

  return (
    <div className="mt-8 animate-fade-in-up">
      {/* Status header */}
      <div className="rounded-2xl border border-ink-700 bg-ink-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Tracking</p>
            <p className="mt-1 font-display text-xl font-bold text-ink-100">Order: {order.id}</p>
            <p className="mt-2 text-sm text-ink-300">Status: <span className="font-bold text-accent-400">{currentStatusLabel}</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Estimated Delivery</p>
            <p className="mt-1 font-display text-lg font-bold text-ink-100">
              {formatDateRange(order.estimatedDeliveryStart, order.estimatedDeliveryEnd)}
            </p>
            <p className="mt-1 text-xs text-ink-400">Tracking #: {order.trackingNumber}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6 rounded-2xl border border-ink-700 bg-ink-900 p-6">
        <h2 className="font-display text-lg font-semibold text-ink-100">Tracking Timeline</h2>
        <div className="mt-6 space-y-0">
          {trackingSteps.map((step, i) => {
            const state = stepStates[i];
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    state === 'done' ? 'bg-accent-400' :
                    state === 'current' ? 'bg-accent-400/20 ring-4 ring-accent-400/10' :
                    'bg-ink-800'
                  }`}>
                    {state === 'done' ? <CheckCircle2 className="h-5 w-5 text-ink-950" /> :
                     state === 'current' ? <Loader2 className="h-4 w-4 animate-spin text-accent-400" /> :
                     <Circle className="h-3 w-3 text-ink-500" />}
                  </div>
                  {i < trackingSteps.length - 1 && (
                    <div className={`w-px h-10 ${state === 'done' ? 'bg-accent-400' : 'bg-ink-700'}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-bold ${state === 'pending' ? 'text-ink-500' : 'text-ink-100'}`}>
                    {step.label.toUpperCase()}
                  </p>
                  <p className="text-xs text-ink-400">{step.desc}</p>
                  {state === 'done' && (
                    <p className="mt-0.5 text-xs text-accent-400">
                      {formatDate(createdAt.toISOString())}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order items quick view */}
      <div className="mt-6 rounded-2xl border border-ink-700 bg-ink-900 p-6">
        <h2 className="font-display text-lg font-semibold text-ink-100">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-100">{item.name}</p>
                <p className="text-xs text-ink-400">{item.colorName} · EU {item.sizeEu} · Qty {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-800 px-4 py-3">
          <MapPin className="h-4 w-4 text-accent-400" />
          <span className="text-sm text-ink-300">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName} · {order.shippingAddress.city}, {order.shippingAddress.state}
          </span>
          <span className="ml-auto text-xs text-ink-400">{shippingLabel(order.shippingMethod)}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to={`/confirmation/${order.id}`} className="flex items-center justify-center gap-2 rounded-full border border-ink-600 px-6 py-3 text-sm font-bold text-ink-100 hover:bg-ink-800">
          <Package className="h-4 w-4" /> VIEW ORDER DETAILS
        </Link>
        <Link to="/shop" className="flex items-center justify-center gap-2 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950 hover:scale-105">
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  );
}
