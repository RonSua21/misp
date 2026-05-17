import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Forgot Password — MISP" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Fixed glass background */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/makati-hall.jpg" alt="" aria-hidden className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-makati-blue/70" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="text-left">
              <p className="text-white font-bold leading-tight">MSWD Makati</p>
              <p className="text-white/50 text-xs">Integrated Services Portal</p>
            </div>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-makati-gold/20 border border-makati-gold/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-makati-gold" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Forgot your password?</h1>
              <p className="text-white/50 text-xs mt-0.5">We&apos;ll send you a secure reset link</p>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-7 leading-relaxed">
            Enter your email and we&apos;ll send you a link to reset it. Your data is protected under the Philippine Data Privacy Act (R.A. 10173).
          </p>
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          For assistance, contact MSWD at{" "}
          <a href="tel:028869400" className="text-makati-gold hover:text-yellow-400">
            (02) 8869-4000
          </a>
        </p>
      </div>
    </div>
  );
}
