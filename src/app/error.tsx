"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      role="alert"
      aria-labelledby="err-heading"
      className="mx-auto grid max-w-5xl items-center gap-8 py-8 sm:py-14 lg:grid-cols-[auto_1fr] lg:gap-14"
    >
      <div
        aria-hidden="true"
        className="grid size-40 select-none place-items-center justify-self-center border-2 border-border bg-primary shadow-hard-lg sm:size-56 lg:rotate-2"
      >
        <TriangleAlert className="size-20 sm:size-28" strokeWidth={2.5} />
      </div>
      <div className="space-y-6">
        <p className="eyebrow inline-block border-2 border-border bg-accent px-2.5 py-1 text-accent-foreground">
          Something went wrong
        </p>
        <h1 id="err-heading" className="text-5xl sm:text-6xl">
          That did not <br className="hidden sm:block" />
          work as planned
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          We could not load this page. It is usually brief: try again in a moment. If it keeps
          happening, go back to the home page.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={reset}
            className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
          >
            Try again
          </button>
          <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
            Go to home
          </Link>
        </div>
        {error.digest && <p className="eyebrow text-muted-foreground">Reference: {error.digest}</p>}
      </div>
    </section>
  );
}
