import { Link, useRouter } from '@/store/router';
import { products, collections } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useCurrency } from '@/store/currency';
import { ArrowRight, ArrowUpRight, Zap, Shield, Truck, RefreshCw, Star, Cpu, Leaf, Award, Sparkles } from 'lucide-react';

export function HomePage() {
  const { navigate } = useRouter();
  const { formatPrice } = useCurrency();

  const newDrops = products.filter((p) => p.isNew);
  const featured = products.filter((p) => p.isFeatured);
  const trending = products.filter((p) => p.isTrending);
  const recommended = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const limitedEditions = products.filter((p) => p.isLimited);
  const bestValue = products.filter((p) => p.compareAt).sort((a, b) => {
    const aSavings = a.compareAt! - a.price;
    const bSavings = b.compareAt! - b.price;
    return bSavings - aSavings;
  }).slice(0, 4);

  const techFeatures = [
    { icon: Cpu, title: 'FluxFoam 2.0', desc: 'Responsive midsole that returns 85% of impact energy with every stride.' },
    { icon: Leaf, title: 'Bio-Materials', desc: 'Up to 50% recycled and plant-based materials across our performance lines.' },
    { icon: Zap, title: 'Carbon Plate', desc: 'Graphene-infused carbon-fiber plates propel you forward with explosive energy return.' },
    { icon: Award, title: 'Adaptive Fit', desc: '3D-printed ventilation and memory-foam footbeds that mold to your unique foot shape.' },
  ];

  const reviewWall = [
    { author: 'Marcus T.', rating: 5, text: 'Best sneakers I have ever owned. The comfort is unreal and the design turns heads everywhere.', product: 'Sneakora Flux', initials: 'MT' },
    { author: 'Aisha K.', rating: 4, text: 'Beautiful sneakers — the color is even better in person. Quality is absolutely top notch.', product: 'Sneakora Aero', initials: 'AK' },
    { author: 'Diego R.', rating: 5, text: 'These feel like wearing nothing. The FluxFoam midsole is incredibly responsive. Worth every penny.', product: 'Sneakora Vortex', initials: 'DR' },
    { author: 'Yuki S.', rating: 5, text: 'The Glide is a game changer. That carbon plate literally propels you forward. My PRs are falling.', product: 'Sneakora Glide', initials: 'YS' },
    { author: 'Lena P.', rating: 5, text: 'The Luna feels like it was made for my feet. The memory foam adapted perfectly after two days.', product: 'Sneakora Luna', initials: 'LP' },
    { author: 'Kofi A.', rating: 5, text: 'Atlas leather is gorgeous. Getting compliments daily and the patina is developing beautifully.', product: 'Sneakora Atlas', initials: 'KA' },
  ];

  return (
    <div className="pt-16">
      {/* Announcement marquee */}
      <div className="overflow-hidden border-b border-ink-800 bg-ink-900/50 py-2">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-8 px-4 text-xs font-medium text-ink-400">
              {['FREE SHIPPING OVER $150', '30-DAY EASY RETURNS', 'NEW: VOLT X LIMITED EDITION', 'CARBON PLATE TECHNOLOGY', 'ENGINEERED FOR PERFORMANCE'].map((text) => (
                <span key={text} className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-accent-400" />
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative min-h-[90vh] overflow-hidden aurora-bg scan-line">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-accent-400/10 blur-[120px] animate-glow" />
        <div className="absolute right-10 top-20 h-64 w-64 rounded-full bg-accent-400/5 blur-[100px] animate-float" />
        <div className="absolute left-10 bottom-20 h-48 w-48 rounded-full bg-volt-600/5 blur-[80px] animate-float-delayed" />
        {/* Floating particles */}
        <div className="particle h-2 w-2 left-[15%] top-[30%]" style={{ animationDelay: '0s' }} />
        <div className="particle h-1.5 w-1.5 left-[80%] top-[40%]" style={{ animationDelay: '1.5s' }} />
        <div className="particle h-1 w-1 left-[60%] top-[60%]" style={{ animationDelay: '3s' }} />
        <div className="particle h-2 w-2 left-[25%] top-[70%]" style={{ animationDelay: '4.5s' }} />
        <div className="particle h-1.5 w-1.5 left-[70%] top-[25%]" style={{ animationDelay: '6s' }} />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/50 px-4 py-2 text-xs font-medium text-ink-300 animate-fade-in-up glass">
            <span className="flex h-2 w-2 rounded-full bg-accent-400 animate-pulse" />
            4 New Drops — Glide, Echo, Surge, Volt X
          </div>

          <h1 className="mt-8 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink-100 animate-fade-in-up sm:text-7xl lg:text-8xl" style={{ animationDelay: '80ms' }}>
            STEP INTO
            <br />
            <span className="gradient-text-animate neon-text">THE FUTURE</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-300 animate-fade-in-up sm:text-lg" style={{ animationDelay: '160ms' }}>
            Futuristic sneakers engineered for tomorrow. Responsive foam, recycled materials, and design that turns heads.
          </p>

          <div className="mt-10 flex flex-col gap-3 animate-fade-in-up sm:flex-row" style={{ animationDelay: '240ms' }}>
            <Link
              to="/shop"
              className="group flex items-center justify-center gap-2 rounded-full bg-accent-400 px-8 py-4 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-105 neon-glow"
            >
              EXPLORE SNEAKERS
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/collections"
              className="flex items-center justify-center gap-2 rounded-full border border-ink-600 bg-ink-900/50 px-8 py-4 text-sm font-bold text-ink-100 transition-all duration-300 hover:bg-ink-800 neon-glow-hover"
            >
              VIEW COLLECTIONS
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
            {[
              { value: '16', label: 'Models' },
              { value: '40+', label: 'Colorways' },
              { value: '2.1K+', label: 'Reviews' },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <div className="font-display text-3xl font-bold text-ink-100 transition-all duration-300 group-hover:scale-110 group-hover:text-accent-400 sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-ink-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured product floating preview */}
        <div className="relative mx-auto -mt-8 max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {newDrops.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 animate-fade-in-up"
                style={{ animationDelay: `${400 + i * 80}ms`, opacity: 0 }}
                onClick={() => navigate(`/product/${p.slug}`)}
              >
                <img
                  src={p.colors[0].image}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-sm font-semibold text-ink-100">{p.name}</p>
                  <p className="mt-0.5 text-xs text-ink-300">{formatPrice(p.price)}</p>
                </div>
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full glass opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4 text-ink-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <ScrollReveal as="section" className="border-y border-ink-800 bg-ink-900/30 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 sm:px-6 md:justify-between">
          {[
            { icon: Truck, label: 'Free shipping over $150' },
            { icon: RefreshCw, label: '30-day easy returns' },
            { icon: Shield, label: 'Secure checkout' },
            { icon: Zap, label: 'Engineered for performance' },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-ink-300 transition-transform hover:scale-105" style={{ transitionDelay: `${i * 50}ms` }}>
              <item.icon className="h-4 w-4 text-accent-400" />
              {item.label}
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Technology showcase */}
      <ScrollReveal as="section" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Engineered Innovation</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-100 sm:text-4xl">Technology That Moves You</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-400">Every Sneakora shoe is built with proprietary technology designed to make every step better than the last.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {techFeatures.map((tech, i) => (
            <div
              key={tech.title}
              className="group relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-all duration-300 hover:border-accent-400/30 hover:bg-ink-800/50 hover:-translate-y-1 animate-fade-in-up neon-glow-hover"
              style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent-400/5 blur-2xl transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />
              <div className="absolute inset-0 holo-shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-800 transition-all duration-300 group-hover:bg-accent-400/10 group-hover:scale-110 group-hover:rotate-6">
                  <tech.icon className="h-6 w-6 text-accent-400 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-100">{tech.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* New Drops */}
      <ScrollReveal as="section" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Just Landed</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-100 sm:text-4xl">New Drops</h2>
          </div>
          <Link to="/shop?filter=new" className="flex items-center gap-1 text-sm font-medium text-ink-300 transition-colors hover:text-ink-100">
            View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {newDrops.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </ScrollReveal>

      {/* Collections banner */}
      <ScrollReveal as="section" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Curated</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-100 sm:text-4xl">Collections</h2>
          </div>
          <Link to="/collections" className="flex items-center gap-1 text-sm font-medium text-ink-300 transition-colors hover:text-ink-100">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {collections.slice(0, 6).map((c, i) => (
            <div
              key={c.id}
              className="group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-2xl border border-ink-700 transition-all duration-300 hover:border-ink-500 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
              onClick={() => navigate(`/shop?collection=${c.id}`)}
            >
              <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 transition-transform duration-500 group-hover:translate-y-[-4px]">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: c.accent }}>{c.tagline}</p>
                <h3 className="mt-1 font-display text-2xl font-bold text-ink-100">{c.name}</h3>
                <p className="mt-1 max-w-sm text-sm text-ink-300">{c.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink-100">
                  Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Limited Edition Spotlight */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-accent-400/20 bg-gradient-to-br from-ink-900 via-ink-900 to-ink-800 p-8 sm:p-12">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-accent-400/8 blur-[100px]" />
          <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full bg-accent-400/5 blur-[80px]" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Exclusive</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink-100 sm:text-4xl">Limited Editions</h2>
            <p className="mt-2 max-w-lg text-sm text-ink-300">Ultra-rare releases with numbered authenticity cards, premium packaging, and collector-grade materials. Once they're gone, they're gone.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {limitedEditions.map((p) => (
                <div
                  key={p.id}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/50 transition-all hover:border-accent-400/30"
                  onClick={() => navigate(`/product/${p.slug}`)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img src={p.colors[0].image} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-3 left-3 rounded-full bg-accent-400 px-3 py-1 text-xs font-bold text-ink-950">LIMITED</div>
                  </div>
                  <div className="p-4">
                    <p className="font-display text-sm font-semibold text-ink-100">{p.name}</p>
                    <p className="mt-0.5 text-xs text-ink-400">{p.tagline}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-display text-lg font-bold text-accent-400">{formatPrice(p.price)}</span>
                      <div className="flex items-center gap-1 text-xs text-ink-500">
                        <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                        {p.rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Handpicked</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-100 sm:text-4xl">Featured Sneakers</h2>
          </div>
          <Link to="/shop" className="flex items-center gap-1 text-sm font-medium text-ink-300 hover:text-ink-100">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="border-y border-ink-800 bg-ink-900/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Hot Right Now</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink-100 sm:text-4xl">Trending</h2>
            </div>
            <Link to="/shop?filter=trending" className="flex items-center gap-1 text-sm font-medium text-ink-300 hover:text-ink-100">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {trending.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Value */}
      {bestValue.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Save More</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink-100 sm:text-4xl">Best Value Picks</h2>
            </div>
            <Link to="/shop" className="flex items-center gap-1 text-sm font-medium text-ink-300 hover:text-ink-100">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {bestValue.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">For You</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-100 sm:text-4xl">Recommended</h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {recommended.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Review wall */}
      <ScrollReveal as="section" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">Loved by Thousands</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-100 sm:text-4xl">What Our Community Says</h2>
        </div>
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {reviewWall.map((review, i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-all duration-300 hover:border-ink-600 hover:bg-ink-800/30 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
            >
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent-400 text-accent-400" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-200">“{review.text}”</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 font-display text-xs font-bold text-ink-100 transition-transform duration-300 hover:scale-110">
                  {review.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-100">{review.author}</p>
                  <p className="text-xs text-ink-400">Verified Buyer &middot; {review.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal as="section" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-accent-400 p-12 text-center transition-transform duration-500 hover:scale-[1.01] sm:p-20 aurora-bg pulse-glow">
          <div className="absolute inset-0 dot-bg opacity-20" />
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-ink-950/10 blur-[60px] animate-float" />
          <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full bg-ink-950/10 blur-[60px] animate-float-delayed" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold leading-tight text-ink-950 sm:text-5xl">
              Ready to step
              <br />into the future?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-ink-800">
              Join thousands of pioneers wearing the next generation of footwear.
            </p>
            <Link
              to="/shop"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink-950 px-8 py-4 text-sm font-bold text-ink-100 transition-transform hover:scale-105"
            >
              SHOP ALL SNEAKERS <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
