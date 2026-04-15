import { notFound, redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  ArrowLeft, FileText, Calendar, Hash,
  Banknote, MessageSquare, Clock, CheckCircle2,
  XCircle, AlertCircle, ShieldCheck, Building2,
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

const REJECTION_MESSAGES: Record<string, string> = {
  VOTER_INACTIVE:       "Your voter registration is inactive. Please update at the COMELEC office.",
  INCOMPLETE_DOCS:      "One or more required documents are missing or invalid.",
  NOT_ELIGIBLE:         "You do not meet the eligibility requirements for this program.",
  ORIENTATION_REQUIRED: "You must attend an orientation seminar before your application can proceed.",
  FAILED_HOME_VISIT:    "The home visitation assessment could not be completed successfully.",
  OTHER:                "Your application was not approved. Please contact the MSWD office for details.",
};

// 5-step approval tracker: Submitted → MAC → MSWD Head → Mayor's Office → Released
const APPROVAL_STEPS = [
  { label: "Submitted",       icon: FileText       },
  { label: "MAC Review",      icon: Clock          },
  { label: "MSWD Head",       icon: ShieldCheck    },
  { label: "Mayor's Office",  icon: Building2      },
  { label: "Approved",        icon: CheckCircle2   },
];

// Maps approval_level (0–3) + status to active step index (0–4)
function getActiveStep(approvalLevel: number, status: ApplicationStatus): number {
  if (status === "APPROVED" || status === "DISBURSED") return 4;
  if (status === "REJECTED") return approvalLevel + 1;
  // PENDING or UNDER_REVIEW: active step = approval_level + 1
  return approvalLevel + 1;
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getMispUser();
  if (!profile) redirect("/login");

  const db = createAdminClient();

  const { data: app } = await db
    .from("applications")
    .select(
      "id, referenceNumber, status, purpose, amountApproved, remarks, benefitProgramId, createdAt, updatedAt, approval_level, voter_status, rejection_code"
    )
    .eq("id", id)
    .eq("userId", profile.id)
    .single();

  if (!app) notFound();

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
      .select("id, fromStatus, toStatus, remarks, changedAt, approvalLevel, rejectionCode")
      .eq("applicationId", id)
      .order("changedAt", { ascending: false }),
  ]);

  const isRejected   = app.status === "REJECTED";
  const approvalLevel = (app.approval_level as number) ?? 0;
  const activeStep    = getActiveStep(approvalLevel, app.status as ApplicationStatus);

  // Rejection message (use rejection_code from app or latest history entry)
  const rejCode = (app.rejection_code as string | null) ?? null;
  const rejectionMessage = rejCode
    ? (REJECTION_MESSAGES[rejCode] ?? REJECTION_MESSAGES.OTHER)
    : (app.remarks ?? "Your application was not approved. Please contact the MSWD office.");

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
            Approval Progress
          </p>
          <div className="flex items-center gap-0">
            {APPROVAL_STEPS.map((step, i) => {
              const done    = activeStep > i;
              const active  = activeStep === i;
              return (
                <div key={step.label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors
                      ${done   ? "bg-makati-blue border-makati-blue text-white"
                      : active ? "bg-white border-makati-blue text-makati-blue"
                               : "bg-gray-100 border-gray-200 text-gray-300"}`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight w-16
                      ${done || active ? "text-makati-blue" : "text-gray-400"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < APPROVAL_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 ${done ? "bg-makati-blue" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {app.status === "DISBURSED" && (
            <p className="mt-4 text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
              <Banknote className="w-4 h-4 inline mr-1" />
              Your benefit has been disbursed. Please visit the MSWD office if you have not yet claimed it.
            </p>
          )}
        </div>
      ) : (
        <div className="card p-5 border-l-4 border-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Application Not Approved</p>
              <p className="text-sm text-red-700 mt-0.5">{rejectionMessage}</p>
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
            {app.amountApproved && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-400">Benefit Awarded</span>
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
                    {entry.fromStatus
                      ? `${(entry.fromStatus as string).replace(/_/g, " ")} → ${(entry.toStatus as string).replace(/_/g, " ")}`
                      : (entry.toStatus as string).replace(/_/g, " ")
                    }
                    {entry.approvalLevel != null && (
                      <span className="ml-2 text-xs text-gray-400 font-normal">(Level {entry.approvalLevel})</span>
                    )}
                  </p>
                  {entry.rejectionCode && (
                    <p className="text-xs text-red-600 mt-0.5">
                      {REJECTION_MESSAGES[entry.rejectionCode as string] ?? (entry.rejectionCode as string).replace(/_/g, " ")}
                    </p>
                  )}
                  {entry.remarks && (
                    <p className="text-xs text-gray-500 mt-0.5">&quot;{entry.remarks}&quot;</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(entry.changedAt).toLocaleDateString("en-PH", {
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
