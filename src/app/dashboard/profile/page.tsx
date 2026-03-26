import { getMispUser } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import AddressVerification from "@/components/dashboard/AddressVerification";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile — MISP" };

export default async function ProfilePage() {
  const profile = await getMispUser();
  if (!profile) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account information and verify your residency.
        </p>
      </div>

      {/* Personal info card */}
      <div className="card p-6 space-y-5">
        <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">
          Personal Information
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: "First Name",    value: profile.firstName },
            { label: "Last Name",     value: profile.lastName },
            { label: "Middle Name",   value: profile.middleName ?? "—" },
            { label: "Email Address", value: profile.email },
            { label: "Mobile Number", value: profile.contactNumber ?? "—" },
            {
              label: "Role",
              value: profile.role === "SUPER_ADMIN"
                ? "MSWD Staff (Super Admin)"
                : profile.role === "ADMIN"
                ? "Barangay Coordinator"
                : "Resident",
            },
            {
              label: "Member Since",
              value: new Date(profile.createdAt).toLocaleDateString("en-PH", {
                year: "numeric", month: "long", day: "numeric",
              }),
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
              <p className="mt-0.5 font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Residency verification card */}
      <div id="residency" className="card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="font-bold text-gray-900 text-lg">Residency Verification</h2>
          {profile.residencyVerified ? (
            <span className="flex items-center gap-1.5 text-green-700 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-600 text-sm font-semibold">
              <XCircle className="w-4 h-4" /> Not Verified
            </span>
          )}
        </div>

        <AddressVerification
          userId={profile.id}
          isVerified={profile.residencyVerified}
          initialHouseNo={profile.houseNo ?? ""}
          initialStreet={profile.street ?? ""}
          initialBarangay={profile.barangay ?? ""}
        />
      </div>
    </div>
  );
}
