import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — MISP",
};

const perks = [
  "Apply for 4 social assistance programs online",
  "Upload documents securely",
  "Track your application status in real-time",
  "Receive notifications on updates",
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-makati-gray flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-makati-blue text-white w-[45%] p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <span className="font-extrabold text-lg">M</span>
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">MSWD</p>
            <p className="text-blue-200 text-sm">Integrated Services Portal</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight mb-5">
            Join{" "}
            <span className="text-makati-gold">MISP</span>
            <br />
            for Free
          </h2>
          <p className="text-blue-200 text-base leading-relaxed mb-8">
            Create your resident account and access all MSWD social welfare programs
            from the comfort of your home.
          </p>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-makati-gold shrink-0 mt-0.5" />
                <span className="text-blue-100 text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-blue-300 text-xs">
          © {new Date().getFullYear()} Makati Social Welfare Department
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-full bg-makati-blue flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <div>
              <p className="font-bold text-makati-blue text-sm">MSWD</p>
              <p className="text-xs text-gray-500">Integrated Services Portal</p>
            </div>
          </div>

          <div className="card p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create Your Account</h1>
            <p className="text-gray-500 text-sm mb-7">
              Register as a Makati City resident to apply for MSWD social assistance.
            </p>

            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Exclusively for{" "}
            <span className="font-semibold text-makati-blue">Makati City residents</span>.
            Residency will be verified during registration.
          </p>
        </div>
      </div>
    </div>
  );
}
