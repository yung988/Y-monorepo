export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "@/lib/email/sendEmail";
import { generateInvoicePdfBuffer } from "@/lib/invoice/pdf";
import { createPacketaShipment } from "@/lib/packeta";

type Variant = { id: string; weight?: number | null; product_id?: string };
type Product = { id: string; weight?: number | null };
type OrderItemRef = { product_id?: string | null; variant_id?: string | null; quantity?: number | null };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

// Initialize Supabase with service role key for webhook
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for server-side operations
);

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    const body = await request.text(); // Stripe requires raw body
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Webhook signature verification failed:", err.message);
    } else {
      console.error("Webhook signature verification failed:", err);
    }
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  try {
    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.processing":
        await handlePaymentProcessing(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.requires_action":
        await handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment succeeded:", paymentIntent.id);

  // Get order data from PaymentIntent
  const idempotencyKey = paymentIntent.metadata.idempotency_key;

  if (!idempotencyKey) {
    console.error("No idempotency_key in payment intent metadata");
    return;
  }

  // Extract customer info from shipping or metadata
  const customerEmail = paymentIntent.receipt_email || "";
  const customerName = paymentIntent.shipping?.name || "Customer";
  const customerPhone = paymentIntent.metadata.customer_phone || "";

  // Extract pickup point info from shipping and metadata
  const packetaPickupPointId = paymentIntent.metadata.packeta_pickup_point_id || null;
  const packetaPickupPointName = paymentIntent.shipping?.name || null;
  const packetaPickupPointAddress = paymentIntent.shipping?.address?.line1 || null;

  // Parse order items from metadata
  let orderItems = [];
  try {
    orderItems = JSON.parse(paymentIntent.metadata.items || "[]");
  } catch (error) {
    console.error("Failed to parse order items from metadata:", error);
    orderItems = [];
  }

  // Find existing order by idempotency key (created during PaymentIntent initialization)
  const { data: existingOrder, error: findError } = await supabase
    .from("orders")
    .select("id, access_token")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (findError || !existingOrder) {
    console.error("Failed to find existing order for idempotency key:", idempotencyKey, findError);
    return;
  }

  // Update existing order as paid/confirmed and enrich data
  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      total_amount: paymentIntent.amount_received,
      currency: paymentIntent.currency.toUpperCase(),
      status: "confirmed",
      payment_status: "paid",
      shipping_address: paymentIntent.shipping
        ? {
            name: paymentIntent.shipping.name,
            address: paymentIntent.shipping.address,
          }
        : null,
      stripe_payment_id: paymentIntent.id,
      packeta_pickup_point_id: packetaPickupPointId,
      packeta_pickup_point_name: packetaPickupPointName,
      packeta_pickup_point_address: packetaPickupPointAddress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingOrder.id)
    .select("*")
    .single();

  if (updateError || !updatedOrder) {
    console.error("Failed to update existing order as paid:", updateError);
    return;
  }

  const order = updatedOrder;
  console.log(`Order ${order.id} updated and marked as paid and confirmed`);

  // Compute total order weight (kg) from items and store invoice metadata
  let totalWeight = 0;
  try {
    const { data: itemsData } = await supabase
      .from("order_items")
      .select("product_id, variant_id, quantity")
      .eq("order_id", order.id);
    const items = (itemsData || []) as OrderItemRef[];

    const variantIds = items.map((it) => it.variant_id).filter((v): v is string => !!v);
    const productIds = items.map((it) => it.product_id).filter((p): p is string => !!p);

    const variantsRes = variantIds.length
      ? await supabase.from("product_variants").select("id, weight, product_id").in("id", variantIds)
      : ({ data: [] as Variant[] } as { data: Variant[] });
    const productsRes = productIds.length
      ? await supabase.from("products").select("id, weight").in("id", productIds)
      : ({ data: [] as Product[] } as { data: Product[] });

    const variants = (variantsRes.data || []) as Variant[];
    const products = (productsRes.data || []) as Product[];

    const vMap = new Map<string, Variant>(variants.map((v) => [v.id, v]));
    const pMap = new Map<string, Product>(products.map((p) => [p.id, p]));

    for (const it of items) {
      const v = it.variant_id ? vMap.get(it.variant_id) : undefined;
      const p = it.product_id ? pMap.get(it.product_id) : undefined;
      const w = v?.weight ?? p?.weight ?? 0.25; // default 0.25 kg per item
      totalWeight += (Number(w) || 0.25) * (Number(it.quantity) || 1);
    }
  } catch (wErr) {
    console.warn("Failed to compute total weight, using default:", wErr);
    totalWeight = 1.0;
  }

  const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${(order.order_number || order.id.slice(0, 8))}`;
  await supabase
    .from("orders")
    .update({ total_weight: totalWeight, invoice_number: invoiceNumber, invoice_sent_at: new Date().toISOString() })
    .eq("id", order.id);

  // Do NOT insert order items here: they were created during PaymentIntent initialization
  // If needed, you could reconcile items, but we'll trust initial insert.

  // Send order confirmation email with invoice PDF attached
  if (order && customerEmail) {
    const orderNumber = order.order_number || order.id.slice(0, 8);
    const orderData = {
      orderNumber,
      customerName: customerName || "Zákazník",
      orderDate: new Date(order.created_at).toLocaleDateString("cs-CZ"),
      items: orderItems.map(
        (item: {
          product_id?: string;
          id?: string;
          variant_id?: string | null;
          quantity?: number;
          price?: number;
          product_name?: string;
          variant_size?: string;
          image_url?: string;
        }) => ({
          name: item.product_name || "Neznámý produkt",
          variant: item.variant_size || undefined,
          quantity: item.quantity,
          price: item.price,
          image: item.image_url || undefined,
        }),
      ),
      subtotal: orderItems.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + item.price * item.quantity,
        0,
      ),
      shipping: 0, // Free shipping
      total: paymentIntent.amount_received,
      shippingAddress: paymentIntent.shipping?.address
        ? {
            line1: paymentIntent.shipping.address.line1 || "",
            line2: paymentIntent.shipping.address.line2 || undefined,
            city: paymentIntent.shipping.address.city || "",
            postalCode: paymentIntent.shipping.address.postal_code || "",
            country: paymentIntent.shipping.address.country || "",
          }
        : undefined,
      isPacketa: !!packetaPickupPointId,
      packetaPickupPoint: packetaPickupPointName || undefined,
    };

    try {
      // Generate simple invoice PDF (non‑VAT)
      const itemsForPdf = orderItems.map((it: any) => ({
        name: it.product_name || "Položka",
        sku: it.product_sku || undefined,
        size: it.variant_size || undefined,
        quantity: it.quantity || 1,
        price: it.price || 0,
      }));

      const pdfBuffer = await generateInvoicePdfBuffer({
        orderNumber,
        createdAt: new Date(order.created_at),
        customerName,
        customerEmail,
        customerPhone: paymentIntent.metadata.customer_phone || undefined,
        items: itemsForPdf,
        totalAmount: paymentIntent.amount_received,
        currency: paymentIntent.currency.toUpperCase(),
        seller: { name: process.env.NEXT_PUBLIC_SITE_URL || "Váš e‑shop", email: process.env.EMAIL_FROM },
        shipping: { method: order.shipping_method, pickupPointName: order.packeta_pickup_point_name },
        note: "Nejsme plátci DPH.",
      });

      // Skip Storage upload (private bucket is paid). Send invoice only as email attachment.
      const invoiceFilename = `Faktura-${orderNumber}.pdf`;

      await sendOrderConfirmationEmail(customerEmail, orderData, [
        { filename: invoiceFilename, content: pdfBuffer, contentType: "application/pdf" },
      ]);
    } catch (emailError) {
      console.error("Failed to send order confirmation email or generate PDF:", emailError);
    }
  }

  // Create Packeta shipment if pickup point is specified
  if (paymentIntent.metadata.packeta_pickup_point_id) {
    try {
      const updatedOrder = {
        ...order,
        customer_phone: paymentIntent.metadata.customer_phone || "",
        packeta_pickup_point_id: paymentIntent.metadata.packeta_pickup_point_id,
      };

      await createPacketaShipmentForOrder(order.id, updatedOrder);
      console.log("Packeta shipment created successfully");

      // Send shipping notification
      await sendOrderStatusUpdateEmail({
        to: order.customer_email,
        orderNumber: order.id.toString(),
        customerName: order.customer_name,
        newStatus: "processing",
        message: "Vaše objednávka je připravována k odeslání.",
      });
      console.log("Shipping notification sent successfully");
    } catch (packetaError) {
      console.error("Failed to create Packeta shipment:", packetaError);
    }
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment failed:", paymentIntent.id);

  const idempotencyKey = paymentIntent.metadata.idempotency_key;

  if (!idempotencyKey) {
    console.error("No idempotency_key in payment intent metadata");
    return;
  }

  // Find order by idempotency key
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .single();

  if (fetchError || !order) {
    console.error("Failed to find order by idempotency key:", idempotencyKey);
    return;
  }

  // Update order status
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (error) {
    console.error("Failed to update order:", error);
    return;
  }

  console.log(`Order ${order.id} marked as failed`);

  // TODO: Add failure handling logic:
  // - Send failure notification email
  // - Release inventory holds
  // - Log failure reason
}

// Handle payment processing
async function handlePaymentProcessing(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment processing:", paymentIntent.id);

  const idempotencyKey = paymentIntent.metadata.idempotency_key;

  if (!idempotencyKey) {
    console.error("No idempotency_key in payment intent metadata");
    return;
  }

  // Find order by idempotency key
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .single();

  if (fetchError || !order) {
    console.error("Failed to find order by idempotency key:", idempotencyKey);
    return;
  }

  // Update order status
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "processing",
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (error) {
    console.error("Failed to update order:", error);
  }
}

// Handle payment requiring action
async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment requires action:", paymentIntent.id);

  const idempotencyKey = paymentIntent.metadata.idempotency_key;

  if (!idempotencyKey) {
    console.error("No idempotency_key in payment intent metadata");
    return;
  }

  // Find order by idempotency key
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .single();

  if (fetchError || !order) {
    console.error("Failed to find order by idempotency key:", idempotencyKey);
    return;
  }

  // Update order status
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "requires_action",
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (error) {
    console.error("Failed to update order:", error);
  }
}

// Helper function to create Packeta shipment for order
async function createPacketaShipmentForOrder(
  orderId: string,
  order: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    packeta_pickup_point_id?: string;
    order_number?: string;
    id: string;
    total_amount: number;
  },
) {
  try {
    // Parse customer name - assume format "Name Surname" or just "Name"
    const nameParts = (order.customer_name || "").split(" ");
    const customerName = nameParts[0] || "Unknown";
    const customerSurname = nameParts.slice(1).join(" ") || "Customer";

    const orderData = {
      orderNumber: order.order_number || order.id,
      customerName,
      customerSurname,
      customerEmail: order.customer_email || "",
      customerPhone: order.customer_phone || "",
      pickupPointId: order.packeta_pickup_point_id,
      orderValue: order.total_amount / 100, // Convert cents to koruny for Packeta
      weight: 1.0, // Default weight in kg - you might want to calculate this from order items
      cashOnDelivery: 0, // Set to 0 for prepaid orders
    };

    console.log("Creating Packeta shipment with data:", orderData);

    const result = await createPacketaShipment(orderData);

    // Update order with Packeta data
    if (result?.id) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          packeta_label_id: result.id,
          packeta_tracking_number: result.barcode || result.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Failed to update order with Packeta data:", updateError);
      } else {
        console.log(`Order ${orderId} updated with Packeta label ID: ${result.id}`);
      }
    }

    return result;
  } catch (error: unknown) {
    console.error("Failed to create Packeta shipment:", error);
    throw error;
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
