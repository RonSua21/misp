"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

interface Program {
  id: string;
  name: string;
  category: string;
  description: string;
  requirements: string[];
  maxAmount?: number;
}

interface Props {
  userId: string;
  applicantName: string;
  applicantContact: string;
  applicantBarangay: string;
  residencyVerified: boolean;
  programs: Program[];
}

const CATEGORY_LABELS: Record<string, string> = {
  FINANCIAL_ASSISTANCE: "Financial Assistance",
  MEDICAL_ASSISTANCE:   "Medical Assistance",
  SENIOR_CITIZEN:       "Senior Citizen",
  PWD_ASSISTANCE:       "PWD Assistance",
};

export default function ApplyForm({
  userId,
  applicantName,
  applicantContact,
  applicantBarangay,
  residencyVerified,
  programs,
}: Props) {
  const router = useRouter();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [purpose, setPurpose] = useState("");
  const [amountRequested, setAmountRequested] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const valid: File[] = [];
    for (const f of Array.from(incoming)) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`File "${f.name}" is not allowed. Use JPG, PNG, or PDF.`);
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError(`File "${f.name}" exceeds the 5 MB size limit.`);
        return;
      }
      valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid]);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedProgram) { setError("Please select a benefit program."); return; }
    if (!purpose.trim()) { setError("Please describe the purpose of your application."); return; }
    if (!residencyVerified) { setError("Your residency must be verified before applying."); return; }

    setLoading(true);
    try {
      const supabase = createClient();

      // 1. Upload documents to Supabase Storage
      const uploadedUrls: { url: string; fileName: string; fileSize: number; mimeType: string }[] = [];
      for (const file of files) {
        const path = `documents/${userId}/${Date.now()}-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("misp-documents")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadErr) throw new Error(`Upload failed for ${file.name}: ${uploadErr.message}`);

        const { data: urlData } = supabase.storage.from("misp-documents").getPublicUrl(path);
        uploadedUrls.push({
          url: urlData.publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
      }

      // 2. Submit application via API
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          benefitProgramId: selectedProgram.id,
          applicantName,
          applicantContact,
          applicantBarangay,
          purpose: purpose.trim(),
          amountRequested: amountRequested ? parseFloat(amountRequested) : undefined,
          documents: uploadedUrls,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Submission failed.");
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/applications"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
        <p className="text-gray-500 text-sm">Redirecting to your applications...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Program selection */}
      <div>
        <label className="label">
          Benefit Program <span className="text-red-500">*</span>
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {programs.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProgram(p)}
              className={`text-left p-4 rounded-xl border-2 transition-all
                ${selectedProgram?.id === p.id
                  ? "border-makati-blue bg-makati-blue-light"
                  : "border-gray-200 hover:border-makati-blue/40 bg-white"
                }`}
            >
              <p className="font-semibold text-sm text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-500 mt-1">{CATEGORY_LABELS[p.category]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Show requirements when program selected */}
      {selectedProgram && (
        <div className="p-4 bg-makati-blue-light rounded-xl border border-makati-blue/20">
          <p className="text-xs font-semibold text-makati-blue uppercase tracking-wide mb-2">Required Documents</p>
          <ul className="space-y-1">
            {selectedProgram.requirements.map((r) => (
              <li key={r} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-makati-blue shrink-0" />
                {r}
              </li>
            ))}
          </ul>
          {selectedProgram.maxAmount && (
            <p className="mt-3 text-xs text-gray-500">
              Maximum assistance: <strong className="text-makati-blue">₱{selectedProgram.maxAmount.toLocaleString()}</strong>
            </p>
          )}
        </div>
      )}

      {/* Purpose */}
      <div>
        <label className="label">
          Purpose / Reason for Application <span className="text-red-500">*</span>
        </label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          rows={4}
          placeholder="Please describe your situation and why you are applying for this assistance..."
          className="input resize-none"
          required
        />
      </div>

      {/* Amount */}
      {selectedProgram?.maxAmount && (
        <Input
          label="Amount Requested (₱)"
          type="number"
          min="1"
          max={selectedProgram.maxAmount}
          step="0.01"
          placeholder={`Max ₱${selectedProgram.maxAmount.toLocaleString()}`}
          value={amountRequested}
          onChange={(e) => setAmountRequested(e.target.value)}
          hint={`Must not exceed ₱${selectedProgram.maxAmount.toLocaleString()}`}
        />
      )}

      {/* Document upload */}
      <div>
        <label className="label">Upload Documents</label>
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-makati-blue hover:bg-makati-blue-light/30 transition-all">
          <Upload className="w-8 h-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">Click to upload or drag & drop</p>
          <p className="text-xs text-gray-400">JPG, PNG, PDF — max 5 MB per file</p>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => addFiles(e.target.files)}
            className="sr-only"
          />
        </label>

        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-blue-600">
                      {f.name.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 truncate">{f.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={!residencyVerified}
        className="w-full"
      >
        Submit Application
      </Button>
    </form>
  );
}
