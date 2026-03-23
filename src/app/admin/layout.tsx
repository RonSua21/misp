import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminNav from "@/components/layout/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: dbUser } = await db
    .from("users")
    .select("role, firstName, lastName, email, barangay")
    .eq("supabaseId", user.id)
    .single();

  // Only SUPER_ADMIN and ADMIN (barangay coordinator) can access /admin
  if (!dbUser || (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav
        adminName={`${dbUser.firstName} ${dbUser.lastName}`}
        adminEmail={dbUser.email}
        role={dbUser.role}
        barangay={dbUser.barangay ?? null}
      />
      <main className="flex-1 container-max px-4 py-8">{children}</main>
    </div>
  );
}
