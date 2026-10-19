import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/shared/search-view";
import { Skeleton } from "@/components/ui/skeleton";

/** Search result URLs are never indexed (docs/projectflow.md section 10), but each gets a clear tab title. */
export async function generateMetadata(props: PageProps<"/search">): Promise<Metadata> {
  const q = (await props.searchParams).q;
  const term = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 50);
  return {
    title: term ? `Search: ${term}` : "Search question papers",
    description: term
      ? `Question papers matching "${term}" on Notes & Papers.`
      : "Search previous year question papers by subject, course, exam and year.",
    robots: { index: false, follow: true },
  };
}

/** A thin shell: the results come from the JSON API (GET /api/search), see SearchView. */
export default function SearchPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <SearchView />
    </Suspense>
  );
}
