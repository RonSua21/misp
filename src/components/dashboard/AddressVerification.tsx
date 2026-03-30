"use client";
import { useState } from "react";
import {
  MapPin, CheckCircle2, AlertTriangle, Search, Lock,
  Navigation, XCircle, ExternalLink,
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
type GpsState   = "idle" | "loading" | "confirmed_makati" | "confirmed_outside" | "gps_error";

export default function AddressVerification({
  userId,
  isVerified,
  initialHouseNo = "",
  initialStreet  = "",
  initialBarangay = "",
}: Props) {
  const [houseNo,  setHouseNo]  = useState(initialHouseNo);
  const [street,   setStreet]   = useState(initialStreet);
  const [barangay, setBarangay] = useState(initialBarangay);
  const [state,    setState]    = useState<VerifyState>("idle");
  const [message,  setMessage]  = useState<string | null>(null);
  const [errors,   setErrors]   = useState<{ barangay?: string }>({});

  // GPS geolocation state
  const [gpsState,   setGpsState]   = useState<GpsState>("idle");
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [gpsCoords,  setGpsCoords]  = useState<{ lat: number; lng: number } | null>(null);

  // ── GPS Verification ─────────────────────────────────────────────────────

  async function handleGpsVerify() {
    if (!("geolocation" in navigator)) {
      setGpsState("gps_error");
      setGpsMessage("Your browser does not support GPS. Please fill in the address manually.");
      return;
    }

    setGpsState("loading");
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode via Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en-PH" } }
          );
          const data = await res.json();

          const city: string =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.municipality ||
            data?.address?.county ||
            "";

          const normalised = city.trim().toLowerCase();
          const isMakati =
            normalised === "makati" ||
            normalised === "makati city" ||
            normalised.includes("makati");

          if (isMakati) {
            setGpsCoords({ lat: latitude, lng: longitude });
            setGpsState("confirmed_makati");
            setGpsMessage(
              `GPS confirmed: ${city}. Fill in your barangay below to complete verification.`
            );
          } else {
            // Downgrade role to GUEST
            await fetch("/api/user/set-guest", { method: "PATCH" });
            setGpsState("confirmed_outside");
            setGpsMessage(
              city
                ? `Your GPS location shows "${city}", which is outside Makati City.`
                : "Your GPS location is outside Makati City boundaries."
            );
          }
        } catch {
          // Reverse geocode failed — fall back to bounding box check
          if (isWithinMakati(latitude, longitude)) {
            setGpsCoords({ lat: latitude, lng: longitude });
            setGpsState("confirmed_makati");
            setGpsMessage("GPS coordinates confirmed within Makati City.");
          } else {
            await fetch("/api/user/set-guest", { method: "PATCH" });
            setGpsState("confirmed_outside");
            setGpsMessage("Your GPS location is outside Makati City boundaries.");
          }
        }
      },
      (err) => {
        setGpsState("gps_error");
        if (err.code === err.PERMISSION_DENIED) {
          setGpsMessage("Location permission denied. You may fill in your address manually.");
        } else {
          setGpsMessage("Could not get your location. Please fill in your address manually.");
        }
      },
      { timeout: 10_000, maximumAge: 60_000 }
    );
  }

  // ── Address Form Validation ───────────────────────────────────────────────

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

    // Use GPS coords if available, otherwise geocode the typed address
    let lat = gpsCoords?.lat ?? MAKATI_CENTER.lat;
    let lng = gpsCoords?.lng ?? MAKATI_CENTER.lng;

    if (!gpsCoords) {
      const addressQuery = [houseNo, street, `Barangay ${barangay}`, "Makati City", "Metro Manila", "Philippines"]
        .filter(Boolean)
        .join(", ");

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery)}&format=json&countrycodes=ph&limit=1`,
          { headers: { "Accept-Language": "en-PH" } }
        );
        const results = await res.json();
        if (results.length > 0) {
          const geocodedLat = parseFloat(results[0].lat);
          const geocodedLng = parseFloat(results[0].lon);
          if (isWithinMakati(geocodedLat, geocodedLng)) {
            lat = geocodedLat;
            lng = geocodedLng;
          }
        }
      } catch {
        // Nominatim unreachable — keep MAKATI_CENTER fallback
      }
    }

    try {
      const apiRes = await fetch("/api/residency-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          latitude:  lat,
          longitude: lng,
          houseNo:   houseNo.trim()  || null,
          street:    street.trim()   || null,
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

  // ── Already verified ─────────────────────────────────────────────────────

  if (isVerified) {
    return (
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-800 text-sm">Residency Verified</p>
          <p className="text-green-700 text-sm mt-0.5">
            Your Makati City address is on record.{" "}
            {initialBarangay && (
              <span>
                Barangay <strong>{initialBarangay}</strong>.
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  // ── GPS confirmed outside Makati — show guest banner ────────────────────

  if (gpsState === "confirmed_outside") {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-xl">
          <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Outside Makati City</p>
            <p className="text-red-700 text-sm mt-1">{gpsMessage}</p>
            <p className="text-red-600 text-sm mt-2">
              MSWD benefit programs are exclusively for <strong>Makati City residents</strong>.
              Your account has been set to <strong>Guest</strong> access.
            </p>
          </div>
        </div>

        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          <p className="font-semibold text-gray-700 text-sm">As a Guest you can still access:</p>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-makati-blue shrink-0" />
              MSWD service information &amp; announcements
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-makati-blue shrink-0" />
              Emergency hotlines &amp; contact numbers
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-makati-blue shrink-0" />
              Active evacuation center locations
            </li>
          </ul>
          <a
            href="/guest"
            className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-makati-blue hover:underline"
          >
            Go to Guest View <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── GPS Quick Verify ──────────────────────────────────────────────── */}
      <div className="p-4 bg-makati-blue-light border border-makati-blue/20 rounded-xl">
        <p className="text-sm font-semibold text-makati-blue mb-1 flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          Option 1 — Verify with GPS (Recommended)
        </p>
        <p className="text-xs text-gray-600 mb-3">
          Use your device&apos;s GPS to instantly confirm you&apos;re within Makati City.
        </p>

        {gpsState === "idle" && (
          <button
            type="button"
            onClick={handleGpsVerify}
            className="inline-flex items-center gap-2 bg-makati-blue text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Use My GPS Location
          </button>
        )}

        {gpsState === "loading" && (
          <div className="flex items-center gap-2 text-sm text-makati-blue">
            <span className="w-4 h-4 border-2 border-makati-blue border-t-transparent rounded-full animate-spin" />
            Detecting your location…
          </div>
        )}

        {gpsState === "confirmed_makati" && (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {gpsMessage}
          </div>
        )}

        {gpsState === "gps_error" && (
          <div className="flex items-start gap-2 text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{gpsMessage}</span>
          </div>
        )}
      </div>

      {/* ── Manual Address Form ───────────────────────────────────────────── */}
      <form onSubmit={handleVerify} className="space-y-5" noValidate>
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-makati-blue" />
          Option 2 — Enter Your Address Manually
        </p>

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

        {/* House / Street */}
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

        {/* Barangay */}
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
          Your address is verified against the official list of Makati City barangays.
          All information is kept confidential in accordance with R.A. 10173.
        </p>
      </form>
    </div>
  );
}
