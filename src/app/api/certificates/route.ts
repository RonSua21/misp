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
  const { data: requests } = await db
    .from("certificate_requests")
    .select("id, type, purpose, status, referenceNumber, remarks, requestedAt, releasedAt")
    .eq("userId", dbUser.id)
    .order("requestedAt", { ascending: false });

  return NextResponse.json({ requests: requests ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getResidentUser(user.id);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { type, purpose } = await req.json();
  if (!type || !purpose?.trim())
    return NextResponse.json({ error: "Type and purpose are required." }, { status: 400 });

  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  const referenceNumber = `CERT-${year}-${suffix}`;

  const db = createAdminClient();
  const { data, error } = await db
    .from("certificate_requests")
    .insert({ userId: dbUser.id, type, purpose: purpose.trim(), referenceNumber })
    .select("id, referenceNumber")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
