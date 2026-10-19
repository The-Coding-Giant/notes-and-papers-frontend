import { DataTable, type Column } from "@/components/admin/data-table";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, SearchForm, Select, StatCard, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import { enumParam, first, intParam } from "@/lib/search-params";

interface SeoOverview {
  pages: number;
  indexed: number;
  not_indexed: number;
  clicks: number;
  impressions: number;
  pages_with_issues: number;
  last_synced: string | null;
}
interface SeoPageRow {
  url: string;
  page_type: string | null;
  indexed: boolean | null;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  issues: string[];
}
interface Pages {
  items: SeoPageRow[];
  total: number;
  page: number;
  size: number;
}
interface IssueGroup {
  issue: string;
  count: number;
  sample: string[];
}

const SORTS = ["clicks", "impressions", "position", "ctr"] as const;

export default async function SeoPage(props: PageProps<"/admin/seo">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const sp = await props.searchParams;
  const sort = enumParam(sp.sort, SORTS, "clicks")!;
  const order = enumParam(sp.order, ["asc", "desc"] as const, "desc")!;
  const pageType = enumParam(sp.page_type, ["paper", "subject", "course", "term", "home"] as const);
  const [ov, pages, issues] = await Promise.all([
    authedFetch<SeoOverview>("/admin/seo/overview", {}, "/admin/seo"),
    authedFetch<Pages>(
      "/admin/seo/pages",
      { query: { sort, order, page_type: pageType, page: intParam(sp.page), size: 50 } },
      "/admin/seo",
    ),
    authedFetch<IssueGroup[]>("/admin/seo/issues", {}, "/admin/seo"),
  ]);
  void first;

  const cols: Column<SeoPageRow>[] = [
    {
      key: "url",
      header: "Page",
      cell: (p) => (
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-link hover:underline"
        >
          {p.url.replace(/^https?:\/\/[^/]+/, "")}
        </a>
      ),
    },
    { key: "type", header: "Type", cell: (p) => p.page_type ?? "-" },
    {
      key: "idx",
      header: "Indexed",
      cell: (p) => (p.indexed === null ? "unknown" : p.indexed ? "yes" : "no"),
    },
    { key: "clicks", header: "Clicks", sortKey: "clicks", cell: (p) => p.clicks ?? "-" },
    {
      key: "impr",
      header: "Impressions",
      sortKey: "impressions",
      cell: (p) => p.impressions ?? "-",
    },
    {
      key: "pos",
      header: "Position",
      sortKey: "position",
      cell: (p) => (p.position === null ? "-" : p.position.toFixed(1)),
    },
    {
      key: "issues",
      header: "Issues",
      cell: (p) =>
        p.issues.length ? (
          <span className="text-amber-700 dark:text-amber-300">{p.issues.join(", ")}</span>
        ) : (
          <span className="text-muted-foreground">none</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="SEO"
        description={`Search Console data (28 days) plus problems found in our own pages. Last synced ${fmtDate(ov.last_synced)}.`}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked pages" value={ov.pages} />
        <StatCard label="Indexed" value={ov.indexed} hint={`${ov.not_indexed} not indexed`} />
        <StatCard
          label="Clicks / impressions"
          value={`${ov.clicks.toLocaleString("en-IN")} / ${ov.impressions.toLocaleString("en-IN")}`}
        />
        <StatCard
          label="Pages with issues"
          value={ov.pages_with_issues}
          tone={ov.pages_with_issues ? "warn" : undefined}
        />
      </div>

      {issues.length > 0 && (
        <section aria-labelledby="issues-h" className="mt-6">
          <h2 id="issues-h" className=" mb-4 text-2xl">
            Issues
          </h2>
          <ul className="grid gap-2 md:grid-cols-2">
            {issues.map((g) => (
              <li key={g.issue} className="border-2 border-border bg-card p-3 text-sm">
                <p className="font-medium">
                  {g.issue.replace(/_/g, " ")}{" "}
                  <span className="text-muted-foreground">({g.count})</span>
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  e.g. {g.sample[0]?.replace(/^https?:\/\/[^/]+/, "")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="pages-h" className="mt-6">
        <h2 id="pages-h" className=" mb-4 text-2xl">
          Pages
        </h2>
        <SearchForm action="/admin/seo" placeholder="">
          <Select
            name="page_type"
            label="Page type"
            value={pageType}
            options={[
              { value: "", label: "All types" },
              ...["paper", "subject", "course", "term", "home"].map((t) => ({
                value: t,
                label: t,
              })),
            ]}
          />
        </SearchForm>
        <DataTable
          caption="Pages by search performance"
          columns={cols}
          rows={pages.items}
          rowKey={(p) => p.url}
          basePath="/admin/seo"
          params={{ page_type: pageType }}
          sort={sort}
          order={order}
          total={pages.total}
          page={pages.page}
          size={pages.size}
          emptyTitle="No page data yet"
          emptyDescription="Run the daily workflow (seo-sync) to fill this in."
        />
      </section>
    </>
  );
}
