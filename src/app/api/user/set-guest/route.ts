import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/user/set-guest
 * Downgrades the currently authenticated user's role to GUEST.
 * Called automatically when GPS geolocation determines the user
 * is outside Makati City boundaries.
 */
export async function PATCH() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createAdminClient();
    const now = new Date().toISOString();

    const { error } = await db
      .from("users")
      .update({
        role: "GUEST",
        residencyVerified: false,
        updatedAt: now,
      })
      .eq("supabaseId", user.id);

    if (error) {
      console.error("[PATCH /api/user/set-guest]", error);
      return NextResponse.json({ error: "Failed to update role." }, { status: 500 });
    }

    return NextResponse.json({ success: true, role: "GUEST" });
  } catch (err) {
    console.error("[PATCH /api/user/set-guest]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
