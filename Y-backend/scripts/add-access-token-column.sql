-- Add access_token column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS access_token TEXT UNIQUE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_access_token ON orders (access_token);
