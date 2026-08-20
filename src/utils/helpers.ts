import type { Product, CartItem } from '@/types';

export function formatPrice(value: number): string {
  return `$${value.toFixed(2).replace(/\.00$/, '')}`;
}

export function formatPriceCents(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 89999);
  return `SNK-${year}-${random}`;
}

export function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SNK';
  for (let i = 0; i < 12; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function getStockState(product: Product, sizeEu: number): 'in-stock' | 'low' | 'only-few' | 'out' {
  const size = product.sizes.find((s) => s.eu === sizeEu);
  if (!size || size.stock === 0) return 'out';
  if (size.stock <= 2) return 'only-few';
  if (size.stock <= 5) return 'low';
  return 'in-stock';
}

export function getOverallStock(product: Product): number {
  return product.sizes.reduce((sum, s) => sum + s.stock, 0);
}

export function getProductStock(product: Product): 'in-stock' | 'low' | 'out' {
  const total = getOverallStock(product);
  if (total === 0) return 'out';
  if (total <= 10) return 'low';
  return 'in-stock';
}

export function cartItemKey(item: Pick<CartItem, 'productId' | 'colorId' | 'sizeEu'>): string {
  return `${item.productId}-${item.colorId}-${item.sizeEu}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const sStr = s.toLocaleDateString('en-US', opts);
  const eStr = e.toLocaleDateString('en-US', opts);
  const yearStr = e.toLocaleDateString('en-US', { year: 'numeric' });
  return `${sStr}–${eStr}, ${yearStr}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function shippingDays(method: 'standard' | 'express' | 'priority'): [number, number] {
  switch (method) {
    case 'standard': return [5, 7];
    case 'express': return [2, 3];
    case 'priority': return [1, 2];
  }
}

export function shippingCost(method: 'standard' | 'express' | 'priority'): number {
  switch (method) {
    case 'standard': return 10;
    case 'express': return 25;
    case 'priority': return 40;
  }
}

export function shippingLabel(method: 'standard' | 'express' | 'priority'): string {
  switch (method) {
    case 'standard': return 'Standard Delivery';
    case 'express': return 'Express Delivery';
    case 'priority': return 'Priority Delivery';
  }
}

export function taxRate(state: string): number {
  const rates: Record<string, number> = {
    CA: 0.0975, NY: 0.08875, TX: 0.0825, FL: 0.07, WA: 0.095, IL: 0.0625, PA: 0.06, OH: 0.0575, GA: 0.07, NC: 0.0475,
  };
  return rates[state.toUpperCase()] ?? 0.08;
}

export function detectCardBrand(number: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
  const clean = number.replace(/\s/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  return 'unknown';
}

export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 16);
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiry(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  return clean;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10;
}

export function isValidCardNumber(number: string): boolean {
  const clean = number.replace(/\s/g, '');
  if (clean.length < 13 || clean.length > 16) return false;
  let sum = 0;
  let alt = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let n = parseInt(clean[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(expiry: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const [mm, yy] = expiry.split('/').map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const expYear = 2000 + yy;
  const expDate = new Date(expYear, mm, 0);
  return expDate >= now;
}

export function isValidCvv(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}
