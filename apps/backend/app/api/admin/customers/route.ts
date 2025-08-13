import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const supabase = await createClient();
    const { data: customers, error } = await supabase
      .from("customers")
      .select(`
        *,
        orders (
          id,
          total_amount,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
      return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 });
    }

    // Transformuj data pro frontend
    const transformedCustomers = (customers || []).map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postal_code: customer.postal_code,
      country: customer.country,
      registeredAt: customer.created_at,
      orders: customer.orders?.length || 0,
      totalSpent:
        (customer.orders?.reduce(
          (sum: number, order: { total_amount?: number }) => sum + (order.total_amount || 0),
          0,
        ) || 0) / 100,
    }));

    return NextResponse.json({ success: true, data: transformedCustomers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
