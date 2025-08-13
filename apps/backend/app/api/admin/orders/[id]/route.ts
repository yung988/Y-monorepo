import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 });
    }

    // Validace možných stavů
    const validStatuses = ["pending", "confirmed", "paid", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const supabase = await createClient();

    // Aktualizace stavu objednávky
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
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
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Transformace dat pro frontend
    const transformedOrder = {
      id: data.id,
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
      },
      items: data.order_items.map(
        (item: { product: { name: string }; quantity: number; price: number }) => ({
          product: item.product.name,
          quantity: item.quantity,
          price: item.price,
        }),
      ),
      total: data.total,
      status: data.status,
      date: data.created_at,
      shippingAddress: {
        street: data.shipping_address.street,
        city: data.shipping_address.city,
        postalCode: data.shipping_address.postal_code,
        country: data.shipping_address.country,
      },
    };

    // Revalidate admin orders pages
    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);

    return NextResponse.json({ success: true, data: transformedOrder });
  } catch (error) {
    console.error("Error in PATCH /api/orders/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
