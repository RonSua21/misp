"use server";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "APPLICATION_UPDATE"
  | "ANNOUNCEMENT"
  | "DISASTER_ALERT";

/**
 * Creates a single targeted notification for one user.
 * Call this from API routes, server actions, or other server-side logic.
 *
 * Example — plug into application approval:
 *   await createNotification({
 *     userId: application.userId,
 *     title: "Application Approved",
 *     message: `Your application ${ref} has been approved.`,
 *     type: "APPLICATION_UPDATE",
 *   });
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
}: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}) {
  const db = createAdminClient();
  const { error } = await db.from("notifications").insert({
    id: crypto.randomUUID(),
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  if (error) console.error("[createNotification]", error);
}

/**
 * Sends a notification to ALL active admin and super-admin users.
 * Used by resident-facing actions (application submit, etc.) to alert staff.
 *
 * @param excludeUserId - optional app-level user id to skip (e.g. the actor themselves)
 */
export async function notifyAdmins({
  title,
  message,
  type,
  excludeUserId,
}: {
  title: string;
  message: string;
  type: NotificationType;
  excludeUserId?: string;
}) {
  const db = createAdminClient();

  let query = db
    .from("users")
    .select("id")
    .in("role", ["ADMIN", "SUPER_ADMIN"])
    .eq("isActive", true);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data: admins } = await query;
  if (!admins || admins.length === 0) return;

  const now = new Date().toISOString();
  const rows = admins.map((a) => ({
    id: crypto.randomUUID(),
    userId: a.id,
    title,
    message,
    type,
    isRead: false,
    createdAt: now,
  }));

  const { error } = await db.from("notifications").insert(rows);
  if (error) console.error("[notifyAdmins]", error);
}
