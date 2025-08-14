// Admin API pro volání backend serveru

// Ponecháme staré typy (PaymentIntent*), ale nově budeme používat Stripe Checkout přes backend
interface PaymentIntentRequest {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    street?: string;
    city?: string;
    postalCode?: string;
  };
  packetaPickupPointId?: string | null;
  packetaPickupPointName?: string;
  packetaPickupPointAddress?: string;
  orderData: {
    items: Array<{
      product_id: string;
      variant_id: string;
      quantity: number;
      price: number;
    }>;
    notes?: string | null;
  };
  idempotencyKey: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  orderId: string;
  accessToken: string;
}

// Nový typ pro Checkout request na Ruby backend
export interface CreateCheckoutRequest {
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
  shipping: {
    email: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
    phone?: string;
  };
  totalCents?: number;
  shippingCents?: number;
  zasilkovnaPointId?: string | null;
  zasilkovnaPointName?: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;

if (!BASE_URL) {
  console.error("NEXT_PUBLIC_ADMIN_API_URL is not defined");
}

// Helper: převod backend produktu na frontend typy (aby UI zůstalo beze změny)
function mapBackendProduct(p: any): import("@/types/product").Product {
  const imagesRaw: Array<{ url: string }> = Array.isArray(p.images) ? p.images : [];
  const variantsRaw: Array<{ id: string | number; size: string; stock?: number; stockQuantity?: number }> =
    Array.isArray(p.variants) ? p.variants : [];

  return {
    id: String(p.id),
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    price: typeof p.price_cents === "number" ? p.price_cents : (p.price ?? 0),
    category: p.category,
    sku: undefined,
    status: "active",
    airtable_id: undefined,
    stripe_product_id: p.stripe_product_id ?? "",
    created_at: "",
    updated_at: "",
    product_images: imagesRaw.map((img, idx) => ({
      id: `${p.id}-img-${idx}`,
      product_id: String(p.id),
      url: img.url,
      alt_text: undefined,
      is_main_image: idx === 0,
      sort_order: idx,
      created_at: "",
      updated_at: "",
    })),
    product_variants: variantsRaw.map((v) => ({
      id: String(v.id),
      product_id: String(p.id),
      size: v.size,
      sku: "",
      stock_quantity: typeof v.stockQuantity === "number" ? v.stockQuantity : (v.stock ?? 0),
      price_override: undefined,
      stripe_price_id: undefined,
      status: "active",
      created_at: "",
      updated_at: "",
    })),
  };
}

export const adminApi = {
  // Zachováno pro zpětnou kompatibilitu, ale nově nepoužíváno
  async createPaymentIntent(data: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const response = await fetch(`${BASE_URL}/api/stripe/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Network error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async getProducts(): Promise<import("@/types/product").Product[]> {
    const res = await fetch(`${BASE_URL}/api/products`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    const list = Array.isArray(data.products) ? data.products : Array.isArray(data.data) ? data.data : [];
    return list.map(mapBackendProduct);
  },

  async getProductBySlug(slug: string): Promise<import("@/types/product").Product | null> {
    const res = await fetch(`${BASE_URL}/api/products/slug/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const p = await res.json();
    return mapBackendProduct(p);
  },

  async getOrder(orderId: string, token: string): Promise<import("@/app/success/page").Order> {
    const res = await fetch(
      `${BASE_URL}/api/orders/${orderId}?access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async createCheckout(req: CreateCheckoutRequest): Promise<{ id?: string; url?: string; checkout_url?: string }> {
    const response = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      cache: "no-store",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Network error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  },
};
