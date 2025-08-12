// Admin API pro volání backend serveru

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

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;

if (!BASE_URL) {
  console.error("NEXT_PUBLIC_ADMIN_API_URL is not defined");
}

export const adminApi = {
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
    return res.json();
  },

  async getProductBySlug(slug: string): Promise<any | null> {
    const res = await fetch(`${BASE_URL}/api/products/slug/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  },

  async getOrder(orderId: string, token: string): Promise<import("@/app/success/page").Order> {
    const res = await fetch(
      `${BASE_URL}/api/orders/${orderId}?token=${encodeURIComponent(token)}`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
