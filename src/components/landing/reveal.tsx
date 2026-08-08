"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Fade-and-rise a block the first time it enters the viewport.
 *
 * The hidden state is server-rendered (`data-reveal=""`), so nothing flashes into
 * existence on hydration; the observer only ever flips it to `shown`. Without
 * JavaScript the `<noscript>` rule in the root layout releases every block, and under
 * `prefers-reduced-motion` the transition is dropped in CSS — so this degrades to a
 * plain, immediately visible section in both cases.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger, in ms. Keep small — a long cascade makes a page feel slow, not alive. */
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = () => node.setAttribute("data-reveal", "shown");

    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      // Fire a little before the block is fully on screen, so the motion has finished
      // by the time the reader's eye arrives.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — one ref type per tag; the union is not worth generic plumbing.
      ref={ref}
      data-reveal=""
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
