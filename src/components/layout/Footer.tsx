import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-makati-blue text-white">
      <div className="container-max section">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">MSWD</p>
                <p className="text-blue-200 text-sm">Makati Integrated Services Portal</p>
              </div>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
              The Makati Social Welfare Department provides social protection and
              welfare services to the residents of Makati City.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.facebook.com/MakatiCityGovernment"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-200 mb-4">
              Services
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Financial Assistance",
                "Medical Assistance",
                "Senior Citizen Benefits",
                "PWD Assistance",
                "Track Application",
              ].map((s) => (
                <li key={s}>
                  <Link href="/#services" className="text-blue-100 hover:text-white transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-200 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-blue-100">
              <li className="flex gap-2 items-start">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-makati-gold" />
                <span>J.P. Rizal Street, Makati City, Metro Manila</span>
              </li>
              <li className="flex gap-2 items-center">
                <Phone className="w-4 h-4 shrink-0 text-makati-gold" />
                <span>(02) 8869-4000</span>
              </li>
              <li className="flex gap-2 items-center">
                <Mail className="w-4 h-4 shrink-0 text-makati-gold" />
                <a href="mailto:mswd@makati.gov.ph" className="hover:text-white transition-colors">
                  mswd@makati.gov.ph
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-blue-200">
          <p>© {new Date().getFullYear()} Makati Social Welfare Department. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
