"use client";

import { BarChart3, ListChecks, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { href: "/admin/complaints", label: "Complaints", icon: ListChecks },
  { href: "/admin/ai", label: "AI & Assistant", icon: Sparkles },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // The login page lives under /admin but must not be wrapped by the guard, or it
  // would redirect to itself forever.
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <AdminGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Service dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage complaints and review the service statistics.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              api.logout();
              router.replace("/admin/login");
            }}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>

        <nav className="mb-6 flex gap-1 overflow-x-auto border-b">
          {TABS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </AdminGuard>
  );
}
