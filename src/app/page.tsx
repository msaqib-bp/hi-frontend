import {
  BarChart3,
  Building2,
  Clock,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { ReportForm } from "@/components/report-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const HOW_IT_WORKS = [
  {
    icon: Users,
    title: "You describe it",
    body: "Write what is wrong in your own words. No forms to decode, no category to guess, no account to create.",
  },
  {
    icon: Sparkles,
    title: "AI structures it",
    body: "The model reads your complaint, works out which service it belongs to, how urgent it is, and writes a one-line brief for the crew.",
  },
  {
    icon: Building2,
    title: "It reaches the right team",
    body: "It goes straight to the responsible department instead of sitting in a general inbox waiting to be sorted by hand.",
  },
  {
    icon: Clock,
    title: "You can follow it",
    body: "Your reference code shows the current status and every step taken, from received to resolved.",
  },
];

const PROBLEMS = [
  "Broken streetlights",
  "Overflowing bins",
  "Damaged roads",
  "Water leakage",
  "Blocked drains",
  "Unsafe public areas",
  "Power faults",
];

export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------------------- hero */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI-assisted civic complaint triage
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                Report a problem.
                <br />
                <span className="text-primary">We route it in seconds.</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Tell us what is wrong in plain language. The system works out which
                department owns it, how urgent it is, and sends it there — then gives you
                a code to follow what happens next.
              </p>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {PROBLEMS.map((problem) => (
                  <span
                    key={problem}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {problem}
                  </span>
                ))}
              </div>

              {/* Links styled as buttons rather than `<Button render={<Link/>}>`:
                  a navigation is an anchor, and this keeps middle-click and
                  open-in-new-tab working. */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/track"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Track an existing complaint
                </Link>
                <Link
                  href="/admin"
                  className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  See the service statistics
                </Link>
              </div>
            </div>

            <div id="report">
              <ReportForm />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- how it works */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            Reporting a civic problem usually means guessing which department to call.
            This removes the guessing.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ icon: Icon, title, body }, index) => (
            <Card key={title} className="relative">
              <CardContent className="pt-6">
                <span className="absolute right-4 top-4 text-4xl font-bold text-muted/60">
                  {index + 1}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- the model */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                What the AI does — and what it does not
              </h2>
              <p className="mt-4 text-muted-foreground">
                A classifier reads your complaint and predicts two things: which service
                category it belongs to, and how urgent it is. It also writes a short
                instruction for the field crew and checks whether the same problem has
                already been reported nearby.
              </p>
              <p className="mt-4 text-muted-foreground">
                It runs locally on the server in about ten milliseconds — no data is sent
                to a third party to classify your report.
              </p>
              <Link
                href="/admin/ai"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-6")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                See how the model performs
              </Link>
            </div>

            {/* Stating the limits on the public page, not buried in a report. A system
                that triages public-safety complaints should be candid about being
                fallible, because the reader is the person affected by the mistake. */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold">Honest limitations</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    <span>
                      <strong className="text-foreground">It can be wrong.</strong> Every
                      complaint is reviewed by staff, who can correct the category and
                      priority. Nothing is closed automatically.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    <span>
                      <strong className="text-foreground">It reads tone.</strong> Urgency
                      is inferred from how the complaint is written, so a calm report of a
                      serious problem may be under-rated. Say plainly if something is
                      dangerous.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    <span>
                      <strong className="text-foreground">English works best.</strong>{" "}
                      Complaints written mainly in other languages are classified less
                      reliably.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    <span>
                      <strong className="text-foreground">
                        It cannot verify anything.
                      </strong>{" "}
                      It sorts what you tell it; a crew still has to visit and check.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
