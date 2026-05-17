"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AppointmentCancelButton({ appointmentId }: { appointmentId: string }) {
  const router  = useRouter();
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to cancel."); return; }
      router.refresh();
    } catch { setError("Network error."); }
    finally { setBusy(false); }
  }

  return (
    <div>
      {error && <p className="text-xs text-red-400 mb-1">{error}</p>}
      <button disabled={busy} onClick={handleCancel}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50">
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        Cancel appointment
      </button>
    </div>
  );
}

