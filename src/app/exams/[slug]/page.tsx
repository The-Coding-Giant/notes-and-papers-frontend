import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLdScript } from "@/components/shared/json-ld";
import { Badge } from "@/components/ui/badge";
import { getExam } from "@/lib/api/public";
import { kindLabel, routes, yearRange } from "@/lib/routes";
import { buildMetadata, collectionPageLd } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata(props: PageProps<"/exams/[slug]">) {
  const { slug } = await props.params;
  const e = await getExam(slug).catch(() => null);
  if (!e) return { title: "Exam not found", robots: { index: false } };
  return buildMetadata({
    title: `${e.name} Previous Year Question Papers`,
    description: `${plural(e.paper_count, "paper")} for ${e.name}${e.year_min ? `, ${yearRange(e.year_min, e.year_max)}` : ""}. Free PDFs, section-wise.`,
    path: routes.exam(slug),
    noindex: e.paper_count === 0,
  });
}

export default async function ExamPage(props: PageProps<"/exams/[slug]">) {
  const { slug } = await props.params;
  const exam = await getExam(slug);
  if (!exam) notFound();
  const path = routes.exam(slug);

  return (
    <div className="space-y-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Exams", path: routes.exams },
          { name: exam.name, path },
        ]}
      />
      <header className="space-y-5">
        <p className="eyebrow inline-block bg-accent px-2 py-0.5 text-accent-foreground">
          {exam.kind === "board" ? "School board" : "Competitive exam"}
        </p>
        <h1 className="max-w-5xl text-5xl sm:text-6xl lg:text-7xl">{exam.name}</h1>
        <p className="flex flex-wrap gap-3">
          <span className="border-2 border-border bg-primary px-3 py-1 text-sm font-bold uppercase">
            {plural(exam.paper_count, "paper")}
          </span>
          {exam.year_min && (
            <span className="border-2 border-border bg-card px-3 py-1 text-sm font-bold uppercase">
              {yearRange(exam.year_min, exam.year_max)}
            </span>
          )}
          <span className="border-2 border-border bg-card px-3 py-1 text-sm font-bold uppercase">
            {plural(exam.sections.length, "section")}
          </span>
        </p>
        {exam.sections.length > 1 && (
          <nav aria-label="Sections" className="flex flex-wrap gap-2 pt-1">
            {exam.sections.map((s, i) => (
              <a
                key={s.name}
                href={`#sec-${i}`}
                className="border-2 border-border bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-primary"
              >
                {s.name} ({s.paper_count})
              </a>
            ))}
          </nav>
        )}
      </header>

      {exam.sections.length === 0 && (
        <p className="text-muted-foreground">No papers have been published for this exam yet.</p>
      )}

      {exam.sections.map((s, i) => (
        <section
          key={s.name}
          id={`sec-${i}`}
          aria-labelledby={`sec-h-${i}`}
          className="scroll-mt-24 space-y-5"
        >
          <h2
            id={`sec-h-${i}`}
            className="flex flex-wrap items-baseline gap-3 font-sans text-xl font-bold normal-case leading-snug tracking-normal"
          >
            {s.name}
            <span className="border-2 border-border bg-primary px-2 py-0.5 text-xs font-bold">
              {s.paper_count}
            </span>
          </h2>
          <ul className="divide-y-2 divide-border border-2 border-border bg-card shadow-hard-sm">
            {s.papers.map((p) => (
              <li key={p.slug}>
                <Link
                  href={routes.examPaper(slug, p.slug)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-primary"
                >
                  <FileText className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{p.title}</span>
                  {p.kind !== "question_paper" && <Badge>{kindLabel(p.kind)}</Badge>}
                  {p.year && <Badge tone="primary">{p.year}</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <JsonLdScript
        data={[collectionPageLd(`${exam.name} question papers`, path, `Papers for ${exam.name}`)]}
      />
    </div>
  );
}
