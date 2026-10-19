"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { track } from "@/lib/track";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/use-catalog";
import type { FacetBucket } from "@/lib/api/types";
import { parsePositiveInt } from "@/lib/routes";
import type { SearchQuery } from "@/services/queries";
import { EmptyState } from "./empty-state";
import { ErrorBox } from "./home-sections";
import { Pagination } from "./pagination";
import { PaperList, PaperListSkeleton } from "./paper-list";
import { SearchBar } from "./search-bar";
import { Select } from "@/components/ui/select";

const SIZE = 20;

function toQuery(p: SearchQuery) {
  const u = new URLSearchParams();
  if (p.q) u.set("q", p.q);
  if (p.course) u.set("course", p.course);
  if (p.year) u.set("year", p.year);
  if (p.kind) u.set("kind", p.kind);
  if (p.page && p.page > 1) u.set("page", String(p.page));
  const s = u.toString();
  return s ? `/search?${s}` : "/search";
}

/**
 * Search is driven entirely by the JSON API: the URL holds the filters (shareable), and every change
 * issues GET /api/search?... from the browser and re-renders the results without a page reload.
 */
export function SearchView() {
  const sp = useSearchParams();
  const router = useRouter();
  const params: SearchQuery = {
    q: (sp.get("q") ?? "").trim().slice(0, 120),
    course: sp.get("course") ?? "",
    year: sp.get("year") ?? "",
    kind: sp.get("kind") ?? "",
    page: parsePositiveInt(sp.get("page") ?? undefined),
    size: SIZE,
  };
  const active = Boolean(params.q || params.course || params.year || params.kind);
  const { data, isPending, isFetching, isError, error, refetch } = useSearch(params, active);

  const total = data?.total;
  useEffect(() => {
    if (params.q && total !== undefined && params.page === 1)
      track("search", { query: params.q, meta: { results: total } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, total]);

  const update = (patch: Partial<SearchQuery>) =>
    router.replace(toQuery({ ...params, page: 1, ...patch }), { scroll: false });

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground">
          Search archive
        </p>
        <h1 className="text-5xl sm:text-6xl">Search &amp; explore papers</h1>
      </div>
      <SearchBar key={params.q} defaultValue={params.q} />

      {data && (data.facets.courses.length > 0 || data.facets.years.length > 0) && (
        <div className="grid gap-4 border-2 border-border bg-card p-5 shadow-hard-sm sm:grid-cols-4">
          <FilterSelect
            label="Course"
            value={params.course ?? ""}
            options={data.facets.courses}
            onChange={(course) => update({ course })}
          />
          <FilterSelect
            label="Year"
            value={params.year ?? ""}
            options={data.facets.years}
            onChange={(year) => update({ year })}
          />
          <FilterSelect
            label="Type"
            value={params.kind ?? ""}
            options={data.facets.kinds}
            onChange={(kind) => update({ kind })}
          />
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => update({ course: "", year: "", kind: "" })}>
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {!active ? (
        <EmptyState
          title="Start with a search"
          description='Type a course, subject or year, for example "BCA 1st year question papers".'
        />
      ) : isPending ? (
        <div aria-busy="true" className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <PaperListSkeleton />
        </div>
      ) : isError && !data ? (
        <ErrorBox message={error.message} onRetry={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EmptyState
          title={params.q ? `No results for "${params.q}"` : "No results"}
          description="Check the spelling, remove a filter, or browse by course instead."
          action={{ href: "/rajasthan-university", label: "Browse courses" }}
        />
      ) : data ? (
        <section
          aria-live="polite"
          aria-busy={isFetching}
          className={isFetching ? "opacity-70 transition-opacity" : ""}
        >
          <p className="eyebrow mb-4 text-muted-foreground">
            {data.total.toLocaleString("en-IN")} result{data.total === 1 ? "" : "s"} found
            {data.suggestions.length > 0 && (
              <>
                {" "}
                · Did you mean:{" "}
                {data.suggestions.slice(0, 3).map((s, i) => (
                  <span key={s}>
                    {i > 0 && ", "}
                    <Link className="underline" href={toQuery({ q: s })}>
                      {s}
                    </Link>
                  </span>
                ))}
              </>
            )}
          </p>
          <div
            onClickCapture={(e) => {
              const a = (e.target as HTMLElement).closest("a");
              const m = a?.getAttribute("href")?.match(/^\/(?:papers|exams\/[^/]+)\/([^/]+)$/);
              if (m) track("result_click", { paper_slug: m[1], query: params.q });
            }}
          >
            <PaperList papers={data.items} />
          </div>
          <Pagination
            page={data.page}
            size={data.size}
            total={data.total}
            hrefFor={(page) => toQuery({ ...params, page })}
          />
        </section>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FacetBucket[];
  onChange: (v: string) => void;
}) {
  if (options.length === 0) return <div />;
  const id = `f-${label.toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full border-2 border-input bg-card px-2 text-sm font-medium"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} ({o.count})
          </option>
        ))}
      </Select>
    </div>
  );
}
