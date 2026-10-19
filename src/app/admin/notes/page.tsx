import { AdminAction } from "@/components/admin/admin-action";
import { DataTable, type Column } from "@/components/admin/data-table";
import { PageHeader, SearchForm, Select, StatusBadge, fmtDate } from "@/components/admin/ui";
import { authedFetch } from "@/lib/api/server";
import { enumParam, intParam } from "@/lib/search-params";

interface AdminNote {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  subject_name: string | null;
  has_file: boolean;
  created_at: string;
}
interface Page {
  items: AdminNote[];
  total: number;
  page: number;
  size: number;
}
const STATUSES = ["pending_review", "published", "unpublished", "rejected"] as const;

export default async function AdminNotesPage(props: PageProps<"/admin/notes">) {
  const sp = await props.searchParams;
  const status = enumParam(sp.status, STATUSES, "pending_review");
  const data = await authedFetch<Page>(
    "/admin/notes",
    { query: { status, page: intParam(sp.page), size: 20 } },
    "/admin/notes",
  );

  const columns: Column<AdminNote>[] = [
    {
      key: "title",
      header: "Note",
      cell: (n) => (
        <div className="max-w-md">
          <p className="font-medium">{n.title}</p>
          {n.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{n.description}</p>
          )}
        </div>
      ),
    },
    { key: "subj", header: "Subject", cell: (n) => n.subject_name ?? "-" },
    { key: "when", header: "Uploaded", cell: (n) => fmtDate(n.created_at) },
    { key: "status", header: "Status", cell: (n) => <StatusBadge status={n.status} /> },
    {
      key: "act",
      header: "Actions",
      cell: (n) => (
        <div className="flex flex-wrap gap-1">
          {n.has_file && (
            <a
              href={`/api/backend/admin/notes/${n.id}/file`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center border-2 border-border bg-card px-3 text-xs font-bold uppercase hover:bg-primary"
            >
              View PDF
            </a>
          )}
          {n.status !== "published" && (
            <AdminAction label="Publish" path={`admin/notes/${n.id}/publish`} variant="secondary" />
          )}
          {n.status === "published" && (
            <AdminAction
              label="Unpublish"
              path={`admin/notes/${n.id}/unpublish`}
              confirm="Take this note off the site?"
            />
          )}
          {n.status === "pending_review" && (
            <AdminAction
              label="Reject"
              path={`admin/notes/${n.id}/reject`}
              confirm="Reject this note?"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Notes" description="Moderate notes uploaded by students." />
      <SearchForm action="/admin/notes" placeholder="">
        <Select
          name="status"
          label="Status"
          value={status}
          options={STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
        />
      </SearchForm>
      <DataTable
        caption="Notes"
        columns={columns}
        rows={data.items}
        rowKey={(n) => n.id}
        basePath="/admin/notes"
        params={{ status }}
        total={data.total}
        page={data.page}
        size={data.size}
        emptyTitle="No notes to moderate"
        emptyDescription="Uploaded notes waiting for review show up here."
      />
    </>
  );
}
