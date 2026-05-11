import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { ShieldAlert, MapPin, UserX, ExternalLink } from "lucide-react";
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
      .select("id, firstName, lastName, contactNumber, barangay, residencyVerified, role")
      .eq("supabaseId", user.id)
      .single(),
    db.from("benefit_programs")
      .select("id, name, category, description, requirements, maxAmount")
      .eq("isActive", true)
      .order("name"),
  ]);

  if (!profile) redirect("/login");

  // GUEST users cannot submit benefit applications
  if (profile.role === "GUEST") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Apply for Assistance</h1>
        </div>
        <div className="card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <UserX className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Restricted — Non-Makati Resident</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
              MSWD benefit programs are exclusively for <strong>Makati City residents</strong>.
              Your GPS verification determined that you are outside Makati City.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/guest"
              className="inline-flex items-center justify-center gap-2 bg-makati-blue text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> View Guest Services
            </Link>
            <Link
              href="/dashboard/profile#residency"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-4 h-4" /> Re-verify Address
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
