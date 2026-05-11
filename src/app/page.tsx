import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Stethoscope,
  Users,
  Accessibility,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Phone,
  Clock,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Data ────────────────────────────────────────────────────────────────────

const services = [
  {
    icon: Heart,
    title: "Financial Assistance",
    description:
      "Emergency financial aid for Makati residents facing economic hardship, covering basic needs and livelihood support.",
    requirements: ["Valid ID", "Proof of Residency", "Income Certificate"],
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    border: "border-red-100 dark:border-red-900/40",
    linkColor: "text-red-600 dark:text-red-400",
  },
  {
    icon: Stethoscope,
    title: "Medical Assistance",
    description:
      "Support for hospitalization, medicines, and laboratory fees for qualified low-income Makati residents.",
    requirements: ["Valid ID", "Medical Certificate", "Hospital Statement"],
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900/40",
    linkColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Senior Citizen Benefits",
    description:
      "Monthly stipends, burial assistance, and social activities for senior citizens aged 60 and above.",
    requirements: ["Senior Citizen ID", "Proof of Residency", "Birth Certificate"],
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-900/40",
    linkColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Accessibility,
    title: "PWD Assistance",
    description:
      "Livelihood programs, assistive devices, and financial support for Persons with Disabilities in Makati.",
    requirements: ["PWD ID", "Medical Certificate", "Valid ID"],
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    border: "border-green-100 dark:border-green-900/40",
    linkColor: "text-green-600 dark:text-green-400",
  },
];

const steps = [
  {
    step: "01",
    title: "Create an Account",
    description: "Register using your valid email address and complete your resident profile.",
  },
  {
    step: "02",
    title: "Verify Your Residency",
    description: "Confirm your Makati City address using our built-in location verification.",
  },
  {
    step: "03",
    title: "Submit Application",
    description: "Choose a benefit program, fill out the form, and upload required documents.",
  },
  {
    step: "04",
    title: "Track Your Status",
    description: "Monitor your application in real-time — from Pending to Disbursed.",
  },
];

