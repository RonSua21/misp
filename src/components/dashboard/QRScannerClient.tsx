"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  QrCode, CheckCircle, AlertCircle, Camera, CameraOff,
  ArrowLeft, Keyboard,
} from "lucide-react";

type ScanState = "idle" | "scanning" | "loading" | "success" | "error";

function extractCenterId(raw: string): string | null {
  try {
    // QR contains a URL like http://localhost:3001/check-in/[uuid]
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("check-in");
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  } catch {
    // Not a URL — treat the raw value itself as a center ID (UUID format)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(raw.trim())) return raw.trim();
  }
  return null;
}

export default function QRScannerClient() {
  const router = useRouter();
  const [state, setState]         = useState<ScanState>("idle");
  const [message, setMessage]     = useState("");
  const [centerName, setCenterName] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualId, setManualId]   = useState("");
  const [cameraError, setCameraError] = useState(false);

  const checkIn = useCallback(async (centerId: string) => {
    setState("loading");
    try {
      const res = await fetch("/api/evacuation/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "Check-in failed. Please try again.");
        return;
      }
      setCenterName(data.centerName ?? "the relief center");
      setState("success");
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch {
      setState("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }, [router]);

  const handleScan = useCallback((results: { rawValue: string }[]) => {
    if (state !== "scanning") return;
    const raw = results?.[0]?.rawValue;
    if (!raw) return;

    const centerId = extractCenterId(raw);
    if (!centerId) {
      setState("error");
      setMessage("This QR code is not a valid MSWD evacuation center code. Please try again.");
      return;
    }
    checkIn(centerId);
  }, [state, checkIn]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const centerId = extractCenterId(manualId.trim()) ?? manualId.trim();
    if (!centerId) { setMessage("Please enter a valid Center ID."); return; }
    checkIn(centerId);
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (state === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-10 px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Checked in!</h2>
          <p className="text-gray-500 mt-1 text-sm">
            You have been registered at <span className="font-semibold text-gray-700">{centerName}</span>.
          </p>
          <p className="text-xs text-gray-400 mt-3">Redirecting to dashboard in 3 seconds…</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-primary text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-10 px-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Check-in Failed</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-xs">{message}</p>
        </div>
        <button
          onClick={() => { setState("scanning"); setMessage(""); }}
          className="btn-primary text-sm"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-16 px-6">
        <div className="w-12 h-12 border-4 border-makati-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Checking you in…</p>
      </div>
    );
  }

  // ── Idle (start screen) ──────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-10 px-6">
        <div className="w-20 h-20 rounded-2xl bg-makati-blue/10 flex items-center justify-center">
          <QrCode className="w-10 h-10 text-makati-blue" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Evacuation Check-in</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-xs">
            Scan the QR code displayed at your evacuation center to register your presence.
          </p>
        </div>
        <button
          onClick={() => { setState("scanning"); setManualMode(false); }}
          className="btn-primary w-full max-w-xs"
        >
          <Camera className="w-5 h-5" />
          Open Camera & Scan
        </button>
        <button
          onClick={() => { setManualMode(true); setState("scanning"); }}
          className="flex items-center gap-2 text-sm text-makati-blue font-medium hover:underline"
        >
          <Keyboard className="w-4 h-4" />
          Enter Center Code Manually
        </button>
      </div>
    );
  }

  // ── Scanning state ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Back button */}
      <button
        onClick={() => { setState("idle"); setCameraError(false); setManualMode(false); }}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {manualMode || cameraError ? (
        /* Manual entry fallback */
        <div className="space-y-4">
          {cameraError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <CameraOff className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              Camera access was denied. Please enter the Center ID manually or allow camera access in your browser settings.
            </div>
          )}
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 mb-1">Enter Center ID</h2>
            <p className="text-sm text-gray-500 mb-4">
              Ask the MSWD staff at the evacuation center for the Center ID or the check-in URL.
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              {message && (
                <p className="text-sm text-red-600">{message}</p>
              )}
              <input
                className="input"
                placeholder="Paste Center ID or check-in URL here"
                value={manualId}
                onChange={(e) => { setManualId(e.target.value); setMessage(""); }}
                autoFocus
              />
              <button type="submit" className="btn-primary w-full">
                Check In
              </button>
            </form>
          </div>
          {!cameraError && (
            <button
              onClick={() => setManualMode(false)}
              className="flex items-center gap-2 text-sm text-makati-blue font-medium hover:underline"
            >
              <Camera className="w-4 h-4" /> Use Camera Instead
            </button>
          )}
        </div>
      ) : (
        /* Camera scanner */
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Point at QR Code</h2>
            <p className="text-sm text-gray-500 mt-1">
              Hold your camera steady over the QR code at the evacuation center.
            </p>
          </div>

          {/* Scanner viewport */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-makati-blue shadow-lg aspect-square max-w-sm mx-auto">
            <Scanner
              onScan={handleScan}
              onError={() => setCameraError(true)}
              constraints={{ facingMode: "environment" }}
              components={{ audio: false }}
              styles={{ container: { width: "100%", height: "100%" } }}
            />
            {/* Scanning frame overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 relative">
                <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-makati-blue rounded-tl-lg" />
                <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-makati-blue rounded-tr-lg" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-makati-blue rounded-bl-lg" />
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-makati-blue rounded-br-lg" />
              </div>
            </div>
          </div>

          <button
            onClick={() => { setManualMode(true); }}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-full"
          >
            <Keyboard className="w-4 h-4" />
            Can&apos;t scan? Enter code manually
          </button>
        </div>
      )}
    </div>
  );
}
