import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SearchBar } from "@/components/shared/search-bar";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <section
      aria-labelledby="nf-heading"
      className="mx-auto grid max-w-5xl items-center gap-8 py-8 sm:py-14 lg:grid-cols-[auto_1fr] lg:gap-14"
    >
      <p
        aria-hidden="true"
        className="select-none justify-self-center border-2 border-border bg-primary px-6 py-2 font-display text-[7rem] leading-[1.1] shadow-hard-lg sm:text-[10rem] lg:-rotate-2"
      >
        404
      </p>
      <div className="space-y-6">
        <p className="eyebrow inline-block border-2 border-border bg-accent px-2.5 py-1 text-accent-foreground">
          Page not found
        </p>
        <h1 id="nf-heading" className="text-5xl sm:text-6xl">
          We could not find <br className="hidden sm:block" />
          that page
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          The paper may have been renamed, or its PDF is not ready yet. Search for it below, or
          browse from the start.
        </p>
        <SearchBar />
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
            Go to home
          </Link>
          <Link href={routes.universities} className={cn(buttonVariants({ size: "lg" }))}>
            University papers
          </Link>
          <Link href={routes.exams} className={cn(buttonVariants({ size: "lg" }))}>
            Exam papers
          </Link>
        </div>
      </div>
    </section>
  );
}
