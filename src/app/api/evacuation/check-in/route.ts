import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMispUser } from "@/lib/auth-cache";

export async function POST(request: NextRequest) {
  const profile = await getMispUser();
  if (!profile) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { centerId } = await request.json();
  if (!centerId) {
    return NextResponse.json({ error: "Center ID is required." }, { status: 400 });
  }

  const db = createAdminClient();

  // Verify the center exists and is accepting check-ins
  const { data: center } = await db
    .from("evacuation_centers")
    .select("id, name, isOpen, currentHeadcount, capacity")
    .eq("id", centerId)
    .single();

  if (!center) {
    return NextResponse.json({ error: "Relief center not found. Please scan a valid QR code." }, { status: 404 });
  }
  if (!center.isOpen) {
    return NextResponse.json({ error: `${center.name} is currently closed and not accepting check-ins.` }, { status: 403 });
  }
  if ((center.currentHeadcount ?? 0) >= (center.capacity ?? 0)) {
    return NextResponse.json({ error: `${center.name} is at full capacity. Please go to another center.` }, { status: 409 });
  }

  const fullName = [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  // Insert evacuee record
  const { error: insertError } = await db.from("evacuees").insert({
    evacuationCenterId: centerId,
    name: fullName,
    barangay: profile.barangay ?? null,
    headCount: 1,
    registeredAt: new Date().toISOString(),
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Increment center headcount
  await db
    .from("evacuation_centers")
    .update({ currentHeadcount: (center.currentHeadcount ?? 0) + 1 })
    .eq("id", centerId);

  return NextResponse.json({ success: true, centerName: center.name });
}
