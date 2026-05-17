"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import type { CertType } from "@/types";

const CERT_OPTIONS: { value: CertType; label: string }[] = [
  { value: "INDIGENCY",    label: "Certificate of Indigency" },
  { value: "LOW_INCOME",   label: "Low-Income Certificate" },
  { value: "COHABITATION", label: "Cohabitation Certificate" },
  { value: "SOLO_PARENT",  label: "Solo Parent Certificate" },
  { value: "NO_INCOME",    label: "No-Income Certificate" },
  { value: "GOOD_MORAL",   label: "Good Moral Character Certificate" },
  { value: "RESIDENCY",    label: "Residency Certificate" },
];

const PURPOSE_MAX = 300;

export default function NewCertificateForm() {
  const router  = useRouter();
  const [type,    setType]    = useState<CertType>("INDIGENCY");
  const [purpose, setPurpose] = useState("");
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!purpose.trim()) { setError("Please state the purpose of the certificate."); return; }
    if (purpose.length > PURPOSE_MAX) { setError(`Purpose must be ${PURPOSE_MAX} characters or fewer.`); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, purpose }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed."); return; }
      router.push("/dashboard/certificates");
      router.refresh();
    } catch { setError("Network error. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {error && (
        <p className="text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
      )}

      <div>
        <label className="label">
          Certificate Type <span className="text-red-400">*</span>
        </label>
        <select value={type} onChange={e => setType(e.target.value as CertType)} disabled={busy}
          className="input">
          {CERT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-slate-800 text-white">{o.label}</option>)}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0">
            Purpose <span className="text-red-400">*</span>
          </label>
          <span className={`text-xs ${purpose.length > PURPOSE_MAX ? "text-red-400 font-semibold" : "text-white/40"}`}>
            {purpose.length}/{PURPOSE_MAX}
          </span>
        </div>
        <textarea rows={4} value={purpose} onChange={e => { setPurpose(e.target.value); setError(null); }} disabled={busy}
          placeholder="Briefly state the purpose (e.g., for hospital admission, scholarship application, employment…)"
          className={`input resize-none ${error && !purpose.trim() ? "border-red-400/60 focus:ring-red-400/30" : ""}`} />
      </div>

      <p className="text-xs text-white/50 bg-white/5 rounded-lg px-3 py-2">
        Processing takes 1–3 working days. You will be notified when your certificate is ready for pick-up at the MSWD office.
      </p>

      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><FileText className="w-4 h-4" /> Submit Request</>}
        </button>
        <button type="button" disabled={busy} onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

