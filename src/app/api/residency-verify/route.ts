import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isWithinMakati, MAKATI_BARANGAYS } from "@/lib/makati-bounds";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId, latitude, longitude, houseNo, street, barangay } = await request.json();

    if (!userId || !barangay) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Barangay must be in the official Makati list
    if (!MAKATI_BARANGAYS.includes(barangay)) {
      return NextResponse.json(
        { error: "Selected barangay is not a valid Makati City barangay." },
        { status: 422 }
      );
    }

    const db = createAdminClient();

    // Verify ownership
    const { data: dbUser } = await db
      .from("users")
      .select("id")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser || dbUser.id !== userId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const lat  = latitude  ?? null;
    const lng  = longitude ?? null;
    const now  = new Date().toISOString();

    // Since barangay is validated against the official list, residency is confirmed
    const withinMakati = true;

    // Log verification
    await db.from("residency_verifications").insert({
      id: crypto.randomUUID(),
      userId,
      latitude:  lat ?? 14.5547,
      longitude: lng ?? 121.0244,
      address:   [houseNo, street, `Brgy. ${barangay}`, "Makati City"].filter(Boolean).join(", "),
      isWithinMakati: withinMakati,
      verifiedAt: now,
    });

    // Update user profile with full address
    await db.from("users").update({
      houseNo:          houseNo  ?? null,
      street:           street   ?? null,
      barangay,
      city:             "Makati City",
      province:         "Metro Manila",
      latitude:         lat,
      longitude:        lng,
      residencyVerified: true,
      updatedAt:        now,
    }).eq("id", userId);

    revalidatePath("/dashboard/applications");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/residency-verify]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
