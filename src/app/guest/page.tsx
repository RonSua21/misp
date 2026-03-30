import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  UserX, Heart, Stethoscope, Users, Accessibility,
  Phone, MapPin, Megaphone, ShieldCheck, Navigation,
  AlertTriangle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Guest Access — MISP" };

const HOTLINES = [
  { label: "MSWD Makati Hotline",      number: "(02) 8869-4000" },
  { label: "Makati Emergency (MDRRMO)", number: "(02) 8870-1300" },
  { label: "Philippine Red Cross",     number: "143" },
  { label: "National Emergency",       number: "911" },
];

const SERVICES = [
  {
    icon: Heart,
    title: "Financial Assistance",
    desc: "Emergency aid for Makati residents facing economic hardship.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Stethoscope,
    title: "Medical Assistance",
    desc: "Support for hospitalization and medicines for qualified residents.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Users,
    title: "Senior Citizen Benefits",
    desc: "Monthly stipends and burial assistance for seniors aged 60+.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Accessibility,
    title: "PWD Assistance",
    desc: "Livelihood programs and assistive devices for persons with disabilities.",
    color: "bg-green-100 text-green-600",
  },
];

export default async function GuestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = createAdminClient();

  // Fetch published announcements
  const { data: announcements } = await db
    .from("announcements")
    .select("id, title, content, publishedAt")
    .eq("isPublished", true)
    .order("publishedAt", { ascending: false })
    .limit(3);

  // Fetch open evacuation centers
  const { data: centers } = await db
    .from("evacuation_centers")
    .select("id, name, address, barangay, capacity, currentHeadcount, isOpen, contactPerson, contactNumber")
    .eq("isOpen", true)
    .order("createdAt", { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen flex flex-col bg-makati-gray">
      <Navbar />

      {/* ── Guest Banner ─────────────────────────────────────────────────── */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="container-max px-4 py-5">
          <div className="flex items-start gap-3">
            <UserX className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-800">Guest Access — Non-Makati Resident</p>
              <p className="text-amber-700 text-sm mt-0.5">
                MSWD benefit programs are restricted to <strong>Makati City residents</strong>.
                You can view public information below. If you believe this is an error,{" "}
                {user ? (
                  <Link href="/dashboard/profile#residency" className="underline font-semibold">
                    re-verify your address
                  </Link>
                ) : (
                  <Link href="/login" className="underline font-semibold">sign in</Link>
                )}{" "}to update your location.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 container-max px-4 py-10 space-y-12">

        {/* ── Available MSWD Services ──────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">MSWD Services</h2>
          <p className="text-gray-500 text-sm mb-6">
            The following programs are available to qualified Makati City residents.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((svc) => (
              <div key={svc.title} className="card p-5">
                <div className={`w-10 h-10 rounded-xl ${svc.color} flex items-center justify-center mb-3`}>
                  <svc.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{svc.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Emergency Hotlines ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
            <Phone className="w-6 h-6 text-makati-blue" />
            Emergency Hotlines
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {HOTLINES.map((h) => (
              <div key={h.label} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-makati-blue-light flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-makati-blue" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{h.label}</p>
                  <p className="text-makati-blue font-bold">{h.number}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Active Evacuation Centers ─────────────────────────────────────── */}
        {centers && centers.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-makati-blue" />
              Active Evacuation Centers
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Currently open shelters in Makati City.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {centers.map((center) => {
                const pct = Math.min(
                  Math.round((center.currentHeadcount / center.capacity) * 100),
                  100
                );
                const isFull = pct >= 100;
                return (
                  <div key={center.id} className="card p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{center.name}</h3>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isFull ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {isFull ? "FULL" : "OPEN"}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {center.address}, Brgy. {center.barangay}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Occupancy</span>
                        <span>{center.currentHeadcount}/{center.capacity}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full">
                        <div
                          className={`h-full rounded-full ${isFull ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-green-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    {center.contactNumber && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> {center.contactNumber}
                        {center.contactPerson && ` — ${center.contactPerson}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Announcements ─────────────────────────────────────────────────── */}
        {announcements && announcements.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-makati-blue" />
              Latest Announcements
            </h2>
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="card p-5">
                  <p className="text-xs text-gray-400 mb-1">
                    {ann.publishedAt
                      ? new Date(ann.publishedAt).toLocaleDateString("en-PH", {
                          year: "numeric", month: "long", day: "numeric",
                        })
                      : ""}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-1">{ann.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Info Banner ───────────────────────────────────────────────────── */}
        <section className="card p-6 bg-makati-blue-light border border-makati-blue/20">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-makati-blue shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-makati-blue mb-1">Are you a Makati City Resident?</h3>
              <p className="text-gray-600 text-sm mb-3">
                If you live in Makati City, register or sign in and verify your address to
                unlock access to all MSWD benefit programs.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-makati-blue text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Register as Resident
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 border border-makati-blue text-makati-blue text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-makati-blue/10 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