function formatResidents(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K+`;
  return `${n}`;
}

const announcements = [
  {
    date: "March 20, 2025",
    tag: "New Program",
    title: "Expanded Medical Assistance for Dialysis Patients",
    excerpt:
      "MSWD Makati now covers dialysis sessions for qualified beneficiaries. Apply online through MISP.",
  },
  {
    date: "March 15, 2025",
    tag: "Reminder",
    title: "Annual Re-validation of Senior Citizen Benefits",
    excerpt:
      "Senior citizens must re-validate their registration by April 30. Submit requirements via MISP.",
  },
  {
    date: "March 10, 2025",
    tag: "Advisory",
    title: "Updated PWD ID Application Requirements",
    excerpt:
      "New requirements now include a recent medical certificate from a licensed physician.",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

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
  const accuracyPct = totalDecided > 0
    ? `${Math.round(((approvedCount ?? 0) / totalDecided) * 100)}%`
    : "—";

  const stats = [
    { value: formatResidents(residentCount ?? 0), label: "Registered Residents" },
    { value: "4",          label: "Benefit Programs" },
    { value: accuracyPct,  label: "Application Accuracy" },
    { value: "24/7",       label: "Online Access" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-makati-blue overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full" />
        </div>

        <div className="container-max section relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure · Official · Makati City Government
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Social Welfare{" "}
              <span className="text-makati-gold">Services</span>{" "}
              Made Accessible
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Apply for financial, medical, senior citizen, and PWD assistance
              programs online — anytime, anywhere. The MSWD Integrated Services
              Portal serves every Makati City resident.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/register" className="btn-primary bg-makati-gold text-makati-blue hover:bg-yellow-400 text-base px-8 py-3">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#services" className="btn-secondary bg-transparent text-white border-white/50 hover:bg-white/10 text-base px-8 py-3">
                View Services
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              {["Data Privacy Act Compliant", "SSL Secured", "Gov-PH Verified"].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-blue-200 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-makati-gold" />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="container-max px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-makati-blue">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <section id="services" className="section bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="inline-block text-makati-blue dark:text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2">
              Our Programs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Available Social Services
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">
              MSWD Makati offers four assistance programs for qualified city residents.
              Select a program below to view eligibility and requirements.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc) => (
              <div
                key={svc.title}
                className={`card card-hover p-6 border ${svc.border} flex flex-col`}
              >
                <div className={`w-12 h-12 rounded-xl ${svc.iconBg} flex items-center justify-center mb-4`}>
                  <svc.icon className={`w-6 h-6 ${svc.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{svc.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed flex-1">{svc.description}</p>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                    Requirements
                  </p>
                  <ul className="space-y-1">
                    {svc.requirements.map((r) => (
                      <li key={r} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-300">
                        <ChevronRight className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/register"
                  className={`mt-5 text-sm font-semibold flex items-center gap-1 ${svc.linkColor} hover:underline`}
                >
                  Apply now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="section bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="inline-block text-makati-blue dark:text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              How to Apply in 4 Steps
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center text-center p-6">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+3rem)] right-[-3rem] h-px bg-makati-blue-light dark:bg-blue-900/50" />
                )}
                <div className="w-16 h-16 rounded-full bg-makati-blue flex items-center justify-center text-white font-extrabold text-xl mb-5 shadow-lg ring-4 ring-makati-blue-light dark:ring-blue-900/40">
                  {step.step}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/register" className="btn-primary text-base px-10 py-3">
              Start Your Application
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── RESIDENCY VERIFICATION CALLOUT ────────────────────────────────── */}
      <section className="section bg-blue-50 dark:bg-blue-950/30 border-y border-blue-100 dark:border-blue-900/40 transition-colors duration-300">
        <div className="container-max">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-makati-blue flex items-center justify-center shrink-0">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-xl font-bold text-makati-blue dark:text-blue-400 mb-2">
                Residency Verification — Makati City Only
              </h3>
              <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed max-w-2xl">
                All social services are exclusively for <strong className="text-gray-800 dark:text-white">Makati City residents</strong>. During
                registration, you will be asked to verify your home address using our integrated
                location tool. Your address must fall within the official boundaries of Makati City
                to be eligible for any MSWD benefit program.
              </p>
            </div>
            <Link href="/register" className="btn-primary shrink-0">
              Verify My Address
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ANNOUNCEMENTS ─────────────────────────────────────────────────── */}
      <section id="announcements" className="section bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="container-max">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-block text-makati-blue dark:text-blue-400 font-semibold text-sm uppercase tracking-wider mb-1">
                Latest Updates
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Announcements</h2>
            </div>
            <Link href="/announcements" className="btn-ghost text-sm hidden sm:flex">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((ann) => (
              <div key={ann.title} className="card card-hover p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge bg-makati-blue-light dark:bg-blue-900/40 text-makati-blue dark:text-blue-400">{ann.tag}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{ann.date}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 leading-snug">{ann.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{ann.excerpt}</p>
                <Link
                  href="/announcements"
                  className="mt-4 text-sm font-semibold text-makati-blue dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Read more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="section bg-makati-blue">
        <div className="container-max text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to Apply for Assistance?
          </h2>
          <p className="text-blue-200 text-lg max-w-xl mx-auto mb-8">
            Create your MISP account in minutes. No physical visits required for
            initial application submission.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register" className="btn-primary bg-makati-gold text-makati-blue hover:bg-yellow-400 text-base px-10 py-3">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary bg-transparent text-white border-white/50 hover:bg-white/10 text-base px-10 py-3">
              Sign In
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-makati-gold" />
              <span>(02) 8869-4000</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-makati-gold" />
              <span>Mon – Fri, 8:00 AM – 5:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-makati-gold" />
              <span>J.P. Rizal St., Makati City</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
