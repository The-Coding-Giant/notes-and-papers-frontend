import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, SearchForm, Select, StatusBadge, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AdminRun, Paginated } from "@/lib/api/types";
import { enumParam, first, intParam } from "@/lib/search-params";

const STATUSES = ["queued", "running", "succeeded", "partial", "failed", "cancelled"] as const;
const UUID = /^[0-9a-f-]{36}$/i;

export default async function RunsPage(props: PageProps<"/admin/runs">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const sp = await props.searchParams;
  const status = enumParam(sp.status, STATUSES);
  const sourceId =
    first(sp.source_id) && UUID.test(first(sp.source_id)!) ? first(sp.source_id) : undefined;
  const data = await authedFetch<Paginated<AdminRun>>(
    "/admin/runs",
    { query: { page: intParam(sp.page), size: 20, status, source_id: sourceId } },
    "/admin/runs",
  );

  const columns: Column<AdminRun>[] = [
    {
      key: "src",
      header: "Source",
      cell: (r) => (
        <Link href={`/admin/runs/${r.id}`} className="font-medium text-link hover:underline">
          {r.source_name ?? r.source_id}
        </Link>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "trig", header: "Trigger", cell: (r) => r.trigger },
    { key: "found", header: "Found", cell: (r) => r.pages_crawled },
    { key: "new", header: "New", cell: (r) => r.new_count },
    { key: "chg", header: "Changed", cell: (r) => r.changed_count },
    { key: "miss", header: "Missing", cell: (r) => r.removed_count },
    { key: "fail", header: "Failed", cell: (r) => r.failed_count },
    {
      key: "dur",
      header: "Duration",
      cell: (r) => (r.duration_seconds === null ? "-" : `${Math.round(r.duration_seconds)}s`),
    },
    { key: "when", header: "Started", cell: (r) => fmtDate(r.started_at ?? r.created_at) },
  ];

  return (
    <>
      <PageHeader
        title="Crawl runs"
        description="History of pipeline runs. Open one to read its log."
      />
      <SearchForm action="/admin/runs" placeholder="" hidden={{ source_id: sourceId }}>
        <Select
          name="status"
          label="Status"
          value={status}
          options={[
            { value: "", label: "Any status" },
            ...STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
      </SearchForm>
      <DataTable
        caption="Crawl runs"
        columns={columns}
        rows={data.items}
        rowKey={(r) => r.id}
        basePath="/admin/runs"
        params={{ status, source_id: sourceId }}
        total={data.total}
        page={data.page}
        size={data.size}
        emptyTitle="No runs yet"
        emptyDescription="Enable a source and press Run now, or wait for the daily schedule."
      />
    </>
  );
}
