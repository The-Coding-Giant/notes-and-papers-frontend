import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader } from "@/components/admin/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { authedFetch, getMe } from "@/lib/api/server";
import { enumParam } from "@/lib/search-params";
import Link from "next/link";

interface Q {
  query: string;
  count: number;
  avg_results?: number;
  last_seen?: string;
}
interface D {
  slug: string;
  title: string;
  downloads: number;
}

function List({
  title,
  hint,
  rows,
  empty,
}: {
  title: string;
  hint: string;
  rows: { key: string; label: React.ReactNode; value: string }[];
  empty: string;
}) {
  return (
    <section className="border-2 border-border bg-card p-4">
      <h2 className=" mb-4 text-2xl">{title}</h2>
      <p className="mb-3 text-xs text-muted-foreground">{hint}</p>
      {rows.length === 0 ? (
        <EmptyState title="Nothing yet" description={empty} />
      ) : (
        <ol className="divide-y text-sm">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-3 py-1.5">
              <span className="min-w-0 truncate">{r.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{r.value}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function InsightsPage(props: PageProps<"/admin/insights">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const days = Number(enumParam((await props.searchParams).days, ["7", "30", "90"] as const, "30"));
  const [top, gaps, dl] = await Promise.all([
    authedFetch<Q[]>("/admin/insights/searches", { query: { days, limit: 15 } }, "/admin/insights"),
    authedFetch<Q[]>(
      "/admin/insights/no-results",
      { query: { days, limit: 15 } },
      "/admin/insights",
    ),
    authedFetch<D[]>(
      "/admin/insights/downloads",
      { query: { days, limit: 15 } },
      "/admin/insights",
    ),
  ]);

  return (
    <>
      <PageHeader
        title="Search insights"
        description="What people look for. Zero-result searches are content gaps: add those papers next."
        actions={
          <nav aria-label="Period" className="flex gap-1 text-sm">
            {[7, 30, 90].map((d) => (
              <Link
                key={d}
                href={`/admin/insights?days=${d}`}
                aria-current={d === days ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 ${d === days ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
              >
                {d}d
              </Link>
            ))}
          </nav>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <List
          title="Top searches"
          hint={`Last ${days} days`}
          rows={top.map((q) => ({
            key: q.query,
            label: q.query,
            value: `${q.count}× · ~${q.avg_results} results`,
          }))}
          empty="Searches will appear as people use the site."
        />
        <List
          title="No-result searches (content gaps)"
          hint="Queries that returned nothing"
          rows={gaps.map((q) => ({ key: q.query, label: q.query, value: `${q.count}×` }))}
          empty="Every search found something. Nice."
        />
        <List
          title="Most downloaded"
          hint={`Last ${days} days`}
          rows={dl.map((d) => ({
            key: d.slug,
            label: (
              <Link className="text-link hover:underline" href={`/papers/${d.slug}`}>
                {d.title}
              </Link>
            ),
            value: `${d.downloads}`,
          }))}
          empty="Downloads will appear here."
        />
      </div>
    </>
  );
}
