import { redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ApplicationStatus } from "@/types";

const STATUSES: (ApplicationStatus | "ALL")[] = [
  "ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "DISBURSED", "REJECTED",
];

const PAGE_SIZE = 10;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const dbUser = await getMispUser();
  if (!dbUser) redirect("/login");

  const params = await searchParams;
  const statusFilter = (params.status ?? "ALL") as ApplicationStatus | "ALL";
  const search = params.search ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const db = createAdminClient();
  const isCoordinator = dbUser.role === "ADMIN";
  const coordinatorBarangay: string | null = isCoordinator ? (dbUser.barangay ?? null) : null;

  let query = db
    .from("applications")
    .select("id, referenceNumber, applicantName, applicantBarangay, status, createdAt, benefitProgramId", {
      count: "exact",
    })
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (coordinatorBarangay) query = query.eq("applicantBarangay", coordinatorBarangay);
  if (statusFilter !== "ALL") query = query.eq("status", statusFilter);
  if (search) query = query.ilike("applicantName", `%${search}%`);

  const { data: applications, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Fetch program names for this page only (max PAGE_SIZE IDs).
  const programIds = [...new Set((applications ?? []).map((a) => a.benefitProgramId))];
  const { data: programs } = programIds.length
    ? await db.from("benefit_programs").select("id, name").in("id", programIds)
    : { data: [] };

  const appsWithPrograms = (applications ?? []).map((app) => ({
    ...app,
    benefitProgram: (programs ?? []).find((p) => p.id === app.benefitProgramId),
  }));

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (statusFilter !== "ALL") p.set("status", statusFilter);
    if (search) p.set("search", search);
    p.set("page", String(page));
    Object.entries(overrides).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    const qs = p.toString();
    return `/admin/applications${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isCoordinator
            ? `Barangay ${coordinatorBarangay} — showing residents' applications only`
            : "All applications across Makati City"}
        </p>
      </div>

      {/* Status filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={buildUrl({ status: s === "ALL" ? "" : s, page: "1" })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
                ${(statusFilter ?? "ALL") === s
                  ? "bg-makati-blue text-white border-makati-blue"
                  : "bg-white text-gray-600 border-gray-200 hover:border-makati-blue"}`}
            >
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="get" action="/admin/applications" className="flex gap-2 shrink-0">
          {statusFilter !== "ALL" && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name…"
              className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-makati-blue w-52"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold bg-makati-blue text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{count ?? 0}</span> application{(count ?? 0) !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Applicant</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Barangay</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Program</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Filed</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appsWithPrograms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400 text-sm">
                    No applications found.
                  </td>
                </tr>
              ) : (
                appsWithPrograms.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-makati-blue font-semibold">
                      {app.referenceNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{app.applicantName}</td>
                    <td className="px-6 py-4 text-gray-500">{app.applicantBarangay ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{app.benefitProgram?.name ?? "—"}</td>
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
                        href={`/admin/applications/${app.id}`}
                        className="text-makati-blue text-xs font-medium hover:underline flex items-center gap-1"
                      >
                        Review <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
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
                href={buildUrl({ page: String(page - 1) })}
                aria-disabled={page <= 1}
                className={`p-1.5 rounded-lg border border-gray-200 text-gray-500 ${
                  page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={buildUrl({ page: String(page + 1) })}
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
    </div>
  );
}
