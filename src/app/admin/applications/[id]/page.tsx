import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowLeft, FileText, User, MapPin, Clock } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import StatusUpdateForm from "@/components/admin/StatusUpdateForm";
import type { ApplicationStatus } from "@/types";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: dbUser } = await db
    .from("users")
    .select("role, barangay")
    .eq("supabaseId", user.id)
    .single();
  if (!dbUser) redirect("/login");

  // Fetch application
  const { data: app } = await db
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!app) notFound();

  // Coordinators can only view their barangay's applications
  if (dbUser.role === "ADMIN" && app.applicantBarangay !== dbUser.barangay) {
    redirect("/admin/applications");
  }

  // Fetch program name, documents, status history in parallel
  const [
    { data: program },
    { data: documents },
    { data: history },
  ] = await Promise.all([
    db.from("benefit_programs").select("name, category, description").eq("id", app.benefitProgramId).single(),
    db.from("documents").select("*").eq("applicationId", id).order("createdAt", { ascending: true }),
    db.from("application_status_history").select("*").eq("applicationId", id).order("createdAt", { ascending: false }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back link */}
      <Link
        href="/admin/applications"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-makati-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </Link>

      {/* Page title */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Application Review</h1>
          <p className="font-mono text-sm text-makati-blue mt-0.5">{app.referenceNumber}</p>
        </div>
        <StatusBadge status={app.status as ApplicationStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant info */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-makati-blue" />
              <h2 className="font-bold text-gray-900">Applicant Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Full Name</p>
                <p className="font-semibold text-gray-900">{app.applicantName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Contact</p>
                <p className="text-gray-700">{app.applicantContact ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Barangay</p>
                <p className="text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {app.applicantBarangay ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Date Filed</p>
                <p className="text-gray-700">
                  {new Date(app.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Application details */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-makati-blue" />
              <h2 className="font-bold text-gray-900">Application Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Benefit Program</p>
                <p className="font-semibold text-gray-900">{program?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Category</p>
                <p className="text-gray-700">{program?.category?.replace(/_/g, " ") ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Amount Requested</p>
                <p className="text-gray-700">
                  {app.amountRequested
                    ? `₱ ${Number(app.amountRequested).toLocaleString("en-PH")}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Amount Approved</p>
                <p className="text-gray-700">
                  {app.amountApproved
                    ? `₱ ${Number(app.amountApproved).toLocaleString("en-PH")}`
                    : "—"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Purpose / Reason</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">
                {app.purpose}
              </p>
            </div>
            {app.remarks && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Staff Remarks</p>
                <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-lg p-3 leading-relaxed">
                  {app.remarks}
                </p>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-makati-blue" />
              <h2 className="font-bold text-gray-900">Submitted Documents</h2>
            </div>
            {!documents || documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents submitted.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {doc.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-400">{doc.fileName} · {(doc.fileSize / 1024).toFixed(0)} KB</p>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-makati-blue font-medium hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — actions + history */}
        <div className="space-y-6">
          {/* Status update form */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Update Status</h2>
            <StatusUpdateForm
              applicationId={app.id}
              currentStatus={app.status as ApplicationStatus}
            />
          </div>

          {/* Status history */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-makati-blue" />
              <h2 className="font-bold text-gray-900">Status History</h2>
            </div>
            {!history || history.length === 0 ? (
              <p className="text-sm text-gray-400">No history yet.</p>
            ) : (
              <ol className="space-y-3">
                {history.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-makati-blue mt-1.5 flex-shrink-0" />
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-semibold text-gray-900">
                        {entry.status.replace("_", " ")}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(entry.createdAt).toLocaleDateString("en-PH", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
