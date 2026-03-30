"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus, MapPin, X } from "lucide-react";

// TODO: Replace with real check from user profile once backend is wired up.
const isVerifiedMakatiCitizen = false;

interface Props {
  label: string;
  variant?: "primary" | "empty-state";
}

export default function NewApplicationButton({ label, variant = "primary" }: Props) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  function handleClick() {
    if (isVerifiedMakatiCitizen) {
      router.push("/dashboard/apply");
    } else {
      setShowModal(true);
    }
  }

  return (
    <>
      {variant === "primary" ? (
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 bg-makati-blue text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 active:scale-95 transition-all"
        >
          <FilePlus className="w-4 h-4" />
          {label}
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 bg-makati-blue text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-800 active:scale-95 transition-all mt-4"
        >
          {label}
        </button>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-makati-blue-light shrink-0">
                  <MapPin className="w-5 h-5 text-makati-blue" />
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 leading-tight">
                  Location Verification Required
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-600 leading-relaxed">
              You must verify your location as a Makati citizen before starting a new application.
              Please go to your profile and upload a valid proof of residency or government-issued ID.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => {
                  setShowModal(false);
                  router.push("/dashboard/profile");
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-makati-blue text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 active:scale-95 transition-all"
              >
                <MapPin className="w-4 h-4" />
                Verify Location
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-makati-blue text-sm font-semibold border border-makati-blue px-5 py-2.5 rounded-lg hover:bg-makati-blue-light active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
