import type { ApplicationStatus } from "@/types";

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING:      { label: "Pending",      className: "badge-pending" },
  UNDER_REVIEW: { label: "Under Review", className: "badge-review" },
  APPROVED:     { label: "Approved",     className: "badge-approved" },
  REJECTED:     { label: "Rejected",     className: "badge-rejected" },
  DISBURSED:    { label: "Disbursed",    className: "badge-disbursed" },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = statusConfig[status];
  return <span className={cfg.className}>{cfg.label}</span>;
}
