import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { JsonLdScript } from "@/components/shared/json-ld";
import { PaperList } from "@/components/shared/paper-list";
import { getSubject } from "@/lib/api/public";
import type { PaperSummary } from "@/lib/api/types";
import { paperHref, routes, yearRange } from "@/lib/routes";
import { buildMetadata, collectionPageLd, faqLd, itemListLd, subjectMeta } from "@/lib/seo";

export const revalidate = 86400;
export const dynamicParams = true;

type Props = PageProps<"/universities/[university]/[course]/[term]/[subject]">;

export async function generateMetadata(props: Props) {
  const { university, course, term, subject } = await props.params;
  const s = await getSubject(university, course, term, subject);
  if (!s) return { title: "Not found", robots: { index: false } };
  const m = subjectMeta(s);
  return buildMetadata({
    title: m.title,
    description: m.description,
    path: routes.subject(university, course, term, subject),
    noindex: s.papers.length === 0,
  });
}

/** Group newest-first so the page reads as a year-by-year list. */
function byYear(papers: PaperSummary[]) {
  const groups = new Map<string, PaperSummary[]>();
  for (const p of papers) {
    const key = p.year ? String(p.year) : "Other";
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.entries()].sort(
    ([a], [b]) => Number(b) - Number(a) || (a === "Other" ? 1 : -1),
  );
}

export default async function SubjectPage(props: Props) {
  const { university, course, term, subject } = await props.params;
  const s = await getSubject(university, course, term, subject);
  if (!s) notFound();
  const m = subjectMeta(s);
  const path = routes.subject(university, course, term, subject);
  const range = yearRange(s.subject.year_min, s.subject.year_max);

  const faqs = [
    {
      q: `How many years of ${s.subject.name} question papers are available?`,
      a: `We have ${s.papers.length} ${s.subject.name} papers for ${s.course.name} ${m.label}${range ? ` covering ${range}` : ""}.`,
    },
    {
      q: `Can I download ${s.subject.name} question papers for free?`,
      a: "Yes. Every paper can be viewed online and downloaded as a PDF at no cost.",
    },
    {
      q: `Which university are these ${s.subject.name} papers from?`,
      a: `They are previous year examination papers of ${s.university.name} for ${s.course.name} ${m.label}.`,
    },
  ];

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Universities", path: routes.universities },
          { name: s.university.name, path: routes.university(university) },
          { name: s.course.name, path: routes.course(university, course) },
          { name: m.label, path: routes.term(university, course, term) },
          { name: s.subject.name, path },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-5xl sm:text-6xl">{m.h1}</h1>
        <p className="max-w-3xl text-muted-foreground">
          Previous year {s.subject.name} question papers for {s.course.name} {m.label},{" "}
          {s.university.name}. {m.years} year{m.years === 1 ? "" : "s"} available
          {range ? ` (${range})` : ""}
          {s.subject.paper_code ? `. Paper code ${s.subject.paper_code}` : ""}. Newest first.
        </p>
      </header>

      {s.papers.length === 0 ? (
        <EmptyState
          title="No papers yet"
          description="No papers have been published for this subject yet. Try the search or browse another subject."
        />
      ) : (
        byYear(s.papers).map(([year, papers]) => (
          <section key={year} aria-labelledby={`y-${year}`} className="space-y-3">
            <h2 id={`y-${year}`} className="text-3xl sm:text-4xl">
              {year}
            </h2>
            <PaperList papers={papers} />
          </section>
        ))
      )}

      <section aria-labelledby="faq-heading" className="space-y-3">
        <h2 id="faq-heading" className="text-3xl sm:text-4xl">
          Frequently asked questions
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      <JsonLdScript
        data={[
          collectionPageLd(m.h1, path, m.description),
          itemListLd(s.papers.map((p) => ({ name: p.title, path: paperHref(p) }))),
          faqLd(faqs),
        ]}
      />
    </div>
  );
}
