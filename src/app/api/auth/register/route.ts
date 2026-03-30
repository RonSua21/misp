import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supabaseId, email, firstName, lastName, middleName, contactNumber, barangay } = body;

    if (!supabaseId || !email || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const db = createAdminClient();
    const now = new Date().toISOString();

    // Check for duplicates
    const { data: existing } = await db
      .from("users")
      .select("id")
      .or(`supabaseId.eq.${supabaseId},email.eq.${email.toLowerCase()}`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const { data: user, error } = await db
      .from("users")
      .insert({
        id: crypto.randomUUID(),
        supabaseId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        middleName: middleName ?? null,
        contactNumber: contactNumber ?? null,
        barangay: barangay ?? null,
        role: "REGISTERED_USER",
        city: "Makati City",
        province: "Metro Manila",
        residencyVerified: false,
        consentGiven: true,
        consentDate: now,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[/api/auth/register]", error);
      return NextResponse.json({ error: "Failed to create user profile." }, { status: 500 });
    }

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (err) {
    console.error("[/api/auth/register]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
