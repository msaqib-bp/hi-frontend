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
 * Sign-in details offered on the page so a judge can get in without being handed
 * credentials out of band.
 *
 * Read from the environment rather than written here because this repository is public,
 * and a working admin password committed to it stays in the git history permanently —
 * long after the deployment it belonged to is gone. Set `NEXT_PUBLIC_DEMO_PASSWORD` in
 * the hosting dashboard and rebuild.
 *
 * With no password configured the panel is hidden entirely. That is deliberate: the
 * previous version printed a hard-coded password that stopped being the real one the
 * moment `ADMIN_PASSWORD` was changed on the server, so it confidently told everyone the
 * wrong thing. Showing nothing is better than showing a credential that does not work.
 */
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "admin@civic.gov";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";

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
