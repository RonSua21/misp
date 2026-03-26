import { redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Users, FileText, Clock, CheckCircle2, Banknote, XCircle, ArrowRight, MapPin } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ApplicationStatus } from "@/types";

const STATUS_LIST: ApplicationStatus[] = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISBURSED"];

export default async function AdminOverviewPage() {
  const dbUser = await getMispUser();
  if (!dbUser) redirect("/login");

  const db = createAdminClient();
  const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
  const coordinatorBarangay: string | null = isSuperAdmin ? null : (dbUser.barangay ?? null);

  // Run all queries in parallel — scoped by barangay for coordinators.
  // Use select("id") for count-only queries — avoid unnecessary column transfers.
  const [
    { count: totalUsers },
    { data: recentApplications },
    ...statusResults
  ] = await Promise.all([
    isSuperAdmin
      ? db.from("users").select("id", { count: "exact", head: true }).eq("role", "REGISTERED_USER")
      : db.from("users").select("id", { count: "exact", head: true }).eq("role", "REGISTERED_USER").eq("barangay", coordinatorBarangay!),

    coordinatorBarangay
      ? db.from("applications")
          .select("id, referenceNumber, applicantName, status, createdAt, benefitProgramId")
          .eq("applicantBarangay", coordinatorBarangay)
          .order("createdAt", { ascending: false })
          .limit(10)
      : db.from("applications")
          .select("id, referenceNumber, applicantName, status, createdAt, benefitProgramId")
          .order("createdAt", { ascending: false })
          .limit(10),

    ...STATUS_LIST.map((s) =>
      coordinatorBarangay
        ? db.from("applications").select("id", { count: "exact", head: true }).eq("status", s).eq("applicantBarangay", coordinatorBarangay)
        : db.from("applications").select("id", { count: "exact", head: true }).eq("status", s)
    ),
  ]);

  const countMap = Object.fromEntries(
    STATUS_LIST.map((s, i) => [s, statusResults[i].count ?? 0])
  );
  const totalApps = Object.values(countMap).reduce((a, b) => a + b, 0);

  // Fetch program names for the recent list only (max 10 IDs).
  const programIds = [...new Set((recentApplications ?? []).map((a) => a.benefitProgramId))];
  const { data: programs } = programIds.length
    ? await db.from("benefit_programs").select("id, name").in("id", programIds)
    : { data: [] };

  const appsWithPrograms = (recentApplications ?? []).map((app) => ({
    ...app,
    benefitProgram: (programs ?? []).find((p) => p.id === app.benefitProgramId),
  }));

  const stats = [
    { label: isSuperAdmin ? "Registered Users" : "Barangay Residents", value: totalUsers ?? 0,      icon: Users,        color: "bg-blue-100 text-blue-600" },
    { label: "Total Applications",                                       value: totalApps,             icon: FileText,     color: "bg-gray-100 text-gray-600" },
    { label: "Pending",                                                  value: countMap["PENDING"],   icon: Clock,        color: "bg-yellow-100 text-yellow-600" },
    { label: "Approved",                                                 value: countMap["APPROVED"],  icon: CheckCircle2, color: "bg-green-100 text-green-600" },
    { label: "Disbursed",                                                value: countMap["DISBURSED"], icon: Banknote,     color: "bg-purple-100 text-purple-600" },
    { label: "Rejected",                                                 value: countMap["REJECTED"],  icon: XCircle,      color: "bg-red-100 text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          {isSuperAdmin ? "Admin Overview" : "Coordinator Overview"}
        </h1>
        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
          {isSuperAdmin ? (
            "MSWD Integrated Services Portal — Staff Dashboard"
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5" />
              Barangay {coordinatorBarangay} — Applications &amp; Residents
            </>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent applications */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Applications</h2>
          <Link href="/admin/applications" className="text-sm text-makati-blue font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Applicant</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Program</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appsWithPrograms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                    No applications found.
                  </td>
                </tr>
              ) : (
                appsWithPrograms.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-makati-blue font-semibold">{app.referenceNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{app.applicantName}</td>
                    <td className="px-6 py-4 text-gray-500">{app.benefitProgram?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/applications/${app.id}`} className="text-makati-blue text-xs font-medium hover:underline">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
