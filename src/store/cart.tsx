import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { CartItem } from '@/types';
import { cartItemKey } from '@/utils/helpers';

const CART_KEY = 'sneakora_cart_v1';
const WISHLIST_KEY = 'sneakora_wishlist_v1';

interface CartContextValue {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (item: Omit<CartItem, 'savedForLater'>) => void;
  removeFromCart: (productId: string, colorId: string, sizeEu: number) => void;
  updateQuantity: (productId: string, colorId: string, sizeEu: number, quantity: number) => void;
  saveForLater: (productId: string, colorId: string, sizeEu: number) => void;
  moveToCart: (productId: string, colorId: string, sizeEu: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  activeCartItems: CartItem[];
  savedItems: CartItem[];
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((item: Omit<CartItem, 'savedForLater'>) => {
    setCart((prev) => {
      const key = cartItemKey(item);
      const existing = prev.find((c) => cartItemKey(c) === key && !c.savedForLater);
      if (existing) {
        return prev.map((c) =>
          cartItemKey(c) === key && !c.savedForLater
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      }
      return [...prev, { ...item, savedForLater: false }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, colorId: string, sizeEu: number) => {
    setCart((prev) => prev.filter((c) => !(c.productId === productId && c.colorId === colorId && c.sizeEu === sizeEu)));
  }, []);

  const updateQuantity = useCallback((productId: string, colorId: string, sizeEu: number, quantity: number) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.productId === productId && c.colorId === colorId && c.sizeEu === sizeEu) {
          return { ...c, quantity: Math.max(1, quantity) };
        }
        return c;
      })
    );
  }, []);

  const saveForLater = useCallback((productId: string, colorId: string, sizeEu: number) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.productId === productId && c.colorId === colorId && c.sizeEu === sizeEu) {
          return { ...c, savedForLater: true };
        }
        return c;
      })
    );
  }, []);

  const moveToCart = useCallback((productId: string, colorId: string, sizeEu: number) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.productId === productId && c.colorId === colorId && c.sizeEu === sizeEu) {
          return { ...c, savedForLater: false };
        }
        return c;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart((prev) => prev.filter((c) => c.savedForLater));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const activeCartItems = cart.filter((c) => !c.savedForLater);
  const savedItems = cart.filter((c) => c.savedForLater);
  const cartCount = activeCartItems.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        saveForLater,
        moveToCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        cartCount,
        activeCartItems,
        savedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
