import { useState } from 'react';
import { useRouter, Link } from '@/store/router';
import { getProduct } from '@/data/products';
import { useCart } from '@/store/cart';
import { AddToCartConfirmation } from '@/components/AddToCartConfirmation';
import {
  getStockState, getOverallStock, getProductStock,
} from '@/utils/helpers';
import { useCurrency } from '@/store/currency';
import { sizeChart, convertSize } from '@/data/sizes';
import type { SizeSystem, CartItem } from '@/types';
import {
  Star, Heart, ShoppingBag, Minus, Plus, Truck, RefreshCw, Shield, ChevronRight,
  Ruler, Check, AlertTriangle, Bell, ArrowLeft, ArrowRight,
} from 'lucide-react';

export function ProductPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { formatPrice } = useCurrency();
  const product = getProduct(slug);

  const [colorIdx, setColorIdx] = useState(0);
  const [sizeEu, setSizeEu] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>('EU');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [addedItem, setAddedItem] = useState<CartItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-3xl font-bold text-ink-100">Product not found</h1>
        <p className="mt-2 text-ink-400">This sneaker doesn't exist or has been removed.</p>
        <Link to="/shop" className="mt-6 rounded-full bg-accent-400 px-6 py-3 text-sm font-bold text-ink-950">
          BACK TO SHOP
        </Link>
      </div>
    );
  }

  const color = product.colors[colorIdx];
  const stockState = sizeEu ? getStockState(product, sizeEu) : null;
  const productStock = getProductStock(product);
  const totalStock = getOverallStock(product);
  const wished = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (!sizeEu) {
      setError('Please select a size before continuing.');
      return;
    }
    if (stockState === 'out') {
      setError('This size is no longer available.');
      return;
    }
    setError(null);
    const item: CartItem = {
      productId: product.id,
      colorId: color.id,
      sizeEu,
      quantity,
      savedForLater: false,
    };
    addToCart(item);
    setAddedItem(item);
  };

  return (
    <div className="pt-20 animate-fade-in aurora-bg">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-1 text-xs text-ink-500">
          <Link to="/" className="hover:text-ink-300">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-ink-300">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink-300">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start animate-fade-in-up" style={{ opacity: 0 }}>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-ink-700 bg-ink-900 neon-glow-hover">
              <img
                key={galleryIdx}
                src={color.gallery[galleryIdx]}
                alt={product.name}
                className="h-full w-full object-cover animate-fade-in"
              />
              {product.isNew && (
                <span className="absolute left-4 top-4 rounded-full bg-accent-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-950 neon-glow animate-scale-bounce">
                  New
                </span>
              )}
              {product.isLimited && (
                <span className="absolute left-4 top-4 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-400 border border-accent-400/30">
                  Limited Edition
                </span>
              )}
            </div>
            {/* Thumbnails */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {color.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIdx(i)}
                  className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    galleryIdx === i ? 'border-accent-400' : 'border-ink-700 hover:border-ink-600'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="animate-fade-in-up" style={{ animationDelay: '120ms', opacity: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-400 neon-text">{product.collection}</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-ink-100 sm:text-5xl">{product.name}</h1>
            <p className="mt-2 text-lg text-ink-300">{product.tagline}</p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-accent-400 text-accent-400' : 'text-ink-600'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-ink-300">{product.rating}</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-sm text-ink-400 underline hover:text-ink-200"
              >
                {product.reviewCount} reviews
              </button>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-ink-100">{formatPrice(product.price)}</span>
              {product.compareAt && (
                <>
                  <span className="text-xl text-ink-500 line-through">{formatPrice(product.compareAt)}</span>
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
                    SAVE {formatPrice(product.compareAt - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Stock badge */}
            <div className="mt-4">
              {productStock === 'out' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-400">
                  <AlertTriangle className="h-4 w-4" /> Out of Stock
                </span>
              ) : productStock === 'low' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-400">
                  <AlertTriangle className="h-4 w-4" /> Low Stock — {totalStock} pairs left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-400/10 px-3 py-1.5 text-sm font-semibold text-accent-400">
                  <Check className="h-4 w-4" /> In Stock
                </span>
              )}
            </div>

            {/* Color selection */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-ink-100">
                  Color — <span className="text-ink-400">{color.name}</span>
                </label>
              </div>
              <div className="mt-3 flex gap-3">
                {product.colors.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => { setColorIdx(i); setGalleryIdx(0); }}
                    className={`relative h-12 w-12 rounded-full border-2 transition-all ${
                      colorIdx === i ? 'border-accent-400 scale-110' : 'border-ink-700 hover:border-ink-500'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${c.hex}, ${c.hex2})` }}
                    title={c.name}
                  >
                    {colorIdx === i && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-ink-950" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-ink-100">
                  Size {sizeEu && <span className="text-ink-400">— EU {sizeEu}</span>}
                </label>
                <div className="flex items-center gap-3">
                  {/* Size system toggle */}
                  <div className="flex rounded-full border border-ink-700 p-0.5">
                    {(['EU', 'US', 'UK', 'CM'] as SizeSystem[]).map((sys) => (
                      <button
                        key={sys}
                        onClick={() => setSizeSystem(sys)}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                          sizeSystem === sys ? 'bg-accent-400 text-ink-950' : 'text-ink-400 hover:text-ink-100'
                        }`}
                      >
                        {sys}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="flex items-center gap-1 text-sm text-ink-300 hover:text-ink-100"
                  >
                    <Ruler className="h-4 w-4" /> Size Guide
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {product.sizes.map((s) => {
                  const isSelected = sizeEu === s.eu;
                  const isOut = s.stock === 0;
                  const isLow = s.stock > 0 && s.stock <= 2;
                  return (
                    <button
                      key={s.eu}
                      onClick={() => !isOut && setSizeEu(s.eu)}
                      disabled={isOut}
                      className={`relative flex flex-col items-center justify-center rounded-xl border py-3 text-sm font-bold transition-all ${
                        isSelected
                          ? 'border-accent-400 bg-accent-400 text-ink-950'
                          : isOut
                          ? 'border-ink-800 bg-ink-900 text-ink-600 cursor-not-allowed line-through'
                          : isLow
                          ? 'border-orange-500/30 bg-ink-900 text-ink-100 hover:border-orange-500'
                          : 'border-ink-700 bg-ink-900 text-ink-100 hover:border-ink-500'
                      }`}
                    >
                      {convertSize(s.eu, sizeSystem)}
                      {isLow && !isSelected && (
                        <span className="text-[9px] font-medium text-orange-400">{s.stock} left</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {sizeEu && stockState === 'only-few' && (
                <p className="mt-2 text-xs font-medium text-orange-400">
                  Hurry — only {product.sizes.find((s) => s.eu === sizeEu)?.stock} pairs left in this size!
                </p>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex gap-3">
              <div className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-9 w-9 items-center justify-center text-ink-300 hover:text-ink-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center font-display text-base font-bold text-ink-100">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center text-ink-300 hover:text-ink-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {productStock === 'out' ? (
                <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-600 bg-ink-800 py-4 text-sm font-bold text-ink-100 transition-colors hover:bg-ink-700">
                  <Bell className="h-4 w-4" /> NOTIFY ME
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-400 py-4 text-sm font-bold text-ink-950 transition-all duration-300 hover:scale-[1.02] neon-glow"
                >
                  <ShoppingBag className="h-4 w-4" /> ADD TO CART
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all ${
                  wished ? 'border-accent-400 bg-accent-400/10' : 'border-ink-700 bg-ink-900 hover:border-ink-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${wished ? 'fill-accent-400 text-accent-400' : 'text-ink-300'}`} />
              </button>
            </div>

            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-red-400">
                <AlertTriangle className="h-4 w-4" /> {error}
              </p>
            )}

            {/* Trust indicators */}
            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-ink-700 bg-ink-900 p-4 glass-card">
              {[
                { icon: Truck, label: 'Free shipping over $150' },
                { icon: RefreshCw, label: '30-day returns' },
                { icon: Shield, label: 'Secure checkout' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
                  <item.icon className="h-5 w-5 text-accent-400" />
                  <span className="text-xs text-ink-400">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mt-10">
              <div className="flex gap-6 border-b border-ink-700">
                {(['description', 'specs', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative pb-3 text-sm font-semibold capitalize transition-all duration-300 ${
                      activeTab === tab ? 'text-ink-100' : 'text-ink-400 hover:text-ink-200'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent-400 neon-glow" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeTab === 'description' && (
                  <p key="desc" className="text-sm leading-relaxed text-ink-300 animate-fade-in">{product.description}</p>
                )}
                {activeTab === 'specs' && (
                  <dl key="specs" className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-ink-700 sm:grid-cols-2 animate-fade-in">
                    {product.specs.map((spec) => (
                      <div key={spec.label} className="flex justify-between bg-ink-900 p-4 transition-colors hover:bg-ink-800/50">
                        <dt className="text-sm text-ink-400">{spec.label}</dt>
                        <dd className="text-sm font-medium text-ink-100">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {activeTab === 'reviews' && (
                  <div key="reviews" className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-6">
                      <div className="text-center">
                        <div className="font-display text-4xl font-bold text-ink-100">{product.rating}</div>
                        <div className="mt-1 flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-accent-400 text-accent-400' : 'text-ink-600'}`} />
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-ink-400">{product.reviewCount} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="w-3 text-xs text-ink-400">{star}</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-700">
                              <div
                                className="h-full rounded-full bg-accent-400"
                                style={{ width: `${star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : 1}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {product.reviews.map((review, i) => (
                      <div key={review.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-5 transition-all hover:border-ink-600 hover:bg-ink-800/30 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-700 text-xs font-bold text-ink-100">
                              {review.author.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ink-100">{review.author}</p>
                              {review.verified && (
                                <p className="text-xs text-accent-400">Verified Buyer</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-accent-400 text-accent-400' : 'text-ink-600'}`} />
                            ))}
                          </div>
                        </div>
                        <h4 className="mt-3 font-display text-sm font-semibold text-ink-100">{review.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-ink-300">{review.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size guide modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowSizeGuide(false)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-ink-700 bg-ink-900 p-6 animate-scale-in gradient-border">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-ink-100">Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-ink-400 hover:text-ink-100">
                <span className="text-xl">×</span>
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-400">Find your perfect fit. Switch between sizing systems.</p>

            <div className="mt-4 flex gap-2">
              {(['EU', 'US', 'UK', 'CM'] as SizeSystem[]).map((sys) => (
                <button
                  key={sys}
                  onClick={() => setSizeSystem(sys)}
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${
                    sizeSystem === sys ? 'bg-accent-400 text-ink-950' : 'bg-ink-800 text-ink-300 hover:text-ink-100'
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-ink-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-700 bg-ink-800">
                    <th className="px-4 py-3 text-left font-semibold text-ink-100">EU</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-100">US</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-100">UK</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink-100">CM</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.EU.map((eu, i) => (
                    <tr key={eu} className="border-b border-ink-800 last:border-0 hover:bg-ink-800/50">
                      <td className="px-4 py-2.5 text-ink-100">{eu}</td>
                      <td className="px-4 py-2.5 text-ink-300">{sizeChart.US[i]}</td>
                      <td className="px-4 py-2.5 text-ink-300">{sizeChart.UK[i]}</td>
                      <td className="px-4 py-2.5 text-ink-300">{sizeChart.CM[i]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-ink-400">
              Tip: If you're between sizes, we recommend sizing up for a more comfortable fit.
            </p>
          </div>
        </div>
      )}

      {/* Add to cart confirmation */}
      <AddToCartConfirmation item={addedItem} onClose={() => setAddedItem(null)} />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-sm font-medium text-ink-300 hover:text-ink-100">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </button>
      </div>
    </div>
  );
}
