import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { listNotes } from "@/lib/api/public";
import type { Paginated, NoteSummary } from "@/lib/api/types";
import { parsePositiveInt } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;
const SIZE = 20;

export async function generateMetadata(props: PageProps<"/notes">) {
  const sp = await props.searchParams;
  const data = await load(1, "");
  return buildMetadata({
    title: "Notes for Rajasthan University | Notes & Papers",
    description: "Student notes for Rajasthan University subjects, free to read and download.",
    path: "/notes",
    // thin until notes exist; filtered/paged views are never indexed
    noindex: data.total === 0 || Object.keys(sp).length > 0,
  });
}

async function load(page: number, q: string): Promise<Paginated<NoteSummary>> {
  try {
    return await listNotes({ page, size: SIZE, q: q || undefined });
  } catch {
    return { items: [], total: 0, page, size: SIZE };
  }
}

export default async function NotesPage(props: PageProps<"/notes">) {
  const sp = await props.searchParams;
  const q = [sp.q].flat()[0]?.toString().slice(0, 120) ?? "";
  const page = parsePositiveInt([sp.page].flat()[0]?.toString());
  const data = await load(page, q);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-5xl sm:text-6xl">Notes</h1>
        <form action="/notes" role="search" className="flex max-w-xl gap-2">
          <label htmlFor="notes-q" className="sr-only">
            Search notes
          </label>
          <input
            id="notes-q"
            name="q"
            defaultValue={q}
            maxLength={120}
            placeholder="Search notes by title or subject"
            className="h-10 w-full border-2 border-input bg-card font-medium focus-visible:shadow-hard-sm focus-visible:outline-none placeholder:font-normal placeholder:text-muted-foreground px-3 text-sm"
          />
          <button
            className="h-10 border-2 border-border bg-primary px-4 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-hard-sm hover:shadow-hard"
            type="submit"
          >
            Search
          </button>
        </form>
      </header>

      {data.items.length === 0 ? (
        <EmptyState
          title={q ? `No notes for "${q}"` : "No notes yet"}
          description="Student notes appear here once they are reviewed. You can share yours too."
          action={{ href: "/upload", label: "Upload notes" }}
        />
      ) : (
        <>
          <ul className="grid gap-3 md:grid-cols-2">
            {data.items.map((n) => (
              <li key={n.slug}>
                <Card className="h-full transition-shadow hover:shadow-md focus-within:shadow-md">
                  <Link href={`/notes/${n.slug}`} className="flex gap-3 rounded-lg p-4">
                    <FileText className="mt-0.5 size-5 shrink-0 text-link" aria-hidden="true" />
                    <div className="min-w-0 space-y-1.5">
                      <h2 className="font-medium leading-snug">{n.title}</h2>
                      {n.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {n.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {n.course_name && <Badge tone="primary">{n.course_name}</Badge>}
                        {n.subject_name && <Badge>{n.subject_name}</Badge>}
                      </div>
                    </div>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
          <Pagination
            page={data.page}
            size={data.size}
            total={data.total}
            hrefFor={(p) =>
              `/notes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`
            }
          />
        </>
      )}
    </div>
  );
}
