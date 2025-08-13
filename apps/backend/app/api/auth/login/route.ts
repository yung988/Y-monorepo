import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Authenticate with Supabase
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if user has admin role
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (userError || (userData && userData.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized - admin access required" }, { status: 403 });
    }

    // Rely on Supabase session & cookies (no custom JWT)
    // Supabase SSR client will set auth cookies automatically.
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userData?.role ?? null,
      },
      // Optional: surface limited session metadata if needed by client (no secrets)
      session: data.session
        ? {
            expires_at: data.session.expires_at,
            token_type: data.session.token_type,
          }
        : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
