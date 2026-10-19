import Link from "next/link";
import { NoPermission } from "@/components/admin/no-permission";
import { BarChart, PageHeader, StatCard } from "@/components/admin/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { authedFetch, getMe } from "@/lib/api/server";
import { enumParam } from "@/lib/search-params";

interface Analytics {
  days: number;
  totals: Record<string, number>;
  sessions: number;
  daily: { day: string; type: string; n: number }[];
  top_pages: { path: string; n: number }[];
  top_searches: { query: string; n: number }[];
  top_papers: { slug: string; title: string; views: number; attempts: number; downloads: number }[];
  funnel: { step: string; n: number }[];
}

function series(a: Analytics, type: string) {
  const map = new Map(a.daily.filter((d) => d.type === type).map((d) => [d.day, d.n]));
  const out: { date: string; count: number }[] = [];
  for (let i = a.days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ date: day, count: map.get(day) ?? 0 });
  }
  return out;
}

function List({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { key: string; label: React.ReactNode; value: string }[];
  empty: string;
}) {
  return (
    <section className="border-2 border-border bg-card p-4">
      <h2 className=" mb-4 text-2xl">{title}</h2>
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

export default async function AnalyticsPage(props: PageProps<"/admin/analytics">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const days = Number(enumParam((await props.searchParams).days, ["7", "30", "90"] as const, "30"));
  const a = await authedFetch<Analytics>(
    "/admin/analytics",
    { query: { days } },
    "/admin/analytics",
  );
  const top = Math.max(1, ...a.funnel.map((f) => f.n));

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Page views, searches, resource views and the download funnel, from the site's own event log."
        actions={
          <nav aria-label="Period" className="flex gap-1 text-sm">
            {[7, 30, 90].map((d) => (
              <Link
                key={d}
                href={`/admin/analytics?days=${d}`}
                aria-current={d === days ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 ${d === days ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
              >
                {d}d
              </Link>
            ))}
          </nav>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Page views" value={a.totals.page_view ?? 0} />
        <StatCard label="Visits (sessions)" value={a.sessions} />
        <StatCard
          label="Searches"
          value={a.totals.search ?? 0}
          hint={`${a.totals.result_click ?? 0} result clicks`}
        />
        <StatCard
          label="Downloads"
          value={a.totals.download_success ?? 0}
          hint={`${a.totals.download_attempt ?? 0} clicks`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <BarChart title="Page views" data={series(a, "page_view")} />
        <BarChart title="Searches" data={series(a, "search")} />
        <BarChart title="Downloads" data={series(a, "download_success")} />
      </div>

      <section className="mt-4 border-2 border-border bg-card p-4">
        <h2 className=" mb-4 text-2xl">Download funnel</h2>
        <ul className="space-y-2 text-sm">
          {a.funnel.map((f) => (
            <li key={f.step} className="grid grid-cols-[10rem_1fr_4rem] items-center gap-3">
              <span>{f.step}</span>
              <span className="h-3 rounded bg-muted">
                <span
                  className="block h-3 rounded bg-primary"
                  style={{ width: `${(f.n / top) * 100}%` }}
                />
              </span>
              <span className="text-right tabular-nums">{f.n.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <List
          title="Top pages"
          rows={a.top_pages.map((p) => ({ key: p.path, label: p.path, value: String(p.n) }))}
          empty="Browse the site and pages show up here."
        />
        <List
          title="Top searches"
          rows={a.top_searches.map((s) => ({ key: s.query, label: s.query, value: `${s.n}x` }))}
          empty="Searches appear as people use the site."
        />
        <List
          title="Top resources"
          rows={a.top_papers.map((p) => ({
            key: p.slug,
            label: (
              <Link className="text-link hover:underline" href={`/papers/${p.slug}`}>
                {p.title}
              </Link>
            ),
            value: `${p.views} views · ${p.downloads} dl`,
          }))}
          empty="Open a paper page to record a view."
        />
      </div>
    </>
  );
}
