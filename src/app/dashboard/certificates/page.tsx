import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

const CERT_LABELS: Record<string, string> = {
  INDIGENCY:    "Certificate of Indigency",
  LOW_INCOME:   "Low-Income Certificate",
  COHABITATION: "Cohabitation Certificate",
  SOLO_PARENT:  "Solo Parent Certificate",
  NO_INCOME:    "No-Income Certificate",
  GOOD_MORAL:   "Good Moral Character Certificate",
  RESIDENCY:    "Residency Certificate",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:      "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED:     "bg-green-100 text-green-800",
  RELEASED:     "bg-emerald-100 text-emerald-800",
  REJECTED:     "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:      "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED:     "Approved",
  RELEASED:     "Released",
  REJECTED:     "Rejected",
};

export default async function CertificatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: dbUser } = await db.from("users").select("id").eq("supabaseId", user.id).single();
  if (!dbUser) redirect("/login");

  const { data: requests } = await db
    .from("certificate_requests")
    .select("id, type, purpose, status, referenceNumber, remarks, requestedAt, releasedAt")
    .eq("userId", dbUser.id)
    .order("requestedAt", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Certificates</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Request and track MSWD certificates</p>
        </div>
        <Link href="/dashboard/certificates/new"
          className="inline-flex items-center gap-2 bg-makati-blue text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-800 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Request Certificate
        </Link>
      </div>

      {(!requests || requests.length === 0) && (
        <div className="text-center py-16 space-y-3">
          <FileText className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">No certificate requests yet</p>
          <p className="text-sm text-gray-400 dark:text-slate-500">Click "Request Certificate" to get started.</p>
        </div>
      )}

      <div className="space-y-3">
        {(requests ?? []).map(r => (
          <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{CERT_LABELS[r.type] ?? r.type}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">{r.referenceNumber}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">{r.purpose}</p>
            {r.remarks && r.status === "REJECTED" && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                Reason: {r.remarks}
              </p>
            )}
            {r.status === "APPROVED" && (
              <p className="text-sm text-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                Your certificate is approved. Please visit the MSWD office to claim it.
              </p>
            )}
            {r.status === "RELEASED" && r.releasedAt && (
              <p className="text-xs text-gray-500 dark:text-slate-400">Released on {new Date(r.releasedAt).toLocaleDateString()}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-slate-500">Requested {new Date(r.requestedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
