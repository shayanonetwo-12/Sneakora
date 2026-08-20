import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/store/router';
import { fetchOrderById, getLocalOrderById } from '@/services/orders';
import type { Order } from '@/types';
import { formatDate, formatDateRange, shippingLabel } from '@/utils/helpers';
import { useCurrency } from '@/store/currency';
import {
  ArrowLeft, Truck, Download, Package, MapPin, CreditCard, Loader2, Check,
} from 'lucide-react';

export function OrderDetailsPage({ orderId }: { orderId: string }) {
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center pt-20">
        <h1 className="font-display text-2xl font-bold text-ink-100">Order not found</h1>
        <Link to="/account" className="mt-6 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950">BACK TO ACCOUNT</Link>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-sm font-medium text-ink-300 hover:text-ink-100">
          <ArrowLeft className="h-4 w-4" /> Back to My Orders
        </button>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-100">{order.id}</h1>
            <p className="mt-1 text-sm text-ink-400">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span className={`rounded-full px-4 py-2 text-xs font-bold ${
            order.status === 'delivered' ? 'bg-accent-400/20 text-accent-400' : 'bg-ink-800 text-ink-300'
          }`}>
            {order.status === 'placed' ? 'PROCESSING' : order.status.toUpperCase()}
          </span>
        </div>

        {/* Items */}
        <div className="mt-8 rounded-2xl border border-ink-700 bg-ink-900 p-6">
          <h2 className="font-display text-lg font-semibold text-ink-100">Products</h2>
          <div className="mt-4 space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <p className="font-display text-sm font-semibold text-ink-100">{item.name}</p>
                  <p className="text-xs text-ink-400">Color: {item.colorName}</p>
                  <p className="text-xs text-ink-400">Size: EU {item.sizeEu}</p>
                  <p className="text-xs text-ink-400">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-ink-100">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-xs text-ink-500">{formatPrice(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 h-px bg-ink-700" />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-400">Subtotal</span><span className="text-ink-100">{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="text-accent-400">Discount {order.promoCode ? `(${order.promoCode})` : ''}</span><span className="text-accent-400">-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-ink-400">Shipping ({shippingLabel(order.shippingMethod)})</span><span className="text-ink-100">{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Tax</span><span className="text-ink-100">{formatPrice(order.tax)}</span></div>
          </div>
          <div className="mt-4 h-px bg-ink-700" />
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-display text-lg font-bold text-ink-100">Total</span>
            <span className="font-display text-2xl font-bold text-accent-400">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink-700 bg-ink-900 p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-400" />
              <h2 className="font-display text-sm font-bold text-ink-100">Shipping Address</h2>
            </div>
            <div className="mt-3 text-sm text-ink-300">
              <p className="font-medium text-ink-100">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.address}{order.shippingAddress.apt ? `, ${order.shippingAddress.apt}` : ''}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-700 bg-ink-900 p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent-400" />
              <h2 className="font-display text-sm font-bold text-ink-100">Payment</h2>
            </div>
            <div className="mt-3 text-sm text-ink-300">
              <p className="capitalize text-ink-100">
                {order.payment.method === 'card' ? 'Credit Card' : order.payment.method === 'cod' ? 'Cash on Delivery' : order.payment.method === 'applepay' ? 'Apple Pay' : 'PayPal'}
              </p>
              {order.payment.cardLast4 && <p>•••• {order.payment.cardLast4}</p>}
              <p className="mt-2 text-xs text-ink-400">Payment status: {order.paymentStatus === 'demo' ? 'Demo (not charged)' : order.paymentStatus}</p>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="mt-4 rounded-2xl border border-ink-700 bg-ink-900 p-6">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-accent-400" />
            <h2 className="font-display text-sm font-bold text-ink-100">Delivery Information</h2>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div>
              <p className="text-ink-100">{shippingLabel(order.shippingMethod)}</p>
              <p className="text-ink-400">Est. {formatDateRange(order.estimatedDeliveryStart, order.estimatedDeliveryEnd)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-400">Tracking Number</p>
              <p className="font-display text-sm font-bold text-accent-400">{order.trackingNumber}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/track/${order.id}`)}
            className="flex items-center gap-2 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950 transition-transform hover:scale-105"
          >
            <Truck className="h-4 w-4" /> TRACK ORDER
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full border border-ink-600 px-6 py-3 text-sm font-bold text-ink-100 hover:bg-ink-800"
          >
            <Download className="h-4 w-4" /> DOWNLOAD RECEIPT
          </button>
          <a
            href="mailto:support@sneakora.com"
            className="flex items-center gap-2 rounded-full border border-ink-600 px-6 py-3 text-sm font-bold text-ink-100 hover:bg-ink-800"
          >
            CONTACT SUPPORT
          </a>
        </div>
      </div>
    </div>
  );
}
