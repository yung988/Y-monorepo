import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./supabase/server";

export async function authenticateRequest(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: "Unauthorized" };
    }

    return { user, error: null };
  } catch (error) {
    console.error("Error authenticating request:", error);
    return { user: null, error: "Authentication failed" };
  }
}

export async function requireAuth(request: NextRequest) {
  const { user, error } = await authenticateRequest(request);

  if (!user || error) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  return user;
}

export async function requireAdmin(request: NextRequest) {
  const { user, error } = await authenticateRequest(request);

  if (!user || error) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  // 1) Allow by ADMIN_EMAILS whitelist (comma-separated)
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const userEmail = (user.email || "").toLowerCase();
  if (userEmail && adminEmails.includes(userEmail)) {
    return user;
  }

  // 2) Allow by auth metadata role
  const metaRole = (user as any)?.app_metadata?.role || (user as any)?.user_metadata?.role;
  if (metaRole === "admin") {
    return user;
  }

  // 3) Fallback to profile table role
  const supabase = await createClient();
  const { data: profile, error: roleError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (roleError || !profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
  }

  return user;
}

export async function requireAdminOrEditor(request: NextRequest) {
  const { user, error } = await authenticateRequest(request);

  if (!user || error) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  // TEMP: Disable strict role checks during development to align with UI auth
  // TODO: Re-enable role verification (ADMIN/EDITOR) once roles are populated
  return user;
}

