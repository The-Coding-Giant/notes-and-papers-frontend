import { AdminAction } from "@/components/admin/admin-action";
import { AutoRefresh } from "@/components/admin/auto-refresh";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, StatCard, StatusBadge, fmtDate } from "@/components/admin/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { authedFetch, getMe } from "@/lib/api/server";

interface SiteResult {
  imported?: Record<string, number>;
  scraped?: { resources?: number; problems?: number };
}
interface Job {
  id: string;
  status: string;
  payload: { site?: string; refresh?: boolean; result?: Record<string, SiteResult> };
  error: string | null;
  created_at: string;
  started_at: string | null;
}
interface Imports {
  papers_by_source: Record<string, number>;
  jobs: Job[];
}

export default async function ImportsPage() {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const data = await authedFetch<Imports>("/admin/imports", {}, "/admin/imports");
  const running = data.jobs.some((j) => j.status === "queued" || j.status === "running");

  return (
    <>
      <AutoRefresh active={running} />
      <PageHeader
        title="Data imports"
        description="Scrape uoronline.com and pyqonline.com listing pages and load them into the database. PDFs are linked, never copied."
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminAction
              label="Import everything"
              path="/admin/imports"
              body={{ site: "all" }}
              success="Import started"
              disabled={running}
            />
            <AdminAction
              label="uoronline only"
              path="/admin/imports"
              body={{ site: "uoronline" }}
              success="Import started"
              disabled={running}
            />
            <AdminAction
              label="pyqonline only"
              path="/admin/imports"
              body={{ site: "pyqonline" }}
              success="Import started"
              disabled={running}
            />
            <AdminAction
              label="Re-fetch pages"
              path="/admin/imports"
              body={{ site: "all", refresh: true }}
              success="Import started"
              disabled={running}
              confirm="Ignore the page cache and fetch every listing page again?"
            />
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(data.papers_by_source).map(([k, v]) => (
          <StatCard key={k} label={`Papers from ${k}`} value={v} />
        ))}
      </div>

      <section className="mt-6 space-y-3">
        <h2 className=" mb-4 text-2xl">Recent jobs</h2>
        {data.jobs.length === 0 ? (
          <EmptyState
            title="No imports yet"
            description="Press Import everything to scrape and load the data."
          />
        ) : (
          <ul className="divide-y border-2 border-border bg-card text-sm">
            {data.jobs.map((j) => (
              <li key={j.id} className="space-y-1 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={j.status} />
                  <span className="font-medium">{j.payload.site ?? "all"}</span>
                  <span className="text-muted-foreground">{fmtDate(j.created_at)}</span>
                </div>
                {j.error && <p className="text-destructive">{j.error}</p>}
                {j.payload.result &&
                  Object.entries(j.payload.result).map(([site, r]) => (
                    <p key={site} className="text-muted-foreground">
                      {site}: {r.scraped?.resources ?? 0} found, {r.imported?.papers ?? 0} saved,{" "}
                      {r.imported?.listings ?? 0} listings, {r.scraped?.problems ?? 0} flagged.
                    </p>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
