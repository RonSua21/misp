import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the anon key.
 * Works for all tables because RLS is disabled in development.
 * Use this in API routes and Server Components for DB operations.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Generate a human-readable application reference number */
export function generateRefNumber(): string {
  const year = new Date().getFullYear();
  const rand = crypto.randomUUID().substring(0, 6).toUpperCase();
  return `REF-${year}-${rand}`;
}
