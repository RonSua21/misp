import { redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import DashboardNav from "@/components/layout/DashboardNav";
import PageTransition from "@/components/layout/PageTransition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUser = await getMispUser();

  if (!dbUser) redirect("/login");

  if (dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN") {
    redirect("/login?error=use-admin-portal");
  }

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Fixed glass background — same vibe as the landing page */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/makati-hall.jpg" alt="" aria-hidden className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-makati-blue/75" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      <DashboardNav userEmail={dbUser.email} />
      {/* md:ml-16 = sidebar width; pt-20 = mobile top bar; md:pt-[72px] = desktop top bar */}
      <main className="md:ml-16 pt-20 md:pt-[72px] pb-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

