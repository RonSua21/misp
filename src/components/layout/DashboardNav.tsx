"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Award,
  CalendarDays,
  Briefcase,
  Sun,
  Moon,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/layout/NotificationBell";
import { useTheme } from "@/components/providers/ThemeProvider";

const navItems = [
  { href: "/dashboard",              label: "Dashboard",       icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "My Applications", icon: FileText },
  { href: "/dashboard/certificates", label: "Certificates",    icon: Award },
  { href: "/dashboard/appointments", label: "Appointments",    icon: CalendarDays },
  { href: "/dashboard/cases",        label: "My Cases",        icon: Briefcase },
];

export default function DashboardNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile popup on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [profileOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop top bar ───────────────────────────────── */}
      <div className="hidden md:flex fixed top-0 left-16 right-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 items-center justify-end px-6 gap-2 transition-colors duration-300">
        <button
          onClick={toggle}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <NotificationBell />
      </div>

      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside className="
        fixed inset-y-0 left-0 z-40 hidden md:flex flex-col
        w-16 hover:w-56
        bg-white dark:bg-slate-900
        border-r border-gray-100 dark:border-slate-800
        shadow-sm
        transition-[width] duration-300 ease-in-out
        overflow-hidden scrollbar-none
        group
      ">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-makati-blue flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
              <p className="font-bold text-makati-blue text-sm leading-tight">MISP</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-tight">Applicant Portal</p>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-hidden py-3 px-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`
                  flex items-center gap-3 px-2 py-2.5 rounded-lg
                  transition-colors duration-150
                  ${active
                    ? "bg-makati-blue-light dark:bg-blue-900/40 text-makati-blue dark:text-blue-400"
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-sm font-medium">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Profile button at bottom */}
        <div className="shrink-0 border-t border-gray-100 dark:border-slate-800 py-2 px-2">
          <button
            onClick={() => setProfileOpen(p => !p)}
            title="Account"
            className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-makati-blue-light dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <span className="text-makati-blue dark:text-blue-400 font-semibold text-xs">
                {userEmail.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-xs text-gray-500 dark:text-slate-400 max-w-[140px] truncate">
              {userEmail}
            </span>
          </button>
        </div>
      </aside>

      {/* ── Profile popup (fixed to avoid sidebar overflow-hidden clipping) ── */}
      {profileOpen && (
        <div ref={profileRef} className="hidden md:block fixed bottom-[68px] left-2 z-50 w-56 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-xl py-1">
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {userEmail.split("@")[0]}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">{userEmail}</p>
          </div>
          <Link
            href="/dashboard/profile"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors"
          >
            <User className="w-4 h-4 shrink-0 text-gray-400 dark:text-slate-500" />
            Profile
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/60 transition-colors"
          >
            <Settings className="w-4 h-4 shrink-0 text-gray-400 dark:text-slate-500" />
            Settings
          </Link>
          <div className="border-t border-gray-100 dark:border-slate-700 mt-1 pt-1">
            <button
              onClick={() => { setProfileOpen(false); handleSignOut(); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile top bar ────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 transition-colors duration-300">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-makati-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <p className="font-bold text-makati-blue text-sm">MISP</p>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 flex flex-col shadow-2xl transition-colors duration-300">
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 dark:border-slate-800">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-8 h-8 rounded-full bg-makati-blue flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <p className="font-bold text-makati-blue text-sm leading-tight">MISP</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-tight">Applicant Portal</p>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${active
                        ? "bg-makati-blue-light dark:bg-blue-900/40 text-makati-blue dark:text-blue-400"
                        : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
              <p className="px-3 py-1 text-xs text-gray-400 dark:text-slate-500 truncate">{userEmail}</p>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-5 h-5 shrink-0" />
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
