"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle, KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If Supabase already put an error in the URL query params, show it immediately.
    const urlError = searchParams.get("error_code") ?? searchParams.get("error");
    if (urlError) {
      const description = searchParams.get("error_description");
      setLinkError(
        description
          ? decodeURIComponent(description.replace(/\+/g, " "))
          : "This reset link is invalid or has expired."
      );
      return;
    }

    const supabase = createClient();

    // Supabase exchanges the hash token for a recovery session automatically.
    // Listen for PASSWORD_RECOVERY to know when it's ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Fallback: if no event fires within 6 seconds, the link is likely invalid.
    const timeout = setTimeout(() => {
      setLinkError("This reset link is invalid or has expired. Please request a new one.");
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login?reset=success"), 2000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <div className="w-12 h-12 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <p className="font-semibold text-white">Password updated!</p>
          <p className="text-sm text-white/60 mt-1">Redirecting you to the login page…</p>
        </div>
      </div>
    );
  }

  if (linkError) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-2.5 p-3.5 bg-red-400/10 border border-red-400/20 rounded-xl text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {linkError}
        </div>
        <Link href="/forgot-password" className="btn-primary w-full justify-center">
          Request a New Reset Link
        </Link>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/80"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-white/50">Verifying your reset link…</p>
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

      <div className="relative">
        <Input
          label="New Password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[34px] text-white/40 hover:text-white/70 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirm New Password"
          type={showConfirm ? "text" : "password"}
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-[34px] text-white/40 hover:text-white/70 transition-colors"
          aria-label={showConfirm ? "Hide password" : "Show password"}
        >
          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        <KeyRound className="w-4 h-4" />
        Update Password
      </Button>
    </form>
  );
}
