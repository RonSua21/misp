import { Resend } from "resend";
import type { ApplicationStatus } from "@/types";

const FROM = "MISP Makati <notifications@misp.makati.gov.ph>";

// ── Status copy ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { subject: string; headline: string; color: string; body: string }
> = {
  PENDING: {
    subject: "Application Received — MISP Makati",
    headline: "We received your application.",
    color: "#CA8A04",
    body: "Your application has been submitted and is now queued for review. We will notify you once a staff member begins processing it.",
  },
  UNDER_REVIEW: {
    subject: "Your Application is Under Review — MISP Makati",
    headline: "Your application is being reviewed.",
    color: "#2563EB",
    body: "An MSWD staff member has started reviewing your application. Please ensure your submitted documents are complete. You will be notified of the outcome shortly.",
  },
  APPROVED: {
    subject: "Application Approved — MISP Makati",
    headline: "Your application has been approved!",
    color: "#16A34A",
    body: "Congratulations! Your application has been approved. Please visit the MSWD Makati office to claim your assistance. Bring a valid ID and this notification.",
  },
  REJECTED: {
    subject: "Application Update — MISP Makati",
    headline: "Your application was not approved.",
    color: "#DC2626",
    body: "After careful review, your application did not meet the current eligibility requirements. You may visit the MSWD office for further assistance or re-apply after addressing the noted concerns.",
  },
  DISBURSED: {
    subject: "Assistance Disbursed — MISP Makati",
    headline: "Your assistance has been released.",
    color: "#7C3AED",
    body: "Your approved assistance has been successfully disbursed. Thank you for using the MSWD Integrated Services Portal. We hope this support makes a difference.",
  },
};

// ── HTML template ─────────────────────────────────────────────────────────────

function buildEmailHtml({
  firstName,
  referenceNumber,
  programName,
  status,
  remarks,
}: {
  firstName: string;
  referenceNumber: string;
  programName: string;
  status: ApplicationStatus;
  remarks?: string | null;
}): string {
  const cfg = STATUS_CONFIG[status];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#003DA5;padding:28px 32px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.3px;">
              MISP — MSWD Makati
            </p>
            <p style="margin:4px 0 0;color:#93C5FD;font-size:13px;">
              Makati Integrated Services Portal
            </p>
          </td>
        </tr>

        <!-- Status badge -->
        <tr>
          <td style="padding:28px 32px 0;">
            <span style="display:inline-block;background:${cfg.color}1A;color:${cfg.color};font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;border:1px solid ${cfg.color}40;text-transform:uppercase;letter-spacing:0.5px;">
              ${status.replace("_", " ")}
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:16px 32px 28px;">
            <h1 style="margin:12px 0 8px;font-size:22px;font-weight:800;color:#111827;line-height:1.3;">
              ${cfg.headline}
            </h1>
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
              Hi <strong>${firstName}</strong>, ${cfg.body}
            </p>

            <!-- Info card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFF;border:1px solid #DBEAFE;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
              <tr>
                <td style="padding:4px 0;">
                  <p style="margin:0;font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Reference Number</p>
                  <p style="margin:2px 0 0;font-size:15px;color:#003DA5;font-weight:700;font-family:monospace;">${referenceNumber}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0 4px;">
                  <p style="margin:0;font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Program</p>
                  <p style="margin:2px 0 0;font-size:15px;color:#111827;font-weight:600;">${programName}</p>
                </td>
              </tr>
            </table>

            ${remarks ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
              <tr>
                <td>
                  <p style="margin:0 0 4px;font-size:12px;color:#92400E;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Staff Remarks</p>
                  <p style="margin:0;font-size:14px;color:#78350F;line-height:1.5;">${remarks}</p>
                </td>
              </tr>
            </table>` : ""}

            <a href="http://localhost:3000/dashboard/applications"
               style="display:inline-block;background:#003DA5;color:#ffffff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
              View My Application →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
              This is an automated notification from the MSWD Makati Integrated Services Portal.<br />
              For concerns, visit the MSWD office at J.P. Rizal St., Makati City or call (02) 8869-4000.<br />
              Mon – Fri, 8:00 AM – 5:00 PM
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Public function ───────────────────────────────────────────────────────────

export async function sendStatusNotification({
  toEmail,
  firstName,
  referenceNumber,
  programName,
  status,
  remarks,
}: {
  toEmail: string;
  firstName: string;
  referenceNumber: string;
  programName: string;
  status: ApplicationStatus;
  remarks?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping notification.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const cfg = STATUS_CONFIG[status];

  const { error } = await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `${cfg.subject} [Ref: ${referenceNumber}]`,
    html: buildEmailHtml({ firstName, referenceNumber, programName, status, remarks }),
  });

  if (error) {
    console.error("[email] Failed to send status notification:", error);
  }
}
