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
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/layout/NotificationBell";

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
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [profileExiting, setProfileExiting] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  function closeProfileMenu() {
    setProfileExiting(true);
    setTimeout(() => {
      setProfileOpen(false);
      setProfileExiting(false);
    }, 150);
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        closeProfileMenu();
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

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
  }

  const initials = userEmail.charAt(0).toUpperCase();
  const displayName = userEmail.split("@")[0];

  return (
    <>
      {/* ── Desktop top bar ───────────────────────────────── */}
      <div className="hidden md:flex fixed top-0 left-16 right-0 z-30 h-14 bg-white/10 backdrop-blur-2xl border-b border-white/10 items-center justify-end px-6 gap-2">
        <NotificationBell />

        {/* Profile button */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => profileOpen ? closeProfileMenu() : setProfileOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/15 active:scale-95 active:bg-white/20 transition-all duration-150"
          >
            <div className={`w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 transition-transform duration-200 ${profileOpen ? "scale-110" : ""}`}>
              <span className="text-white font-semibold text-xs">{initials}</span>
            </div>
            <span className="text-sm text-white/80 font-medium max-w-[140px] truncate">{displayName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile dropdown */}
          {(profileOpen || profileExiting) && (
            <div className={`${profileExiting ? "dropdown-exit" : "dropdown-enter"} absolute right-0 top-full mt-2 w-56 bg-white/25 backdrop-blur-[80px] rounded-2xl border border-white/30 shadow-2xl py-1 z-50`}>
              <div className="px-4 py-2.5 border-b border-white/10">
                <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                <p className="text-[11px] text-white/50 truncate">{userEmail}</p>
              </div>
              <Link
                href="/dashboard/profile"
                onClick={closeProfileMenu}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/20 hover:text-white active:bg-white/30 active:scale-[0.98] transition-all duration-150"
              >
                <User className="w-4 h-4 shrink-0 text-white/40 transition-colors" />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={closeProfileMenu}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/20 hover:text-white active:bg-white/30 active:scale-[0.98] transition-all duration-150"
              >
                <Settings className="w-4 h-4 shrink-0 text-white/40 transition-colors" />
                Settings
              </Link>
              <div className="border-t border-white/10 mt-1 pt-1">
                <button
                  onClick={() => { closeProfileMenu(); handleSignOut(); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/15 hover:text-red-200 active:bg-red-500/25 active:scale-[0.98] transition-all duration-150"
                >
                  <LogOut className="w-4 h-4 shrink-0 transition-colors" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside
        className="
          fixed inset-y-0 left-0 z-40 hidden md:flex flex-col
          w-16 hover:w-56
          bg-white/10 backdrop-blur-2xl
          border-r border-white/10
          transition-[width] duration-300 ease-in-out
          overflow-hidden scrollbar-none
          group
        "
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
              <p className="font-bold text-white text-sm leading-tight">MISP</p>
              <p className="text-[10px] text-white/50 leading-tight">Applicant Portal</p>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-hidden py-3 px-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`
                  flex items-center gap-3 px-2 py-2.5 rounded-xl
                  transition-all duration-200 active:scale-95
                  ${active
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
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
      </aside>

      {/* ── Mobile top bar ────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white/10 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <p className="font-bold text-white text-sm">MISP</p>
        </Link>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
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
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-makati-blue/90 backdrop-blur-2xl flex flex-col shadow-2xl border-r border-white/10">
            <div className="flex items-center justify-between h-14 px-4 border-b border-white/10">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-tight">MISP</p>
                  <p className="text-[10px] text-white/50 leading-tight">Applicant Portal</p>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${active
                        ? "bg-white/20 text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-white/10 space-y-1">
              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white font-semibold text-xs">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-white/40 truncate">{userEmail}</p>
                </div>
              </div>
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <User className="w-5 h-5 shrink-0" />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5 shrink-0" />
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
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
