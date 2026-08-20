import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart';
import { useRouter } from '@/store/router';
import { getProductById } from '@/data/products';
import { useCurrency } from '@/store/currency';
import { Check, ShoppingBag, ArrowRight, X } from 'lucide-react';
import type { CartItem } from '@/types';

export function AddToCartConfirmation({
  item,
  onClose,
}: {
  item: CartItem | null;
  onClose: () => void;
}) {
  const { navigate } = useRouter();
  const { formatPrice } = useCurrency();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (item) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  if (!item) return null;

  const product = getProductById(item.productId);
  if (!product) return null;
  const color = product.colors.find((c) => c.id === item.colorId);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-ink-950/70 backdrop-blur-sm ${visible ? 'animate-fade-in' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`relative w-full max-w-md rounded-3xl border border-ink-700 bg-ink-900 p-6 gradient-border ${
          visible ? 'animate-scale-in' : 'opacity-0 scale-95 transition-all duration-200'
        }`}
      >
        <button onClick={handleClose} className="absolute right-4 top-4 text-ink-500 transition-all duration-300 hover:text-ink-100 hover:rotate-90">
          <X className="h-5 w-5" />
        </button>

        {/* Success indicator */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent-400 neon-glow pulse-glow">
            <Check className="h-8 w-8 text-ink-950" strokeWidth={3} />
            <div className="absolute inset-0 rounded-full border-2 border-accent-400 animate-pulse-ring" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold text-ink-100 neon-text">ADDED TO YOUR BAG</h2>
        </div>

        {/* Product info */}
        <div className="mt-6 flex gap-4 rounded-2xl border border-ink-700 bg-ink-800 p-4 transition-all duration-300 hover:border-accent-400/20">
          <img
            src={color?.image ?? product.colors[0].image}
            alt={product.name}
            className="h-20 w-20 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h3 className="font-display text-base font-semibold text-ink-100">{product.name}</h3>
            <p className="mt-1 text-sm text-ink-400">{color?.name}</p>
            <div className="mt-1 flex gap-4 text-sm text-ink-400">
              <span>Size: EU {item.sizeEu}</span>
              <span>Qty: {item.quantity}</span>
            </div>
            <p className="mt-1 font-display text-lg font-bold text-ink-100">
              {formatPrice(product.price * item.quantity)}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-2">
          <button
            onClick={() => {
              handleClose();
              navigate('/cart');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-400 py-3.5 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-[1.02] neon-glow"
          >
            <ShoppingBag className="h-4 w-4" /> VIEW BAG
          </button>
          <button
            onClick={handleClose}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-600 py-3.5 text-sm font-bold text-ink-100 transition-all duration-300 hover:bg-ink-800 neon-glow-hover"
          >
            CONTINUE SHOPPING <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
