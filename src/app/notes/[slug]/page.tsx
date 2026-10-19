import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PdfPreview } from "@/components/shared/pdf-preview";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getNote } from "@/lib/api/public";
import { noteDownloadUrl } from "@/lib/api/urls";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata(props: PageProps<"/notes/[slug]">) {
  const { slug } = await props.params;
  const n = await getNote(slug);
  if (!n) return { title: "Note not found", robots: { index: false } };
  return buildMetadata({
    title: `${n.title} - Notes`,
    description:
      n.description ??
      `${n.title}: student notes${n.subject_name ? ` for ${n.subject_name}` : ""}. Free to read and download.`,
    path: `/notes/${slug}`,
    type: "article",
  });
}

export default async function NotePage(props: PageProps<"/notes/[slug]">) {
  const { slug } = await props.params;
  const n = await getNote(slug);
  if (!n) notFound();

  return (
    <article className="space-y-6">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Notes", path: "/notes" },
          { name: n.title, path: `/notes/${slug}` },
        ]}
      />
      <header className="space-y-3">
        <h1 className="text-5xl sm:text-6xl">{n.title}</h1>
        <div className="flex flex-wrap gap-2">
          {n.course_name && <Badge tone="primary">{n.course_name}</Badge>}
          {n.subject_name && <Badge>{n.subject_name}</Badge>}
        </div>
        {n.description && <p className="max-w-2xl text-muted-foreground">{n.description}</p>}
        <a
          href={noteDownloadUrl(slug)}
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          <Download className="size-4" aria-hidden="true" /> Download PDF
        </a>
      </header>
      <PdfPreview slug={`note-${slug}`} title={n.title} src={noteDownloadUrl(slug, true)} />
    </article>
  );
}
