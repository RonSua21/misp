import Link from "next/link";
import { CheckCircle2, Shield, FileText, Bell, MapPin } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — MISP",
};

const perks = [
  { icon: FileText,    text: "Apply for social assistance programs online" },
  { icon: Shield,      text: "Secure document upload and storage" },
  { icon: CheckCircle2,text: "Track your application status in real-time" },
  { icon: Bell,        text: "Receive notifications on updates" },
  { icon: MapPin,      text: "GIS-based Makati residency verification" },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      {/* Fixed glass background */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/makati-hall.jpg" alt="" aria-hidden className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-makati-blue/70" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* Top government strip */}
      <div className="bg-makati-blue/80 backdrop-blur-sm border-b border-white/10 text-white text-xs py-1.5 px-4 text-center tracking-wide">
        Republic of the Philippines &nbsp;·&nbsp; City of Makati &nbsp;·&nbsp; Official Portal of the Social Welfare and Development Department
      </div>

      <div className="flex min-h-[calc(100vh-32px)]">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] p-12">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <p className="text-white font-bold leading-tight">MSWD Makati</p>
                <p className="text-white/50 text-xs">Integrated Services Portal</p>
              </div>
            </Link>

            <div className="inline-block bg-makati-gold/20 text-makati-gold text-xs font-bold px-3 py-1.5 rounded-full border border-makati-gold/30 mb-6">
              Official Portal
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
              MSWD Integrated<br />
              <span className="text-makati-gold">Services Portal</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8 border-l-2 border-makati-gold/40 pl-4">
              The official online gateway for Makati City residents to access social welfare
              assistance programs from the Municipal Social Welfare and Development Department.
            </p>
            <div className="space-y-3">
              {perks.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 bg-white/5 backdrop-blur rounded-2xl px-4 py-3 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-makati-gold/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-makati-gold" />
                  </div>
                  <span className="text-white/70 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} MSWD Makati — R.A. 10173 Compliant
          </p>
        </div>

        {/* Right panel — glass card */}
        <div className="flex-1 flex items-start justify-center px-4 py-10 overflow-y-auto">
          <div className="w-full max-w-lg">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <p className="text-white font-bold">MSWD Integrated Services Portal</p>
              <p className="text-white/50 text-xs">City of Makati — Official Portal</p>
            </div>

            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-white/10">
                <h1 className="text-white font-bold text-xl">Resident Registration Form</h1>
                <p className="text-white/50 text-xs mt-0.5">MISP — MSWD Integrated Services Portal</p>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-start gap-2 p-3 bg-makati-gold/10 border border-makati-gold/20 rounded-xl text-xs text-makati-gold mb-6">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    This form is exclusively for <strong>Makati City residents</strong>.
                    Residency will be verified during the application process.
                  </span>
                </div>
                <RegisterForm />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-white/40">
              For assistance, contact MSWD Makati at{" "}
              <span className="text-makati-gold font-medium">(02) 8870-1111</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
