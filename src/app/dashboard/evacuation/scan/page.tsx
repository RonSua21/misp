import { getMispUser } from "@/lib/auth-cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import QRScannerClient from "@/components/dashboard/QRScannerClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Evacuation Check-in — MISP" };

export default async function EvacuationScanPage() {
  const profile = await getMispUser();
  if (!profile) redirect("/login");

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Disclaimer banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-400/10 border border-amber-400/25 rounded-xl text-sm text-amber-300">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <p>
          Only use this during an active disaster. Your name and barangay from your profile will be
          recorded as your check-in information.
        </p>
      </div>

      {/* Scanner card */}
      <div className="card p-6">
        <QRScannerClient />
      </div>
    </div>
  );
}

