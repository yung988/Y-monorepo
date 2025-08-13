import { NextRequest, NextResponse } from "next/server";

// Přesměrování na novou admin routu
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(`/api/admin/orders/${id}/email`, request.url);
  return NextResponse.redirect(url, 308);
}
