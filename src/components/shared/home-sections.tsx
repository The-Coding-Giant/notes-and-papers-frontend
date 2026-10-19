"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, RefreshCw, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses, useExams, useLatestPapers } from "@/hooks/use-catalog";
import type { ExamSummary, Paginated, PaperSummary, UniversityDetail } from "@/lib/api/types";
import { routes, yearRange } from "@/lib/routes";
import { plural } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { PaperList, PaperListSkeleton } from "./paper-list";

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 border-2 border-destructive bg-card p-8 text-center"
    >
      <p className="text-sm font-medium text-destructive">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" /> Try again
      </Button>
    </div>
  );
}

/** Section title with a small eyebrow, an optional link on the right, and room to breathe. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  id: string;
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-2">
        <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground">
          {eyebrow}
        </p>
        <h2 id={id} className="text-4xl sm:text-5xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 border-b-2 border-border pb-0.5 text-xs font-bold uppercase tracking-wide hover:bg-primary"
        >
          {linkLabel ?? "See all"} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function TileGrid({ children, busy }: { children: React.ReactNode; busy?: boolean }) {
  return (
    <ul
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy={busy || undefined}
    >
      {children}
    </ul>
  );
}

function TileSkeletons() {
  return (
    <TileGrid busy>
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i}>
          <Skeleton className="h-[132px] border-2 border-border/30" />
        </li>
      ))}
    </TileGrid>
  );
}

/** Courses of the university. Data: GET /api/courses (server-rendered first, refreshed from the API on load). */
export function CoursesSection({ initial }: { initial: UniversityDetail | null }) {
  const { data, isPending, isError, error, refetch } = useCourses(initial);
  const courses = (data?.courses ?? []).filter((c) => c.paper_count > 0).slice(0, 12);

  return (
    <section aria-labelledby="courses-heading" className="space-y-8">
      <SectionHeading
        id="courses-heading"
        eyebrow="University exams"
        title="Browse by course"
        href={routes.university}
        linkLabel="All courses"
      />
      {isPending ? (
        <TileSkeletons />
      ) : isError && courses.length === 0 ? (
        <ErrorBox message={error.message} onRetry={() => void refetch()} />
      ) : courses.length > 0 ? (
        <TileGrid>
          {courses.map((c) => (
            <li key={c.slug}>
              <Link
                href={routes.course(c.slug)}
                className="brutal brutal-hover flex h-full flex-col justify-between gap-6 p-5"
              >
                <span className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center border-2 border-border bg-primary">
                    <GraduationCap className="size-5" aria-hidden="true" />
                  </span>
                  {c.level && (
                    <span className="eyebrow border-2 border-border px-1.5 py-0.5">{c.level}</span>
                  )}
                </span>
                <span>
                  <span className="block font-display text-3xl uppercase leading-[1.2]">
                    {c.name}
                  </span>
                  <span className="eyebrow mt-2 block text-muted-foreground">
                    {plural(c.paper_count, "paper")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </TileGrid>
      ) : (
        <EmptyState
          title="Courses are being added"
          description="Try the search to look for a specific paper."
          action={{ href: "/search", label: "Search papers" }}
        />
      )}
    </section>
  );
}

/** Popular exams. Data: GET /api/exams?kind=exam (server-rendered first, refreshed on load). */
export function ExamsSection({ initial }: { initial: ExamSummary[] | null }) {
  const { data, isPending, isError, error, refetch } = useExams("exam", initial);
  const exams = (data ?? []).filter((e) => e.paper_count > 0).slice(0, 12);

  return (
    <section aria-labelledby="exams-heading" className="space-y-8">
      <SectionHeading
        id="exams-heading"
        eyebrow="Competitive exams"
        title="Popular exams"
        href={routes.exams}
        linkLabel="All exams"
      />
      {isPending ? (
        <TileSkeletons />
      ) : isError && exams.length === 0 ? (
        <ErrorBox message={error.message} onRetry={() => void refetch()} />
      ) : exams.length > 0 ? (
        <TileGrid>
          {exams.map((e, i) => (
            <li key={e.slug}>
              <Link
                href={routes.exam(e.slug)}
                className="brutal brutal-hover flex h-full flex-col justify-between gap-6 p-5"
              >
                <span className="flex items-start justify-between">
                  <span
                    className={`grid size-11 place-items-center border-2 border-border ${i % 2 ? "bg-accent" : "bg-primary"}`}
                  >
                    <ScrollText className="size-5" aria-hidden="true" />
                  </span>
                  {e.year_min && (
                    <span className="eyebrow border-2 border-border px-1.5 py-0.5">
                      {yearRange(e.year_min, e.year_max)}
                    </span>
                  )}
                </span>
                <span>
                  <span className="line-clamp-2 block font-display text-2xl uppercase leading-snug">
                    {e.name}
                  </span>
                  <span className="eyebrow mt-2 block text-muted-foreground">
                    {plural(e.paper_count, "paper")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </TileGrid>
      ) : (
        <EmptyState title="Exams are being added" description="Exam papers will appear here." />
      )}
    </section>
  );
}

/** Latest papers. Data: GET /api/papers?sort=latest&size=8. */
export function LatestPapersSection({
  initial,
  size = 8,
}: {
  initial: Paginated<PaperSummary> | null;
  size?: number;
}) {
  const { data, isPending, isError, error, refetch } = useLatestPapers(size, initial);
  const papers = data?.items ?? [];

  return (
    <section aria-labelledby="latest-heading" className="space-y-8">
      <SectionHeading
        id="latest-heading"
        eyebrow="Fresh in the vault"
        title="Recently added papers"
        href="/search?q=2024"
        linkLabel="Search all"
      />
      {isPending ? (
        <PaperListSkeleton count={size} />
      ) : isError && papers.length === 0 ? (
        <ErrorBox message={error.message} onRetry={() => void refetch()} />
      ) : papers.length > 0 ? (
        <PaperList papers={papers} />
      ) : (
        <EmptyState
          title="No papers yet"
          description="New question papers appear here as soon as they are published."
        />
      )}
    </section>
  );
}
