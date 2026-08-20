import { useRouter } from '@/store/router';
import { collections, products } from '@/data/products';
import { ArrowRight } from 'lucide-react';

export function CollectionsPage() {
  const { navigate } = useRouter();

  return (
    <div className="pt-24 animate-fade-in aurora-bg">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-ink-100 sm:text-5xl animate-fade-in-up gradient-text-animate">Collections</h1>
        <p className="mt-2 text-ink-400 animate-fade-in-up" style={{ animationDelay: '80ms', opacity: 0 }}>Explore our curated series — each engineered for a purpose.</p>

        {/* Featured collections */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {collections.map((c, i) => {
            const collectionProducts = products.filter((p) => p.collection === c.name);
            return (
              <div
                key={c.id}
                className="group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-3xl border border-ink-700 transition-all duration-300 hover:border-accent-400/30 hover:-translate-y-1 animate-fade-in-up neon-glow-hover"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
                onClick={() => navigate(`/shop?collection=${c.id}`)}
              >
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 holo-shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 transition-transform duration-500 group-hover:-translate-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: c.accent }}>{c.tagline}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-ink-100">{c.name}</h3>
                  <p className="mt-1 max-w-sm text-sm text-ink-300">{c.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-100">{collectionProducts.length} sneakers</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-accent-400">
                      Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All products grid */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-ink-100">All Sneakers</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((p, i) => (
              <div
                key={p.id}
                className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 transition-all duration-300 hover:border-accent-400/30 hover:-translate-y-1 animate-fade-in-up neon-glow-hover"
                style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
                onClick={() => navigate(`/product/${p.slug}`)}
              >
                <img src={p.colors[0].image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 holo-shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-sm font-semibold text-ink-100">{p.name}</p>
                  <p className="text-xs text-ink-300">{p.collection}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
