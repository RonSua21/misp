import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Memoized user lookup — React.cache() ensures layout + page share ONE DB
 * round-trip per request instead of making independent duplicate calls.
 *
 * Returns null if unauthenticated or user record not found.
 */
export const getMispUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createAdminClient();
  const { data } = await db
    .from("users")
    .select(
      "id, firstName, lastName, middleName, email, contactNumber, barangay, role, residencyVerified, houseNo, street, city, province, createdAt"
    )
    .eq("supabaseId", user.id)
    .single();

  return data ?? null;
});
