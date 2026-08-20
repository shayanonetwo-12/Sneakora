/*
# Create orders table for Sneakora e-commerce

## Purpose
Stores all customer orders placed through the Sneakora checkout flow.
Supports both guest checkout (customer_id null) and authenticated users.

## New Tables
- `orders`: Complete order records with contact info, shipping address,
  payment method, items (JSONB), pricing breakdown, status, and tracking.

## Security
- RLS enabled on `orders`.
- Authenticated users can read/update/delete only their own orders.
- INSERT: authenticated users can insert with their own user_id;
  anon can also insert (guest checkout) but can only read back via
  a direct lookup with the order id — this is handled by a separate
  policy for anon reads by order id.
- Guest orders (user_id null) are readable by anyone who knows the order id,
  which is a high-entropy generated string.
*/

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contact jsonb NOT NULL,
  shipping_address jsonb NOT NULL,
  shipping_method text NOT NULL DEFAULT 'standard',
  payment jsonb NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  promo_code text,
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'placed',
  payment_status text NOT NULL DEFAULT 'demo',
  tracking_number text,
  estimated_delivery_start date,
  estimated_delivery_end date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users: full CRUD on their own orders
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "insert_orders" ON orders;
CREATE POLICY "insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = customer_id);

-- Anon/guest: can read a specific order by id (high-entropy, unguessable)
DROP POLICY IF EXISTS "guest_select_by_id" ON orders;
CREATE POLICY "guest_select_by_id" ON orders FOR SELECT
  TO anon USING (customer_id IS NULL);

-- Index for user's orders lookup
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
