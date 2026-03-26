import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApplicationStatus } from "@/types";

const VALID_STATUSES: ApplicationStatus[] = [
  "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  const { data: dbUser } = await db
    .from("users")
    .select("id, role, barangay")
    .eq("supabaseId", user.id)
    .single();

  if (!dbUser || (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status, remarks } = body as { status: ApplicationStatus; remarks?: string };

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status value." }, { status: 422 });
  }

  // Fetch the application to verify coordinator access
  const { data: application } = await db
    .from("applications")
    .select("id, applicantBarangay, status")
    .eq("id", id)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  // Coordinators can only update applications from their barangay
  if (dbUser.role === "ADMIN" && application.applicantBarangay !== dbUser.barangay) {
    return NextResponse.json({ error: "You can only update applications from your barangay." }, { status: 403 });
  }

  // Update application status + remarks
  const { error: updateError } = await db
    .from("applications")
    .update({
      status,
      ...(remarks ? { remarks } : {}),
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update application." }, { status: 500 });
  }

  // Insert status history entry
  await db.from("application_status_history").insert({
    id: crypto.randomUUID(),
    applicationId: id,
    status,
    notes: remarks ?? null,
    changedBy: dbUser.id,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
