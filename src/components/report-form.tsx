"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Copy, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AIResultCard } from "@/components/ai-result-card";
import { StatusBadge } from "@/components/complaint-badges";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api } from "@/lib/api";
import { formatRelative } from "@/lib/domain";
import type { ComplaintCreateResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

// Mirrors the backend's validation so users get feedback before a round trip. The
// backend still validates independently — this is convenience, not the security boundary.
const schema = z.object({
  description: z
    .string()
    .trim()
    .min(15, "Please describe the problem in a little more detail (15+ characters).")
    .max(5000, "That is too long — please keep it under 5000 characters."),
  location: z
    .string()
    .trim()
    .min(3, "Where is the problem? A street, landmark or ward helps us find it.")
    .max(255),
  reporter_name: z.string().trim().max(160).optional(),
  reporter_contact: z.string().trim().max(160).optional(),
});

type FormValues = z.infer<typeof schema>;

const EXAMPLES = [
  "There is a large water leak near the main road and traffic is becoming difficult.",
  "The streetlight outside our house has been off for two weeks and the lane is very dark.",
  "Garbage has not been collected from our lane for four days and it is starting to smell.",
];

export function ReportForm() {
  const [result, setResult] = useState<ComplaintCreateResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: "", location: "", reporter_name: "", reporter_contact: "" },
  });

  const description = watch("description") ?? "";

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.submitComplaint({
        description: values.description,
        location: values.location,
        reporter_name: values.reporter_name || undefined,
        reporter_contact: values.reporter_contact || undefined,
      }),
    onSuccess: (data) => {
      setResult(data);
      reset();
      toast.success(`Complaint ${data.complaint.reference_code} submitted`);
      // The result card renders above the form; scroll so it is visible on mobile.
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Could not submit your complaint.",
      );
    },
  });

  const copyReference = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Reference code copied");
    } catch {
      // Clipboard access is denied in some browsers/contexts; the code is on screen.
      toast.info(`Your reference is ${code}`);
    }
  };

  // ------------------------------------------------------------ success view
  if (result) {
    const { complaint, possible_duplicates: duplicates } = result;

    return (
      <div className="space-y-6">
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="text-lg">Complaint received</CardTitle>
            <CardDescription>
              Keep this reference code — you can use it to check progress at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded-lg border bg-background px-4 py-2 font-mono text-xl font-semibold tracking-wider">
                {complaint.reference_code}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyReference(complaint.reference_code)}
              >
                <Copy className="mr-2 h-3.5 w-3.5" />
                Copy
              </Button>
              <StatusBadge status={complaint.status} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/track?ref=${complaint.reference_code}`}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Track this complaint
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
              <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                Report another issue
              </Button>
            </div>
          </CardContent>
        </Card>

        {duplicates.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {duplicates.length} similar complaint
              {duplicates.length > 1 ? "s are" : " is"} already open
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Your report has still been recorded — more reports help us judge how
                widespread a problem is.
              </p>
              <ul className="space-y-1.5">
                {duplicates.map((duplicate) => (
                  <li key={duplicate.id} className="text-sm">
                    <span className="font-mono text-xs">{duplicate.reference_code}</span>{" "}
                    <span className="text-muted-foreground">
                      ({Math.round(duplicate.similarity * 100)}% similar,{" "}
                      {formatRelative(duplicate.created_at)})
                    </span>
                    <br />
                    <span className="line-clamp-1 text-muted-foreground">
                      {duplicate.description}
                    </span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <AIResultCard complaint={complaint} />
      </div>
    );
  }

  // --------------------------------------------------------------- form view
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report a problem</CardTitle>
        <CardDescription>
          Describe the issue in your own words. No account needed — you will get a
          reference code to track it.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="description">
              What is the problem? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="e.g. There is a large water leak near the main road and traffic is becoming difficult."
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
              {...register("description")}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              {errors.description ? (
                <p id="description-error" className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The more detail you give, the better we can route it.
                </p>
              )}
              <span className="text-xs tabular-nums text-muted-foreground">
                {description.length}/5000
              </span>
            </div>

            {/* Examples make the free-text field far less intimidating, and they
                double as one-click demo inputs. */}
            {!description && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-muted-foreground">Try:</span>
                {EXAMPLES.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setValue("description", example, { shouldValidate: true })
                    }
                    className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {example.slice(0, 34)}…
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Where is it? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g. MG Road, Ward 12 — or a nearby landmark"
              aria-invalid={!!errors.location}
              {...register("location")}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reporter_name">Your name (optional)</Label>
              <Input id="reporter_name" placeholder="Optional" {...register("reporter_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reporter_contact">Email or phone (optional)</Label>
              <Input
                id="reporter_contact"
                placeholder="For updates on progress"
                {...register("reporter_contact")}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analysing your complaint…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit complaint
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Your complaint is classified automatically and reviewed by municipal staff.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
