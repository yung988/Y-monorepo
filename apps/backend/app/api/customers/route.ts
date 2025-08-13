import { NextRequest, NextResponse } from "next/server";

// Redirect to admin customers API
export async function GET(request: NextRequest) {
  const url = new URL("/api/admin/customers", request.url);
  return NextResponse.redirect(url, 308);
}
