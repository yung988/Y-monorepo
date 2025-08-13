import { createClient } from "@supabase/supabase-js"; // ← OPRAVA: správný import
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

// Initialize Supabase with SERVICE ROLE KEY
const supabaseService = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key má všechna oprávnění
);

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");

  const allowedOrigin = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    const body = await request.json();
    console.log("Received order data:", JSON.stringify(body, null, 2));

    const {
      amount,
      currency = "czk",
      orderData,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      packetaPickupPointId,
      packetaPickupPointName,
      packetaPickupPointAddress,
      items = [],
      idempotencyKey,
    } = body;

    const orderItems = orderData?.items || items || [];

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    // Check if payment intent with this idempotency key already exists
    if (idempotencyKey) {
      const { data: existingOrder, error: existingOrderError } = await supabaseService
        .from("orders")
        .select("id, stripe_payment_id, access_token, order_number")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (existingOrder?.stripe_payment_id) {
        console.log("Found existing order with idempotency key:", idempotencyKey);
        try {
          const existingPaymentIntent = await stripe.paymentIntents.retrieve(
            existingOrder.stripe_payment_id,
          );

          const response = NextResponse.json({
            clientSecret: existingPaymentIntent.client_secret,
            paymentIntentId: existingPaymentIntent.id,
            orderId: existingOrder.id,
            accessToken: existingOrder.access_token,
          });

          response.headers.set("Access-Control-Allow-Origin", origin || "*");
          response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
          response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
          response.headers.set("Access-Control-Allow-Credentials", "true");

          return response;
        } catch (stripeError) {
          console.error("Error retrieving existing payment intent:", stripeError);
        }
      }
    }

    // Generate idempotency key if not provided
    const finalIdempotencyKey =
      idempotencyKey || `${customerEmail}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create or retrieve Stripe Customer
    let customerId = null;
    try {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("Found existing customer:", customerId);
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
        });
        customerId = customer.id;
        console.log("Created new customer:", customerId);
      }
    } catch (customerError) {
      console.error("Error handling customer:", customerError);
    }

    // Create PaymentIntent
    const paymentIntentData: Stripe.PaymentIntentCreateParams & Record<string, unknown> = {
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      payment_method_types: ["card"],
      shipping: {
        name: packetaPickupPointName || customerName || "Customer",
        address: {
          line1: packetaPickupPointAddress || "",
          city: shippingAddress?.city || "",
          postal_code: shippingAddress?.postalCode || "",
          country: "CZ",
        },
      },
      metadata: {
        customer_email: customerEmail,
        customer_name: customerName || "",
        customer_phone: customerPhone || "",
        idempotency_key: finalIdempotencyKey,
        packeta_pickup_point_id: packetaPickupPointId || "",
        items: JSON.stringify(orderItems),
      },
      description: `Objednávka eshop Yeezuz2020`,
      receipt_email: customerEmail || undefined,
    };

    if (customerId) {
      paymentIntentData.customer = customerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    // --- Create Order in Supabase Database ---
    let orderDataForResponse: { id: string; access_token: string } | null = null;
    try {
      // Generate access token
      const accessToken = randomUUID();

      console.log("🔧 Generating access token:", accessToken);

      const orderInsertData = {
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        total_amount: amount,
        currency: currency,
        status: "pending",
        payment_status: "unpaid",
        shipping_address: shippingAddress,
        stripe_payment_id: paymentIntent.id,
        packeta_pickup_point_id: packetaPickupPointId,
        packeta_pickup_point_name: packetaPickupPointName || null,
        packeta_pickup_point_address: packetaPickupPointAddress || null,
        idempotency_key: finalIdempotencyKey,
        access_token: accessToken,
        access_token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      console.log("🔧 Inserting order with service role key...");

      const { data: order, error: orderError } = await supabaseService
        .from("orders")
        .insert([orderInsertData])
        .select("id, access_token")
        .single();

      console.log("🔧 Database response:", { order, orderError });

      if (orderError || !order) {
        throw new Error(`Failed to create order: ${orderError?.message || "No data returned"}`);
      }

      orderDataForResponse = order;
      console.log(
        "✅ Data returned from DB after insert:",
        JSON.stringify(orderDataForResponse, null, 2),
      );
      console.log("✅ Created order with ID:", orderDataForResponse.id);

      // Insert order items
      if (orderItems && orderItems.length > 0) {
        const orderItemsForDb = orderItems.map(
          (item: { product_id: string; variant_id: string; quantity: number; price: number }) => ({
            order_id: orderDataForResponse!.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price,
          }),
        );

        const { error: itemsError } = await supabaseService
          .from("order_items")
          .insert(orderItemsForDb);

        if (itemsError) {
          console.error("Failed to insert order items:", itemsError);
          await supabaseService.from("orders").delete().eq("id", orderDataForResponse!.id);
          throw new Error(`Failed to insert order items: ${itemsError.message}`);
        }

        console.log("✅ Order items inserted successfully");
      }
    } catch (dbError: unknown) {
      console.error("❌ Database transaction failed:", dbError);
      return NextResponse.json(
        {
          error: "Order creation failed in database",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      );
    }

    console.log("🔧 Final response data:", {
      clientSecret: !!paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: orderDataForResponse!.id,
      accessToken: orderDataForResponse!.access_token,
    });

    const response = NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: orderDataForResponse!.id,
      accessToken: orderDataForResponse!.access_token,
    });

    // Add CORS headers
    const allowedOrigin = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  } catch (error: unknown) {
    console.error("Stripe Payment Intent creation failed:", error);

    return NextResponse.json(
      {
        error: "Payment initialization failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
