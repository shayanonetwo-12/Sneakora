import { useCart } from '@/store/cart';
import { getProductById } from '@/data/products';
import { shippingCost, taxRate, shippingLabel } from '@/utils/helpers';
import { useCurrency } from '@/store/currency';
import { Edit3, ShoppingBag } from 'lucide-react';
import { useRouter } from '@/store/router';
import type { ShippingMethod, PromoCode } from '@/types';

interface OrderSummaryProps {
  shippingMethod?: ShippingMethod;
  appliedPromo?: PromoCode | null;
  onEditCart?: () => void;
  collapsible?: boolean;
  state?: string;
}

export function OrderSummary({ shippingMethod = 'standard', appliedPromo = null, onEditCart, collapsible = false, state = 'CA' }: OrderSummaryProps) {
  const { activeCartItems } = useCart();
  const { navigate } = useRouter();
  const { formatPrice } = useCurrency();

  const subtotal = activeCartItems.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  const discount = appliedPromo
    ? appliedPromo.type === 'percent'
      ? (subtotal * appliedPromo.value) / 100
      : appliedPromo.value
    : 0;

  const shipping = subtotal - discount >= 150 ? 0 : subtotal > 0 ? shippingCost(shippingMethod) : 0;
  const tax = (subtotal - discount) * taxRate(state);
  const total = subtotal - discount + shipping + tax;

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-100">Your Order</h3>
        {onEditCart && (
          <button onClick={onEditCart} className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-ink-100">
            <Edit3 className="h-3 w-3" /> Edit Cart
          </button>
        )}
      </div>

      {/* Items */}
      <div className={`mt-4 space-y-3 ${collapsible ? 'max-h-64 overflow-y-auto' : ''}`}>
        {activeCartItems.map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null;
          const color = product.colors.find((c) => c.id === item.colorId);
          return (
            <div key={`${item.productId}-${item.colorId}-${item.sizeEu}`} className="flex gap-3">
              <div className="relative">
                <img
                  src={color?.image ?? product.colors[0].image}
                  alt={product.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-700 text-[10px] font-bold text-ink-100">
                  {item.quantity}
                </span>
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-medium text-ink-100">{product.name}</p>
                <p className="text-xs text-ink-400">{color?.name}</p>
                <p className="text-xs text-ink-400">Size: EU {item.sizeEu}</p>
              </div>
              <span className="text-sm font-semibold text-ink-100">{formatPrice(product.price * item.quantity)}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 h-px bg-ink-700" />

      {/* Totals */}
      <div className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-400">Subtotal</span>
          <span className="text-ink-100">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-accent-400">Discount ({appliedPromo?.code})</span>
            <span className="text-accent-400">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-ink-400">Shipping ({shippingLabel(shippingMethod)})</span>
          <span className="text-ink-100">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-400">Tax</span>
          <span className="text-ink-100">{formatPrice(tax)}</span>
        </div>
      </div>

      <div className="mt-4 h-px bg-ink-700" />

      <div className="mt-4 flex items-baseline justify-between">
        <span className="font-display text-lg font-bold text-ink-100">Total</span>
        <span className="font-display text-2xl font-bold text-accent-400">{formatPrice(total)}</span>
      </div>

      {activeCartItems.length === 0 && (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-ink-800 p-4 text-center">
          <ShoppingBag className="h-6 w-6 text-ink-500" />
          <p className="text-sm text-ink-400">Your bag is empty</p>
          <button onClick={() => navigate('/shop')} className="text-sm font-bold text-accent-400 hover:underline">
            Continue shopping
          </button>
        </div>
      )}
    </div>
  );
}

export function calculateTotal(
  subtotal: number,
  discount: number,
  shippingMethod: ShippingMethod,
  state: string = 'CA'
): { shipping: number; tax: number; total: number } {
  const shipping = subtotal - discount >= 150 ? 0 : subtotal > 0 ? shippingCost(shippingMethod) : 0;
  const tax = (subtotal - discount) * taxRate(state);
  const total = subtotal - discount + shipping + tax;
  return { shipping, tax, total };
}
