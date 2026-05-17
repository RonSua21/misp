import Link from "next/link";
import {
  ArrowRight, Heart, Stethoscope, Users, Accessibility,
  ShieldCheck, MapPin, CheckCircle2, ChevronRight, Phone, Clock,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createAdminClient } from "@/lib/supabase/admin";

const services = [
  {
    icon: Heart,
    title: "Financial Assistance",
    description: "Emergency financial aid for Makati residents facing economic hardship, covering basic needs and livelihood support.",
    requirements: ["Valid ID", "Proof of Residency", "Income Certificate"],
    iconBg: "bg-red-400/20",
    iconColor: "text-red-300",
  },
  {
    icon: Stethoscope,
    title: "Medical Assistance",
    description: "Support for hospitalization, medicines, and laboratory fees for qualified low-income Makati residents.",
    requirements: ["Valid ID", "Medical Certificate", "Hospital Statement"],
    iconBg: "bg-blue-400/20",
    iconColor: "text-blue-300",
  },
  {
    icon: Users,
    title: "Senior Citizen Benefits",
    description: "Monthly stipends, burial assistance, and social activities for senior citizens aged 60 and above.",
    requirements: ["Senior Citizen ID", "Proof of Residency", "Birth Certificate"],
    iconBg: "bg-amber-400/20",
    iconColor: "text-amber-300",
  },
  {
    icon: Accessibility,
    title: "PWD Assistance",
    description: "Livelihood programs, assistive devices, and financial support for Persons with Disabilities in Makati.",
    requirements: ["PWD ID", "Medical Certificate", "Valid ID"],
    iconBg: "bg-green-400/20",
    iconColor: "text-green-300",
  },
];

const steps = [
  { step: "01", title: "Create an Account", description: "Register using your valid email address and complete your resident profile." },
  { step: "02", title: "Verify Your Residency", description: "Confirm your Makati City address using our built-in location verification." },
  { step: "03", title: "Submit Application", description: "Choose a benefit program, fill out the form, and upload required documents." },
  { step: "04", title: "Track Your Status", description: "Monitor your application in real-time — from Pending to Disbursed." },
];

