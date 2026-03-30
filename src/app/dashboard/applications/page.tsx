import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import NewApplicationButton from "@/components/dashboard/LocationVerificationModal";
import type { ApplicationStatus } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Applications — MISP" };

const PAGE_SIZE = 10;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const profile = await getMispUser();
  if (!profile) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const db = createAdminClient();

  const { data: applications, count } = await db
    .from("applications")
    .select("id, referenceNumber, status, purpose, createdAt, benefitProgramId", {
      count: "exact",
    })
    .eq("userId", profile.id)
    .order("createdAt", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {count ?? 0} total application{(count ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <NewApplicationButton label="New Application" variant="primary" />
      </div>

      {(count ?? 0) === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">You have no applications yet.</p>
          <NewApplicationButton label="Apply Now" variant="empty-state" />
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
                      {new Date(app.createdAt).toLocaleDateString("en-PH", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/applications/${app.id}`}
                        className="text-makati-blue text-xs font-medium hover:underline"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {from + 1}–{Math.min(to + 1, count ?? 0)} of {count ?? 0}
              </p>
              <div className="flex gap-1">
                <Link
                  href={`/dashboard/applications?page=${page - 1}`}
                  aria-disabled={page <= 1}
                  className={`p-1.5 rounded-lg border border-gray-200 text-gray-500 ${
                    page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <Link
                  href={`/dashboard/applications?page=${page + 1}`}
                  aria-disabled={page >= totalPages}
                  className={`p-1.5 rounded-lg border border-gray-200 text-gray-500 ${
                    page >= totalPages ? "opacity-40 pointer-events-none" : "hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
