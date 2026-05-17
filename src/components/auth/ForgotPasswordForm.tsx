"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      setSent(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-12 h-12 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Check your inbox</p>
            <p className="text-sm text-white/60 mt-1">
              We sent a password reset link to{" "}
              <span className="font-medium text-white/80">{email}</span>.
              It may take a minute to arrive.
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-makati-blue font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-400/10 border border-red-400/20 rounded-xl text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Button type="submit" loading={loading} className="w-full">
        <Mail className="w-4 h-4" />
        Send Reset Link
      </Button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/80"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>
    </form>
  );
}
