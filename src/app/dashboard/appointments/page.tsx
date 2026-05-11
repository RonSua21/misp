import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import AppointmentCancelButton from "@/components/dashboard/AppointmentCancelButton";

const SERVICE_LABELS: Record<string, string> = {
  CASE_CONSULTATION:   "Case Consultation",
  CERTIFICATE_REQUEST: "Certificate Request",
  FINANCIAL_INQUIRY:   "Financial Inquiry",
  SOLO_PARENT:         "Solo Parent Services",
  PWD_ASSESSMENT:      "PWD Assessment",
  GENERAL_INQUIRY:     "General Inquiry",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-600",
  NO_SHOW:   "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:   "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW:   "No Show",
};

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: dbUser } = await db.from("users").select("id").eq("supabaseId", user.id).single();
  if (!dbUser) redirect("/login");

  const { data: appointments } = await db
    .from("appointments")
    .select("id, serviceType, preferredDate, preferredTime, status, notes, queueNumber, confirmedAt, createdAt")
    .eq("userId", dbUser.id)
    .not("status", "in", '("CANCELLED","NO_SHOW")')
    .order("preferredDate", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Book and manage MSWD office appointments</p>
        </div>
        <Link href="/dashboard/appointments/new"
          className="inline-flex items-center gap-2 bg-makati-blue text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-800 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Book Appointment
        </Link>
      </div>

      {(!appointments || appointments.length === 0) && (
        <div className="text-center py-16 space-y-3">
          <CalendarDays className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">No upcoming appointments</p>
          <p className="text-sm text-gray-400 dark:text-slate-500">Click "Book Appointment" to schedule a visit.</p>
        </div>
      )}

      <div className="space-y-3">
        {(appointments ?? []).map(a => (
          <div key={a.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{SERVICE_LABELS[a.serviceType] ?? a.serviceType}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {new Date(a.preferredDate + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · {formatTime(a.preferredTime)}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[a.status] ?? "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[a.status] ?? a.status}
              </span>
            </div>
            {a.notes && <p className="text-sm text-gray-600 dark:text-slate-300">{a.notes}</p>}
            {a.status === "CONFIRMED" && (
              <p className="text-sm text-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                Your appointment is confirmed. Please arrive on time at the MSWD office.
              </p>
            )}
            {(a.status === "PENDING" || a.status === "CONFIRMED") && (
              <AppointmentCancelButton appointmentId={a.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