function formatResidents(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K+`;
  return `${n}`;
}

const announcements = [
  { date: "March 20, 2026", tag: "New Program",  title: "Expanded Medical Assistance for Dialysis Patients",   excerpt: "MSWD Makati now covers dialysis sessions for qualified beneficiaries. Apply online through MISP." },
  { date: "March 15, 2026", tag: "Reminder",     title: "Annual Re-validation of Senior Citizen Benefits",     excerpt: "Senior citizens must re-validate their registration by April 30. Submit requirements via MISP." },
  { date: "March 10, 2026", tag: "Advisory",     title: "Updated PWD ID Application Requirements",             excerpt: "New requirements now include a recent medical certificate from a licensed physician." },
];

export default async function LandingPage() {
  const db = createAdminClient();
  const [
    { count: residentCount },
    { count: approvedCount },
    { count: rejectedCount },
  ] = await Promise.all([
    db.from("users").select("id", { count: "exact", head: true }).eq("role", "REGISTERED_USER"),
    db.from("applications").select("id", { count: "exact", head: true }).in("status", ["APPROVED", "DISBURSED"]),
    db.from("applications").select("id", { count: "exact", head: true }).eq("status", "REJECTED"),
  ]);

  const totalDecided = (approvedCount ?? 0) + (rejectedCount ?? 0);
  const accuracyPct = totalDecided > 0 ? `${Math.round(((approvedCount ?? 0) / totalDecided) * 100)}%` : "—";

  const stats = [
    { value: formatResidents(residentCount ?? 0), label: "Registered Residents" },
    { value: "21",         label: "Benefit Programs" },
    { value: accuracyPct,  label: "Application Accuracy" },
    { value: "24/7",       label: "Online Access" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar glass />

      {/* ── FULL-PAGE BACKGROUND ─────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/makati-hall.jpg" alt="" aria-hidden className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-makati-blue/70" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative section">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">

            {/* Glass pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xl text-white/90 text-xs font-medium px-4 py-2 rounded-full mb-8 border border-white/25 shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-makati-gold" />
              Secure · Official · Makati City Government
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg">
              Social Welfare{" "}
              <span className="text-makati-gold">Services</span>{" "}
              Made Accessible
            </h1>

            <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Apply for financial, medical, senior citizen, and PWD assistance
              programs online — anytime, anywhere.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-10">
              <Link href="/register" className="inline-flex items-center gap-2 bg-makati-gold text-makati-blue font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:bg-yellow-400 hover:scale-105 transition-all duration-200">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#services" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xl text-white font-semibold px-8 py-3.5 rounded-2xl border border-white/25 shadow-lg hover:bg-white/25 transition-all duration-200">
                View Services
              </Link>
            </div>

            <div className="flex flex-wrap gap-5 justify-center">
              {["Data Privacy Act Compliant", "SSL Secured", "Gov-PH Verified"].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-white/70 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-makati-gold" />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="pb-8">
        <div className="container-max px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl px-4 py-6">
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-sm text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <section id="services" className="section">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="inline-block text-makati-gold font-semibold text-sm uppercase tracking-wider mb-2">Our Programs</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow">Available Social Services</h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto">
              MSWD Makati offers assistance programs for qualified city residents.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc) => (
              <div key={svc.title} className="flex flex-col bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl p-6 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl ${svc.iconBg} backdrop-blur flex items-center justify-center mb-4 border border-white/20`}>
                  <svc.icon className={`w-6 h-6 ${svc.iconColor}`} />
                </div>
                <h3 className="font-bold text-white mb-2">{svc.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed flex-1">{svc.description}</p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Requirements</p>
                  <ul className="space-y-1">
                    {svc.requirements.map((r) => (
                      <li key={r} className="flex items-center gap-1.5 text-xs text-white/70">
                        <ChevronRight className="w-3 h-3 text-makati-gold" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/register" className="mt-5 text-sm font-semibold flex items-center gap-1 text-makati-gold hover:text-yellow-300 transition-colors">
                  Apply now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="inline-block text-makati-gold font-semibold text-sm uppercase tracking-wider mb-2">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow">How to Apply in 4 Steps</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl p-6 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-makati-gold flex items-center justify-center text-makati-blue font-extrabold text-lg mb-4 shadow-lg">
                  {step.step}
                </div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/register" className="inline-flex items-center gap-2 bg-makati-gold text-makati-blue font-bold px-10 py-3.5 rounded-2xl shadow-xl hover:bg-yellow-400 hover:scale-105 transition-all duration-200">
              Start Your Application <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── RESIDENCY CALLOUT ─────────────────────────────────────────────── */}
      <section className="pb-8">
        <div className="container-max px-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl p-8 flex flex-col lg:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-makati-gold/20 backdrop-blur flex items-center justify-center shrink-0 border border-makati-gold/30">
              <MapPin className="w-7 h-7 text-makati-gold" />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-lg font-bold text-white mb-2">Residency Verification — Makati City Only</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                All social services are exclusively for <strong className="text-white">Makati City residents</strong>.
                Your address must fall within the official boundaries of Makati City to be eligible.
              </p>
            </div>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xl text-white font-semibold px-6 py-3 rounded-2xl border border-white/25 hover:bg-white/25 transition-all shrink-0">
              Verify My Address <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ANNOUNCEMENTS ─────────────────────────────────────────────────── */}
      <section id="announcements" className="section">
        <div className="container-max">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-block text-makati-gold font-semibold text-sm uppercase tracking-wider mb-1">Latest Updates</span>
              <h2 className="text-3xl font-extrabold text-white drop-shadow">Announcements</h2>
            </div>
            <Link href="/announcements" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {announcements.map((ann) => (
              <div key={ann.title} className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-xl p-6 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold bg-makati-gold/20 text-makati-gold px-3 py-1 rounded-full border border-makati-gold/30">{ann.tag}</span>
                  <span className="text-xs text-white/40">{ann.date}</span>
                </div>
                <h3 className="font-bold text-white mb-2 leading-snug">{ann.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{ann.excerpt}</p>
                <Link href="/announcements" className="mt-4 text-sm font-semibold text-makati-gold hover:text-yellow-300 flex items-center gap-1 transition-colors">
                  Read more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-max">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 drop-shadow">Ready to Apply for Assistance?</h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
              Create your MISP account in minutes. No physical visits required for initial application submission.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-10">
              <Link href="/register" className="inline-flex items-center gap-2 bg-makati-gold text-makati-blue font-bold px-10 py-3.5 rounded-2xl shadow-xl hover:bg-yellow-400 hover:scale-105 transition-all duration-200">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-xl text-white font-semibold px-10 py-3.5 rounded-2xl border border-white/25 hover:bg-white/25 transition-all duration-200">
                Sign In
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-white/50 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-makati-gold" /><span>(02) 8869-4000</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-makati-gold" /><span>Mon – Fri, 8:00 AM – 5:00 PM</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-makati-gold" /><span>J.P. Rizal St., Makati City</span></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
