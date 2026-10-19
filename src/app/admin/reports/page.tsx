import Link from "next/link";
import { AdminAction } from "@/components/admin/admin-action";
import { DataTable, type Column } from "@/components/admin/data-table";
import { PageHeader, SearchForm, Select, StatusBadge, fmtDate } from "@/components/admin/ui";
import { authedFetch } from "@/lib/api/server";
import type { AdminReport, Paginated } from "@/lib/api/types";
import { enumParam, intParam } from "@/lib/search-params";

const STATUSES = ["open", "resolved", "dismissed"] as const;

export default async function ReportsPage(props: PageProps<"/admin/reports">) {
  const sp = await props.searchParams;
  const status = enumParam(sp.status, STATUSES, "open");
  const data = await authedFetch<Paginated<AdminReport>>(
    "/admin/reports",
    { query: { status, page: intParam(sp.page), size: 20 } },
    "/admin/reports",
  );

  const columns: Column<AdminReport>[] = [
    {
      key: "reason",
      header: "Type",
      cell: (r) => <span className="capitalize">{r.reason ?? "-"}</span>,
    },
    {
      key: "details",
      header: "Message",
      cell: (r) => (
        <div className="max-w-md">
          <p className="whitespace-pre-line">{r.details}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {r.email}
            {r.paper_slug && (
              <>
                {" · "}
                <Link
                  href={`/papers/${r.paper_slug}`}
                  className="text-link underline"
                  target="_blank"
                >
                  {r.paper_slug}
                </Link>
              </>
            )}
          </p>
        </div>
      ),
    },
    { key: "when", header: "Received", cell: (r) => fmtDate(r.created_at) },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "act",
      header: "Actions",
      cell: (r) =>
        r.status === "open" ? (
          <div className="flex flex-wrap gap-1">
            <AdminAction
              label="Resolve"
              path={`admin/reports/${r.id}`}
              method="PATCH"
              body={{ status: "resolved" }}
              variant="secondary"
            />
            {r.paper_id && (
              <AdminAction
                label="Resolve + unpublish"
                path={`admin/reports/${r.id}`}
                method="PATCH"
                body={{ status: "resolved", unpublish_paper: true }}
                confirm="Resolve this report and take the paper off the site?"
              />
            )}
            <AdminAction
              label="Dismiss"
              path={`admin/reports/${r.id}`}
              method="PATCH"
              body={{ status: "dismissed" }}
            />
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Broken or wrong papers, takedown requests and contact messages."
      />
      <SearchForm action="/admin/reports" placeholder="">
        <Select
          name="status"
          label="Status"
          value={status}
          options={STATUSES.map((s) => ({ value: s, label: s }))}
        />
      </SearchForm>
      <DataTable
        caption="Reports"
        columns={columns}
        rows={data.items}
        rowKey={(r) => r.id}
        basePath="/admin/reports"
        params={{ status }}
        total={data.total}
        page={data.page}
        size={data.size}
        emptyTitle={status === "open" ? "Inbox zero" : "Nothing here"}
        emptyDescription="No reports in this view."
      />
    </>
  );
}
