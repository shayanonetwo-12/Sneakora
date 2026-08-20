import { useState, useMemo, useEffect } from 'react';
import { products } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { useRouter } from '@/store/router';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import type { Product } from '@/types';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'rating';

export function ShopPage() {
  const { path } = useRouter();
  const params = new URLSearchParams(path.split('?')[1] || '');

  const [search, setSearch] = useState(params.get('search') || '');
  const [category, setCategory] = useState<string>(params.get('filter') || params.get('collection') || 'all');
  const [sort, setSort] = useState<SortOption>('featured');
  const [priceMax, setPriceMax] = useState(250);
  const [showFilters, setShowFilters] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(path.split('?')[1] || '');
    const s = p.get('search');
    if (s) setSearch(s);
    const f = p.get('filter');
    const c = p.get('collection');
    if (f || c) setCategory(f || c || 'all');
  }, [path]);

  const filtered = useMemo(() => {
    let result: Product[] = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    if (category === 'new') result = result.filter((p) => p.isNew);
    else if (category === 'trending') result = result.filter((p) => p.isTrending);
    else if (category === 'limited') result = result.filter((p) => p.isLimited);
    else if (category !== 'all') {
      const collectionMap: Record<string, string> = {
        flux: 'Flux Series',
        aero: 'Aero Series',
        pulse: 'Pulse Series',
        nova: 'Nova Series',
        drift: 'Drift Series',
        vortex: 'Vortex Series',
        phantom: 'Phantom Series',
        trail: 'Trail Series',
        glide: 'Glide Series',
        echo: 'Echo Series',
        luna: 'Luna Series',
        charge: 'Charge Series',
        atlas: 'Atlas Series',
        surge: 'Surge Series',
      };
      const collectionName = collectionMap[category];
      if (collectionName) result = result.filter((p) => p.collection === collectionName);
      else result = result.filter((p) => p.category === category);
    }

    result = result.filter((p) => p.price <= priceMax);

    if (inStockOnly) {
      result = result.filter((p) => p.sizes.some((s) => s.stock > 0));
    }

    switch (sort) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)); break;
    }

    return result;
  }, [search, category, sort, priceMax, inStockOnly]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New Drops' },
    { id: 'trending', label: 'Trending' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'performance', label: 'Performance' },
    { id: 'trail', label: 'Trail' },
    { id: 'limited', label: 'Limited' },
  ];

  return (
    <div className="pt-24 animate-fade-in aurora-bg">
      {/* Header */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-ink-100 sm:text-5xl animate-fade-in-up gradient-text-animate">Shop All</h1>
        <p className="mt-2 text-ink-400 animate-fade-in-up" style={{ animationDelay: '80ms', opacity: 0 }}>{filtered.length} {filtered.length === 1 ? 'sneaker' : 'sneakers'}</p>

        {/* Search bar */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-900 px-4 py-3 sm:max-w-md animate-fade-in-up glass-card neon-glow-hover" style={{ animationDelay: '160ms', opacity: 0 }}>
          <Search className="h-5 w-5 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sneakers..."
            className="flex-1 bg-transparent text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-ink-500 transition-colors hover:text-ink-100">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills + sort */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  category === cat.id
                    ? 'bg-accent-400 text-ink-950 scale-105 neon-glow'
                    : 'border border-ink-700 bg-ink-900 text-ink-300 hover:border-ink-600 hover:text-ink-100 hover:-translate-y-0.5 neon-glow-hover'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-4 py-2 text-sm font-medium text-ink-300 transition-all hover:text-ink-100 hover:border-ink-600"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none rounded-full border border-ink-700 bg-ink-900 py-2 pl-4 pr-10 text-sm font-medium text-ink-100 transition-colors focus:outline-none focus:border-accent-400"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="mt-4 grid gap-6 rounded-2xl border border-ink-700 bg-ink-900 p-6 animate-slide-down md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-ink-100">Max Price</label>
                <span className="text-sm font-bold text-accent-400">${priceMax}</span>
              </div>
              <input
                type="range"
                min={50}
                max={250}
                step={10}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="mt-3 w-full"
              />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3">
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${inStockOnly ? 'bg-accent-400' : 'bg-ink-700'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-ink-200">In stock only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-800 animate-scale-in neon-glow">
              <Search className="h-6 w-6 text-ink-500" />
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold text-ink-100">No sneakers found</h3>
            <p className="mt-2 text-sm text-ink-400">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); setPriceMax(250); setInStockOnly(false); }}
              className="mt-6 rounded-full border border-ink-600 px-6 py-3 text-sm font-bold text-ink-100 hover:bg-ink-800 transition-all duration-300 hover:scale-105 neon-glow-hover"
            >
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
