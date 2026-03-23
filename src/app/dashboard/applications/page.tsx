import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FilePlus, FileText } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ApplicationStatus } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Applications — MISP" };

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();

  const { data: profile } = await db
    .from("users")
    .select("id")
    .eq("supabaseId", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: applications } = await db
    .from("applications")
    .select("id, referenceNumber, status, purpose, createdAt, benefitProgramId")
    .eq("userId", profile.id)
    .order("createdAt", { ascending: false });

  const programIds = [...new Set((applications ?? []).map((a) => a.benefitProgramId))];
  const { data: programs } = programIds.length
    ? await db.from("benefit_programs").select("id, name").in("id", programIds)
    : { data: [] };

  const appsWithPrograms = (applications ?? []).map((app) => ({
    ...app,
    benefitProgram: (programs ?? []).find((p) => p.id === app.benefitProgramId),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {appsWithPrograms.length} total application{appsWithPrograms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/apply" className="btn-primary">
          <FilePlus className="w-4 h-4" /> New Application
        </Link>
      </div>

      {appsWithPrograms.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">You have no applications yet.</p>
          <Link href="/dashboard/apply" className="btn-primary mt-4 inline-flex">Apply Now</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference No.</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Program</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Purpose</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Applied</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appsWithPrograms.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-makati-blue font-semibold whitespace-nowrap">
                      {app.referenceNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {app.benefitProgram?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{app.purpose}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/applications/${app.id}`} className="text-makati-blue text-xs font-medium hover:underline">
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
