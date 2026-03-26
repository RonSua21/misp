import { redirect } from "next/navigation";
import { getMispUser } from "@/lib/auth-cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { CheckCircle2, XCircle } from "lucide-react";
import type { BenefitCategory } from "@/types";

const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  FINANCIAL_ASSISTANCE: "Financial Assistance",
  MEDICAL_ASSISTANCE:   "Medical Assistance",
  SENIOR_CITIZEN:       "Senior Citizen",
  PWD_ASSISTANCE:       "PWD Assistance",
};

const CATEGORY_COLORS: Record<BenefitCategory, string> = {
  FINANCIAL_ASSISTANCE: "bg-green-100 text-green-800",
  MEDICAL_ASSISTANCE:   "bg-red-100 text-red-800",
  SENIOR_CITIZEN:       "bg-purple-100 text-purple-800",
  PWD_ASSISTANCE:       "bg-blue-100 text-blue-800",
};

export default async function AdminProgramsPage() {
  const dbUser = await getMispUser();
  if (!dbUser || dbUser.role !== "SUPER_ADMIN") redirect("/admin");

  const db = createAdminClient();
  const { data: programs } = await db
    .from("benefit_programs")
    .select("id, name, category, description, requirements, maxAmount, isActive")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Benefit Programs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {(programs ?? []).length} program{(programs ?? []).length !== 1 ? "s" : ""} configured
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(programs ?? []).length === 0 ? (
          <div className="card p-10 col-span-2 text-center text-gray-400">
            No programs found. Add benefit programs in Supabase Table Editor.
          </div>
        ) : (
          (programs ?? []).map((prog) => (
            <div key={prog.id} className="card p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-gray-900">{prog.name}</h2>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[prog.category as BenefitCategory] ?? "bg-gray-100 text-gray-600"}`}>
                    {CATEGORY_LABELS[prog.category as BenefitCategory] ?? prog.category}
                  </span>
                </div>
                {prog.isActive ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-semibold whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 text-xs font-semibold whitespace-nowrap">
                    <XCircle className="w-3.5 h-3.5" /> Inactive
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{prog.description}</p>

              {prog.maxAmount && (
                <p className="text-sm text-gray-500">
                  Max Amount:{" "}
                  <span className="font-semibold text-gray-900">
                    ₱ {Number(prog.maxAmount).toLocaleString("en-PH")}
                  </span>
                </p>
              )}

              {prog.requirements && prog.requirements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Requirements</p>
                  <ul className="space-y-1">
                    {prog.requirements.map((req: string, i: number) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-makati-blue mt-0.5">•</span> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
