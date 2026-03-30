import { ShieldCheck } from "lucide-react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Forgot Password — MISP" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-makati-gray flex">
      {/* Left panel — branding */}
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
            Reset Your<br />
            <span className="text-makati-gold">Password</span>
          </h2>
          <p className="text-blue-200 text-base leading-relaxed mb-8">
            Enter the email address linked to your account and we&apos;ll send
            you a secure link to reset your password.
          </p>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 border border-white/20">
            <ShieldCheck className="w-6 h-6 text-makati-gold shrink-0" />
            <p className="text-sm text-blue-100">
              Your data is protected under the Philippine Data Privacy Act (R.A. 10173).
            </p>
          </div>
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
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Forgot your password?</h1>
            <p className="text-gray-500 text-sm mb-7">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
            <ForgotPasswordForm />
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            For assistance, contact MSWD at{" "}
            <a href="tel:028869400" className="underline hover:text-gray-600">
              (02) 8869-4000
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
