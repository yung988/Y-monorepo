-- Ensure orders table has a column for PaymentIntent id used across code
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;

-- Optional: index for faster lookups from webhook
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id ON orders (stripe_payment_id);

