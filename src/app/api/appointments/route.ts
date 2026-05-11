import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getResidentUser(supabaseUserId: string) {
  const db = createAdminClient();
  const { data } = await db.from("users").select("id, role").eq("supabaseId", supabaseUserId).single();
  return data;
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getResidentUser(user.id);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const db = createAdminClient();
  const { data: appointments } = await db
    .from("appointments")
    .select("id, serviceType, preferredDate, preferredTime, status, notes, queueNumber, confirmedAt, createdAt")
    .eq("userId", dbUser.id)
    .not("status", "in", '("CANCELLED","NO_SHOW")')
    .order("preferredDate", { ascending: true });

  return NextResponse.json({ appointments: appointments ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getResidentUser(user.id);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { serviceType, preferredDate, preferredTime, notes } = await req.json();
  if (!serviceType || !preferredDate || !preferredTime)
    return NextResponse.json({ error: "serviceType, preferredDate, and preferredTime are required." }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);
  if (preferredDate <= today)
    return NextResponse.json({ error: "Appointment date must be in the future." }, { status: 400 });

  const db = createAdminClient();
  const { data, error } = await db
    .from("appointments")
    .insert({
      userId: dbUser.id,
      serviceType,
      preferredDate,
      preferredTime,
      notes: notes ?? null,
      isWalkIn: false,
      updatedAt: new Date().toISOString(),
    })
    .select("id, serviceType, preferredDate, preferredTime, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
