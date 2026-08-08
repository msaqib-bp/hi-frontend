import Link from "next/link";

import { CivicLogo } from "@/components/civic-logo";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/#report", label: "Report a Problem" },
      { href: "/admin", label: "Dashboard" },
      { href: "/#ai", label: "AI Features" },
      { href: "/#how-it-works", label: "How It Works" },
    ],
  },
  {
    title: "Information",
    links: [
      { href: "/#about", label: "About" },
      { href: "/privacy", label: "Privacy" },
      { href: "/privacy#contact", label: "Contact" },
      { href: "/track", label: "Track a complaint" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex w-fit items-center gap-2.5 font-semibold">
              <CivicLogo className="h-9 w-9" />
              <span className="text-lg tracking-tight">
                Civic<span className="text-brand">AI</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              AI-powered civic services for smarter complaint management and better
              decisions.
            </p>
          </div>

          {COLUMNS.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h2 className="text-sm font-semibold">{title}</h2>
              <ul className="mt-4 space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CivicAI. Smart Civic Services.</p>
          <p>
            Complaints are classified and prioritised automatically, then reviewed by
            municipal staff.
          </p>
        </div>
      </div>
    </footer>
  );
}
