import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart';
import { useRouter } from '@/store/router';
import { getProductById } from '@/data/products';
import { useCurrency } from '@/store/currency';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeCartItems, updateQuantity, removeFromCart, cartCount } = useCart();
  const { navigate } = useRouter();
  const { formatPrice } = useCurrency();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open && !exiting) return null;

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, 300);
  };

  const subtotal = activeCartItems.reduce((sum, item) => {
    const product = getProductById(item.productId);
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className={`absolute inset-0 bg-ink-950/70 backdrop-blur-sm ${open ? 'animate-fade-in' : 'opacity-0 transition-opacity duration-300'}`}
        onClick={handleClose}
      />
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ink-900 border-l border-ink-700 ${
          open ? 'animate-slide-in-right' : 'translate-x-full transition-transform duration-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-700 p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-400/10">
              <ShoppingBag className="h-5 w-5 text-accent-400" />
            </div>
            <h2 className="font-display text-lg font-bold text-ink-100">
              Your Bag {cartCount > 0 && `(${cartCount})`}
            </h2>
          </div>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-all duration-300 hover:bg-ink-800 hover:text-ink-100 hover:rotate-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        {activeCartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-800 animate-scale-in neon-glow">
              <ShoppingBag className="h-8 w-8 text-ink-500" />
            </div>
            <h3 className="mt-6 font-display text-lg font-semibold text-ink-100">Your bag is waiting</h3>
            <p className="mt-2 text-sm text-ink-400">Looks like you haven't added anything yet.</p>
            <button
              onClick={() => {
                handleClose();
                navigate('/shop');
              }}
              className="mt-6 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950 transition-transform hover:scale-105"
            >
              EXPLORE SNEAKERS
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                {activeCartItems.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;
                  const color = product.colors.find((c) => c.id === item.colorId);
                  return (
                    <div key={`${item.productId}-${item.colorId}-${item.sizeEu}`} className="flex gap-3">
                      <img
                        src={color?.image ?? product.colors[0].image}
                        alt={product.name}
                        className="h-24 w-24 rounded-xl object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <div>
                            <h4 className="font-display text-sm font-semibold text-ink-100">{product.name}</h4>
                            <p className="mt-0.5 text-xs text-ink-400">{color?.name} · EU {item.sizeEu}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId, item.colorId, item.sizeEu)}
                            className="text-ink-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-ink-700">
                            <button
                              onClick={() => updateQuantity(item.productId, item.colorId, item.sizeEu, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center text-ink-300 hover:text-ink-100"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-6 text-center text-sm font-semibold text-ink-100">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.colorId, item.sizeEu, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center text-ink-300 hover:text-ink-100"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-display text-sm font-bold text-ink-100">
                            {formatPrice(product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-ink-700 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-400">Subtotal</span>
                <span className="font-display text-xl font-bold text-ink-100">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-500">Shipping and taxes calculated at checkout</p>
              <button
                onClick={() => {
                  handleClose();
                  navigate('/cart');
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-ink-600 py-3 text-sm font-bold text-ink-100 transition-colors hover:bg-ink-800"
              >
                VIEW BAG
              </button>
              <button
                onClick={() => {
                  handleClose();
                  navigate('/checkout');
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-accent-400 py-3.5 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-[1.02] neon-glow"
              >
                CHECKOUT <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
