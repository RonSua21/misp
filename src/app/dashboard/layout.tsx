import { redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import DashboardNav from "@/components/layout/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUser = await getMispUser();

  if (!dbUser) redirect("/login");

  // ADMIN/SUPER_ADMIN belong in the admin portal, not the resident dashboard.
  if (dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN") {
    redirect("/login?error=use-admin-portal");
  }

  return (
    <div className="min-h-screen bg-makati-gray flex flex-col">
      <DashboardNav userEmail={dbUser.email} />
      <main className="flex-1 container-max px-4 py-8">{children}</main>
    </div>
  );
}
