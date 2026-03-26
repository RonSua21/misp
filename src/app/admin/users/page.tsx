import { redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { CheckCircle2, XCircle, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 10;

function RoleBadge({ role }: { role: string }) {
  const colorMap: Record<string, string> = {
    SUPER_ADMIN: "bg-yellow-100 text-yellow-800",
    ADMIN: "bg-blue-100 text-blue-800",
    REGISTERED_USER: "bg-gray-100 text-gray-700",
  };
  const labelMap: Record<string, string> = {
    SUPER_ADMIN: "MSWD Staff",
    ADMIN: "Coordinator",
    REGISTERED_USER: "Resident",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorMap[role] ?? "bg-gray-100 text-gray-600"}`}>
      {labelMap[role] ?? role}
    </span>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const dbUser = await getMispUser();
  if (!dbUser) redirect("/login");
  if (dbUser.role !== "SUPER_ADMIN") redirect("/admin");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const db = createAdminClient();

  // Fetch staff + coordinators (small set — no pagination needed).
  // Fetch paginated residents separately with DB-side role filter.
  const [
    { data: staff },
    { data: residents, count: residentCount },
  ] = await Promise.all([
    db.from("users")
      .select("id, firstName, lastName, email, barangay, role, residencyVerified, createdAt")
      .in("role", ["SUPER_ADMIN", "ADMIN"])
      .order("createdAt", { ascending: false }),
    db.from("users")
      .select("id, firstName, lastName, email, barangay, role, residencyVerified, createdAt", {
        count: "exact",
      })
      .eq("role", "REGISTERED_USER")
      .order("createdAt", { ascending: false })
      .range(from, to),
  ]);

  const totalPages = Math.ceil((residentCount ?? 0) / PAGE_SIZE);

  type UserRow = NonNullable<typeof staff>[number];

  function UserTable({ rows }: { rows: UserRow[] | null }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Barangay</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Residency</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(rows ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              (rows ?? []).map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {u.barangay ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" /> {u.barangay}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-6 py-4">
                    {u.residencyVerified ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <XCircle className="w-3.5 h-3.5" /> Not yet
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">All registered accounts in the MISP system</p>
      </div>

      {/* Staff & Coordinators — small set, always fully loaded */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Staff &amp; Barangay Coordinators</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {(staff ?? []).length} account{(staff ?? []).length !== 1 ? "s" : ""}
          </p>
        </div>
        <UserTable rows={staff} />
      </div>

      {/* Residents — paginated */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Registered Residents</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {residentCount ?? 0} account{(residentCount ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <UserTable rows={residents} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {from + 1}–{Math.min(to + 1, residentCount ?? 0)} of {residentCount ?? 0}
            </p>
            <div className="flex gap-1">
              <Link
                href={`/admin/users?page=${page - 1}`}
                aria-disabled={page <= 1}
                className={`p-1.5 rounded-lg border border-gray-200 text-gray-500 ${
                  page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/users?page=${page + 1}`}
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
