import { redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import AdminNav from "@/components/layout/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const dbUser = await getMispUser();

  if (!dbUser) redirect("/login");
  if (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "ADMIN") {
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
