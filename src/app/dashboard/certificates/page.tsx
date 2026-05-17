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
  PENDING:      "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30",
  UNDER_REVIEW: "bg-blue-400/20 text-blue-300 border border-blue-400/30",
  APPROVED:     "bg-green-400/20 text-green-300 border border-green-400/30",
  RELEASED:     "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30",
  REJECTED:     "bg-red-400/20 text-red-300 border border-red-400/30",
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
          <h1 className="text-xl font-bold text-white">My Certificates</h1>
          <p className="text-sm text-white/60 mt-0.5">Request and track MSWD certificates</p>
        </div>
        <Link href="/dashboard/certificates/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Request Certificate
        </Link>
      </div>

      {(!requests || requests.length === 0) && (
        <div className="text-center py-16 space-y-3">
          <FileText className="w-10 h-10 text-white/30 mx-auto" />
          <p className="text-white/60 font-medium">No certificate requests yet</p>
          <p className="text-sm text-white/50">Click "Request Certificate" to get started.</p>
        </div>
      )}

      <div className="space-y-3">
        {(requests ?? []).map(r => (
          <div key={r.id} className="card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-white text-sm">{CERT_LABELS[r.type] ?? r.type}</p>
                <p className="text-xs text-white/60 font-mono">{r.referenceNumber}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
            </div>
            <p className="text-sm text-white/70">{r.purpose}</p>
            {r.remarks && r.status === "REJECTED" && (
              <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                Reason: {r.remarks}
              </p>
            )}
            {r.status === "APPROVED" && (
              <p className="text-sm text-green-300 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                Your certificate is approved. Please visit the MSWD office to claim it.
              </p>
            )}
            {r.status === "RELEASED" && r.releasedAt && (
              <p className="text-xs text-white/60">Released on {new Date(r.releasedAt).toLocaleDateString()}</p>
            )}
            <p className="text-xs text-white/50">Requested {new Date(r.requestedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

