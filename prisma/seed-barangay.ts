import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BARANGAY_ACCOUNTS = [
  { firstName: "Maria", lastName: "Santos",  email: "brgy.poblacion@makati.gov.ph",     barangay: "Poblacion" },
  { firstName: "Jose",  lastName: "Reyes",   email: "brgy.bangkal@makati.gov.ph",        barangay: "Bangkal" },
  { firstName: "Ana",   lastName: "Garcia",  email: "brgy.belair@makati.gov.ph",         barangay: "Bel-Air" },
  { firstName: "Carlo", lastName: "Mendoza", email: "brgy.guadalupenuevo@makati.gov.ph", barangay: "Guadalupe Nuevo" },
  { firstName: "Rosa",  lastName: "Flores",  email: "brgy.sanantonio@makati.gov.ph",     barangay: "San Antonio" },
];

const PASSWORD = "Password123";

async function main() {
  console.log("Creating barangay staff accounts...\n");

  for (const acc of BARANGAY_ACCOUNTS) {
    // Check if already exists in users table
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", acc.email)
      .maybeSingle();

    if (existing) {
      console.log(`  SKIP (already exists): ${acc.email}`);
      continue;
    }

    // Try to create auth user; if already exists, fetch their ID instead
    let authUserId: string;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { firstName: acc.firstName, lastName: acc.lastName },
    });

    if (authError) {
      if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
        // Fetch existing auth user
        const { data: listData } = await supabase.auth.admin.listUsers();
        const found = listData?.users?.find(u => u.email === acc.email);
        if (!found) {
          console.error(`  ERROR: Could not find existing auth user for ${acc.email}`);
          continue;
        }
        authUserId = found.id;
        console.log(`  Found existing auth user for ${acc.email}, creating DB entry...`);
      } else {
        console.error(`  ERROR (auth) ${acc.email}:`, authError.message);
        continue;
      }
    } else {
      authUserId = authData.user.id;
    }

    // Insert into users table with explicit id
    const { error: dbError } = await supabase.from("users").insert({
      id:                randomUUID(),
      supabaseId:        authUserId,
      email:             acc.email,
      firstName:         acc.firstName,
      lastName:          acc.lastName,
      role:              "ADMIN",
      barangay:          acc.barangay,
      residencyVerified: true,
      consentGiven:      true,
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString(),
    });

    if (dbError) {
      console.error(`  ERROR (db) ${acc.email}:`, dbError.message);
      continue;
    }

    console.log(`  ✓ ${acc.firstName} ${acc.lastName} — Brgy. ${acc.barangay} (${acc.email})`);
  }

  console.log("\nDone! All accounts use password: Password123");
  console.log("Login at: http://localhost:3001");
}

main().catch(console.error);
