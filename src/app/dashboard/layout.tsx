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
    <div className="min-h-screen bg-makati-gray dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
      <DashboardNav userEmail={dbUser.email} />
      {/* md:ml-16 = sidebar width; pt-20 = mobile top bar; md:pt-[72px] = desktop top bar + gap */}
      <main className="md:ml-16 pt-20 md:pt-[72px] pb-8">
        <div className="max-w-5xl mx-auto px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
