import Link from "next/link";
import { AdminAction } from "@/components/admin/admin-action";
import { DataTable, type Column } from "@/components/admin/data-table";
import { PageHeader, SearchForm, Select, StatusBadge, fmtDate } from "@/components/admin/ui";
import { authedFetch } from "@/lib/api/server";
import type { AdminPaper, Paginated } from "@/lib/api/types";
import { enumParam, first, intParam } from "@/lib/search-params";

const SIZE = 20;
const STATUSES = ["pending_review", "published", "unpublished", "rejected"] as const;

export default async function AdminPapersPage(props: PageProps<"/admin/papers">) {
  const sp = await props.searchParams;
  const page = intParam(sp.page);
  const q = first(sp.q)?.slice(0, 120);
  const status = enumParam(sp.status, STATUSES);
  const missing = first(sp.missing) === "1" ? "true" : undefined;
  const data = await authedFetch<Paginated<AdminPaper>>(
    "/admin/papers",
    { query: { page, size: SIZE, q, status, missing_from_source: missing } },
    "/admin/papers",
  );

  const columns: Column<AdminPaper>[] = [
    {
      key: "title",
      header: "Title",
      cell: (p) => (
        <div>
          <Link href={`/admin/review/${p.id}`} className="font-medium text-link hover:underline">
            {p.title}
          </Link>
          <p className="text-xs text-muted-foreground">{p.slug}</p>
        </div>
      ),
    },
    {
      key: "class",
      header: "Course / subject",
      cell: (p) => [p.course_name, p.subject_name].filter(Boolean).join(" · ") || "-",
    },
    { key: "year", header: "Year", cell: (p) => p.year ?? "-" },
    { key: "dl", header: "Downloads", cell: (p) => p.download_count },
    {
      key: "status",
      header: "Status",
      cell: (p) => (
        <div className="space-y-1">
          <StatusBadge status={p.status} />
          {p.missing_from_source && <p className="text-xs text-amber-600">missing from source</p>}
        </div>
      ),
    },
    { key: "upd", header: "Updated", cell: (p) => fmtDate(p.updated_at) },
    {
      key: "act",
      header: "Actions",
      cell: (p) =>
        p.status === "published" ? (
          <AdminAction
            label="Unpublish"
            path={`admin/papers/${p.id}/unpublish`}
            confirm={`Take "${p.title}" off the site?`}
            variant="outline"
          />
        ) : p.subject_id ? (
          <AdminAction label="Publish" path={`admin/papers/${p.id}/publish`} variant="secondary" />
        ) : (
          <span className="text-xs text-muted-foreground">needs a subject</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Papers"
        description="Search, edit and unpublish any paper. Unpublishing is the one-click takedown."
      />
      <SearchForm action="/admin/papers" q={q} placeholder="Search by title, slug or paper code">
        <Select
          name="status"
          label="Status"
          value={status}
          options={[
            { value: "", label: "Any status" },
            ...STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
          ]}
        />
        <Select
          name="missing"
          label="Source"
          value={missing ? "1" : ""}
          options={[
            { value: "", label: "All" },
            { value: "1", label: "Missing from source" },
          ]}
        />
      </SearchForm>
      <DataTable
        caption="Papers"
        columns={columns}
        rows={data.items}
        rowKey={(p) => p.id}
        basePath="/admin/papers"
        params={{ q, status, missing: missing ? "1" : undefined }}
        total={data.total}
        page={data.page}
        size={data.size}
        emptyTitle="No papers match"
        emptyDescription="Try a different search or clear the filters."
      />
    </>
  );
}
