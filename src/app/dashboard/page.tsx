import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FilePlus, FileText, Clock, CheckCircle2,
  XCircle, Banknote, ArrowRight, MapPin, ShieldAlert,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ApplicationStatus } from "@/types";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  // getMispUser() is memoized — shares the single DB call made by layout.tsx.
  const profile = await getMispUser();
  if (!profile) redirect("/login");

  const db = createAdminClient();

  // Fetch recent applications
  const { data: applications } = profile
    ? await db
        .from("applications")
        .select("id, referenceNumber, status, createdAt, benefitProgramId")
        .eq("userId", profile.id)
        .order("createdAt", { ascending: false })
        .limit(5)
    : { data: [] };

  // Fetch benefit program names for those applications
  const programIds = [...new Set((applications ?? []).map((a) => a.benefitProgramId))];
  const { data: programs } = programIds.length
    ? await db.from("benefit_programs").select("id, name").in("id", programIds)
    : { data: [] };

  const appsWithPrograms = (applications ?? []).map((app) => ({
    ...app,
    benefitProgram: (programs ?? []).find((p) => p.id === app.benefitProgramId),
  }));

  const counts = {
    total:    appsWithPrograms.length,
    pending:  appsWithPrograms.filter((a) => a.status === "PENDING").length,
    approved: appsWithPrograms.filter((a) => a.status === "APPROVED").length,
    disbursed:appsWithPrograms.filter((a) => a.status === "DISBURSED").length,
  };

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Resident";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome back, {fullName}</h1>
          <p className="text-gray-500 text-sm mt-1">Track your MSWD assistance applications below.</p>
        </div>
        <Link href="/dashboard/apply" className="btn-primary shrink-0">
          <FilePlus className="w-4 h-4" />
          New Application
        </Link>
      </div>

      {/* Residency alert */}
      {profile && !profile.residencyVerified && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold">Residency Not Yet Verified</p>
            <p className="mt-0.5 text-amber-700">Verify your Makati City address to submit applications.</p>
          </div>
          <Link href="/dashboard/profile#residency" className="shrink-0 flex items-center gap-1 font-semibold hover:underline">
            <MapPin className="w-4 h-4" /> Verify now
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={counts.total}     icon={FileText}     color="bg-blue-100 text-blue-600" />
        <StatCard label="Pending"            value={counts.pending}   icon={Clock}        color="bg-yellow-100 text-yellow-600" />
        <StatCard label="Approved"           value={counts.approved}  icon={CheckCircle2} color="bg-green-100 text-green-600" />
        <StatCard label="Disbursed"          value={counts.disbursed} icon={Banknote}     color="bg-purple-100 text-purple-600" />
      </div>

      {/* Recent applications */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Applications</h2>
          <Link href="/dashboard/applications" className="text-sm text-makati-blue font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {appsWithPrograms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference No.</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Program</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Applied</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appsWithPrograms.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-makati-blue font-semibold">{app.referenceNumber}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{app.benefitProgram?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/applications/${app.id}`} className="text-makati-blue text-xs font-medium hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No applications yet.</p>
            <Link href="/dashboard/apply" className="btn-primary mt-4 text-sm inline-flex">
              <FilePlus className="w-4 h-4" /> Apply for Assistance
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
