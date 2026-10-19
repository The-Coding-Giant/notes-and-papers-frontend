import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { PaperCard } from "@/components/shared/paper-card";
import { authedFetch } from "@/lib/api/server";
import type { DownloadItem, Paginated } from "@/lib/api/types";
import { parsePositiveInt } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Download history",
  robots: { index: false, follow: false },
};
const SIZE = 20;

export default async function DownloadsPage(props: PageProps<"/downloads">) {
  const page = parsePositiveInt([(await props.searchParams).page].flat()[0]);
  const data = await authedFetch<Paginated<DownloadItem>>(
    "/me/downloads",
    { query: { page, size: SIZE } },
    "/downloads",
  );
  return (
    <div className="space-y-6">
      <h1 className="text-5xl sm:text-6xl">Download history</h1>
      {data.items.length === 0 ? (
        <EmptyState
          title="No downloads yet"
          description="Papers you download while logged in will be listed here."
          action={{ href: "/rajasthan-university", label: "Browse papers" }}
        />
      ) : (
        <>
          <ul className="grid gap-3 md:grid-cols-2">
            {data.items.map((d) => (
              <li key={`${d.paper.slug}-${d.downloaded_at}`} className="space-y-1">
                <PaperCard paper={d.paper} />
                <p className="px-1 text-xs text-muted-foreground">
                  Downloaded{" "}
                  {new Date(d.downloaded_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </li>
            ))}
          </ul>
          <Pagination
            page={data.page}
            size={data.size}
            total={data.total}
            hrefFor={(p) => `/downloads?page=${p}`}
          />
        </>
      )}
    </div>
  );
}
