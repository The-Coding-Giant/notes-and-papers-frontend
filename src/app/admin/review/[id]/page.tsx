import { notFound } from "next/navigation";
import Link from "next/link";
import { ReviewEditor } from "@/components/admin/review-editor";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { getCatalog } from "@/lib/api/public";
import { authedFetch, getMe } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";
import type { AdminPaper } from "@/lib/api/types";

export default async function ReviewPaperPage(props: PageProps<"/admin/review/[id]">) {
  const { id } = await props.params;
  const me = await getMe();
  const [paper, catalog] = await Promise.all([
    authedFetch<AdminPaper>(`/admin/papers/${id}`, {}, `/admin/review/${id}`).catch((e) => {
      if (e instanceof ApiError && (e.status === 404 || e.status === 422)) return null;
      throw e;
    }),
    getCatalog().catch(() => []),
  ]);
  if (!paper || !me) notFound();

  return (
    <>
      <PageHeader
        title="Review paper"
        description={`Check the details against the PDF, then save or publish. Confidence ${paper.confidence === null ? "n/a" : `${Math.round(paper.confidence * 100)}%`}.`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={paper.status} />
            {paper.status === "published" && (
              <Link
                href={`/papers/${paper.slug}`}
                className="text-sm text-link underline"
                target="_blank"
              >
                View live page
              </Link>
            )}
          </div>
        }
      />
      <ReviewEditor paper={paper} catalog={catalog} role={me.role} />
    </>
  );
}
