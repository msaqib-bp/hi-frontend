"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyRound, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, api } from "@/lib/api";

/**
 * Sign-in details printed on the page so a judge can get in without being handed
 * credentials out of band.
 *
 * These are the live account's real credentials, deliberately committed so the panel
 * works with no configuration — this deployment exists to be walked into by strangers,
 * and an unlisted password defeats that. The account is a demo administrator over
 * seeded data; it holds nothing that matters.
 *
 * Two consequences worth being explicit about, since this repository is public:
 * the password is in the git history permanently and rotating it later will not remove
 * it, and it must stay in step with `ADMIN_PASSWORD` on the API or this panel tells
 * every visitor something that does not work. `NEXT_PUBLIC_DEMO_PASSWORD` overrides it
 * without a code change; setting that variable to an empty string hides the panel.
 */
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "admin@civic.gov";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "Saqib##1";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.login(email, password),
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.user.full_name}`);
      router.replace("/admin");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Could not sign in.",
      );
    },
  });

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle>Staff sign in</CardTitle>
          <CardDescription>
            For municipal administrators. Citizens do not need an account to report or
            track a complaint.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@civic.gov"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign in
            </Button>
          </form>

          {/* Shown because this is a hackathon deployment judges need to get into.
              A real deployment would not print these. */}
          {DEMO_PASSWORD ? (
            <div className="mt-5 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Demo credentials</p>
              <p className="mt-1 font-mono break-all">
                {DEMO_EMAIL} / {DEMO_PASSWORD}
              </p>
              <button
                type="button"
                className="mt-2 underline underline-offset-2 hover:text-foreground"
                onClick={() => {
                  setEmail(DEMO_EMAIL);
                  setPassword(DEMO_PASSWORD);
                }}
              >
                Fill them in
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
