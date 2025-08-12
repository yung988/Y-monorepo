// Product types matching backend schema

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_main_image?: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  sku: string;
  stock_quantity: number;
  price_override?: number; // Price in cents, overrides product price
  stripe_price_id?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  price: number; // Price in cents
  category?: string;
  sku?: string;
  status: string; // 'active', 'inactive', etc.
  airtable_id?: string;
  stripe_product_id?: string;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number; // Price in cents
  product?: Product;
  variant?: ProductVariant;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number; // Price in cents
  created_at: string;
}
