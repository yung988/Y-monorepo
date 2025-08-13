import { NextRequest, NextResponse } from "next/server";

// Přesměrování na novou admin routu
export async function GET(request: NextRequest) {
  const url = new URL("/api/admin/orders", request.url);
  return NextResponse.redirect(url, 308);
}
