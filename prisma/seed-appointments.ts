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

const SERVICE_TYPES = [
  "CASE_CONSULTATION", "CERTIFICATE_REQUEST", "FINANCIAL_INQUIRY",
  "SOLO_PARENT", "PWD_ASSESSMENT", "GENERAL_INQUIRY",
];
const TIMES = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
               "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"];
const STATUSES = [
  ...Array(10).fill("PENDING"),
  ...Array(15).fill("CONFIRMED"),
  ...Array(20).fill("COMPLETED"),
  ...Array(5).fill("CANCELLED"),
  ...Array(5).fill("NO_SHOW"),
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randomDateBetween(start: Date, end: Date): string {
  const ms = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ms).toISOString().slice(0, 10);
}

async function main() {
  console.log("Seeding appointments...\n");

  // Get all registered users
  const { data: users } = await supabase
    .from("users")
    .select("id")
    .eq("role", "REGISTERED_USER");

  if (!users || users.length === 0) {
    console.error("No registered users found. Run the main seed first.");
    return;
  }

  // Clear existing appointments
  await supabase.from("appointments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("Cleared existing appointments.\n");

  const start = new Date("2026-03-01");
  const end   = new Date(); // today

  const records = [];
  for (let i = 0; i < 55; i++) {
    const date   = randomDateBetween(start, end);
    const status = STATUSES[i % STATUSES.length];
    const userId = pick(users).id;

    records.push({
      id:           randomUUID(),
      userId,
      serviceType:  pick(SERVICE_TYPES),
      preferredDate: date,
      preferredTime: pick(TIMES),
      status,
      notes:        i % 3 === 0 ? "Please bring valid ID and supporting documents." : null,
      isWalkIn:     i % 5 === 0,
      queueNumber:  `Q-${String(i + 1).padStart(3, "0")}`,
      confirmedAt:  status !== "PENDING" ? new Date(date + "T" + pick(TIMES)).toISOString() : null,
      completedAt:  status === "COMPLETED" ? new Date(date + "T15:00:00").toISOString() : null,
      cancelledAt:  status === "CANCELLED" ? new Date(date + "T10:00:00").toISOString() : null,
      createdAt:    new Date(date + "T07:00:00").toISOString(),
      updatedAt:    new Date().toISOString(),
    });
  }

  const { error } = await supabase.from("appointments").insert(records);
  if (error) { console.error("ERROR:", error.message); return; }

  console.log(`✓ ${records.length} appointments created`);
  console.log("Date range: March 1, 2026 – today");
}

main().catch(console.error);
