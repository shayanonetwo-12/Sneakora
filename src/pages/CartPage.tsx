import { useState } from 'react';
import { useCart } from '@/store/cart';
import { useRouter, Link } from '@/store/router';
import { getProductById } from '@/data/products';
import { promoCodes } from '@/data/products';
import { shippingCost, taxRate } from '@/utils/helpers';
import { useCurrency } from '@/store/currency';
import {
  Minus, Plus, Trash2, Heart, ArrowRight, ArrowLeft, ShoppingBag, Tag, Check, X, AlertCircle,
} from 'lucide-react';
import type { PromoCode } from '@/types';

export function CartPage() {
  const {
    activeCartItems, savedItems, updateQuantity, removeFromCart, saveForLater, moveToCart, toggleWishlist, isWishlisted,
  } = useCart();
  const { navigate } = useRouter();
  const { formatPrice } = useCurrency();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const subtotal = activeCartItems.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  const discount = appliedPromo
    ? appliedPromo.type === 'percent'
      ? (subtotal * appliedPromo.value) / 100
      : appliedPromo.value
    : 0;

  const shipping = subtotal - discount >= 150 ? 0 : subtotal > 0 ? shippingCost('standard') : 0;
  const tax = (subtotal - discount) * taxRate('CA');
  const total = subtotal - discount + shipping + tax;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const promo = promoCodes.find((p) => p.code === code);
    if (promo) {
      setAppliedPromo(promo);
      setPromoError(null);
      setPromoSuccess(`Promo code applied — You saved ${formatPrice((subtotal * promo.value) / 100)}`);
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try SNEAK10, WELCOME15, or FUTURE20.');
      setPromoSuccess(null);
    }
  };

  if (activeCartItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-20 text-center animate-fade-in">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-ink-800 animate-scale-in neon-glow">
          <ShoppingBag className="h-10 w-10 text-ink-500" />
        </div>
        <h1 className="mt-8 font-display text-3xl font-bold text-ink-100 animate-fade-in-up gradient-text-animate" style={{ animationDelay: '100ms', opacity: 0 }}>YOUR BAG IS WAITING.</h1>
        <p className="mt-3 text-ink-400 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-400 px-8 py-4 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-105 neon-glow"
        >
          EXPLORE SNEAKERS <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 animate-fade-in aurora-bg">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-ink-100 animate-fade-in-up gradient-text-animate">Shopping Bag</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            {activeCartItems.length > 0 && (
              <div className="space-y-4">
                {activeCartItems.map((item, i) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;
                  const color = product.colors.find((c) => c.id === item.colorId);
                  const wished = isWishlisted(product.id);
                  return (
                    <div
                      key={`${item.productId}-${item.colorId}-${item.sizeEu}`}
                      className="flex gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-4 transition-all duration-300 hover:border-accent-400/20 animate-fade-in-up neon-glow-hover"
                      style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
                    >
                      <img
                        src={color?.image ?? product.colors[0].image}
                        alt={product.name}
                        className="h-28 w-28 shrink-0 cursor-pointer rounded-xl object-cover"
                        onClick={() => navigate(`/product/${product.slug}`)}
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <div>
                            <h3
                              className="cursor-pointer font-display text-lg font-semibold text-ink-100 hover:text-accent-400"
                              onClick={() => navigate(`/product/${product.slug}`)}
                            >
                              {product.name}
                            </h3>
                            <p className="mt-0.5 text-sm text-ink-400">{color?.name}</p>
                            <p className="mt-0.5 text-sm text-ink-400">Size: EU {item.sizeEu}</p>
                          </div>
                          <span className="font-display text-lg font-bold text-ink-100">
                            {formatPrice(product.price * item.quantity)}
                          </span>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center gap-2 rounded-full border border-ink-700">
                            <button
                              onClick={() => updateQuantity(item.productId, item.colorId, item.sizeEu, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center text-ink-300 hover:text-ink-100"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-ink-100">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.colorId, item.sizeEu, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center text-ink-300 hover:text-ink-100"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                saveForLater(item.productId, item.colorId, item.sizeEu);
                                toggleWishlist(product.id);
                              }}
                              className={`flex items-center gap-1 text-xs font-medium ${wished ? 'text-accent-400' : 'text-ink-400 hover:text-ink-100'}`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${wished ? 'fill-accent-400' : ''}`} /> Save
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId, item.colorId, item.sizeEu)}
                              className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Saved for later */}
            {savedItems.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-lg font-semibold text-ink-100">Saved for Later</h2>
                <div className="mt-4 space-y-3">
                  {savedItems.map((item) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;
                    const color = product.colors.find((c) => c.id === item.colorId);
                    return (
                      <div key={`${item.productId}-${item.colorId}-${item.sizeEu}`} className="flex gap-4 rounded-2xl border border-ink-800 bg-ink-900/50 p-4">
                        <img src={color?.image ?? product.colors[0].image} alt={product.name} className="h-20 w-20 rounded-xl object-cover opacity-80" />
                        <div className="flex flex-1 items-center justify-between">
                          <div>
                            <h3 className="font-display text-sm font-semibold text-ink-200">{product.name}</h3>
                            <p className="text-xs text-ink-400">{color?.name} · EU {item.sizeEu}</p>
                            <p className="text-xs text-ink-400">Qty: {item.quantity}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => moveToCart(item.productId, item.colorId, item.sizeEu)}
                              className="rounded-full bg-ink-700 px-4 py-2 text-xs font-bold text-ink-100 hover:bg-ink-600"
                            >
                              MOVE TO BAG
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId, item.colorId, item.sizeEu)}
                              className="flex h-8 w-8 items-center justify-center text-ink-400 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-300 hover:text-ink-100">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink-700 bg-ink-900 p-6 animate-fade-in-up glass-card gradient-border" style={{ animationDelay: '200ms', opacity: 0 }}>
              <h2 className="font-display text-lg font-semibold text-ink-100">Order Summary</h2>

              {/* Promo code */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Have a promo code?</p>
                {appliedPromo ? (
                  <div className="mt-2 flex items-center justify-between rounded-xl border border-accent-400/30 bg-accent-400/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent-400" />
                      <div>
                        <p className="text-sm font-bold text-accent-400">{appliedPromo.code}</p>
                        <p className="text-xs text-ink-300">{appliedPromo.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setAppliedPromo(null); setPromoSuccess(null); }}
                      className="text-ink-400 hover:text-ink-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="ENTER CODE"
                      className="flex-1 rounded-xl border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm uppercase text-ink-100 placeholder:text-ink-500 focus:border-accent-400 focus:outline-none"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="rounded-xl bg-ink-700 px-5 py-2.5 text-sm font-bold text-ink-100 hover:bg-ink-600"
                    >
                      APPLY
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" /> {promoError}
                  </p>
                )}
                {promoSuccess && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-accent-400 animate-fade-in">
                    <Check className="h-3.5 w-3.5" /> {promoSuccess}
                  </p>
                )}
                <p className="mt-2 text-xs text-ink-500">Try: SNEAK10, WELCOME15, FUTURE20</p>
              </div>

              <div className="mt-5 h-px bg-ink-700" />

              {/* Totals */}
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-400">Subtotal</span>
                  <span className="font-medium text-ink-100">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-accent-400">Discount</span>
                    <span className="font-medium text-accent-400">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink-400">Shipping</span>
                  <span className="font-medium text-ink-100">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Estimated tax</span>
                  <span className="font-medium text-ink-100">{formatPrice(tax)}</span>
                </div>
                {subtotal - discount < 150 && subtotal > 0 && (
                  <p className="rounded-lg bg-ink-800 px-3 py-2 text-xs text-ink-400">
                    Add {formatPrice(150 - (subtotal - discount))} more for free shipping
                  </p>
                )}
              </div>

              <div className="mt-5 h-px bg-ink-700" />

              <div className="mt-5 flex items-baseline justify-between">
                <span className="font-display text-lg font-bold text-ink-100">Total</span>
                <span className="font-display text-2xl font-bold text-ink-100">{formatPrice(total)}</span>
              </div>

              {activeCartItems.length > 0 && (
                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent-400 py-4 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-[1.02] neon-glow"
                >
                  PROCEED TO CHECKOUT <ArrowRight className="h-4 w-4" />
                </button>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-500">
                <Tag className="h-3.5 w-3.5" /> Secure checkout · 30-day returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
