import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/store/router';
import { fetchOrderById, getLocalOrderById } from '@/services/orders';
import type { Order } from '@/types';
import { formatDate, formatDateRange, shippingLabel } from '@/utils/helpers';
import { useCurrency } from '@/store/currency';
import {
  Check, Package, Truck, MapPin, Download, ArrowRight, ShoppingBag, Clock,
  CheckCircle2, Circle, Loader2, Mail,
} from 'lucide-react';

export function ConfirmationPage({ orderId }: { orderId: string }) {
  const { navigate } = useRouter();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = getLocalOrderById(orderId);
      if (local && !cancelled) {
        setOrder(local);
        setLoading(false);
      }
      const fetched = await fetchOrderById(orderId);
      if (!cancelled && fetched) {
        setOrder(fetched);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center pt-20">
        <h1 className="font-display text-2xl font-bold text-ink-100">Order not found</h1>
        <p className="mt-2 text-ink-400">We couldn't find this order.</p>
        <Link to="/shop" className="mt-6 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950">CONTINUE SHOPPING</Link>
      </div>
    );
  }

  return (
    <div className="pt-20 animate-fade-in">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Animated checkmark */}
        <div className="flex flex-col items-center text-center animate-bounce-in">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-accent-400">
            <svg viewBox="0 0 52 52" className="h-12 w-12">
              <circle cx="26" cy="26" r="25" fill="none" stroke="rgba(10,10,11,0.2)" strokeWidth="2" />
              <path
                d="M14 27 L22 35 L38 19"
                fill="none"
                stroke="#0A0A0B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="100"
                style={{ animation: 'checkDraw 0.6s ease-out 0.2s forwards', strokeDashoffset: 100 }}
              />
            </svg>
            <div className="absolute inset-0 rounded-full border-2 border-accent-400 animate-pulse-ring" />
          </div>

          <h1 className="mt-8 font-display text-4xl font-bold text-ink-100 sm:text-5xl animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>ORDER CONFIRMED.</h1>
          <p className="mt-3 text-lg text-ink-300 animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>You're officially stepping into the future.</p>
          <p className="mt-2 text-sm text-ink-400 animate-fade-in-up" style={{ animationDelay: '380ms', opacity: 0 }}>
            Thanks for shopping with Sneakora. Your order has been successfully placed.
          </p>
        </div>

        {/* Order number + delivery */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5 text-center animate-fade-in-up" style={{ animationDelay: '450ms', opacity: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Order Number</p>
            <p className="mt-2 font-display text-xl font-bold text-accent-400">{order.id}</p>
          </div>
          <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5 text-center animate-fade-in-up" style={{ animationDelay: '520ms', opacity: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Estimated Delivery</p>
            <p className="mt-2 font-display text-xl font-bold text-ink-100">
              {formatDateRange(order.estimatedDeliveryStart, order.estimatedDeliveryEnd)}
            </p>
          </div>
        </div>

        {/* Order status timeline */}
        <div className="mt-8 rounded-2xl border border-ink-700 bg-ink-900 p-6 animate-fade-in-up" style={{ animationDelay: '600ms', opacity: 0 }}>
          <h2 className="font-display text-lg font-semibold text-ink-100">Order Status</h2>
          <div className="mt-6 space-y-0">
            {[
              { label: 'Order Placed', desc: 'Your order has been received.', status: 'done' },
              { label: 'Confirmed', desc: 'Order is being prepared.', status: 'current' },
              { label: 'Packed', desc: 'Your sneakers are packed.', status: 'pending' },
              { label: 'Shipped', desc: 'Your order is on the way.', status: 'pending' },
              { label: 'Delivered', desc: 'Enjoy your Sneakora sneakers.', status: 'pending' },
            ].map((s, i, arr) => (
              <div key={s.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    s.status === 'done' ? 'bg-accent-400' :
                    s.status === 'current' ? 'bg-accent-400/20 ring-4 ring-accent-400/10' :
                    'bg-ink-800'
                  }`}>
                    {s.status === 'done' ? <Check className="h-4 w-4 text-ink-950" strokeWidth={3} /> :
                     s.status === 'current' ? <Loader2 className="h-4 w-4 animate-spin text-accent-400" /> :
                     <Circle className="h-3 w-3 text-ink-500" />}
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`w-px h-12 ${s.status === 'done' ? 'bg-accent-400' : 'bg-ink-700'}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-bold ${s.status === 'pending' ? 'text-ink-500' : 'text-ink-100'}`}>
                    {s.label.toUpperCase()}
                  </p>
                  <p className="text-xs text-ink-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary items */}
        <div className="mt-8 rounded-2xl border border-ink-700 bg-ink-900 p-6">
          <h2 className="font-display text-lg font-semibold text-ink-100">Order Summary</h2>
          <div className="mt-4 space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <p className="font-display text-sm font-semibold text-ink-100">{item.name}</p>
                  <p className="text-xs text-ink-400">{item.colorName} · EU {item.sizeEu}</p>
                  <p className="text-xs text-ink-400">Qty: {item.quantity}</p>
                </div>
                <span className="font-display text-sm font-bold text-ink-100">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 h-px bg-ink-700" />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-400">Subtotal</span><span className="text-ink-100">{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="text-accent-400">Discount</span><span className="text-accent-400">-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-ink-400">Shipping</span><span className="text-ink-100">{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Tax</span><span className="text-ink-100">{formatPrice(order.tax)}</span></div>
          </div>
          <div className="mt-4 h-px bg-ink-700" />
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-display text-lg font-bold text-ink-100">Total</span>
            <span className="font-display text-2xl font-bold text-accent-400">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Delivering to */}
        <div className="mt-8 rounded-2xl border border-ink-700 bg-ink-900 p-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent-400" />
            <h2 className="font-display text-lg font-semibold text-ink-100">Delivering To</h2>
          </div>
          <div className="mt-3 text-sm text-ink-300">
            <p className="font-medium text-ink-100">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
            <p>{order.shippingAddress.address}{order.shippingAddress.apt ? `, ${order.shippingAddress.apt}` : ''}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal}</p>
            <p>{order.shippingAddress.country}</p>
            <p className="mt-2">{order.shippingAddress.phone}</p>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-800 px-4 py-3">
            <Truck className="h-4 w-4 text-accent-400" />
            <span className="text-sm font-medium text-ink-100">{shippingLabel(order.shippingMethod)}</span>
            <span className="ml-auto text-xs text-ink-400">Est. {formatDateRange(order.estimatedDeliveryStart, order.estimatedDeliveryEnd)}</span>
          </div>
        </div>

        {/* Email note */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-800 p-4">
          <Mail className="h-5 w-5 shrink-0 text-accent-400" />
          <p className="text-xs text-ink-300">
            A confirmation email with your order details has been prepared for {order.contact.email}. (Email sending is not configured in demo mode.)
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate(`/track/${order.id}`)}
            className="flex items-center justify-center gap-2 rounded-full bg-accent-400 px-6 py-3.5 text-sm font-bold text-ink-950 transition-transform hover:scale-105"
          >
            <Truck className="h-4 w-4" /> TRACK ORDER
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center justify-center gap-2 rounded-full border border-ink-600 px-6 py-3.5 text-sm font-bold text-ink-100 hover:bg-ink-800"
          >
            <ShoppingBag className="h-4 w-4" /> CONTINUE SHOPPING
          </button>
          <Link
            to="/account"
            className="flex items-center justify-center gap-2 rounded-full border border-ink-600 px-6 py-3.5 text-sm font-bold text-ink-100 hover:bg-ink-800"
          >
            <Package className="h-4 w-4" /> VIEW MY ORDERS
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-full border border-ink-600 px-6 py-3.5 text-sm font-bold text-ink-100 hover:bg-ink-800"
          >
            <Download className="h-4 w-4" /> DOWNLOAD RECEIPT
          </button>
        </div>

        {/* Create account prompt for guest */}
        {!order.customerId && (
          <div className="mt-8 rounded-2xl border border-accent-400/30 bg-accent-400/5 p-6 text-center">
            <p className="font-display text-lg font-semibold text-ink-100">Create an account to track your orders easily.</p>
            <p className="mt-2 text-sm text-ink-400">Save your details for faster checkout and order tracking.</p>
            <Link to="/auth" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950">
              CREATE ACCOUNT <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
