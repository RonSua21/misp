import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText, Clock, CheckCircle2, CalendarDays,
  Award, Briefcase, ArrowRight, ChevronRight,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ApplicationStatus } from "@/types";

const APPROVAL_LEVEL_LABELS = ["Pending MAC Review", "Pending MSWD Head", "Pending Mayor's Office", "Fully Approved"];

export default async function DashboardPage() {
  const profile = await getMispUser();
  if (!profile) redirect("/login");

  const db = createAdminClient();
  const fullName = `${profile.firstName} ${profile.lastName}`;

  const [
    { data: applications },
    { data: appointments },
    { data: certificates },
    { data: cases },
  ] = await Promise.all([
    db.from("applications")
      .select("id, referenceNumber, type, status, approvalLevel, createdAt")
      .eq("userId", profile.id)
      .order("createdAt", { ascending: false })
      .limit(3),
    db.from("appointments")
      .select("id, serviceType, preferredDate, status")
      .eq("userId", profile.id)
      .in("status", ["PENDING", "CONFIRMED"])
      .order("preferredDate", { ascending: true })
      .limit(2),
    db.from("certificate_requests")
      .select("id, type, status, requestedAt")
      .eq("userId", profile.id)
      .not("status", "in", '("RELEASED","REJECTED")')
      .order("requestedAt", { ascending: false })
      .limit(2),
    db.from("cases")
      .select("id, caseNumber, category, status")
      .eq("clientId", profile.id)
      .not("status", "in", '("CLOSED","REFERRED")')
      .limit(2),
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Welcome, {fullName}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Here's a summary of your MSWD service records.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/dashboard/appointments/new"
          className="flex items-center gap-3 p-4 bg-makati-blue text-white rounded-xl hover:bg-blue-800 transition-colors">
          <CalendarDays className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Book an Appointment</p>
            <p className="text-xs text-blue-200">Schedule a visit to the MSWD office</p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto shrink-0" />
        </Link>
        <Link href="/dashboard/certificates/new"
          className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          <Award className="w-5 h-5 text-makati-blue shrink-0" />
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">Request a Certificate</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Indigency, Residency, Solo Parent & more</p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto shrink-0 text-gray-400" />
        </Link>
      </div>

      {/* Applications */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-makati-blue" /> My Applications
          </h2>
          <Link href="/dashboard/applications" className="text-xs text-makati-blue font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {!applications || applications.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <FileText className="w-8 h-8 text-gray-200 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-slate-400">No applications on record.</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Visit the MSWD office to register for assistance.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {(applications as any[]).map(app => (
              <Link key={app.id} href={`/dashboard/applications/${app.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(app.type as string)?.replace(/_/g, " ") ?? "Application"}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">{app.referenceNumber}</p>
                  {app.status === "UNDER_REVIEW" && (
                    <p className="text-xs text-blue-500 mt-0.5">
                      {APPROVAL_LEVEL_LABELS[app.approvalLevel ?? 0]}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status as ApplicationStatus} />
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Appointments + Certificates row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-makati-blue" /> Appointments
            </h2>
            <Link href="/dashboard/appointments" className="text-xs text-makati-blue font-medium hover:underline">View all</Link>
          </div>
          {!appointments || appointments.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400 dark:text-slate-500 text-center">No upcoming appointments.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {(appointments as any[]).map(appt => (
                <div key={appt.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {(appt.serviceType as string).replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(appt.preferredDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificates */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-makati-blue" /> Certificates
            </h2>
            <Link href="/dashboard/certificates" className="text-xs text-makati-blue font-medium hover:underline">View all</Link>
          </div>
          {!certificates || certificates.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400 dark:text-slate-500 text-center">No pending certificates.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {(certificates as any[]).map(cert => (
                <div key={cert.id} className="px-5 py-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {(cert.type as string).replace(/_/g, " ")}
                  </p>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Cases */}
      {cases && cases.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-makati-blue" /> Active Cases
            </h2>
            <Link href="/dashboard/cases" className="text-xs text-makati-blue font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {(cases as any[]).map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {(c.category as string).replace(/_/g, " ")}
                  </p>
                  <p className="text-xs font-mono text-gray-400">{c.caseNumber}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          To apply for PWD ID, Senior Citizen Card, AICS, or Calamity Relief, please visit the{" "}
          <span className="font-semibold">MSWD office</span> or the{" "}
          <span className="font-semibold">Makati Action Center (MAC)</span>. A social worker will assist you with the intake process.
        </p>
      </div>
    </div>
  );
}
