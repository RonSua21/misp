import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { ShieldAlert, MapPin } from "lucide-react";
import Link from "next/link";
import ApplyForm from "@/components/dashboard/ApplyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Apply for Assistance — MISP" };

export default async function ApplyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();

  const [{ data: profile }, { data: programs }] = await Promise.all([
    db.from("users")
      .select("id, firstName, lastName, contactNumber, barangay, residencyVerified")
      .eq("supabaseId", user.id)
      .single(),
    db.from("benefit_programs")
      .select("id, name, category, description, requirements, maxAmount")
      .eq("isActive", true)
      .order("name"),
  ]);

  if (!profile) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Apply for Assistance</h1>
        <p className="text-gray-500 text-sm mt-1">Complete all required fields and upload supporting documents.</p>
      </div>

      {!profile.residencyVerified && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold">Residency Verification Required</p>
            <p className="mt-0.5 text-amber-700">Verify your Makati City address before submitting.</p>
          </div>
          <Link href="/dashboard/profile#residency" className="shrink-0 flex items-center gap-1 font-semibold hover:underline">
            <MapPin className="w-4 h-4" /> Verify
          </Link>
        </div>
      )}

      <div className="card p-8">
        <ApplyForm
          userId={profile.id}
          applicantName={`${profile.firstName} ${profile.lastName}`}
          applicantContact={profile.contactNumber ?? ""}
          applicantBarangay={profile.barangay ?? ""}
          residencyVerified={profile.residencyVerified}
          programs={(programs ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            description: p.description,
            requirements: p.requirements ?? [],
            maxAmount: p.maxAmount ?? undefined,
          }))}
        />
      </div>
    </div>
  );
}
