import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { PaperList } from "@/components/shared/paper-list";
import { authedFetch } from "@/lib/api/server";
import type { Paginated, PaperSummary } from "@/lib/api/types";
import { parsePositiveInt } from "@/lib/routes";

export const metadata: Metadata = { title: "Bookmarks", robots: { index: false, follow: false } };
const SIZE = 20;

export default async function BookmarksPage(props: PageProps<"/bookmarks">) {
  const page = parsePositiveInt([(await props.searchParams).page].flat()[0]);
  const data = await authedFetch<Paginated<PaperSummary>>(
    "/me/bookmarks",
    { query: { page, size: SIZE } },
    "/bookmarks",
  );
  return (
    <div className="space-y-6">
      <h1 className="text-5xl sm:text-6xl">Bookmarks</h1>
      {data.items.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          description="Tap Bookmark on any paper to keep it here for quick access."
          action={{ href: "/rajasthan-university", label: "Browse papers" }}
        />
      ) : (
        <>
          <PaperList papers={data.items} />
          <Pagination
            page={data.page}
            size={data.size}
            total={data.total}
            hrefFor={(p) => `/bookmarks?page=${p}`}
          />
        </>
      )}
    </div>
  );
}
