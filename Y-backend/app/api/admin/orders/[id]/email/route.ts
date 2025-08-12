import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "@/lib/email/sendEmail";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate admin request
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Získání detailů objednávky
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(name, email, phone),
        shipping_address:shipping_addresses(street, city, postal_code, country),
        order_items(
          quantity,
          price,
          product:products(name)
        )
      `)
      .eq("id", id)
      .single();

    if (error || !order) {
      console.error("Error fetching order:", error);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Pokud je status "paid", pošleme email s potvrzením objednávky
    if (status === "paid") {
      const emailResult = await sendOrderConfirmationEmail(
        order.customer.email,
        {
          orderNumber: order.id,
          customerName: order.customer.name,
          orderDate: new Date(order.created_at).toLocaleDateString("cs-CZ"),
          items: order.order_items.map(
            (item: { product: { name: string }; quantity: number; price: number }) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price,
            }),
          ),
          subtotal: order.total - order.shipping_cost,
          shipping: order.shipping_cost,
          total: order.total,
          shippingAddress: order.shipping_address
            ? {
                line1: order.shipping_address.street,
                city: order.shipping_address.city,
                postalCode: order.shipping_address.postal_code,
                country: order.shipping_address.country,
              }
            : undefined,
        }
      );

      if (emailResult.success) {
        return NextResponse.json({
          success: true,
          message: "Order confirmation email sent successfully",
          recipient: order.customer.email,
        });
      } else {
        console.error("Error sending order confirmation email:", emailResult.error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to send order confirmation email",
            details: emailResult.error,
          },
          { status: 500 },
        );
      }
    }

    // Pro ostatní stavy použijeme email s aktualizací stavu objednávky
    const statusMap: Record<string, string> = {
      pending: "processing",
      shipped: "shipped",
      delivered: "delivered",
      cancelled: "cancelled",
    };

    const emailResult = await sendOrderStatusUpdateEmail({
      orderNumber: order.id,
      customerName: order.customer.name,
      newStatus:
        (statusMap[status] as "processing" | "shipped" | "delivered" | "cancelled") || "processing",
      to: order.customer.email,
    });

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Order status update email sent successfully",
        recipient: order.customer.email,
      });
    } else {
      console.error("Error sending order status update email:", emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send order status update email",
          details: emailResult.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in POST /api/orders/[id]/email:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
