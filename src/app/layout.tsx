import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "MISP — Makati Integrated Services Portal",
  description:
    "The official digital platform of the Makati Social Welfare Department for processing Social Services assistance applications.",
  keywords: ["MSWD", "Makati", "social welfare", "PWD", "senior citizen", "financial assistance"],
  openGraph: {
    title: "MISP — Makati Integrated Services Portal",
    description: "Apply for social welfare services online — MSWD Makati City",
    siteName: "MISP",
    locale: "en_PH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-clip">
      <body className="overflow-x-clip">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
