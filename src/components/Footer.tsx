import { Link } from '@/store/router';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Zap, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950">
      <ScrollReveal className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Zap className="h-5 w-5 text-ink-950" fill="currentColor" />
              </div>
              <span className="font-display text-xl font-bold text-ink-100">SNEAKORA</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
              Futuristic sneakers engineered for tomorrow. Step into the future with footwear designed for the way you actually move.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition-all duration-300 hover:border-accent-400 hover:text-accent-400 hover:scale-110 hover:-translate-y-0.5"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-ink-100">Shop</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-400">
              <li><Link to="/shop" className="transition-colors hover:text-ink-100">All Sneakers</Link></li>
              <li><Link to="/shop?filter=new" className="transition-colors hover:text-ink-100">New Drops</Link></li>
              <li><Link to="/shop?filter=trending" className="transition-colors hover:text-ink-100">Trending</Link></li>
              <li><Link to="/collections" className="transition-colors hover:text-ink-100">Collections</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-ink-100">Account</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-400">
              <li><Link to="/auth" className="transition-colors hover:text-ink-100">Sign In</Link></li>
              <li><Link to="/account" className="transition-colors hover:text-ink-100">My Orders</Link></li>
              <li><Link to="/wishlist" className="transition-colors hover:text-ink-100">Wishlist</Link></li>
              <li><Link to="/track" className="transition-colors hover:text-ink-100">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-ink-100">Support</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-400">
              <li><a href="#" className="transition-colors hover:text-ink-100" onClick={(e) => e.preventDefault()}>Size Guide</a></li>
              <li><a href="#" className="transition-colors hover:text-ink-100" onClick={(e) => e.preventDefault()}>Shipping</a></li>
              <li><a href="#" className="transition-colors hover:text-ink-100" onClick={(e) => e.preventDefault()}>Returns</a></li>
              <li><a href="#" className="transition-colors hover:text-ink-100" onClick={(e) => e.preventDefault()}>Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-800 pt-8 sm:flex-row">
          <p className="text-xs text-ink-500">© 2026 Sneakora. All rights reserved.</p>
          <p className="text-xs text-ink-500">Crafted for the future of footwear.</p>
        </div>
      </ScrollReveal>
    </footer>
  );
}
