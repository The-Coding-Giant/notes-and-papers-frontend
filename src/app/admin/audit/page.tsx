import { DataTable, type Column } from "@/components/admin/data-table";
import { NoPermission } from "@/components/admin/no-permission";
import { PageHeader, SearchForm, Select, fmtDate } from "@/components/admin/ui";
import { authedFetch, getMe } from "@/lib/api/server";
import type { AuditEntry, Paginated } from "@/lib/api/types";
import { enumParam, intParam } from "@/lib/search-params";

const ENTITIES = [
  "paper",
  "note",
  "source",
  "report",
  "user",
  "settings",
  "subject",
  "course",
] as const;

export default async function AuditPage(props: PageProps<"/admin/audit">) {
  if ((await getMe())?.role !== "admin") return <NoPermission />;
  const sp = await props.searchParams;
  const entity = enumParam(sp.entity, ENTITIES);
  const data = await authedFetch<Paginated<AuditEntry>>(
    "/admin/audit-log",
    { query: { entity, page: intParam(sp.page), size: 50 } },
    "/admin/audit",
  );

  const cols: Column<AuditEntry>[] = [
    { key: "when", header: "When", cell: (a) => fmtDate(a.created_at) },
    { key: "action", header: "Action", cell: (a) => <code className="text-xs">{a.action}</code> },
    {
      key: "entity",
      header: "Entity",
      cell: (a) => `${a.entity ?? ""} ${a.entity_id ? a.entity_id.slice(0, 8) : ""}`,
    },
    {
      key: "actor",
      header: "Who",
      cell: (a) => (
        <span className="text-xs text-muted-foreground">{a.actor_id?.slice(0, 8) ?? "system"}</span>
      ),
    },
    {
      key: "diff",
      header: "Change",
      cell: (a) =>
        a.diff ? (
          <details>
            <summary className="cursor-pointer text-xs text-link">View</summary>
            <pre className="mt-1 max-w-md overflow-auto whitespace-pre-wrap text-xs">
              {JSON.stringify(a.diff, null, 1)}
            </pre>
          </details>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Audit log" description="Who changed what, newest first." />
      <SearchForm action="/admin/audit" placeholder="">
        <Select
          name="entity"
          label="Entity"
          value={entity}
          options={[
            { value: "", label: "All entities" },
            ...ENTITIES.map((e) => ({ value: e, label: e })),
          ]}
        />
      </SearchForm>
      <DataTable
        caption="Audit log"
        columns={cols}
        rows={data.items}
        rowKey={(a) => String(a.id)}
        basePath="/admin/audit"
        params={{ entity }}
        total={data.total}
        page={data.page}
        size={data.size}
        emptyTitle="No activity yet"
      />
    </>
  );
}
