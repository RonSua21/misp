"use client";
import { useState } from "react";
import {
  MapPin, CheckCircle2, AlertTriangle, Search, Lock,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { MAKATI_BARANGAYS, isWithinMakati, MAKATI_CENTER } from "@/lib/makati-bounds";

interface Props {
  userId: string;
  isVerified: boolean;
  initialHouseNo?: string;
  initialStreet?: string;
  initialBarangay?: string;
}

type VerifyState = "idle" | "loading" | "success" | "error";

export default function AddressVerification({
  userId,
  isVerified,
  initialHouseNo = "",
  initialStreet = "",
  initialBarangay = "",
}: Props) {
  const [houseNo,  setHouseNo]  = useState(initialHouseNo);
  const [street,   setStreet]   = useState(initialStreet);
  const [barangay, setBarangay] = useState(initialBarangay);
  const [state,    setState]    = useState<VerifyState>("idle");
  const [message,  setMessage]  = useState<string | null>(null);
  const [errors,   setErrors]   = useState<{ barangay?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!barangay) e.barangay = "Please select your barangay.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setState("loading");
    setMessage(null);

    // Build a full address string for geocoding
    const addressQuery = [houseNo, street, `Barangay ${barangay}`, "Makati City", "Metro Manila", "Philippines"]
      .filter(Boolean)
      .join(", ");

    let lat = MAKATI_CENTER.lat;
    let lng = MAKATI_CENTER.lng;

    // ── Try Nominatim geocoding (best-effort) ──────────────────────────────
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery)}&format=json&countrycodes=ph&limit=1`,
        { headers: { "Accept-Language": "en-PH" } }
      );
      const results = await res.json();

      if (results.length > 0) {
        const geocodedLat = parseFloat(results[0].lat);
        const geocodedLng = parseFloat(results[0].lon);

        // If geocoding returned a result outside Makati, warn but still allow
        // if the barangay is from our verified list (it can't be added manually)
        if (isWithinMakati(geocodedLat, geocodedLng)) {
          lat = geocodedLat;
          lng = geocodedLng;
        }
        // If outside bounds, we keep MAKATI_CENTER as fallback
        // and let barangay list be the source of truth
      }
    } catch {
      // Nominatim unreachable — fall back to barangay-based verification
    }

    // ── Call verification API ──────────────────────────────────────────────
    try {
      const apiRes = await fetch("/api/residency-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          latitude: lat,
          longitude: lng,
          houseNo: houseNo.trim() || null,
          street: street.trim() || null,
          barangay,
        }),
      });

      if (!apiRes.ok) {
        const body = await apiRes.json();
        throw new Error(body.error ?? "Verification failed.");
      }

      setState("success");
      setMessage("Your Makati City residency has been verified successfully!");
      setTimeout(() => window.location.reload(), 1800);
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  }

  // ── Already verified ───────────────────────────────────────────────────────
  if (isVerified) {
    return (
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-800 text-sm">Residency Verified</p>
          <p className="text-green-700 text-sm mt-0.5">
            Your Makati City address is on record.{" "}
            {initialBarangay && <span>Barangay <strong>{initialBarangay}</strong>.</span>}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-5" noValidate>
      {/* Status messages */}
      {state === "success" && (
        <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}
      {state === "error" && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-2.5 p-3.5 bg-makati-blue-light border border-makati-blue/20 rounded-lg text-sm text-makati-blue">
        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Enter your home address in Makati City. Only residents of Makati City
          are eligible for MSWD assistance programs.
        </p>
      </div>

      {/* Form fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="House / Unit No."
          placeholder="e.g. 123, Unit 4B"
          value={houseNo}
          onChange={(e) => setHouseNo(e.target.value)}
          disabled={state === "loading"}
        />
        <Input
          label="Street Name"
          placeholder="e.g. Ayala Avenue"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          disabled={state === "loading"}
        />
      </div>

      {/* Barangay dropdown */}
      <div>
        <label className="label">
          Barangay <span className="text-red-500">*</span>
        </label>
        <select
          value={barangay}
          onChange={(e) => {
            setBarangay(e.target.value);
            setErrors({});
          }}
          className={`input ${errors.barangay ? "input-error" : ""}`}
          disabled={state === "loading"}
          required
        >
          <option value="">— Select your barangay —</option>
          {MAKATI_BARANGAYS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        {errors.barangay && (
          <p className="mt-1 text-xs text-red-600">{errors.barangay}</p>
        )}
      </div>

      {/* City / Province — read-only */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">City / Municipality</label>
          <div className="input bg-gray-50 text-gray-500 flex items-center gap-2 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            Makati City
          </div>
        </div>
        <div>
          <label className="label">Province</label>
          <div className="input bg-gray-50 text-gray-500 flex items-center gap-2 cursor-not-allowed">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            Metro Manila
          </div>
        </div>
      </div>

      <Button
        type="submit"
        loading={state === "loading"}
        className="w-full sm:w-auto"
      >
        <Search className="w-4 h-4" />
        Verify My Address
      </Button>

      <p className="text-xs text-gray-400">
        Your address is verified against the official list of Makati City barangays
        and may be cross-referenced with geocoding data. All information is kept
        confidential in accordance with R.A. 10173.
      </p>
    </form>
  );
}
