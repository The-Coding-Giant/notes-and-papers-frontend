import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  size: number;
  total: number;
  /** Builds the href for a page number, preserving the current filters. */
  hrefFor: (page: number) => string;
}

const btn = buttonVariants({ variant: "outline", size: "sm" });

/** Link-based, so it works without JavaScript and is crawlable. */
export function Pagination({ page, size, total, hrefFor }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages <= 1) return null;
  const hasPrev = page > 1;
  const hasNext = page < pages;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-3">
      {hasPrev ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={btn}>
          <ChevronLeft className="size-4" aria-hidden="true" /> Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(btn, "opacity-50")}>
          <ChevronLeft className="size-4" aria-hidden="true" /> Previous
        </span>
      )}
      <p className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </p>
      {hasNext ? (
        <Link href={hrefFor(page + 1)} rel="next" className={btn}>
          Next <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(btn, "opacity-50")}>
          Next <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
