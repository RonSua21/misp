"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, AlertCircle } from "lucide-react";
import type { ServiceType } from "@/types";

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "CASE_CONSULTATION",   label: "Case Consultation" },
  { value: "CERTIFICATE_REQUEST", label: "Certificate Request" },
  { value: "FINANCIAL_INQUIRY",   label: "Financial Inquiry" },
  { value: "SOLO_PARENT",         label: "Solo Parent Services" },
  { value: "PWD_ASSESSMENT",      label: "PWD Assessment" },
  { value: "GENERAL_INQUIRY",     label: "General Inquiry" },
];

const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  const label = `${hour}:${String(m).padStart(2, "0")} ${period}`;
  return { value, label };
});

const NOTES_MAX = 300;

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function BookAppointmentForm() {
  const router  = useRouter();
  const minDate = getTomorrow();

  const [serviceType,    setService] = useState<ServiceType>("GENERAL_INQUIRY");
  const [preferredDate,  setDate]    = useState("");
  const [preferredTime,  setTime]    = useState("08:00");
  const [notes,          setNotes]   = useState("");
  const [busy,           setBusy]    = useState(false);
  const [errors,         setErrors]  = useState<Record<string, string>>({});
  const [globalError,    setGlobal]  = useState<string | null>(null);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!preferredDate) {
      next.date = "Please select a preferred date.";
    } else if (preferredDate < minDate) {
      next.date = "Appointments must be scheduled at least one day in advance.";
    }
    if (notes.length > NOTES_MAX) {
      next.notes = `Notes must be ${NOTES_MAX} characters or fewer.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobal(null);
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceType, preferredDate, preferredTime, notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setGlobal(data.error ?? "Booking failed. Please try again."); return; }
      router.push("/dashboard/appointments");
      router.refresh();
    } catch {
      setGlobal("Could not connect to the server. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const fieldClass = (field: string) =>
    `input ${errors[field] ? "border-red-400/60 focus:ring-red-400/30" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">

      {globalError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-400/10 border border-red-400/20 rounded-xl text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {globalError}
        </div>
      )}

      <div>
        <label className="label">
          Service Type <span className="text-red-400">*</span>
        </label>
        <select
          value={serviceType}
          onChange={e => setService(e.target.value as ServiceType)}
          disabled={busy}
          className={fieldClass("service")}
        >
          {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-slate-800 text-white">{o.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            Preferred Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={preferredDate}
            min={minDate}
            onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: "" })); }}
            disabled={busy}
            className={fieldClass("date")}
          />
          {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="label">
            Preferred Time <span className="text-red-400">*</span>
          </label>
          <select
            value={preferredTime}
            onChange={e => setTime(e.target.value)}
            disabled={busy}
            className={fieldClass("time")}
          >
            {TIME_SLOTS.map(t => <option key={t.value} value={t.value} className="bg-slate-800 text-white">{t.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0">
            Notes <span className="text-white/40 font-normal text-xs">(optional)</span>
          </label>
          <span className={`text-xs ${notes.length > NOTES_MAX ? "text-red-400 font-semibold" : "text-white/40"}`}>
            {notes.length}/{NOTES_MAX}
          </span>
        </div>
        <textarea
          rows={3}
          value={notes}
          onChange={e => { setNotes(e.target.value); setErrors(p => ({ ...p, notes: "" })); }}
          disabled={busy}
          placeholder="Any additional details about your concern…"
          className={`${fieldClass("notes")} resize-none`}
        />
        {errors.notes && <p className="text-xs text-red-600 mt-1">{errors.notes}</p>}
      </div>

      <p className="text-xs text-white/50 bg-white/5 rounded-lg px-3 py-2">
        Appointments are subject to availability. You will be notified once confirmed by MSWD staff.
      </p>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</>
            : <><CalendarDays className="w-4 h-4" /> Book Appointment</>
          }
        </button>
        <button type="button" disabled={busy} onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

