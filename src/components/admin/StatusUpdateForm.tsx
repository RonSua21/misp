"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationStatus } from "@/types";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "PENDING",      label: "Pending",      color: "text-yellow-700" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "text-blue-700" },
  { value: "APPROVED",     label: "Approved",     color: "text-green-700" },
  { value: "DISBURSED",    label: "Disbursed",    color: "text-purple-700" },
  { value: "REJECTED",     label: "Rejected",     color: "text-red-700" },
];

export default function StatusUpdateForm({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === currentStatus && !remarks.trim()) {
      setError("Change the status or add a remark before saving.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch(`/api/admin/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, remarks: remarks.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to update. Please try again.");
    } else {
      setSuccess(true);
      setRemarks("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Status dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Update Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-makati-blue"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Remarks / Notes
          <span className="font-normal text-gray-400 ml-1">(optional)</span>
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          placeholder="Add remarks visible to the applicant..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-makati-blue resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          Application status updated successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-makati-blue text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
