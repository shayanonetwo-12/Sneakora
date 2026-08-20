export type SizeSystem = 'EU' | 'US' | 'UK' | 'CM';

export interface SizeStock {
  eu: number;
  stock: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  hex2: string;
  image: string;
  gallery: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  compareAt?: number;
  category: 'lifestyle' | 'performance' | 'trail' | 'limited';
  collection: string;
  colors: ProductColor[];
  sizes: SizeStock[];
  specs: ProductSpec[];
  reviews: Review[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isLimited?: boolean;
  releaseDate: string;
  tags: string[];
}

export interface CartItem {
  productId: string;
  colorId: string;
  sizeEu: number;
  quantity: number;
  savedForLater: boolean;
}

export interface PromoCode {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  country: string;
  state: string;
  city: string;
  address: string;
  apt: string;
  postal: string;
  phone: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  subscribe: boolean;
}

export type ShippingMethod = 'standard' | 'express' | 'priority';

export type PaymentMethod = 'card' | 'cod' | 'paypal' | 'applepay' | 'googlepay';

export interface PaymentInfo {
  method: PaymentMethod;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardLast4?: string;
  billingSameAsShipping: boolean;
  billingAddress: ShippingAddress | null;
}

export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered';

export interface OrderItem {
  productId: string;
  name: string;
  colorName: string;
  colorHex: string;
  sizeEu: number;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  customerId: string | null;
  contact: ContactInfo;
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  payment: { method: PaymentMethod; cardLast4: string };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode: string | null;
  shippingCost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'paid' | 'pending' | 'demo';
  trackingNumber: string;
  createdAt: string;
  estimatedDeliveryStart: string;
  estimatedDeliveryEnd: string;
}
