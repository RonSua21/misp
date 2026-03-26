import { notFound, redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  ArrowLeft, FileText, Calendar, Hash,
  Banknote, MessageSquare, Clock, CheckCircle2,
  XCircle, AlertCircle,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ApplicationStatus, BenefitCategory } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Application Details — MISP" };

const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  FINANCIAL_ASSISTANCE: "Financial Assistance",
  MEDICAL_ASSISTANCE:   "Medical Assistance",
  SENIOR_CITIZEN:       "Senior Citizen Benefits",
  PWD_ASSISTANCE:       "PWD Assistance",
};

const STATUS_STEPS: { status: ApplicationStatus; label: string; icon: React.ElementType }[] = [
  { status: "PENDING",      label: "Submitted",    icon: FileText },
  { status: "UNDER_REVIEW", label: "Under Review", icon: Clock },
  { status: "APPROVED",     label: "Approved",     icon: CheckCircle2 },
  { status: "DISBURSED",    label: "Disbursed",    icon: Banknote },
];

const STEP_ORDER: Record<ApplicationStatus, number> = {
  PENDING:      0,
  UNDER_REVIEW: 1,
  APPROVED:     2,
  DISBURSED:    3,
  REJECTED:     -1,
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getMispUser();
  if (!profile) redirect("/login");

  const db = createAdminClient();

  // Fetch only the columns used by the UI — ownership enforced via userId filter.
  const { data: app } = await db
    .from("applications")
    .select(
      "id, referenceNumber, status, purpose, amountRequested, amountApproved, remarks, benefitProgramId, createdAt, updatedAt"
    )
    .eq("id", id)
    .eq("userId", profile.id)   // ← ensures ownership
    .single();

  if (!app) notFound();

  // Fetch related data in parallel
  const [
    { data: program },
    { data: documents },
    { data: history },
  ] = await Promise.all([
    db.from("benefit_programs")
      .select("name, category, description, maxAmount")
      .eq("id", app.benefitProgramId)
      .single(),
    db.from("documents")
      .select("id, type, fileName, fileUrl, fileSize, status, createdAt")
      .eq("applicationId", id)
      .order("createdAt", { ascending: true }),
    db.from("application_status_history")
      .select("id, status, notes, createdAt")
      .eq("applicationId", id)
      .order("createdAt", { ascending: false }),
  ]);

  const currentStep = STEP_ORDER[app.status as ApplicationStatus] ?? -1;
  const isRejected = app.status === "REJECTED";

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-makati-blue transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Applications
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Application Details</h1>
            <p className="font-mono text-sm text-makati-blue mt-0.5 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" />{app.referenceNumber}
            </p>
          </div>
          <StatusBadge status={app.status as ApplicationStatus} />
        </div>
      </div>

      {/* Progress Tracker */}
      {!isRejected ? (
        <div className="card p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">
            Application Progress
          </p>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done    = currentStep > i;
              const active  = currentStep === i;
              const pending = currentStep < i;
              return (
                <div key={step.status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors
                      ${done   ? "bg-makati-blue border-makati-blue text-white"
                      : active ? "bg-white border-makati-blue text-makati-blue"
                               : "bg-gray-100 border-gray-200 text-gray-300"}`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight
                      ${done || active ? "text-makati-blue" : "text-gray-400"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 ${done ? "bg-makati-blue" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-5 border-l-4 border-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Application Rejected</p>
              <p className="text-sm text-red-700 mt-0.5">
                {app.remarks ?? "Your application was not approved. Contact MSWD for more information."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Application Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-makati-blue" /> Application Info
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-gray-400">Program</span>
              <span className="font-semibold text-gray-900 text-right">{program?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400">Category</span>
              <span className="text-gray-700 text-right">
                {program?.category ? CATEGORY_LABELS[program.category as BenefitCategory] : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400">Date Submitted</span>
              <span className="text-gray-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {new Date(app.createdAt).toLocaleDateString("en-PH", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400">Last Updated</span>
              <span className="text-gray-700">
                {new Date(app.updatedAt).toLocaleDateString("en-PH", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
            {app.amountRequested && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-400">Amount Requested</span>
                <span className="font-semibold text-gray-900">
                  ₱ {Number(app.amountRequested).toLocaleString("en-PH")}
                </span>
              </div>
            )}
            {app.amountApproved && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-400">Amount Approved</span>
                <span className="font-bold text-green-700">
                  ₱ {Number(app.amountApproved).toLocaleString("en-PH")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Purpose + Remarks */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-makati-blue" /> Purpose & Remarks
          </h2>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1.5">
              Your stated purpose
            </p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">
              {app.purpose}
            </p>
          </div>
          {app.remarks ? (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1.5">
                Staff remarks
              </p>
              <div className="flex gap-2 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 leading-relaxed">{app.remarks}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No remarks from staff yet.</p>
          )}
        </div>
      </div>

      {/* Submitted Documents */}
      <div className="card p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-makati-blue" /> Submitted Documents
        </h2>
        {!documents || documents.length === 0 ? (
          <p className="text-sm text-gray-400">No documents attached to this application.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {doc.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doc.fileName} · {(doc.fileSize / 1024).toFixed(0)} KB
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${doc.status === "VERIFIED" ? "bg-green-100 text-green-700"
                    : doc.status === "REJECTED" ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {doc.status}
                  </span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-makati-blue font-medium hover:underline"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status History */}
      {history && history.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-makati-blue" /> Status History
          </h2>
          <ol className="space-y-3">
            {history.map((entry, i) => (
              <li key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0
                    ${i === 0 ? "bg-makati-blue" : "bg-gray-300"}`}
                  />
                  {i < history.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {(entry.status as string).replace("_", " ")}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(entry.createdAt).toLocaleDateString("en-PH", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pb-4">
        <Link href="/dashboard/applications" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </Link>
        {(app.status === "REJECTED" || app.status === "DISBURSED") && (
          <Link href="/dashboard/apply" className="btn-primary">
            <FileText className="w-4 h-4" /> Submit New Application
          </Link>
        )}
      </div>
    </div>
  );
}
