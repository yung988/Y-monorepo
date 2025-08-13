import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * pageSize;
    const { id: customerId } = await params;

    // Základní dotaz pro objednávky zákazníka
    let query = supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            price,
            sku,
            category
          ),
          product_variants (
            id,
            size,
            sku,
            price_override
          )
        )
      `)
      .eq("customer_email", customerId);

    // Filtrování podle statusu
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Řazení
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Stránkování
    const {
      data: orders,
      error,
      /* count */
    } = await query.range(offset, offset + pageSize - 1).limit(pageSize);

    if (error) {
      console.error("Error fetching customer orders:", error);
      return NextResponse.json({ error: "Failed to fetch customer orders" }, { status: 500 });
    }

    // Získání celkového počtu objednávek pro pagination
    const { count: totalCount, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_email", customerId);

    if (countError) {
      console.error("Error fetching customer orders count:", countError);
      return NextResponse.json({ error: "Failed to fetch customer orders count" }, { status: 500 });
    }

    // Transformace dat pro lepší použití v UI
    const transformedOrders =
      orders?.map((order) => ({
        ...order,
        total_amount: order.total_amount / 100, // Převod z centů na koruny
        shipping_cost: order.shipping_cost ? order.shipping_cost / 100 : 0,
        items:
          order.order_items?.map((item: any) => ({
            ...item,
            price: item.price / 100, // Převod z centů na koruny
            total: (item.price * item.quantity) / 100,
            product_name: item.products?.name || "Unknown Product",
            product_sku: item.products?.sku || "",
            product_category: item.products?.category || "",
            variant_size: item.product_variants?.size || "",
            variant_sku: item.product_variants?.sku || "",
            effective_price: item.product_variants?.price_override
              ? item.product_variants.price_override / 100
              : item.price / 100,
          })) || [],
      })) || [];

    // Statistiky pro zákazníka
    const stats = {
      totalOrders: totalCount || 0,
      page,
      pageSize,
      totalPages: Math.ceil((totalCount || 0) / pageSize),
      hasNextPage: page < Math.ceil((totalCount || 0) / pageSize),
      hasPreviousPage: page > 1,
    };

    return NextResponse.json({
      orders: transformedOrders,
      stats,
      success: true,
    });
  } catch (error) {
    console.error("Error in customer orders API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
