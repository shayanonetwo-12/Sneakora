import { useRouter } from '@/store/router';
import type { Product } from '@/types';
import { useCart } from '@/store/cart';
import { getOverallStock, getProductStock } from '@/utils/helpers';
import { useCurrency } from '@/store/currency';
import { Heart, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigate } = useRouter();
  const { toggleWishlist, isWishlisted } = useCart();
  const { formatPrice } = useCurrency();
  const wished = isWishlisted(product.id);
  const stock = getProductStock(product);
  const totalStock = getOverallStock(product);

  return (
    <div
      className="group relative cursor-pointer animate-fade-in-up transition-transform duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-900 border border-ink-700 transition-all duration-300 group-hover:border-accent-400/30 group-hover:shadow-2xl group-hover:shadow-accent-400/10 neon-glow-hover">
        <img
          src={product.colors[0].image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Holographic shimmer overlay */}
        <div className="absolute inset-0 holo-shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-accent-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-950 transition-transform duration-300 group-hover:scale-105">
              New
            </span>
          )}
          {product.isLimited && (
            <span className="rounded-full bg-ink-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-400 border border-accent-400/30 transition-transform duration-300 group-hover:scale-105">
              Limited
            </span>
          )}
          {product.compareAt && (
            <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white transition-transform duration-300 group-hover:scale-105">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full glass border border-ink-600 transition-all duration-300 hover:scale-125 hover:border-accent-400/50"
          aria-label="Add to wishlist"
        >
          <Heart className={`h-4 w-4 transition-all duration-300 ${wished ? 'fill-accent-400 text-accent-400 scale-110' : 'text-ink-100'}`} />
        </button>

        {/* Quick add gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950/90 to-transparent opacity-0 transition-all duration-400 group-hover:opacity-100" />

        {/* View button on hover */}
        <div className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-accent-400 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 neon-glow">
          <ArrowUpRight className="h-4 w-4 text-ink-950" />
        </div>

        {/* Stock indicator */}
        <div className="absolute bottom-3 left-3 transition-transform duration-300 group-hover:-translate-y-0.5">
          {stock === 'out' ? (
            <span className="rounded-full bg-ink-950/80 px-2.5 py-1 text-[10px] font-semibold text-red-400">
              Out of Stock
            </span>
          ) : stock === 'low' ? (
            <span className="rounded-full bg-ink-950/80 px-2.5 py-1 text-[10px] font-semibold text-orange-400">
              {totalStock} left
            </span>
          ) : (
            <span className="rounded-full bg-ink-950/80 px-2.5 py-1 text-[10px] font-semibold text-accent-400">
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-ink-100">{product.name}</h3>
          <div className="flex items-center gap-0.5 text-xs text-ink-400">
            <span className="text-accent-400">★</span>
            <span>{product.rating}</span>
          </div>
        </div>
        <p className="mt-0.5 text-xs text-ink-400">{product.tagline}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-display text-base font-bold text-ink-100">{formatPrice(product.price)}</span>
          {product.compareAt && (
            <span className="text-sm text-ink-500 line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>
        {/* Color dots */}
        <div className="mt-2 flex gap-1.5">
          {product.colors.map((c) => (
            <div
              key={c.id}
              className="h-3 w-3 rounded-full border border-ink-600"
              style={{ background: `linear-gradient(135deg, ${c.hex}, ${c.hex2})` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/5] rounded-2xl skeleton" />
      <div className="space-y-2">
        <div className="h-4 w-2/3 rounded skeleton" />
        <div className="h-3 w-1/2 rounded skeleton" />
        <div className="h-5 w-1/3 rounded skeleton" />
      </div>
    </div>
  );
}


