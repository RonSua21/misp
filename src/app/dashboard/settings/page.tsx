import { getMispUser } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SettingsClient from "@/components/dashboard/SettingsClient";

export const metadata: Metadata = { title: "Settings — MISP" };

export default async function SettingsPage() {
  const profile = await getMispUser();
  if (!profile) redirect("/login");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Settings</h1>
        <p className="text-sm text-white/60 mt-1">
          Manage your preferences and account security.
        </p>
      </div>
      <SettingsClient userEmail={profile.email} />
    </div>
  );
}

