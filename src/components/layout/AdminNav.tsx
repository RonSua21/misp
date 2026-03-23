"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  ShieldCheck,
  LogOut,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// SUPER_ADMIN sees everything; ADMIN (coordinator) only sees Overview + Applications
const superAdminNav = [
  { href: "/admin",               label: "Overview",      icon: LayoutDashboard },
  { href: "/admin/applications",  label: "Applications",  icon: FileText },
  { href: "/admin/users",         label: "Users",         icon: Users },
  { href: "/admin/programs",      label: "Programs",      icon: ShieldCheck },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

const coordinatorNav = [
  { href: "/admin",              label: "Overview",     icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: FileText },
];

export default function AdminNav({
  adminName,
  adminEmail,
  role,
  barangay,
}: {
  adminName: string;
  adminEmail: string;
  role: string;
  barangay: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isSuperAdmin = role === "SUPER_ADMIN";
  const navItems = isSuperAdmin ? superAdminNav : coordinatorNav;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="bg-makati-blue text-white sticky top-0 z-40 shadow-md">
      <div className="container-max flex items-center justify-between h-16 px-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <span className="font-bold text-sm">M</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-sm leading-tight">MISP Admin</p>
            <p className="text-[10px] text-blue-200 leading-tight">
              {isSuperAdmin ? "MSWD Staff Portal" : "Barangay Coordinator Portal"}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${active ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10"}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + sign out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-white">{adminName}</p>
            <div className="flex items-center justify-end gap-1">
              {isSuperAdmin ? (
                <span className="text-[10px] text-yellow-300 font-medium">Super Admin</span>
              ) : (
                <span className="flex items-center gap-0.5 text-[10px] text-blue-200">
                  <MapPin className="w-2.5 h-2.5" />
                  {barangay ? `Brgy. ${barangay}` : "Coordinator"}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-100 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
