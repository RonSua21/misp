import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

async function main() {
  console.log("Seeding notifications...\n");

  // Get all admin/super-admin users
  const { data: admins } = await supabase
    .from("users")
    .select("id")
    .in("role", ["ADMIN", "SUPER_ADMIN"]);

  // Get all registered users
  const { data: residents } = await supabase
    .from("users")
    .select("id, firstName, lastName")
    .eq("role", "REGISTERED_USER")
    .limit(10);

  // Get some applications for reference
  const { data: apps } = await supabase
    .from("applications")
    .select("id, referenceNumber, applicantName, userId")
    .limit(10);

  if (!admins?.length || !residents?.length) {
    console.error("No users found. Run main seed first.");
    return;
  }

  // Clear existing notifications
  await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const rows: any[] = [];

  // --- Notifications FOR admins (new application submissions) ---
  const adminMessages = [
    { title: "New Application Submitted", message: `${apps?.[0]?.applicantName ?? "Maria Santos"} submitted application ${apps?.[0]?.referenceNumber ?? "REF-2026-001"} — awaiting review.`, hoursAgo: 1 },
    { title: "New Application Submitted", message: `${apps?.[1]?.applicantName ?? "Jose Reyes"} submitted application ${apps?.[1]?.referenceNumber ?? "REF-2026-002"} — awaiting review.`, hoursAgo: 3 },
    { title: "New Application Submitted", message: `${apps?.[2]?.applicantName ?? "Ana Garcia"} submitted application ${apps?.[2]?.referenceNumber ?? "REF-2026-003"} — awaiting review.`, hoursAgo: 6 },
    { title: "New Application Submitted", message: `${apps?.[3]?.applicantName ?? "Carlo Mendoza"} submitted application ${apps?.[3]?.referenceNumber ?? "REF-2026-004"} — awaiting review.`, hoursAgo: 24 },
    { title: "New Application Submitted", message: `${apps?.[4]?.applicantName ?? "Rosa Flores"} submitted application ${apps?.[4]?.referenceNumber ?? "REF-2026-005"} — awaiting review.`, hoursAgo: 48 },
  ];

  for (const admin of admins) {
    for (const msg of adminMessages) {
      rows.push({
        id:        randomUUID(),
        userId:    admin.id,
        title:     msg.title,
        message:   msg.message,
        type:      "APPLICATION_UPDATE",
        isRead:    msg.hoursAgo > 24,
        createdAt: hoursAgo(msg.hoursAgo),
      });
    }
  }

  // --- Notifications FOR all users (residents + any role on resident portal) ---
  const { data: allUsers } = await supabase
    .from("users")
    .select("id");

  const residentNotifTemplates = [
    { title: "Application Status Updated", message: "Your application has been received and is now under review by our staff." },
    { title: "Application Approved", message: "Congratulations! Your application has been approved. Please visit the MSWD office to claim your assistance." },
    { title: "New Announcement", message: "MSWD Makati has posted a new announcement. Please check the announcements section for details." },
    { title: "Appointment Confirmed", message: "Your appointment has been confirmed. Please be at the MSWD office on your scheduled date and time." },
    { title: "Document Required", message: "Additional documents are required for your application. Please visit the MSWD office at your earliest convenience." },
  ];

  for (const u of allUsers ?? []) {
    // Pick 2-3 random notifications per user
    const count = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...residentNotifTemplates].sort(() => Math.random() - 0.5).slice(0, count);
    shuffled.forEach((t, i) => {
      rows.push({
        id:        randomUUID(),
        userId:    u.id,
        title:     t.title,
        message:   t.message,
        type:      "APPLICATION_UPDATE" as const,
        isRead:    i > 0,
        createdAt: hoursAgo(Math.floor(Math.random() * 72) + 1),
      });
    });
  }

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) { console.error("ERROR:", error.message); return; }

  console.log(`✓ ${rows.length} notifications created`);
  console.log(`  - ${adminMessages.length * admins.length} for admin users`);
  console.log(`  - ${(apps ?? []).length} for resident users`);
}

main().catch(console.error);
