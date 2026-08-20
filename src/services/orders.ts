import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { generateOrderId, generateTrackingNumber, addDays, shippingDays } from '@/utils/helpers';

export async function saveOrder(
  orderData: Omit<Order, 'id' | 'trackingNumber' | 'createdAt' | 'estimatedDeliveryStart' | 'estimatedDeliveryEnd' | 'status'>,
  customerId: string | null
): Promise<Order> {
  const id = generateOrderId();
  const trackingNumber = generateTrackingNumber();
  const now = new Date();
  const [minDays, maxDays] = shippingDays(orderData.shippingMethod);

  const order: Order = {
    ...orderData,
    id,
    customerId,
    status: 'placed',
    trackingNumber,
    createdAt: now.toISOString(),
    estimatedDeliveryStart: addDays(now, minDays).toISOString(),
    estimatedDeliveryEnd: addDays(now, maxDays).toISOString(),
  };

  const { error } = await supabase.from('orders').insert({
    id: order.id,
    customer_id: customerId,
    contact: order.contact,
    shipping_address: order.shippingAddress,
    shipping_method: order.shippingMethod,
    payment: order.payment,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    promo_code: order.promoCode,
    shipping_cost: order.shippingCost,
    tax: order.tax,
    total: order.total,
    status: order.status,
    payment_status: order.paymentStatus,
    tracking_number: order.trackingNumber,
    estimated_delivery_start: order.estimatedDeliveryStart,
    estimated_delivery_end: order.estimatedDeliveryEnd,
  });

  if (error) {
    console.error('Failed to save order:', error);
  }

  // Also save to localStorage as a fallback / for guest order lookup
  try {
    const existing = JSON.parse(localStorage.getItem('sneakora_orders') || '[]');
    existing.push(order);
    localStorage.setItem('sneakora_orders', JSON.stringify(existing));
  } catch {
    // ignore
  }

  return order;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch orders:', error);
    return getLocalOrders().filter((o) => o.customerId === userId);
  }

  return data.map(mapDbOrder);
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    const local = getLocalOrders().find((o) => o.id === id);
    return local ?? null;
  }

  return mapDbOrder(data);
}

function mapDbOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    customerId: row.customer_id as string | null,
    contact: row.contact as Order['contact'],
    shippingAddress: row.shipping_address as Order['shippingAddress'],
    shippingMethod: row.shipping_method as Order['shippingMethod'],
    payment: row.payment as Order['payment'],
    items: row.items as Order['items'],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    promoCode: row.promo_code as string | null,
    shippingCost: Number(row.shipping_cost),
    tax: Number(row.tax),
    total: Number(row.total),
    status: row.status as Order['status'],
    paymentStatus: row.payment_status as Order['paymentStatus'],
    trackingNumber: row.tracking_number as string,
    createdAt: row.created_at as string,
    estimatedDeliveryStart: row.estimated_delivery_start as string,
    estimatedDeliveryEnd: row.estimated_delivery_end as string,
  };
}

export function getLocalOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem('sneakora_orders') || '[]');
  } catch {
    return [];
  }
}

export function getLocalOrderById(id: string): Order | null {
  return getLocalOrders().find((o) => o.id === id) ?? null;
}
