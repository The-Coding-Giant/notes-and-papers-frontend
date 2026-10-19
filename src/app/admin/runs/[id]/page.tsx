import { notFound } from "next/navigation";
import { AdminAction } from "@/components/admin/admin-action";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, StatCard, StatusBadge, fmtDate } from "@/components/admin/ui";
import { ApiError } from "@/lib/api/client";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminRun } from "@/lib/api/types";

export default async function RunDetailPage(props: PageProps<"/admin/runs/[id]">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const { id } = await props.params;
  const run = await authedFetch<AdminRun>(`/admin/runs/${id}`, {}, `/admin/runs/${id}`).catch(
    (e) => {
      if (e instanceof ApiError && (e.status === 404 || e.status === 422)) return null;
      throw e;
    },
  );
  if (!run) notFound();

  return (
    <>
      <PageHeader
        title={`Run: ${run.source_name ?? run.source_id}`}
        description={`${run.trigger} run, started ${fmtDate(run.started_at ?? run.created_at)}${run.duration_seconds !== null ? `, took ${Math.round(run.duration_seconds)}s` : ""}.`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={run.status} />
            <AdminAction
              label="Run again"
              path={`admin/sources/${run.source_id}/run`}
              variant="secondary"
              success="Run queued"
            />
          </div>
        }
      />
      {run.error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {run.error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Found" value={run.pages_crawled} />
        <StatCard label="New" value={run.new_count} />
        <StatCard label="Changed" value={run.changed_count} />
        <StatCard label="Missing" value={run.removed_count} />
        <StatCard
          label="Failed"
          value={run.failed_count}
          tone={run.failed_count ? "bad" : undefined}
        />
        <StatCard label="Stored" value={`${(run.bytes_stored / 1024 / 1024).toFixed(1)} MB`} />
      </div>
      <section aria-labelledby="log-h" className="mt-6">
        <h2 id="log-h" className=" mb-4 text-2xl">
          Log
        </h2>
        {run.log && run.log.length > 0 ? (
          <ol className="max-h-[28rem] overflow-auto border-2 border-border bg-card bg-muted/40 p-3 font-mono text-xs">
            {run.log.map((l, i) => (
              <li
                key={i}
                className={
                  l.level === "error"
                    ? "text-destructive"
                    : l.level === "warn"
                      ? "text-amber-700 dark:text-amber-300"
                      : ""
                }
              >
                <span className="text-muted-foreground">{l.t?.slice(11, 19)}</span> {l.msg}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">No log entries.</p>
        )}
      </section>
    </>
  );
}
