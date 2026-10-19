"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <TriangleAlert className="mb-3 size-10 text-destructive" aria-hidden="true" />
      <h1 className="text-3xl sm:text-4xl">Something went wrong</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        We could not load this page. Please try again in a moment.
      </p>
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
