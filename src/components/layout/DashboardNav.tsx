"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/layout/NotificationBell";

const navItems = [
  { href: "/dashboard",                    label: "Dashboard",       icon: LayoutDashboard },
  { href: "/dashboard/apply",              label: "Apply",           icon: FilePlus },
  { href: "/dashboard/applications",       label: "My Applications", icon: FileText },
  { href: "/dashboard/profile",            label: "Profile",         icon: User },
  { href: "/dashboard/evacuation/scan",    label: "Evacuation",      icon: ShieldAlert },
];

export default function DashboardNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="container-max flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-makati-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-makati-blue text-sm leading-tight">MISP</p>
            <p className="text-[10px] text-gray-400 leading-tight">Applicant Portal</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            const isEvacuation = href.includes("evacuation");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isEvacuation
                    ? active
                      ? "bg-red-100 text-red-700"
                      : "text-red-600 hover:bg-red-50"
                    : active
                    ? "bg-makati-blue-light text-makati-blue"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <NotificationBell />

          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-makati-blue-light flex items-center justify-center">
              <span className="text-makati-blue font-semibold text-xs">
                {userEmail.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-600 max-w-[140px] truncate">{userEmail}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="hidden md:flex items-center gap-1.5 btn-ghost text-sm text-gray-600 py-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <nav className="mt-2 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              const isEvacuation = href.includes("evacuation");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isEvacuation
                      ? active ? "bg-red-100 text-red-700" : "text-red-600 hover:bg-red-50"
                      : active ? "bg-makati-blue-light text-makati-blue" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleSignOut}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
