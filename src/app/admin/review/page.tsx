import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { PageHeader, StatusBadge, fmtDate } from "@/components/admin/ui";
import { authedFetch } from "@/lib/api/server";
import type { AdminPaper, Paginated } from "@/lib/api/types";
import { intParam } from "@/lib/search-params";

const SIZE = 20;

export default async function ReviewQueuePage(props: PageProps<"/admin/review">) {
  const page = intParam((await props.searchParams).page);
  const data = await authedFetch<Paginated<AdminPaper>>(
    "/admin/review-queue",
    { query: { page, size: SIZE } },
    "/admin/review",
  );

  const columns: Column<AdminPaper>[] = [
    {
      key: "title",
      header: "Paper",
      cell: (p) => (
        <Link href={`/admin/review/${p.id}`} className="font-medium text-link hover:underline">
          {p.title}
        </Link>
      ),
    },
    {
      key: "class",
      header: "Classified as",
      cell: (p) =>
        [p.course_name, p.term_slug, p.subject_name, p.year].filter(Boolean).join(" · ") || (
          <span className="text-muted-foreground">not classified</span>
        ),
    },
    {
      key: "conf",
      header: "Confidence",
      cell: (p) => (p.confidence === null ? "-" : `${Math.round(p.confidence * 100)}%`),
    },
    { key: "src", header: "Source", cell: (p) => p.source_name ?? "-" },
    { key: "when", header: "Added", cell: (p) => fmtDate(p.created_at) },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Review queue"
        description="Papers the pipeline was not confident about, and user uploads. Open one to check it against the PDF."
      />
      <DataTable
        caption="Papers waiting for review"
        columns={columns}
        rows={data.items}
        rowKey={(p) => p.id}
        basePath="/admin/review"
        total={data.total}
        page={data.page}
        size={data.size}
        emptyTitle="The queue is empty"
        emptyDescription="Nothing needs review. New low-confidence papers and uploads will show up here."
      />
    </>
  );
}
