import { useCart } from '@/store/cart';
import { useRouter, Link } from '@/store/router';
import { products } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export function WishlistPage() {
  const { wishlist } = useCart();
  const { navigate } = useRouter();

  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="pt-24 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3 animate-fade-in-up">
          <Heart className="h-7 w-7 text-accent-400" />
          <h1 className="font-display text-4xl font-bold text-ink-100">Wishlist</h1>
        </div>
        <p className="mt-2 text-ink-400 animate-fade-in-up" style={{ animationDelay: '80ms', opacity: 0 }}>{wishedProducts.length} {wishedProducts.length === 1 ? 'item' : 'items'} saved</p>

        {wishedProducts.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-ink-700 bg-ink-900 p-16 text-center animate-scale-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-800">
              <Heart className="h-8 w-8 text-ink-500" />
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold text-ink-100">Your wishlist is empty</h3>
            <p className="mt-2 text-sm text-ink-400">Save your favorite sneakers for later.</p>
            <Link
              to="/shop"
              className="group mt-6 flex items-center gap-2 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950 transition-transform hover:scale-105"
            >
              <ShoppingBag className="h-4 w-4" /> EXPLORE SNEAKERS
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {wishedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
