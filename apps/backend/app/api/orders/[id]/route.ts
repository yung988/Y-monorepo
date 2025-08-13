import { NextRequest, NextResponse } from "next/server";
import { GET as getOrder } from "./get-route";

// Public endpoint for getting order details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await getOrder(request, { params: await params });
}

// Přesměrování na novou admin routu
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(`/api/admin/orders/${id}`, request.url);
  return NextResponse.redirect(url, 308);
}
