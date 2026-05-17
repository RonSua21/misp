"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn, UserPlus, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

const navLinks = [
  { label: "Home",          href: "/" },
  { label: "Services",      href: "/#services" },
  { label: "Requirements",  href: "/#requirements" },
  { label: "Announcements", href: "/#announcements" },
  { label: "About",         href: "/#about" },
];

export default function Navbar({ glass = false }: { glass?: boolean }) {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  if (glass) {
    return (
      <header className="sticky top-0 z-50">
        {/* Top government strip */}
        <div className="bg-makati-blue/70 backdrop-blur-sm border-b border-white/10 text-white/60 text-[10px] py-1 px-4 text-center tracking-[0.2em] uppercase font-medium">
          Republic of the Philippines &nbsp;·&nbsp; City of Makati &nbsp;·&nbsp; Official Portal of the Social Welfare and Development Department
        </div>

        {/* Main nav — full-width glass bg, content constrained inside */}
        <nav className="bg-white/10 backdrop-blur-2xl border-b border-white/10">
          <div className="container-max flex items-center justify-between h-16 px-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-colors duration-200">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-white text-sm leading-tight tracking-wide">MSWD</p>
                <p className="text-[10px] text-white/50 leading-tight tracking-[0.15em] uppercase">Makati City</p>
              </div>
            </Link>

            {/* Desktop nav links with gold underline on hover */}
            <ul className="hidden lg:flex items-center">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-150 group/link block"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover/link:w-3/4 bg-makati-gold rounded-full transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white active:scale-95 transition-all duration-150"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 bg-makati-gold text-makati-blue font-bold px-5 py-2 rounded-xl text-sm shadow-lg shadow-makati-gold/20 hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all duration-150"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white active:scale-95 transition-all duration-150"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </nav>

        {/* Mobile drawer */}
        {open && (
          <div className="lg:hidden bg-makati-blue/95 backdrop-blur-2xl border-t border-white/10 px-4 pb-5">
            <ul className="mt-3 space-y-0.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 bg-makati-gold text-makati-blue font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-yellow-400 transition-colors shadow-lg">
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-300">
      {/* Top government strip */}
      <div className="bg-makati-blue border-b-2 border-makati-gold text-white text-xs py-1.5 px-4 text-center tracking-wide">
        Republic of the Philippines &nbsp;·&nbsp; City of Makati &nbsp;·&nbsp; Official Portal of the Social Welfare and Development Department
      </div>

      <nav className="container-max flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-makati-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-makati-blue text-sm leading-tight">MSWD</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-tight">Integrated Services Portal</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 rounded-lg hover:bg-makati-blue-light dark:hover:bg-blue-900/30 hover:text-makati-blue dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA + theme toggle */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={toggle}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href="/login" className="btn-ghost text-sm py-2">
            <LogIn className="w-4 h-4" />
            Login
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2">
            <UserPlus className="w-4 h-4" />
            Register
          </Link>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="lg:hidden flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 transition-colors duration-300">
          <ul className="mt-2 space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 rounded-lg hover:bg-makati-blue-light dark:hover:bg-blue-900/30 hover:text-makati-blue dark:hover:text-blue-400 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" className="btn-secondary text-sm justify-center">
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link href="/register" className="btn-primary text-sm justify-center">
              <UserPlus className="w-4 h-4" />
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
