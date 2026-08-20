import { useState, useEffect, useRef } from 'react';
import { Link, useRouter } from '@/store/router';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { products } from '@/data/products';
import { useCurrency } from '@/store/currency';
import { Search, ShoppingBag, Heart, User, Menu, X, Zap } from 'lucide-react';
import { CurrencySwitcher } from '@/components/CurrencySwitcher';

export function Header({ onCartClick }: { onCartClick: () => void }) {
  const { navigate, path } = useRouter();
  const { cartCount, wishlist } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [path]);

  const searchResults = query
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.tagline.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.includes(query.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const navLinks = [
    { label: 'New Drops', to: '/shop?filter=new' },
    { label: 'Shop All', to: '/shop' },
    { label: 'Collections', to: '/collections' },
    { label: 'Trending', to: '/shop?filter=trending' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-ink-700/50 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-accent-400/50">
              <Zap className="h-5 w-5 text-ink-950" fill="currentColor" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-ink-100 transition-all duration-300 group-hover:neon-text">SNEAKORA</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-sm font-medium text-ink-300 transition-colors hover:text-ink-100 after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-accent-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <CurrencySwitcher />

            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-100"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              to="/wishlist"
              className="relative hidden h-9 w-9 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-100 sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent-400 text-[10px] font-bold text-ink-950">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to={user ? '/account' : '/auth'}
              className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-100 sm:flex"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            <button
              onClick={onCartClick}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-100"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-ink-950 animate-scale-bounce neon-glow">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-300 hover:text-ink-100 md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] glass animate-fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <div className="mx-auto max-w-2xl px-4 pt-24 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 rounded-2xl border border-ink-600 bg-ink-900 px-5 py-4 neon-glow">
              <Search className="h-5 w-5 text-ink-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sneakers, collections..."
                className="flex-1 bg-transparent text-lg text-ink-100 placeholder:text-ink-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query) {
                    navigate(`/shop?search=${encodeURIComponent(query)}`);
                    setSearchOpen(false);
                  }
                }}
              />
              <button onClick={() => setSearchOpen(false)} className="text-ink-400 hover:text-ink-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 glass-card">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigate(`/product/${p.slug}`);
                      setSearchOpen(false);
                    }}
                    className="flex w-full items-center gap-4 border-b border-ink-800 p-3 text-left transition-all duration-300 last:border-0 hover:bg-ink-800 hover:translate-x-1"
                  >
                    <img src={p.colors[0].image} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-display text-sm font-semibold text-ink-100">{p.name}</p>
                      <p className="text-xs text-ink-400">{p.tagline}</p>
                    </div>
                    <span className="font-display text-sm font-bold text-ink-100">{formatPrice(p.price)}</span>
                  </button>
                ))}
              </div>
            )}

            {!query && (
              <div className="mt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Popular</p>
                <div className="flex flex-wrap gap-2">
                  {['Flux', 'Aero', 'Limited', 'Trail', 'New Drops'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        searchRef.current?.focus();
                      }}
                      className="rounded-full border border-ink-700 bg-ink-800 px-4 py-2 text-sm text-ink-200 transition-colors hover:border-accent-400 hover:text-accent-400"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-ink-900 border-l border-ink-700 animate-slide-in-right p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-ink-100">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-ink-400 hover:text-ink-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl px-4 py-3 text-base font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-ink-100"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-ink-700" />
              <Link to="/wishlist" className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-ink-200 hover:bg-ink-800">
                <Heart className="h-5 w-5" /> Wishlist
              </Link>
              <Link to={user ? '/account' : '/auth'} className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-ink-200 hover:bg-ink-800">
                <User className="h-5 w-5" /> {user ? 'My Account' : 'Sign In'}
              </Link>
              <Link to="/track" className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-ink-200 hover:bg-ink-800">
                <Search className="h-5 w-5" /> Track Order
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
