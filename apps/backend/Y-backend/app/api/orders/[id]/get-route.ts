import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public API endpoint for getting order details by ID
// Accessible via order access token for guest checkout
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Security check: verify access via order access token
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    // Get order with related data and verify access token
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        customer_email,
        customer_name,
        customer_phone,
        total_amount,
        currency,
        status,
        payment_status,
        shipping_address,
        packeta_pickup_point_id,
        packeta_pickup_point_name,
        packeta_pickup_point_address,
        packeta_tracking_number,
        packeta_tracking_url,
        order_number,
        created_at,
        access_token,
         order_items(
           id,
           quantity,
           price,
           products(
             id,
             name,
             product_images (
               url,
               is_main_image
             )
           ),
           product_variants(
             id,
             size
           )
         )      `)
      .eq("id", id)
      .eq("access_token", token)
      .gte("access_token_expires_at", new Date().toISOString())
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return NextResponse.json(
        { error: "Order not found or unauthorized access" },
        { status: 404 },
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or unauthorized access" },
        { status: 404 },
      );
    }

    // Transform order data for frontend
    const sa: any = order.shipping_address || {};
    const transformedOrder = {
      id: order.id,
      order_number: order.order_number,
      customer_email: order.customer_email,
      customer_first_name: order.customer_name?.split(" ")[0] || "",
      customer_last_name: order.customer_name?.split(" ")[1] || "",
      customer_phone: order.customer_phone || "",
      billing_street: sa.street || sa.address?.line1 || "",
      billing_city: sa.city || sa.address?.city || "",
      billing_postal_code: sa.postal_code || sa.postalCode || sa.address?.postal_code || "",
      billing_country: sa.country || sa.address?.country || "Česká republika",
      pickup_point_name: order.packeta_pickup_point_name || null,
      pickup_point_street: order.packeta_pickup_point_address || null,
      pickup_point_city: sa.city || sa.address?.city || null,
      pickup_point_zip: sa.postal_code || sa.postalCode || sa.address?.postal_code || null,
      packeta_tracking_url: order.packeta_tracking_url || null,
      packeta_tracking_number: order.packeta_tracking_number || null,
      subtotal: (order.order_items as any[]).reduce(
        (sum: number, item: any) => sum + (item?.price || 0) * (item?.quantity || 0),
        0,
      ) * 100, // return in cents
      delivery_price: 79 * 100, // return in cents
      total_price: order.total_amount, // already in cents from Stripe
      currency: order.currency,
      status: order.status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      items: (order.order_items as any[]).map((item: any) => ({
        product_id: item?.products?.id || "",
        product_name: item?.products?.name || "Neznámý produkt",
        product_size: item?.product_variants?.size || null,
        quantity: item?.quantity || 0,
        unit_price: (item?.price || 0) * 100, // cents
        total_price: (item?.price || 0) * (item?.quantity || 0) * 100, // cents
        image:
          (item?.products?.product_images || [])?.find((img: any) => img.is_main_image)?.url ||
          (item?.products?.product_images && item.products.product_images[0]?.url) ||
          undefined,
      })),
    };

    const res = NextResponse.json(transformedOrder);
    const allowedOrigin = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
