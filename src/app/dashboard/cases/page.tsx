import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  CHILD_WELFARE:    "Child Welfare",
  WOMEN_PROTECTION: "Women's Protection",
  SENIOR_CITIZEN:   "Senior Citizen",
  PWD_ASSISTANCE:   "PWD Assistance",
  FAMILY_SERVICES:  "Family Services",
  SOLO_PARENT:      "Solo Parent",
  LIVELIHOOD:       "Livelihood",
  OTHER:            "Other",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN:        "bg-gray-100 text-gray-700",
  ACTIVE:      "bg-blue-100 text-blue-800",
  FOR_CLOSURE: "bg-yellow-100 text-yellow-800",
  CLOSED:      "bg-green-100 text-green-800",
  REFERRED:    "bg-purple-100 text-purple-800",
};

export default async function MyCasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: dbUser } = await db.from("users").select("id").eq("supabaseId", user.id).single();
  if (!dbUser) redirect("/login");

  const { data: cases } = await db
    .from("cases")
    .select(`id, caseNumber, category, priority, status, description, createdAt, worker:users!cases_assignedTo_fkey(firstName, lastName)`)
    .eq("clientId", dbUser.id)
    .not("status", "in", '("CLOSED","REFERRED")')
    .order("createdAt", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Cases</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Active social welfare cases managed by MSWD</p>
      </div>

      {(!cases || cases.length === 0) && (
        <div className="text-center py-16 space-y-3">
          <Briefcase className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">No active cases</p>
          <p className="text-sm text-gray-400 dark:text-slate-500">If you need assistance, please visit the MSWD office.</p>
        </div>
      )}

      <div className="space-y-3">
        {(cases ?? []).map((c: any) => {
          const workerName = c.worker ? `${c.worker.firstName ?? ""} ${c.worker.lastName ?? ""}`.trim() : null;
          return (
            <div key={c.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">{CATEGORY_LABELS[c.category] ?? c.category}</p>
                  <p className="text-xs font-mono text-gray-400 dark:text-slate-500">{c.caseNumber}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[c.status]}`}>{c.status.replace("_", " ")}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2">{c.description}</p>
              {workerName && (
                <p className="text-xs text-gray-500 dark:text-slate-400">Assigned Social Worker: {workerName}</p>
              )}
              <p className="text-xs text-gray-400 dark:text-slate-500">Opened {new Date(c.createdAt).toLocaleDateString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
