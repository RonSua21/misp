import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createAdminClient();
  const { data: dbUser } = await db.from("users").select("id").eq("supabaseId", user.id).single();
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: appt } = await db.from("appointments").select("id, userId, status").eq("id", id).single();
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (appt.userId !== dbUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["PENDING", "CONFIRMED"].includes(appt.status))
    return NextResponse.json({ error: "This appointment cannot be cancelled." }, { status: 422 });

  const { error } = await db.from("appointments").update({ status: "CANCELLED", cancelledAt: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
