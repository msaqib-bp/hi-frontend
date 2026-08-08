import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CivicAI — Smarter Cities Start With Smarter Complaints",
    template: "%s · CivicAI",
  },
  description:
    "Report a local civic problem and let AI classify it, predict its priority and "
    + "summarise it for the right service team. Track progress with a reference code, "
    + "and see the statistics behind the service.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is required by next-themes: it sets the theme class on
    // <html> before React hydrates, which would otherwise be flagged as a mismatch.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Scroll-reveal blocks are server-rendered hidden so they do not flash on
            hydration. Without JavaScript nothing would ever reveal them, so release
            them here instead. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: "[data-reveal]{opacity:1!important;transform:none!important}",
            }}
          />
        </noscript>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
