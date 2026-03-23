"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MAKATI_BARANGAYS } from "@/lib/makati-bounds";

// ─── Validation helpers ───────────────────────────────────────────────────────

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Must contain at least one uppercase letter";
  if (!/[0-9]/.test(pw)) return "Must contain at least one number";
  return null;
}

function validatePHPhone(phone: string): string | null {
  const cleaned = phone.replace(/\s+/g, "");
  if (!/^(09|\+639)\d{9}$/.test(cleaned)) return "Enter a valid PH mobile number (e.g. 09171234567)";
  return null;
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  contactNumber: string;
  barangay: string;
  password: string;
  confirmPassword: string;
  consentGiven: boolean;
}

const INITIAL: FormData = {
  firstName: "",
  lastName: "",
  middleName: "",
  email: "",
  contactNumber: "",
  barangay: "",
  password: "",
  confirmPassword: "",
  consentGiven: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};

    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address";
    if (form.contactNumber && validatePHPhone(form.contactNumber))
      next.contactNumber = validatePHPhone(form.contactNumber)!;
    if (!form.barangay) next.barangay = "Please select your barangay";

    const pwErr = validatePassword(form.password);
    if (pwErr) next.password = pwErr;
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
    if (!form.consentGiven) next.consentGiven = "You must accept the data privacy consent to register";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const supabase = createClient();

      // 1. Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            middle_name: form.middleName.trim() || null,
            contact_number: form.contactNumber.trim() || null,
            barangay: form.barangay,
          },
        },
      });

      if (authError) {
        setGlobalError(authError.message);
        return;
      }

      // 2. Create user profile via API route (server-side Prisma write)
      if (authData.user) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supabaseId: authData.user.id,
            email: form.email.trim().toLowerCase(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            middleName: form.middleName.trim() || undefined,
            contactNumber: form.contactNumber.trim() || undefined,
            barangay: form.barangay,
          }),
        });

        if (!res.ok) {
          const body = await res.json();
          setGlobalError(body.error ?? "Failed to create user profile.");
          return;
        }
      }

      setSuccess(true);
    } catch {
      setGlobalError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
          We sent a confirmation link to <strong>{form.email}</strong>. Click the link to
          activate your account.
        </p>
        <Link href="/login" className="btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {globalError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {globalError}
        </div>
      )}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="Juan"
          value={form.firstName}
          onChange={(e) => set("firstName", e.target.value)}
          error={errors.firstName}
          required
        />
        <Input
          label="Last Name"
          placeholder="Dela Cruz"
          value={form.lastName}
          onChange={(e) => set("lastName", e.target.value)}
          error={errors.lastName}
          required
        />
      </div>

      <Input
        label="Middle Name"
        placeholder="Santos (optional)"
        value={form.middleName}
        onChange={(e) => set("middleName", e.target.value)}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email}
        required
        autoComplete="email"
      />

      <Input
        label="Mobile Number"
        type="tel"
        placeholder="09171234567"
        value={form.contactNumber}
        onChange={(e) => set("contactNumber", e.target.value)}
        error={errors.contactNumber}
        hint="Philippine mobile number format"
      />

      {/* Barangay */}
      <div>
        <label className="label">
          Barangay <span className="text-red-500 ml-0.5">*</span>
        </label>
        <select
          value={form.barangay}
          onChange={(e) => set("barangay", e.target.value)}
          className={`input ${errors.barangay ? "input-error" : ""}`}
          required
        >
          <option value="">— Select your barangay in Makati City —</option>
          {MAKATI_BARANGAYS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        {errors.barangay && <p className="mt-1 text-xs text-red-600">{errors.barangay}</p>}
      </div>

      {/* Password */}
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Min. 8 chars, 1 uppercase, 1 number"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          error={errors.password}
          required
          className="pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
          aria-label="Toggle password visibility"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          placeholder="Repeat your password"
          value={form.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          required
          className="pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
          aria-label="Toggle confirm password visibility"
        >
          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Data Privacy Consent (PH DPA) */}
      <div className={`p-4 rounded-lg border ${errors.consentGiven ? "border-red-300 bg-red-50" : "border-blue-100 bg-makati-blue-light"}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consentGiven}
            onChange={(e) => set("consentGiven", e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-makati-blue shrink-0"
          />
          <span className="text-xs text-gray-700 leading-relaxed">
            I consent to the collection and processing of my personal data by the{" "}
            <strong>Makati Social Welfare Department</strong> in accordance with the{" "}
            <strong>Philippine Data Privacy Act of 2012 (R.A. 10173)</strong> and its
            Implementing Rules and Regulations. My data will be used solely for the
            purpose of processing social welfare assistance applications.
            {" "}
            <Link href="/privacy" className="text-makati-blue underline">Read full privacy notice.</Link>
          </span>
        </label>
        {errors.consentGiven && (
          <p className="mt-2 text-xs text-red-600">{errors.consentGiven}</p>
        )}
      </div>

      <Button type="submit" loading={loading} className="w-full">
        <UserPlus className="w-4 h-4" />
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-makati-blue font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
