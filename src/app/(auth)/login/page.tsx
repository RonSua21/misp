import Link from "next/link";
import { ShieldCheck, AlertTriangle, CheckCircle, FileText, Bell, MapPin } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — MISP",
};

const ERROR_MESSAGES: Record<string, string> = {
  "use-admin-portal":
    "Staff accounts cannot access the Resident Portal. Please use the Admin Portal instead.",
};

const SUCCESS_MESSAGES: Record<string, string> = {
  "reset-success": "Password updated successfully. Please sign in with your new password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;
  const successMessage = reset ? SUCCESS_MESSAGES[`${reset}-success`] : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top government banner */}
      <div className="bg-makati-blue border-b-4 border-makati-gold w-full">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <span className="font-extrabold text-makati-blue text-base">M</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Republic of the Philippines</p>
            <p className="text-blue-200 text-xs">City of Makati — Social Welfare and Development Department</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between bg-makati-blue text-white w-[42%] p-12">
          <div>
            <div className="inline-block bg-makati-gold text-makati-blue text-xs font-bold px-3 py-1 rounded mb-6 tracking-wide uppercase">
              Resident Portal
            </div>
            <h2 className="text-3xl font-extrabold leading-snug mb-3">
              Access Your<br />
              <span className="text-makati-gold">Benefit Programs</span>
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-8 border-l-2 border-makati-gold pl-4">
              Manage your applications for financial, medical, senior citizen, and
              PWD assistance — all in one secure government portal.
            </p>
            <div className="space-y-4">
              {[
                { icon: FileText, text: "View and track all your applications" },
                { icon: ShieldCheck, text: "Secured under R.A. 10173 — Data Privacy Act" },
                { icon: Bell, text: "Receive real-time status notifications" },
                { icon: MapPin, text: "GIS-verified Makati residency" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-makati-gold" />
                  </div>
                  <span className="text-blue-100 text-sm leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-6">
            <p className="text-blue-300 text-xs">© {new Date().getFullYear()} Makati Social Welfare and Development Department</p>
            <p className="text-blue-400 text-xs mt-1">In accordance with R.A. 10173 — Data Privacy Act of 2012</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Republic of the Philippines</p>
              <p className="font-bold text-makati-blue">City of Makati — MSWD</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-makati-blue px-6 py-4 border-b-2 border-makati-gold">
                <h1 className="text-white font-bold text-lg">Resident Sign In</h1>
                <p className="text-blue-200 text-xs mt-0.5">MISP — MSWD Integrated Services Portal</p>
              </div>

              <div className="px-6 py-6 space-y-4">
                {successMessage && (
                  <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                    {successMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    {errorMessage}
                  </div>
                )}
                <LoginForm />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              For assistance, contact MSWD Makati at{" "}
              <a href="tel:028869400" className="text-makati-blue font-medium hover:underline">
                (02) 8869-4000
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
