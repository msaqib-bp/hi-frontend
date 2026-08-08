"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bot,
  CheckCircle2,
  Cpu,
  Loader2,
  MinusCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/domain";
import type { AssistantResponse } from "@/lib/types";

export default function AIPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AssistantResponse | null>(null);

  const status = useQuery({ queryKey: ["ai-status"], queryFn: () => api.aiStatus() });

  const ask = useMutation({
    mutationFn: (value: string) => api.askAssistant(value),
    onSuccess: (data) => setAnswer(data),
  });

  const submit = (value: string) => {
    if (!value.trim()) return;
    setQuestion(value);
    ask.mutate(value);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ------------------------------------------------------ engine status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="h-4 w-4" />
            AI engine status
          </CardTitle>
          <CardDescription>
            What is running right now, and how well it performs.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status.isLoading && <Skeleton className="h-40" />}

          {status.data && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    {status.data.ml_available ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <MinusCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">Local ML models</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {status.data.ml_available
                      ? "Loaded and serving predictions"
                      : "Not loaded"}
                  </p>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    {status.data.llm_available ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <MinusCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">Claude (optional)</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {status.data.llm_available
                      ? "Enabled — writing dispatch summaries"
                      : "Not configured — everything still works"}
                  </p>
                </div>
              </div>

              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-3 border-b py-1.5">
                  <dt className="text-muted-foreground">Active engine</dt>
                  <dd className="font-mono text-xs">{status.data.active_engine}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b py-1.5">
                  <dt className="text-muted-foreground">Model version</dt>
                  <dd className="font-mono text-xs">{status.data.model_version}</dd>
                </div>
                {status.data.trained_at && (
                  <div className="flex justify-between gap-3 border-b py-1.5">
                    <dt className="text-muted-foreground">Trained</dt>
                    <dd className="text-xs">
                      {formatDateTime(status.data.trained_at)}
                    </dd>
                  </div>
                )}
                {status.data.training_samples && (
                  <div className="flex justify-between gap-3 border-b py-1.5">
                    <dt className="text-muted-foreground">Training samples</dt>
                    <dd className="tabular-nums">
                      {status.data.training_samples.toLocaleString()}
                    </dd>
                  </div>
                )}
                {status.data.macro_f1 !== null && (
                  <div className="flex justify-between gap-3 border-b py-1.5">
                    <dt className="text-muted-foreground">
                      Macro F1 (unseen phrasings)
                    </dt>
                    <dd className="tabular-nums">
                      {status.data.macro_f1.toFixed(3)}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Categories the model can predict
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {status.data.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <ul className="space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                {status.data.notes.map((note, index) => (
                  <li key={index} className="flex gap-1.5">
                    <span aria-hidden>·</span>
                    {note}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {/* --------------------------------------------------------- assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            Ask about the data
          </CardTitle>
          <CardDescription>
            Questions are answered from live complaint statistics, not from memory — the
            figures used are shown with every answer.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit(question);
            }}
            className="flex gap-2"
          >
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Which department is slowest?"
            />
            <Button type="submit" disabled={ask.isPending}>
              {ask.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          <div className="flex flex-wrap gap-1.5">
            {(
              answer?.suggestions ?? [
                "Which department is slowest to resolve complaints?",
                "What type of problem is most common?",
                "Is the backlog growing or shrinking?",
              ]
            ).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => submit(suggestion)}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {ask.isError && (
            <p className="text-sm text-destructive">
              Could not get an answer. Please try again.
            </p>
          )}

          {answer && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bot className="h-3.5 w-3.5" />
                  {answer.engine === "llm"
                    ? "Answered by Claude, grounded on live statistics"
                    : "Statistics digest (no API key configured)"}
                </div>
                <p className="whitespace-pre-wrap text-sm">{answer.answer}</p>
              </div>

              {/* The exact context the model received, so any claim in the answer can
                  be checked against the numbers it was actually given. */}
              <details className="rounded-lg border p-3">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                  Show the data this answer is based on
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto text-[11px] leading-relaxed text-muted-foreground">
                  {JSON.stringify(answer.grounded_on, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
