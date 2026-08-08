"use client";

import {
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";

import { CivicLogo } from "@/components/civic-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Section links are absolute (`/#how-it-works`) rather than bare hashes so they work
 * from `/track` and `/admin` too — the browser navigates home, then scrolls.
 */
const SECTION_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#ai", label: "AI Features" },
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
];

/** The same focus treatment the buttons use, so tabbing looks like one system. */
const FOCUS_RING =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-0";

/** Real routes, kept out of the crowded desktop bar but always one tap away. */
const APP_LINKS = [
  { href: "/track", label: "Track a complaint", icon: Search },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
];

/** `false` during SSR and the first client render, `true` afterwards. */
const NO_SUBSCRIBE = () => () => {};

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // The server cannot know the user's theme, so rendering the real icon before hydration
  // causes a mismatch. Render a placeholder of the same size until then.
  const mounted = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => true,
    () => false,
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </Button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The header sits on the hero's tinted wash; it only earns a border and a shadow
  // once there is content scrolled underneath it. Read from the scroll position
  // directly rather than mirroring it into state — there is nothing to keep in sync.
  const scrolled = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    },
    () => window.scrollY > 8,
    () => false,
  );

  const isRouteActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-shadow duration-300",
        "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65",
        scrolled ? "border-b shadow-sm" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 rounded-lg font-semibold tracking-tight",
            FOCUS_RING,
          )}
        >
          <CivicLogo className="h-9 w-9" />
          <span className="text-lg">
            Civic<span className="text-brand">AI</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
          {SECTION_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                FOCUS_RING,
                href === "/" && isRouteActive(href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {label}
            </Link>
          ))}
          <span className="mx-1.5 h-5 w-px bg-border" aria-hidden />
          {APP_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                FOCUS_RING,
                isRouteActive(href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-3">
          <ThemeToggle />

          {/* Links styled as buttons rather than `<Button render={<Link/>}>`: a
              navigation is an anchor, and this keeps middle-click and
              open-in-new-tab working. */}
          <Link
            href="/#report"
            className={cn(
              buttonVariants({ size: "lg" }),
              "hidden h-10 px-4 shadow-sm sm:inline-flex",
            )}
          >
            Report a Problem
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[17rem]">
              <SheetTitle className="flex items-center gap-2.5 px-4 pt-4">
                <CivicLogo className="h-8 w-8" />
                <span>
                  Civic<span className="text-brand">AI</span>
                </span>
              </SheetTitle>

              <nav className="mt-5 flex flex-col gap-0.5 px-3">
                {SECTION_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      FOCUS_RING,
                    )}
                  >
                    {label}
                  </Link>
                ))}

                <span className="my-2 h-px bg-border" aria-hidden />

                {APP_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      FOCUS_RING,
                      isRouteActive(href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}

                <Link
                  href="/#report"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ size: "lg" }), "mt-4 h-10")}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Report a Problem
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
