"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, LogIn, UserPlus } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Requirements", href: "/#requirements" },
  { label: "Announcements", href: "/#announcements" },
  { label: "About", href: "/#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top strip */}
      <div className="bg-makati-blue text-white text-xs py-1.5 px-4 text-center">
        Official website of the Makati Social Welfare Department (MSWD) — Makati City Government
      </div>

      <nav className="container-max flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-makati-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-makati-blue text-sm leading-tight">MSWD</p>
            <p className="text-xs text-gray-500 leading-tight">Integrated Services Portal</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-makati-blue-light hover:text-makati-blue transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-2">
          <Link href="/login" className="btn-ghost text-sm py-2">
            <LogIn className="w-4 h-4" />
            Login
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2">
            <UserPlus className="w-4 h-4" />
            Register
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <ul className="mt-2 space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-makati-blue-light hover:text-makati-blue transition-colors"
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
