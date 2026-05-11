import Link from "next/link";
import { CheckCircle2, Shield, FileText, Bell, MapPin } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — MISP",
};

const perks = [
  { icon: FileText, text: "Apply for social assistance programs online" },
  { icon: Shield, text: "Secure document upload and storage" },
  { icon: CheckCircle2, text: "Track your application status in real-time" },
  { icon: Bell, text: "Receive notifications on updates" },
  { icon: MapPin, text: "GIS-based Makati residency verification" },
];

export default function RegisterPage() {
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
              Official Portal
            </div>
            <h2 className="text-3xl font-extrabold leading-snug mb-3">
              MSWD Integrated<br />
              <span className="text-makati-gold">Services Portal</span>
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-8 border-l-2 border-makati-gold pl-4">
              The official online gateway for Makati City residents to access social welfare
              assistance programs from the Municipal Social Welfare and Development Department.
            </p>

            <div className="space-y-4">
              {perks.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-makati-gold" />
                  </div>
                  <span className="text-blue-100 text-sm leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-blue-300 text-xs">
              © {new Date().getFullYear()} Makati Social Welfare and Development Department
            </p>
            <p className="text-blue-400 text-xs mt-1">
              In accordance with R.A. 10173 — Data Privacy Act of 2012
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-start justify-center px-4 py-10 overflow-y-auto">
          <div className="w-full max-w-lg">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Republic of the Philippines</p>
              <p className="font-bold text-makati-blue">City of Makati — MSWD</p>
            </div>

            {/* Form card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Form header */}
              <div className="bg-makati-blue px-6 py-4 border-b-2 border-makati-gold">
                <h1 className="text-white font-bold text-lg">Resident Registration Form</h1>
                <p className="text-blue-200 text-xs mt-0.5">
                  MISP — MSWD Integrated Services Portal
                </p>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 mb-6">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5 text-makati-blue" />
                  <span>
                    This form is exclusively for <strong>Makati City residents</strong>.
                    Residency will be verified during the application process.
                  </span>
                </div>

                <RegisterForm />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              For assistance, contact MSWD Makati at{" "}
              <span className="text-makati-blue font-medium">(02) 8870-1111</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
